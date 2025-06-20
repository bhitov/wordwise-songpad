/**
 * OpenAI Module Index
 * 
 * This module exports all OpenAI-related functionality from the modular structure.
 * Import from this file to access any OpenAI features.
 */

// Export client functions
export { createChatCompletion, testOpenAIConnection, validateOpenAIConfig } from './client';

// Export AI features
export { makeItRhyme } from './make-it-rhyme';
export { generateChorus, addVerse, generateVersesFromDescription } from './song-enhancement'; 