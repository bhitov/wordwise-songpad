/**
 * OpenAI Client
 * 
 * This module provides a centralized client for making calls to the OpenAI API.
 * All other OpenAI-related functions should use this client instead of creating their own.
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
 * Make a chat completion request to OpenAI
 * 
 * @param messages - Array of messages for the conversation
 * @param options - Optional configuration for the request
 * @returns Promise<string> - The response content from OpenAI
 */
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  try {
    const {
      model = 'gpt-4o',
      maxTokens = 500,
      temperature = 0.7
    } = options;

    console.log('🤖 OpenAI - Creating chat completion:', {
      model,
      maxTokens,
      temperature,
      messageCount: messages.length
    });

    const openai = getOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    
    console.log('✅ OpenAI - Chat completion successful:', {
      responseLength: response.length,
      tokensUsed: completion.usage?.total_tokens || 'unknown'
    });
    
    return response;
  } catch (error) {
    console.error('❌ OpenAI - Chat completion failed:', error);
    
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

    const response = await createChatCompletion([
      {
        role: 'user',
        content: message
      }
    ], {
      maxTokens: 100,
      temperature: 0.7
    });
    
    console.log('📥 Received response:', response);
    console.log('✅ OpenAI connection test successful');
    
    return response;
  } catch (error) {
    console.error('❌ OpenAI connection test failed:', error);
    throw error;
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