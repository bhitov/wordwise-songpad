/**
 * @file TipTap editor component with real-time grammar checking.
 * Integrates with Zustand store for state management and LanguageTool API for corrections.
 */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useCallback, useState, useRef } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useEditorStore } from '@/lib/store/editor-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, BookOpen, Palette } from 'lucide-react';
import type { SimplifiedCorrection } from '@/lib/core/checker';

// Extend TipTap types for our custom commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    correctionHighlight: {
      setCorrectionHighlight: (attributes: { correctionId: string; correctionType: string }) => ReturnType;
      toggleCorrectionHighlight: (attributes: { correctionId: string; correctionType: string }) => ReturnType;
      unsetCorrectionHighlight: () => ReturnType;
    };
  }
}

/**
 * Find the position of text in the editor content
 */
function findTextPosition(
  editorText: string, 
  searchText: string, 
  offset: number
): { from: number; to: number } {
  // Convert character offset to editor position
  // In TipTap, positions start at 1, not 0
  const from = offset + 1;
  const to = from + searchText.length;
  
  // Validate the positions are within bounds
  if (from < 1 || to > editorText.length + 1) {
    return { from: -1, to: -1 };
  }
  
  return { from, to };
}

/**
 * Custom TipTap Mark extension for highlighting corrections
 */
