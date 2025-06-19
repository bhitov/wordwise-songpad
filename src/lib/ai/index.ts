/**
 * AI Library Index
 * 
 * Exports all AI-related utilities, handlers, and services for easy importing.
 */

// OpenAI Service
export { testOpenAIConnection, validateOpenAIConfig } from './openai';

// Actions Handler
export { 
  getAvailableAIActions, 
  isValidSelection, 
  getSelectionContext,
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