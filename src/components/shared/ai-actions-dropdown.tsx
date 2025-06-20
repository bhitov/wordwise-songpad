/**
 * @file AI Actions dropdown component for whole-text AI operations
 * Provides options to generate chorus and add verse to the entire document
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Sparkles, Plus, Music } from 'lucide-react';
import type { Genre } from '@/types';

/**
 * Props for the AI Actions dropdown
 */
interface AIActionsDropdownProps {
  /** Current document content */
  content: string;
  /** Current song genre */
  genre: Genre;
  /** Callback when AI action is triggered */
  onAIAction: (actionType: 'generate-chorus' | 'add-verse', content: string, genre: Genre) => Promise<void>;
  /** Whether an AI action is currently processing */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * AI Actions dropdown component
 */
export function AIActionsDropdown({
  content,
  genre,
  onAIAction,
  isLoading = false,
  className = '',
}: AIActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = async (actionType: 'generate-chorus' | 'add-verse') => {
    setIsOpen(false);
    await onAIAction(actionType, content, genre);
  };

  const isDisabled = isLoading || !content.trim();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          className={`flex items-center gap-2 ${className}`}
        >
          <Sparkles className="h-4 w-4" />
          AI Actions
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          Song Enhancement
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleAction('generate-chorus')}
          disabled={isDisabled}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Generate Chorus</span>
            <span className="text-xs text-muted-foreground">
              Add a chorus that fits the {genre} style
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleAction('add-verse')}
          disabled={isDisabled}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">Add Verse</span>
            <span className="text-xs text-muted-foreground">
              Append a new verse in {genre} style
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 