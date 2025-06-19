/**
 * OpenAI Service
 * 
 * This module provides functions for interacting with the OpenAI API
 * for AI-powered text generation and enhancement features.
 */

import OpenAI from 'openai';

/**
 * Get OpenAI client instance
 * 
 * @returns OpenAI client instance
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

/**
 * Transform selected text to make it rhyme better while preserving meaning
 * 
 * @param selectedText - The text selected by the user to be transformed
 * @param fullText - The complete document content for context
 * @returns Promise<string> - The transformed text with better rhyming
 */
export async function makeItRhyme(selectedText: string, fullText: string): Promise<string> {
  try {
    console.log('🎤 AI - Making text rhyme:', {
      selectedText: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
      hasContext: fullText.length > 0
    });

    const openai = getOpenAIClient();
    
    // Create a comprehensive prompt for rhyme transformation
    const systemPrompt = `You are an expert rap lyricist and poet who transforms text to make it rhyme while preserving the original meaning and intent. Your goal is to:

1. Maintain the core message and meaning of the original text
2. Improve the rhythm and flow for rap/hip-hop style
3. Add internal rhymes, end rhymes, and wordplay where appropriate
4. Keep the same general length and structure
5. Make it sound natural and authentic, not forced

Transform the text to be more lyrical and rhythmic while keeping the essence intact.`;

    const userPrompt = fullText.length > 0 
      ? `Here's the full document for context:
"${fullText}"

Please transform this selected portion to make it rhyme better:
"${selectedText}"

Return ONLY the transformed version of the selected text, nothing else.`
      : `Please transform this text to make it rhyme better:
"${selectedText}"

Return ONLY the transformed version, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8, // Higher temperature for more creative rhyming
    });

    const transformedText = completion.choices[0]?.message?.content?.trim() || selectedText;
    
    console.log('🎤 AI - Transformation successful:', {
      originalLength: selectedText.length,
      transformedLength: transformedText.length,
      original: selectedText.substring(0, 50) + '...',
      transformed: transformedText.substring(0, 50) + '...'
    });
    
    return transformedText;
  } catch (error) {
    console.error('❌ AI - Make it rhyme failed:', error);
    
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    
    throw new Error('Unknown OpenAI API Error');
  }
}

/**
 * Test function to verify OpenAI API connectivity
 * 
 * @param message - Test message to send to the API
 * @returns Promise<string> - Response from OpenAI
 */
export async function testOpenAIConnection(message: string = "Hello, can you respond with 'OpenAI connection successful'?"): Promise<string> {
  try {
    console.log('🤖 Testing OpenAI connection...');
    console.log('📤 Sending message:', message);

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'No response received';
    
    console.log('📥 Received response:', response);
    console.log('✅ OpenAI connection test successful');
    
    return response;
  } catch (error) {
    console.error('❌ OpenAI connection test failed:', error);
    
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    
    throw new Error('Unknown OpenAI API Error');
  }
}

/**
 * Validate OpenAI configuration
 * 
 * @returns boolean - Whether the OpenAI client is properly configured
 */
export function validateOpenAIConfig(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is not set');
    return false;
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ OPENAI_API_KEY does not appear to be valid (should start with sk-)');
    return false;
  }
  
  console.log('✅ OpenAI configuration appears valid');
  return true;
} 