const CorrectionHighlight = Mark.create({
  name: 'correctionHighlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      correctionId: {
        default: null,
        parseHTML: element => element.getAttribute('data-correction-id'),
        renderHTML: attributes => {
          if (!attributes.correctionId) {
            return {};
          }
          return {
            'data-correction-id': attributes.correctionId,
          };
        },
      },
      correctionType: {
        default: 'grammar',
        parseHTML: element => element.getAttribute('data-correction-type'),
        renderHTML: attributes => {
          if (!attributes.correctionType) {
            return {};
          }
          return {
            'data-correction-type': attributes.correctionType,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-correction-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const correctionType = HTMLAttributes['data-correction-type'] || 'grammar';
    
    // Define colors that match the sidebar
    const colorClasses = {
      grammar: 'bg-blue-100 text-blue-900 border-b-2 border-blue-300 hover:bg-blue-200',
      spelling: 'bg-red-100 text-red-900 border-b-2 border-red-300 hover:bg-red-200',
      style: 'bg-purple-100 text-purple-900 border-b-2 border-purple-300 hover:bg-purple-200',
    };

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `cursor-text transition-colors duration-200 ${colorClasses[correctionType as keyof typeof colorClasses] || colorClasses.grammar}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCorrectionHighlight: (attributes: { correctionId: string; correctionType: string }) => ({ commands }) => {
        return commands.setMark(this.name, attributes);
      },
      toggleCorrectionHighlight: (attributes: { correctionId: string; correctionType: string }) => ({ commands }) => {
        return commands.toggleMark(this.name, attributes);
      },
      unsetCorrectionHighlight: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

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
 * Correction popup component
 */
interface CorrectionPopupProps {
  correction: SimplifiedCorrection;
  position: { x: number; y: number };
  onApply: (suggestion: string) => void;
  onDismiss: () => void;
  onClose: () => void;
}

function CorrectionPopup({ correction, position, onApply, onDismiss, onClose }: CorrectionPopupProps) {
  const getCorrectionIcon = (type: SimplifiedCorrection['type']) => {
    switch (type) {
      case 'grammar':
        return <BookOpen className="h-4 w-4" />;
      case 'spelling':
        return <AlertCircle className="h-4 w-4" />;
      case 'style':
        return <Palette className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCorrectionColors = (type: SimplifiedCorrection['type']) => {
    switch (type) {
      case 'grammar':
        return {
          badge: 'bg-blue-100 text-blue-800',
          icon: 'text-blue-600',
        };
      case 'spelling':
        return {
          badge: 'bg-red-100 text-red-800',
          icon: 'text-red-600',
        };
      case 'style':
        return {
          badge: 'bg-purple-100 text-purple-800',
          icon: 'text-purple-600',
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          icon: 'text-gray-600',
        };
    }
  };

  const colors = getCorrectionColors(correction.type);
  const icon = getCorrectionIcon(correction.type);

  return (
    <div
      className="fixed z-50 max-w-sm"
      style={{
        left: position.x,
        top: position.y,
      }}
      data-correction-popup
    >
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={colors.icon}>
                {icon}
              </div>
              <Badge variant="secondary" className={colors.badge}>
                {correction.type}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-sm font-medium">
            {correction.shortMessage}
          </CardTitle>
          {correction.message !== correction.shortMessage && (
            <CardDescription className="text-xs">
              {correction.message}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Original text */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Original:
              </p>
              <p className="text-sm bg-red-50 px-2 py-1 rounded border-l-2 border-red-200">
                "{correction.originalText}"
              </p>
            </div>

            {/* Suggestions */}
            {correction.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Suggestions:
                </p>
                <div className="space-y-1">
                  {correction.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => onApply(suggestion)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                      <span className="flex-1">"{suggestion}"</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onDismiss}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
    applyCorrectionById,
    dismissCorrectionById,
  } = useEditorStore();

  // Popup state
  const [popupState, setPopupState] = useState<{
    correction: SimplifiedCorrection;
    position: { x: number; y: number };
  } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

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
      CorrectionHighlight,
    ],
    content: document?.content || '',
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none ${className}`,
      },
      handleClick: (view, pos, event) => {
        // Handle clicks on correction highlights
        const target = event.target as HTMLElement;
        const correctionId = target.getAttribute('data-correction-id');
        if (correctionId) {
          const correction = corrections.find(c => c.id === correctionId);
          if (correction) {
            // Calculate popup position
            const rect = target.getBoundingClientRect();
            const position = {
              x: rect.left,
              y: rect.bottom + 8, // 8px below the text
            };
            
            // Show popup
            setPopupState({ correction, position });
            
            // Also select in sidebar
            selectCorrection(correctionId);
          }
          return true;
        } else {
          // Click outside correction - close popup
          setPopupState(null);
        }
        return false;
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

  // Apply correction highlights when corrections change
  useEffect(() => {
    if (!editor || !corrections.length) {
      // Clear all highlights if no corrections
      if (editor) {
        editor.commands.unsetCorrectionHighlight();
      }
      return;
    }

    // Clear existing highlights first
    editor.commands.unsetCorrectionHighlight();

    // Apply new highlights
    corrections.forEach((correction) => {
      const { from, to } = findTextPosition(editor.getText(), correction.originalText, correction.offset);
      
      if (from !== -1 && to !== -1) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .setCorrectionHighlight({
            correctionId: correction.id,
            correctionType: correction.type,
          })
          .run();
      }
    });

    // Restore selection
    editor.commands.blur();
  }, [editor, corrections]);

  // Handle popup actions
  const handleApplyCorrection = useCallback((correctionId: string, suggestion: string) => {
    applyCorrectionById(correctionId, suggestion);
    setPopupState(null);
  }, [applyCorrectionById]);

  const handleDismissCorrection = useCallback((correctionId: string) => {
    dismissCorrectionById(correctionId);
    setPopupState(null);
  }, [dismissCorrectionById]);

  const handleClosePopup = useCallback(() => {
    setPopupState(null);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Ctrl/Cmd + S for save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      onSave?.();
    }
    // Escape to close popup
    if (event.key === 'Escape') {
      setPopupState(null);
    }
  }, [onSave]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupState && editorRef.current && !editorRef.current.contains(event.target as Node)) {
        // Check if click is not on the popup itself
        const target = event.target as Element;
        if (!target.closest('[data-correction-popup]')) {
          setPopupState(null);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [popupState]);

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
          ref={editorRef}
        >
          <EditorContent 
            editor={editor}
            className="min-h-[500px] p-6 focus-within:outline-none"
          />
        </div>
      </div>

      {/* Correction popup */}
      {popupState && (
        <CorrectionPopup
          correction={popupState.correction}
          position={popupState.position}
          onApply={(suggestion) => handleApplyCorrection(popupState.correction.id, suggestion)}
          onDismiss={() => handleDismissCorrection(popupState.correction.id)}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}



export default TipTapEditor; 