/**
 * @file Song enhancement functions using OpenAI
 * Provides whole-text AI operations for generating chorus and adding verses
 */

import { createChatCompletion } from './client';
import type { Genre } from '@/types';

/**
 * Generate a chorus for the entire song text
 * 
 * @param fullText - The complete song text
 * @param genre - The music genre to style the chorus for
 * @returns Promise<string> - The complete song with chorus added
 */
export async function generateChorus(fullText: string, genre: Genre): Promise<string> {
  console.log('🎵 AI - Generating chorus:', {
    textLength: fullText.length,
    genre
  });

  // Create genre-specific system prompts
  const genrePrompts = {
    rap: `You are an expert rap songwriter and producer. You specialize in creating catchy, memorable choruses that complement rap verses. Your choruses should have strong hooks, rhythmic flow, and fit seamlessly with the existing verses.`,
    rock: `You are an expert rock songwriter and producer. You specialize in creating powerful, anthemic choruses that complement rock verses. Your choruses should be energetic, memorable, and fit seamlessly with the existing verses.`,
    country: `You are an expert country songwriter and producer. You specialize in creating heartfelt, storytelling choruses that complement country verses. Your choruses should be melodic, relatable, and fit seamlessly with the existing verses.`
  };

  const systemPrompt = genrePrompts[genre];

  const userPrompt = `Please analyze this ${genre} song and add an appropriate chorus where it would fit best. The chorus should:

1. Complement the existing verses and maintain the song's theme
2. Be memorable and catchy in ${genre} style
3. Fit naturally into the song structure
4. Match the rhythm and flow of the existing lyrics

Here's the song:

${fullText}

Return the complete song with the chorus integrated naturally. Only return the lyrics, no explanations or additional text. Do not add any labels like [Chorus], [Verse], or any other section markers - just return the raw lyrics.`;

  const result = await createChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: 'gpt-4o',
    maxTokens: 800,
    temperature: 0.8,
  });

  const enhancedText = result.trim();

  console.log('🎵 AI - Chorus generation successful:', {
    originalLength: fullText.length,
    enhancedLength: enhancedText.length,
    genre
  });

  return enhancedText;
}

/**
 * Add a new verse to the end of the song text
 * 
 * @param fullText - The complete song text
 * @param genre - The music genre to style the verse for
 * @returns Promise<string> - The original text with new verse appended
 */
export async function addVerse(fullText: string, genre: Genre): Promise<string> {
  console.log('🎵 AI - Adding verse:', {
    textLength: fullText.length,
    genre
  });

  // Create genre-specific system prompts
  const genrePrompts = {
    rap: `You are an expert rap songwriter. You specialize in creating verses that maintain consistency with existing lyrics while adding new content. Your verses should have strong flow, clever wordplay, and seamlessly continue the song's narrative.`,
    rock: `You are an expert rock songwriter. You specialize in creating verses that maintain consistency with existing lyrics while adding new content. Your verses should be powerful, energetic, and seamlessly continue the song's narrative.`,
    country: `You are an expert country songwriter. You specialize in creating verses that maintain consistency with existing lyrics while adding new content. Your verses should be storytelling-focused, heartfelt, and seamlessly continue the song's narrative.`
  };

  const systemPrompt = genrePrompts[genre];

  const userPrompt = `Please analyze this ${genre} song and create one additional verse that would fit at the end. The new verse should:

1. Continue the theme and narrative of the existing song
2. Match the rhythm, flow, and style of the existing verses
3. Be consistent with the ${genre} genre
4. Add new content while maintaining the song's overall message

Here's the current song:

${fullText}

Return ONLY the new verse to be added. Do not include the original text, explanations, or additional formatting.`;

  const result = await createChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: 'gpt-4o',
    maxTokens: 300,
    temperature: 0.8,
  });

  const newVerse = result.trim();
  
  // Append the new verse to the original text with proper spacing
  const enhancedText = fullText.trim() + '\n\n' + newVerse;

  console.log('🎵 AI - Verse addition successful:', {
    originalLength: fullText.length,
    newVerseLength: newVerse.length,
    totalLength: enhancedText.length,
    genre
  });

  return enhancedText;
}

/**
 * Generate song verses from a description
 * 
 * @param description - The description text to base verses on
 * @param fullText - The complete document text for context
 * @param genre - The music genre to style the verses for
 * @returns Promise<string> - The generated verses
 */
export async function generateVersesFromDescription(description: string, fullText: string, genre: Genre): Promise<string> {
  console.log('🎵 AI - Generating verses from description:', {
    descriptionLength: description.length,
    fullTextLength: fullText.length,
    genre
  });

  // Determine how many verses to generate based on existing content
  const hasSubstantialContent = hasSubstantialSongContent(fullText);
  const verseCount = hasSubstantialContent ? 2 : 3;

  // Create genre-specific system prompts
  const genrePrompts = {
    rap: `You are an expert rap songwriter and lyricist. You specialize in creating authentic rap verses with strong flow, clever wordplay, and meaningful content. Your verses should have natural rhythm, internal rhymes, and fit seamlessly with existing song content.`,
    rock: `You are an expert rock songwriter and lyricist. You specialize in creating powerful rock verses with energy, attitude, and memorable hooks. Your verses should be anthemic, emotionally charged, and fit seamlessly with existing song content.`,
    country: `You are an expert country songwriter and lyricist. You specialize in creating heartfelt country verses with storytelling, relatable themes, and melodic flow. Your verses should be authentic, emotional, and fit seamlessly with existing song content.`
  };

  const systemPrompt = genrePrompts[genre];

  const contextInfo = fullText.trim() ? 
    `Here's the existing song content for context:
"${fullText}"

The generated verses should complement and flow naturally with this existing content.` :
    'This will be the beginning of a new song.';

  const userPrompt = `Based on this description, create ${verseCount} ${genre} verses:

"${description}"

${contextInfo}

Requirements:
- Generate exactly ${verseCount} verses
- Each verse should be 4-8 lines long
- No chorus or other sections - verses only
- No labels like [Verse 1], [Verse 2] - just the raw lyrics
- Match the ${genre} style and flow
- If there's existing content, ensure the new verses complement it
- Separate verses with a blank line
- Focus on the themes and ideas from the description

Return only the verse lyrics, nothing else.`;

  const result = await createChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], {
    model: 'gpt-4o',
    maxTokens: 600,
    temperature: 0.8,
  });

  const generatedVerses = result.trim();

  console.log('🎵 AI - Verse generation successful:', {
    descriptionLength: description.length,
    versesLength: generatedVerses.length,
    verseCount,
    genre
  });

  return generatedVerses;
}

/**
 * Helper function to determine if document has substantial song content
 * (duplicated from actions-handler for use in this module)
 */
function hasSubstantialSongContent(fullText: string): boolean {
  const wordCount = fullText.trim().split(/\s+/).filter(word => word.length > 0).length;
  const lineCount = fullText.split('\n').filter(line => line.trim().length > 0).length;
  
  // Consider substantial if more than 100 words or more than 8 lines
  return wordCount > 100 || lineCount > 8;
} 