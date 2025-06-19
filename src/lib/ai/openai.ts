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