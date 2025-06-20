/**
 * Shared Types
 * 
 * This module contains global TypeScript type definitions used across the application.
 */

/**
 * Music genre options for AI generation
 */
export type Genre = 'rock' | 'rap' | 'country';

/**
 * Available genre options as a constant array
 */
export const GENRES: Genre[] = ['rock', 'rap', 'country'] as const; 