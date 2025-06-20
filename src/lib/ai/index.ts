/**
 * AI Library Index
 * 
 * Exports all AI-related utilities, handlers, and services for easy importing.
 */

// Types
export type { Genre } from '@/types';

// OpenAI Service (now modular)
export { testOpenAIConnection, validateOpenAIConfig, makeItRhyme, createChatCompletion } from './openai';

// Actions Handler
export { 
  getAvailableAIActions, 
  isValidSelection, 
  getSelectionContext,
  getConvertToLyricsAction,
  AI_ACTIONS 
} from './actions-handler';
export type { TextSelection, AIAction } from './actions-handler';

// Hooks
export { useAIContextualMenu } from '../hooks/use-ai-contextual-menu';
export type { 
  UseAIContextualMenuProps, 
  UseAIContextualMenuReturn, 
  MenuAction 
} from '../hooks/use-ai-contextual-menu'; 