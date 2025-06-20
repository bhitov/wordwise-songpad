/**
 * AI Contextual Menu Hook
 * 
 * Manages the state and behavior of the AI contextual menu,
 * including text selection detection, positioning, and action handling.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  getAvailableAIActions, 
  isValidSelection, 
  type TextSelection, 
  type AIAction 
} from '@/lib/ai/actions-handler';
import type { Genre } from '@/types';

export interface UseAIContextualMenuProps {
  /** Full document text for context */
  fullText: string;
  /** Music genre for action labels and descriptions */
  genre?: Genre;
  /** Callback when an AI action is triggered */
  onAIAction: (actionId: string, selection: TextSelection) => void;
}

export interface MenuAction {
  id: string;
  label: string;
  description: string;
  type: string;
  onClick: () => void;
}

export interface UseAIContextualMenuReturn {
  /** Whether the menu is visible */
  isVisible: boolean;
  /** Menu position relative to viewport */
  position: { x: number; y: number };
  /** Available menu actions */
  actions: MenuAction[];
  /** Whether any action is loading */
  isLoading: boolean;
  /** Close the menu */
  closeMenu: () => void;
  /** Handle text selection change */
  handleSelection: (selection: Selection | null) => void;
  /** Set loading state */
  setIsLoading: (loading: boolean) => void;
}

/**
 * Custom hook for managing AI contextual menu functionality
 */
export function useAIContextualMenu({
  fullText,
  genre = 'rap',
  onAIAction,
}: UseAIContextualMenuProps): UseAIContextualMenuReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentSelection, setCurrentSelection] = useState<TextSelection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const selectionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Close the contextual menu
   */
  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setCurrentSelection(null);
    setIsLoading(false);
  }, []);

  /**
   * Get the available actions based on current selection
   */
  const getMenuActions = useCallback((selection: TextSelection): MenuAction[] => {
    const aiActions = getAvailableAIActions(selection, genre);
    
    return aiActions.map((action: AIAction): MenuAction => ({
      id: action.id,
      label: action.label,
      description: action.description,
      type: action.type,
      onClick: () => {
        setIsLoading(true);
        onAIAction(action.id, selection);
      },
    }));
  }, [onAIAction, genre]);

  /**
   * Handle text selection changes
   */
  const handleSelection = useCallback((selection: Selection | null) => {
    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    // Close menu immediately if no selection
    if (!selection || selection.isCollapsed) {
      closeMenu();
      return;
    }

    // Debounce selection handling to avoid flickering
    selectionTimeoutRef.current = setTimeout(() => {
      const selectedText = selection.toString();
      
      // Ensure we have at least one range
      if (selection.rangeCount === 0) {
        closeMenu();
        return;
      }
      
      const range = selection.getRangeAt(0);
      
      // Create text selection object
      const textSelection: TextSelection = {
        selectedText,
        fullText,
        startPos: getTextPosition(range.startContainer, range.startOffset),
        endPos: getTextPosition(range.endContainer, range.endOffset),
      };

      // Validate selection
      if (!isValidSelection(textSelection)) {
        closeMenu();
        return;
      }

      // Get available actions
      const actions = getMenuActions(textSelection);
      
      // Only show menu if there are actions available
      if (actions.length === 0) {
        closeMenu();
        return;
      }

      // Calculate menu position
      const rect = range.getBoundingClientRect();
      const menuPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top - 10, // Slightly above the selection
      };

      // Update state
      setCurrentSelection(textSelection);
      setPosition(menuPosition);
      setIsVisible(true);
    }, 500); // Half-second delay before showing the menu
  }, [fullText, closeMenu, getMenuActions]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    position,
    actions: currentSelection ? getMenuActions(currentSelection) : [],
    isLoading,
    closeMenu,
    handleSelection,
    setIsLoading,
  };
}

/**
 * Get the text position of a node and offset within the full document
 * This is a simplified implementation - in a real editor, you'd use the editor's API
 */
function getTextPosition(node: Node, offset: number): number {
  // This is a basic implementation
  // In a real TipTap integration, you'd use the editor's position system
  let position = 0;
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  let currentNode: Node | null;
  while ((currentNode = walker.nextNode()) !== null) {
    if (currentNode === node) {
      return position + offset;
    }
    position += currentNode.textContent?.length || 0;
  }

  return position;
} 