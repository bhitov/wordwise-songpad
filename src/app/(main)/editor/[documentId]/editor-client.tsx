/**
 * @file Main editor client component that combines TipTap editor with suggestions sidebar.
 * Handles document loading, auto-save, and integrates all editor functionality.
 */

'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/lib/store/editor-store';
import { TipTapEditor } from '@/components/shared/tiptap-editor';
import { SuggestionsSidebar } from '@/components/shared/suggestions-sidebar';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { 
  Save, 
  FileText, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft
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
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Save document to server
 */
async function saveDocument(documentId: string, content: string, title: string) {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      title,
    }),
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
    setSaving,
    setLastSaved,
    reset,
  } = useEditorStore();

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Debounce content for auto-save (3 seconds)
  const debouncedContent = useDebounce(document?.content || '', 3000);

  // Initialize document on mount
  useEffect(() => {
    if (initialDocument) {
      setDocument({
        id: initialDocument.id,
        title: initialDocument.title,
        content: initialDocument.content,
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
    if (debouncedContent === document.content && debouncedContent.trim()) {
      performSave();
    }
  }, [debouncedContent, document, hasUnsavedChanges, isSaving]);

  // Manual save function
  const performSave = useCallback(async () => {
    if (!document || isSaving) return;

    try {
      setSaving(true);
      await saveDocument(document.id, document.content, document.title);
      setLastSaved(new Date());
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Failed to save document:', error);
      toast.error('Failed to save document');
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

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Document not found</h2>
          <p className="text-muted-foreground mb-4">
            The document you're looking for doesn't exist or you don't have access to it.
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
        {/* Editor */}
        <div className="flex-1 overflow-auto bg-muted/30">
          {/* Document title aligned with editor */}
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-4">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleBlur}
                  className="font-semibold text-2xl text-foreground border-none outline-none bg-transparent w-full resize-none"
                  placeholder="Untitled Document"
                  maxLength={200}
                />
              ) : (
                <h1 
                  className="font-semibold text-2xl text-foreground border-none outline-none bg-transparent cursor-text hover:bg-muted/50 rounded px-1 py-1 -mx-1 transition-colors"
                  onClick={handleTitleClick}
                  title="Click to edit title"
                >
                  {document.title || 'Untitled Document'}
                </h1>
              )}
            </div>
          </div>
          
          <TipTapEditor
            placeholder="Start writing your document..."
            onSave={handleSave}
          />
        </div>

        {/* Suggestions sidebar */}
        <SuggestionsSidebar />
      </div>
    </div>
  );
}

export default EditorClient; 