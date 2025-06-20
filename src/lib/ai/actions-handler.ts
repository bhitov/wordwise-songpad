/**
 * AI Actions Handler
 * 
 * Analyzes selected text and full document content to determine
 * which AI enhancement actions should be available to the user.
 */

import type { Genre } from '@/types';

export interface TextSelection {
  /** The selected text */
  selectedText: string;
  /** The full document text */
  fullText: string;
  /** Start position of selection in the document */
  startPos?: number;
  /** End position of selection in the document */
  endPos?: number;
}

export interface AIAction {
  id: string;
  label: string;
  description: string;
  type: 'convert-to-lyrics' | 'generate' | 'enhance';
}

/**
 * Get genre-specific label and description for the convert to lyrics action
 * 
 * @param genre - The music genre to get labels for
 * @returns Object with label and description for the genre
 */
export function getConvertToLyricsAction(genre: Genre): AIAction {
  const actions = {
    rap: {
      label: 'Make it Rhyme',
      description: 'Transform the selected text to make it rhyme while preserving meaning'
    },
    rock: {
      label: 'Convert to Rock Lyrics',
      description: 'Transform the selected text into powerful rock lyrics with energy and attitude'
    },
    country: {
      label: 'Convert to Country Lyrics',
      description: 'Transform the selected text into heartfelt country lyrics with storytelling'
    }
  };
  
  return {
    id: 'convert-to-lyrics',
    type: 'convert-to-lyrics' as const,
    ...actions[genre]
  }
}

/**
 * Available AI actions that can be performed on text
 */
export const AI_ACTIONS = {
  CONVERT_TO_LYRICS: {
    id: 'convert-to-lyrics',
    label: 'Convert to Lyrics',
    description: 'Transform the selected text into lyrics while preserving meaning',
    type: 'convert-to-lyrics' as const,
  },
  // Future actions can be added here
  // BUILD_LYRICS: {
  //   id: 'build-lyrics',
  //   label: 'Build Lyrics',
  //   description: 'Generate rap lyrics from a description',
  //   type: 'generate' as const,
  // },
  // RHYME_WITH_PREVIOUS: {
  //   id: 'rhyme-with-previous', 
  //   label: 'Rhyme with Previous',
  //   description: 'Make this sentence rhyme with the previous one',
  //   type: 'rhyme' as const,
  // },
} as const;

/**
 * Counts the number of sentences in a text string
 * 
 * @param text - Text to analyze
 * @returns Number of sentences found
 */
function countSentences(text: string): number {
  if (!text.trim()) return 0;
  
  // Split on sentence-ending punctuation, filter out empty strings
  const sentences = text
    .trim()
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 0);
  
  return sentences.length;
}

/**
 * Checks if text contains multiple words (not just a single word)
 * 
 * @param text - Text to analyze
 * @returns True if text contains multiple words
 */
function hasMultipleWords(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length > 1;
}

/**
 * Determines which AI actions should be available based on the text selection
 * 
 * @param selection - Information about the selected text and context
 * @param genre - The music genre to use for action labels and descriptions
 * @returns Array of available AI actions
 */
export function getAvailableAIActions(selection: TextSelection, genre: Genre = 'rap'): AIAction[] {
  const { selectedText } = selection;
  const availableActions: AIAction[] = [];

  // Normalize the selected text
  const trimmedSelection = selectedText.trim();
  
  // If no meaningful text is selected, return no actions
  if (!trimmedSelection || trimmedSelection.length < 3) {
    return availableActions;
  }

  // Count sentences in the selection
  const sentenceCount = countSentences(trimmedSelection);
  
  // Check if selection has multiple words
  const hasMultiWords = hasMultipleWords(trimmedSelection);

  // Rule: "Convert to Lyrics" appears if more than one sentence is selected
  if (sentenceCount > 1 && hasMultiWords) {
    availableActions.push(getConvertToLyricsAction(genre));
  }

  console.log('🎯 AI Actions Analysis:', {
    selectedText: trimmedSelection.substring(0, 50) + (trimmedSelection.length > 50 ? '...' : ''),
    sentenceCount,
    hasMultiWords,
    genre,
    availableActions: availableActions.map(a => a.id),
  });

  return availableActions;
}

/**
 * Validates if a text selection is suitable for AI processing
 * 
 * @param selection - Text selection to validate
 * @returns True if selection is valid for AI processing
 */
export function isValidSelection(selection: TextSelection): boolean {
  const { selectedText } = selection;
  const trimmed = selectedText.trim();
  
  // Must have meaningful content
  if (!trimmed || trimmed.length < 3) {
    return false;
  }
  
  // Must have at least one word
  if (!hasMultipleWords(trimmed) && trimmed.split(/\s+/).length < 1) {
    return false;
  }
  
  return true;
}

/**
 * Extracts context around a selection for better AI processing
 * 
 * @param selection - Text selection information
 * @param contextWords - Number of words to include before/after selection
 * @returns Object with before/after context
 */
export function getSelectionContext(
  selection: TextSelection, 
  contextWords: number = 10
): { before: string; after: string } {
  const { fullText, startPos = 0, endPos = 0 } = selection;
  
  if (!fullText || startPos === undefined || endPos === undefined) {
    return { before: '', after: '' };
  }
  
  const beforeText = fullText.substring(0, startPos);
  const afterText = fullText.substring(endPos);
  
  // Get last N words before selection
  const beforeWords = beforeText.trim().split(/\s+/).slice(-contextWords);
  const before = beforeWords.join(' ');
  
  // Get first N words after selection
  const afterWords = afterText.trim().split(/\s+/).slice(0, contextWords);
  const after = afterWords.join(' ');
  
  return { before, after };
} 