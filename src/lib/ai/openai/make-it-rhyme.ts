/**
 * Make It Rhyme
 * 
 * This module provides the "Make It Rhyme" AI functionality for transforming
 * selected text to have better rhyming while preserving meaning.
 */

import { createChatCompletion } from './client';
import type { Genre } from '@/types';

/**
 * Transform selected text to make it rhyme better while preserving meaning
 * 
 * @param selectedText - The text selected by the user to be transformed
 * @param fullText - The complete document content for context
 * @param genre - The music genre to style the transformation for
 * @returns Promise<string> - The transformed text with better rhyming
 */
export async function makeItRhyme(selectedText: string, fullText: string, genre: Genre = 'rap'): Promise<string> {
  try {
    console.log('🎤 AI - Making text rhyme:', {
      selectedText: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
      hasContext: fullText.length > 0,
      genre
    });
    
    // Create genre-specific system prompts
    const genrePrompts = {
      rap: `You are an expert rap lyricist and poet who transforms text to make it rhyme while preserving the original meaning and intent. Your goal is to:

1. Maintain the core message and meaning of the original text
2. Improve the rhythm and flow for rap/hip-hop style
3. Add internal rhymes, end rhymes, and wordplay where appropriate
4. Keep the same general length and structure
5. Make it sound natural and authentic, not forced
6. Always use new lines between bars
7. Use rap-style language and delivery

Transform the text to be more lyrical and rhythmic while keeping the essence intact.`,

      rock: `You are an expert rock lyricist who transforms text to make it rhyme while preserving the original meaning and intent. Your goal is to:

1. Maintain the core message and meaning of the original text
2. Improve the rhythm and flow for rock/alternative style
3. Add powerful rhymes and memorable phrases
4. Keep the same general length and structure
5. Make it sound anthemic and energetic
6. Always use new lines between verses
7. Use rock-style language with attitude and power

Transform the text to be more powerful and rhythmic while keeping the essence intact.`,

      country: `You are an expert country music lyricist who transforms text to make it rhyme while preserving the original meaning and intent. Your goal is to:

1. Maintain the core message and meaning of the original text
2. Improve the rhythm and flow for country music style
3. Add storytelling elements and relatable rhymes
4. Keep the same general length and structure
5. Make it sound heartfelt and authentic
6. Always use new lines between verses
7. Use country-style language with storytelling and emotion

Transform the text to be more melodic and story-driven while keeping the essence intact.`
    };

    const systemPrompt = genrePrompts[genre];

    const userPrompt = fullText.length > 0 
      ? `Here's the full document for context:
"${fullText}"

Please transform this selected portion to make it rhyme better in ${genre} style:
"${selectedText}"

Return ONLY the transformed version of the selected text, nothing else.`
      : `Please transform this text to make it rhyme better in ${genre} style:
"${selectedText}"

Return ONLY the transformed version, nothing else.`;

    const transformedText = await createChatCompletion([
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ], {
      model: 'gpt-4o',
      maxTokens: 500,
      temperature: 0.8 // Higher temperature for more creative rhyming
    });

    // Fallback to original text if no response
    const result = transformedText || selectedText;
    
    console.log('🎤 AI - Transformation successful:', {
      originalLength: selectedText.length,
      transformedLength: result.length,
      original: selectedText,
      transformed: result,
      genre
    });
    
    return result;
  } catch (error) {
    console.error('❌ AI - Make it rhyme failed:', error);
    
    if (error instanceof Error) {
      throw new Error(`Make It Rhyme Error: ${error.message}`);
    }
    
    throw new Error('Unknown Make It Rhyme Error');
  }
} 