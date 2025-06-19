/**
 * Contextual Menu Component
 * 
 * Displays AI enhancement options when text is selected in the editor.
 * Positioned near the user's cursor and shows relevant actions based on the selection.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Sparkles, TrendingUp, Zap, Loader2 } from 'lucide-react';

export interface ContextualMenuAction {
  id: string;
  label: string;
  type: string;
  description?: string;
  onClick: () => void;
}

export interface ContextualMenuProps {
  /** Whether the menu is visible */
  isVisible: boolean;
  /** Position of the menu relative to the viewport */
  position: { x: number; y: number };
  /** Available actions to display */
  actions: ContextualMenuAction[];
  /** Whether any action is currently loading */
  isLoading?: boolean;
  /** Callback when menu should be hidden */
  onClose: () => void;
}

/**
 * Contextual menu that appears near selected text with AI enhancement options
 */
export function ContextualMenu({
  isVisible,
  position,
  actions,
  isLoading = false,
  onClose,
}: ContextualMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, onClose]);

  if (!isVisible || actions.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-2 min-w-48"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)', // Center horizontally, position above cursor
      }}
    >
      <div className="flex flex-col gap-1">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className="justify-start gap-2 h-auto p-2"
            onClick={() => {
              action.onClick();
              onClose();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              getActionIcon(action.type)
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{action.label}</span>
              {action.description && (
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Get the appropriate icon for an AI action type
 */
function getActionIcon(type: string): React.ReactNode {
  switch (type) {
    case 'rhyme':
      return <Music className="h-4 w-4 text-purple-500" />;
    case 'generate':
      return <Sparkles className="h-4 w-4 text-blue-500" />;
    case 'enhance':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    default:
      return <Zap className="h-4 w-4 text-gray-500" />;
  }
} 