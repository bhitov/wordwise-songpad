/**
 * @file TipTap editor component with real-time grammar checking.
 * Integrates with Zustand store for state management and LanguageTool API for corrections.
 */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useCallback } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useEditorStore } from '@/lib/store/editor-store';
import type { SimplifiedCorrection } from '@/lib/core/checker';

/**
 * Props for the TipTap editor component
 */
interface TipTapEditorProps {
  className?: string;
  placeholder?: string;
  onSave?: () => void;
}

/**
 * Generate a unique request ID for race condition prevention
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check text for grammar and spelling errors using our API
 */
async function checkTextForCorrections(
  text: string,
  requestId: string
): Promise<{ corrections: SimplifiedCorrection[]; requestId: string } | null> {
  if (!text.trim()) {
    return { corrections: [], requestId };
  }

  try {
    const response = await fetch('/api/corrections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        language: 'en-US',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      return {
        corrections: data.data.corrections,
        requestId,
      };
    } else {
      throw new Error(data.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error checking text:', error);
    return null;
  }
}

/**
 * TipTap editor component with real-time grammar checking
 */
export function TipTapEditor({ 
  className = '', 
  placeholder = 'Start writing...',
  onSave 
}: TipTapEditorProps) {
  // Zustand store
  const {
    document,
    corrections,
    isCheckingGrammar,
    lastCheckedContent,
    selectedCorrectionId,
    updateContent,
    setCorrections,
    setIsCheckingGrammar,
    setCheckRequestId,
    selectCorrection,
  } = useEditorStore();

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable some extensions we don't need
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        listItem: false,
        orderedList: false,
        bulletList: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 50000, // Reasonable limit for documents
      }),
    ],
    content: document?.content || '',
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none ${className}`,
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getText();
      updateContent(content);
    },
    onCreate: ({ editor }) => {
      // Set initial content if document exists
      if (document?.content && editor.getText() !== document.content) {
        editor.commands.setContent(document.content);
      }
    },
  });

  // Debounce content for grammar checking (1.5 seconds)
  const debouncedContent = useDebounce(document?.content || '', 1500);

  // Initial grammar check on document load
  useEffect(() => {
    if (document?.content !== undefined && lastCheckedContent === '') {
      // Trigger initial check immediately when document loads
      const performInitialGrammarCheck = async () => {
        const requestId = generateRequestId();
        setCheckRequestId(requestId);
        setIsCheckingGrammar(true);

        const result = await checkTextForCorrections(document.content, requestId);
        
        if (result) {
          setCorrections(result.corrections, result.requestId);
        } else {
          // If request failed, still need to stop loading state and mark as checked
          setIsCheckingGrammar(false);
          // Mark as having performed initial check even if it failed
          useEditorStore.setState({ hasPerformedInitialCheck: true });
        }
      };

      performInitialGrammarCheck();
    }
  }, [document?.content, lastCheckedContent, setCheckRequestId, setIsCheckingGrammar, setCorrections]);

  // Grammar checking effect for subsequent edits
  useEffect(() => {
    if (!debouncedContent.trim() || debouncedContent === lastCheckedContent) {
      return;
    }

    // Skip if this is the initial load (handled above)
    if (lastCheckedContent === '') {
      return;
    }

    const performGrammarCheck = async () => {
      const requestId = generateRequestId();
      setCheckRequestId(requestId);
      setIsCheckingGrammar(true);

      const result = await checkTextForCorrections(debouncedContent, requestId);
      
      if (result) {
        setCorrections(result.corrections, result.requestId);
      } else {
        // If request failed, still need to stop loading state
        setIsCheckingGrammar(false);
      }
    };

    performGrammarCheck();
  }, [debouncedContent, lastCheckedContent, setCheckRequestId, setIsCheckingGrammar, setCorrections]);

  // Update editor content when document changes (e.g., from corrections)
  useEffect(() => {
    if (editor && document?.content !== undefined) {
      const currentContent = editor.getText();
      if (currentContent !== document.content) {
        // Preserve cursor position when possible
        const { from } = editor.state.selection;
        editor.commands.setContent(document.content);
        
        // Try to restore cursor position
        const newLength = editor.state.doc.content.size;
        const newPosition = Math.min(from, newLength);
        editor.commands.setTextSelection(newPosition);
      }
    }
  }, [editor, document?.content]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Ctrl/Cmd + S for save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      onSave?.();
    }
  }, [onSave]);

  // Handle correction selection (clicking on underlined text)
  const handleCorrectionClick = useCallback((correctionId: string) => {
    selectCorrection(selectedCorrectionId === correctionId ? null : correctionId);
  }, [selectedCorrectionId, selectCorrection]);

  // Clean up editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto px-6 pb-6">
      {/* Editor container with border */}
      <div className="border border-border rounded-lg bg-background shadow-sm">
        {/* Grammar checking indicator */}
        {isCheckingGrammar && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Checking grammar...
          </div>
        )}

        {/* Character count */}
        <div className="absolute bottom-2 right-2 z-10 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {editor.storage.characterCount.characters()}/{editor.extensionManager.extensions.find(ext => ext.name === 'characterCount')?.options.limit || 50000}
        </div>

        {/* Editor content */}
        <div 
          className="relative"
          onKeyDown={handleKeyDown}
        >
          <EditorContent 
            editor={editor}
            className="min-h-[500px] p-6 focus-within:outline-none"
          />
          
          {/* Correction highlights overlay */}
          <CorrectionHighlights
            corrections={corrections}
            selectedCorrectionId={selectedCorrectionId}
            onCorrectionClick={handleCorrectionClick}
            editorElement={editor.view.dom}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Component for rendering correction highlights over the editor
 */
interface CorrectionHighlightsProps {
  corrections: SimplifiedCorrection[];
  selectedCorrectionId: string | null;
  onCorrectionClick: (correctionId: string) => void;
  editorElement: Element;
}

function CorrectionHighlights({
  corrections,
  selectedCorrectionId,
  onCorrectionClick,
  editorElement,
}: CorrectionHighlightsProps) {
  // This is a simplified version - in a full implementation,
  // you'd need to calculate exact positions based on the editor's DOM
  // For now, we'll rely on the sidebar for correction display
  return null;
}

export default TipTapEditor; 