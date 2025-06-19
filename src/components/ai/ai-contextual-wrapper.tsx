/**
 * AI Contextual Wrapper Component
 * 
 * Wraps the editor with AI contextual menu functionality.
 * Handles text selection detection and displays the contextual menu when appropriate.
 */

'use client';

import { useEffect, useRef } from 'react';
import { ContextualMenu, type ContextualMenuAction } from './contextual-menu';
import { useAIContextualMenu, type MenuAction } from '@/lib/hooks/use-ai-contextual-menu';
import type { TextSelection } from '@/lib/ai/actions-handler';

export interface AIContextualWrapperProps {
  /** Full document text for context analysis */
  fullText: string;
  /** Callback when an AI action is triggered */
  onAIAction: (actionId: string, selection: TextSelection) => void;
  /** Child components to wrap with AI functionality */
  children: React.ReactNode;
}

/**
 * Wrapper component that adds AI contextual menu functionality to its children
 */
export function AIContextualWrapper({
  fullText,
  onAIAction,
  children,
}: AIContextualWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    isVisible,
    position,
    actions,
    isLoading,
    closeMenu,
    handleSelection,
    setIsLoading,
  } = useAIContextualMenu({
    fullText,
    onAIAction: async (actionId: string, selection: TextSelection) => {
      try {
        await onAIAction(actionId, selection);
      } catch (error) {
        console.error('AI action failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Listen for text selection changes
  useEffect(() => {
    function handleSelectionChange() {
      const selection = window.getSelection();
      
             // Only handle selections within our wrapper
       if (selection && wrapperRef.current) {
         const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
         if (range && wrapperRef.current.contains(range.commonAncestorContainer)) {
           console.log('🎯 AI Wrapper - Selection detected:', {
             text: selection.toString().substring(0, 50) + (selection.toString().length > 50 ? '...' : ''),
             length: selection.toString().length,
           });
           handleSelection(selection);
         } else {
           handleSelection(null);
         }
       } else {
         handleSelection(null);
       }
    }

    // Listen for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Also listen for mouse up events for immediate feedback
    function handleMouseUp() {
      // Small delay to ensure selection is complete
      setTimeout(handleSelectionChange, 10);
    }
    
    if (wrapperRef.current) {
      wrapperRef.current.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [handleSelection]);

  // Convert MenuAction to ContextualMenuAction
  const contextualActions: ContextualMenuAction[] = actions.map((action: MenuAction) => ({
    id: action.id,
    label: action.label,
    type: action.type,
    description: action.description,
    onClick: action.onClick,
  }));

  return (
    <>
      <div ref={wrapperRef} className="relative">
        {children}
      </div>
      
      <ContextualMenu
        isVisible={isVisible}
        position={position}
        actions={contextualActions}
        isLoading={isLoading}
        onClose={closeMenu}
      />
    </>
  );
} 