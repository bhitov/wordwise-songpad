/**
 * @file Main editor client component that combines TipTap editor with suggestions sidebar.
 * Handles document loading, auto-save, and integrates all editor functionality.
 */

'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/lib/store/editor-store';
import { TipTapEditor, TipTapEditorRef } from '@/components/shared/tiptap-editor';
import { SuggestionsSidebar } from '@/components/shared/suggestions-sidebar';
import { GeneratedSongsList, GeneratedSongsListRef } from '@/components/shared/generated-songs-list';
import { SongSettingsPanel } from '@/components/shared/song-settings-panel';
import { AIActionsDropdown } from '@/components/shared/ai-actions-dropdown';
import { EditorTour } from '@/components/shared/editor-tour';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { AIContextualWrapper } from '@/components/ai';
import type { TextSelection } from '@/lib/ai';
import type { Genre } from '@/types';
import { 
  Save, 
  FileText, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Music2
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Props for the editor client component
 */
interface EditorClientProps {
  initialDocument?: {
    id: string;
    title: string;
    content: string;
    songGenre: string;
    songDescription: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Save document to server
 */
async function saveDocument(documentId: string, content: string, title: string, songGenre?: Genre, songDescription?: string) {
  const body: { content: string; title: string; songGenre?: Genre; songDescription?: string } = { content, title };
  
  if (songGenre !== undefined) {
    body.songGenre = songGenre;
  }
  
  if (songDescription !== undefined) {
    body.songDescription = songDescription;
  }

  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to save document: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Main editor client component
 */
export function EditorClient({ initialDocument }: EditorClientProps) {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const {
    document,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    setDocument,
    updateTitle,
    updateSongGenre,
    updateSongDescription,
    setSaving,
    setLastSaved,
    applyAITransformation,
    reset,
  } = useEditorStore();

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Song generation state
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [isProcessingAIAction, setIsProcessingAIAction] = useState(false);
  const songsListRef = useRef<GeneratedSongsListRef>(null);
  const editorRef = useRef<TipTapEditorRef>(null);

  // Debounce content for auto-save (3 seconds)
  const debouncedContent = useDebounce(document?.content || '', 3000);

  // Initialize document on mount
  useEffect(() => {
    if (initialDocument) {
      setDocument({
        id: initialDocument.id,
        title: initialDocument.title,
        content: initialDocument.content,
        songGenre: (initialDocument.songGenre as Genre) || 'rap',
        songDescription: initialDocument.songDescription || '',
        createdAt: new Date(initialDocument.createdAt),
        updatedAt: new Date(initialDocument.updatedAt),
      });
    }
  }, [initialDocument, setDocument]);

  // Auto-save effect
  useEffect(() => {
    if (!document || !hasUnsavedChanges || isSaving) {
      return;
    }

    // Only auto-save if content has actually changed and is debounced
    if (debouncedContent === document.content && debouncedContent) {
      performSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, document, hasUnsavedChanges, isSaving]);

  // Manual save function
  const performSave = useCallback(async () => {
    if (!document || isSaving) return;

    try {
      setSaving(true);
      await saveDocument(document.id, document.content, document.title, document.songGenre, document.songDescription);
      setLastSaved(new Date());
      toast.success('Pad saved successfully');
    } catch (error) {
      console.error('Failed to save pad:', error);
      toast.error('Failed to save pad');
    } finally {
      setSaving(false);
    }
  }, [document, isSaving, setSaving, setLastSaved]);

  // Keyboard shortcut for manual save
  const handleSave = useCallback(() => {
    if (hasUnsavedChanges) {
      performSave();
    }
  }, [hasUnsavedChanges, performSave]);

  // Title editing handlers
  const handleTitleClick = useCallback(() => {
    if (!document) return;
    setTitleValue(document.title);
    setIsEditingTitle(true);
  }, [document]);

  const handleTitleSave = useCallback(() => {
    if (!document || !titleValue.trim()) {
      setIsEditingTitle(false);
      setTitleValue('');
      return;
    }

    const trimmedTitle = titleValue.trim();
    if (trimmedTitle !== document.title) {
      updateTitle(trimmedTitle);
    }
    
    setIsEditingTitle(false);
    setTitleValue('');
  }, [document, titleValue, updateTitle]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingTitle(false);
      setTitleValue('');
    }
  }, [handleTitleSave]);

  const handleTitleBlur = useCallback(() => {
    handleTitleSave();
  }, [handleTitleSave]);

  // Navigation handler with unsaved changes warning
  const handleBackToDashboard = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmed) {
        return;
      }
    }
    router.push('/dashboard');
  }, [hasUnsavedChanges, router]);

  // Song generation handler
  const handleGenerateSong = useCallback(async () => {
    if (!document || !document.content.trim()) {
      toast.error('Please add some content to your pad before generating a song');
      return;
    }

    try {
      setIsGeneratingSong(true);
      
      console.log('🎵 UI - Starting song generation for document:', document.id);
      
      const response = await fetch('/api/song/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          genre: document.songGenre,
          prompt: document.songDescription || undefined,
        }),
      });

      console.log('🎵 UI - Song generation response:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🎵 UI - Song generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate song');
      }

      const data = await response.json();
      console.log('🎵 UI - Song generation successful:', data);
      
      if (data.success) {
        toast.success(`Song generation started! Task ID: ${data.data.taskId}`);
        
        // Refresh the songs list to show the new song immediately
        if (songsListRef.current) {
          songsListRef.current.refresh();
        }
      } else {
        throw new Error(data.error || 'Failed to generate song');
      }
    } catch (error) {
      console.error('🎵 UI - Error generating song:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate song');
    } finally {
      setIsGeneratingSong(false);
    }
  }, [document]);

  // Whole-text AI action handler
  const handleWholeTextAIAction = useCallback(async (
    actionType: 'generate-chorus' | 'add-verse', 
    content: string, 
    genre: Genre
  ) => {
    if (!document || !editorRef.current) {
      toast.error('Editor not ready. Please try again.');
      return;
    }

    try {
      setIsProcessingAIAction(true);
      toast.loading(`${actionType === 'generate-chorus' ? 'Generating chorus' : 'Adding verse'}...`, { id: 'ai-whole-text' });

      // Call the whole-text AI API
      const response = await fetch('/api/ai/whole-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionType,
          fullText: content,
          genre: genre,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI processing failed');
      }

      const data = await response.json();
      
      if (!data.success || !data.data?.enhancedText) {
        throw new Error('Invalid response from AI service');
      }

      const enhancedText = data.data.enhancedText;
      
      console.log('🤖 Whole-text AI result:', {
        action: actionType,
        originalLength: content.length,
        enhancedLength: enhancedText.length,
        genre
      });

      // Update the editor content with the enhanced text
      if (editorRef.current?.editor) {
        editorRef.current.editor.commands.setContent(enhancedText);
      }
      
      // Update the store with the new content
      const { updateContent } = useEditorStore.getState();
      updateContent(enhancedText);

      toast.success(
        actionType === 'generate-chorus' ? 'Chorus generated successfully!' : 'Verse added successfully!',
        { id: 'ai-whole-text' }
      );

    } catch (error) {
      console.error('🤖 Whole-text AI action failed:', error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${actionType === 'generate-chorus' ? 'generate chorus' : 'add verse'}`,
        { id: 'ai-whole-text' }
      );
    } finally {
      setIsProcessingAIAction(false);
    }
  }, [document]);

  // AI action handler
  const handleAIAction = useCallback(async (actionId: string, selection: TextSelection) => {
    console.log('🤖 AI Action triggered:', { actionId, selection });
    
    if (!document || !editorRef.current) {
      toast.error('Editor not ready. Please try again.');
      return;
    }
    
    try {
      toast.loading('Transforming text with AI...', { id: 'ai-processing' });
      
      // Call the AI suggestions API with selected text and full document context
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionId,
          selectedText: selection.selectedText,
          fullText: selection.fullText,
          genre: document.songGenre,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'AI processing failed');
      }

      const data = await response.json();
      
      if (!data.success || !data.data?.transformedText) {
        throw new Error('Invalid response from AI service');
      }

      const transformedText = data.data.transformedText;
      
      console.log('🤖 AI transformation result:', {
        original: selection.selectedText,
        transformed: transformedText,
      });

      // Calculate cursor position before applying transformation
      const transformedTextStartIndex = document.content.indexOf(selection.selectedText);
      const newCursorPosition = transformedTextStartIndex !== -1 
        ? transformedTextStartIndex + transformedText.length 
        : -1;

      // Use the AI transformation function to apply the change
      applyAITransformation(selection.selectedText, transformedText);
      
      // Clear text selection in the editor after transformation
      if (editorRef.current?.editor) {
        const editor = editorRef.current.editor;
        
        setTimeout(() => {
          if (newCursorPosition !== -1) {
            // Set cursor position to end of transformed text and clear selection
            editor.commands.focus();
            editor.commands.setTextSelection(newCursorPosition);
            // for some reason this solves race condition issues. don't remove it!
            editor.commands.insertContent(' ');
          } else {
            // Fallback: just clear selection and focus
            editor.commands.focus();
            editor.commands.blur();
            editor.commands.focus();
          }
        }, 0);
      }
      
      toast.success('Text transformed successfully!', { id: 'ai-processing' });
      
    } catch (error) {
      console.error('🤖 AI action failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'AI action failed. Please try again.',
        { id: 'ai-processing' }
      );
    }
  }, [document, applyAITransformation]);

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Expose editor to global scope for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as typeof window & { editorDebug: any }).editorDebug = {
        // Document state
        document,
        isLoading,
        isSaving,
        hasUnsavedChanges,
        lastSaved,
        
        // Actions
        performSave,
        handleGenerateSong,
        
        // Refs
        songsListRef,
        titleInputRef,
        editorRef,
        
        // Store methods
        updateTitle,
        setDocument,
        
        // State
        isGeneratingSong,
        isEditingTitle,
        titleValue,
        
        // Utility functions
        refreshSongs: () => songsListRef.current?.refresh(),
        
        // TipTap Editor methods
        editor: editorRef.current?.editor,
        getText: () => editorRef.current?.getText() || '',
        getHTML: () => editorRef.current?.getHTML() || '',
        getJSON: () => editorRef.current?.getJSON() || {},
        setEditorContent: (content: string) => editorRef.current?.setContent(content),
        focusEditor: () => editorRef.current?.focus(),
        blurEditor: () => editorRef.current?.blur(),
        getCharacterCount: () => editorRef.current?.getCharacterCount() || 0,
        getWordCount: () => editorRef.current?.getWordCount() || 0,
        
        // API helpers for testing
        testSongGeneration: async () => {
          console.log('🧪 Testing song generation...');
          return handleGenerateSong();
        },
        
        testSave: async () => {
          console.log('🧪 Testing document save...');
          return performSave();
        },
        
        // Get current editor content
        getContent: () => document?.content || '',
        
        // Set editor content (for testing)
        setContent: (content: string) => {
          if (document) {
            setDocument({
              ...document,
              content
            });
          }
        },
        
        // Log current state
        logState: () => {
          console.log('📊 Editor State:', {
            documentId: document?.id,
            title: document?.title,
            contentLength: document?.content?.length || 0,
            isLoading,
            isSaving,
            hasUnsavedChanges,
            lastSaved: lastSaved?.toISOString(),
            isGeneratingSong,
            isEditingTitle
          });
        }
      };
      
      console.log('🎯 Editor exposed to window.editorDebug');
      console.log('Available methods:', Object.keys((window as any).editorDebug));
    }
    
    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).editorDebug;
      }
    };
  }, [
    document, 
    isLoading, 
    isSaving, 
    hasUnsavedChanges, 
    lastSaved, 
    performSave, 
    handleGenerateSong, 
    updateTitle, 
    setDocument, 
    isGeneratingSong, 
    isEditingTitle, 
    titleValue
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pad...</p>
        </div>
      </div>
    );
  }

  // Show loading if we have initialDocument but haven't processed it yet
  if (initialDocument && !document) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pad...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Pad not found</h2>
          <p className="text-muted-foreground mb-4">
            The pad you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-4 w-px bg-border" />
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {document.content.length} characters
              </span>
              {lastSaved && (
                <span>
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tour button */}
            <EditorTour />

            {/* Save status indicator */}
            {isSaving ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                All changes saved
              </div>
            )}

            {/* Generate Song button */}
            <Button
              onClick={handleGenerateSong}
              disabled={isGeneratingSong || !document?.content?.trim()}
              size="sm"
              variant="default"
              className="tour-generate-song bg-purple-600 hover:bg-purple-700"
            >
              {isGeneratingSong ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Music2 className="h-4 w-4 mr-2" />
              )}
              {isGeneratingSong ? 'Generating...' : 'Generate Song'}
            </Button>

            {/* Manual save button */}
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              size="sm"
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar with song settings and generated songs */}
        <div className="w-72 border-r bg-background flex flex-col overflow-hidden">
          <div className="tour-song-settings p-4 flex-shrink-0">
            <SongSettingsPanel
              songGenre={document.songGenre}
              songDescription={document.songDescription}
              onGenreChange={updateSongGenre}
              onDescriptionChange={updateSongDescription}
            />
          </div>
          
          {/* Generated Songs */}
          <div className="tour-generated-songs flex-1 border-t p-4 overflow-auto">
            <GeneratedSongsList ref={songsListRef} documentId={documentId} />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto bg-muted/30">
          {/* Document title and AI actions */}
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleBlur}
                    className="font-semibold text-2xl text-foreground border-none outline-none bg-transparent w-full resize-none"
                    placeholder="Untitled Pad"
                    maxLength={200}
                  />
                ) : (
                  <h1 
                    className="tour-title font-semibold text-2xl text-foreground border-none outline-none bg-transparent cursor-text hover:bg-muted/50 rounded px-1 py-1 -mx-1 transition-colors"
                    onClick={handleTitleClick}
                    title="Click to edit title"
                  >
                    {document.title || 'Untitled Pad'}
                  </h1>
                )}
              </div>
              
              {/* AI Actions Dropdown */}
              <div className="tour-ai-actions ml-4">
                <AIActionsDropdown
                  content={document.content}
                  genre={document.songGenre}
                  onAIAction={handleWholeTextAIAction}
                  isLoading={isProcessingAIAction}
                />
              </div>
            </div>
          </div>
          
          <AIContextualWrapper
            fullText={document.content}
            genre={document.songGenre}
            onAIAction={handleAIAction}
          >
            <div className="tour-editor">
              <TipTapEditor
                ref={editorRef}
                placeholder="Start writing your pad..."
                onSave={handleSave}
              />
            </div>
          </AIContextualWrapper>
        </div>

        {/* Right sidebar with suggestions */}
        <div className="tour-suggestions w-80 border-l bg-background">
          <SuggestionsSidebar className="w-full border-l-0" />
        </div>
      </div>
    </div>
  );
}

export default EditorClient; 