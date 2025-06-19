/**
 * OpenAI Service Test Script
 * 
 * This script tests the OpenAI service to ensure it's properly configured
 * and can communicate with the OpenAI API.
 * 
 * Run with: npm run test:openai or npx ts-node scripts/test-openai.ts
 */

import { config } from 'dotenv';
import { testOpenAIConnection, validateOpenAIConfig } from '../src/lib/ai/openai';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function runOpenAITest() {
  console.log('🚀 Starting OpenAI Service Test\n');
  
  try {
    // Step 1: Validate configuration
    console.log('Step 1: Validating OpenAI configuration...');
    const isConfigValid = validateOpenAIConfig();
    
    if (!isConfigValid) {
      console.error('❌ Configuration validation failed. Please check your OPENAI_API_KEY in .env.local');
      process.exit(1);
    }
    
    console.log('');
    
    // Step 2: Test basic connection
    console.log('Step 2: Testing basic OpenAI connection...');
    const basicResponse = await testOpenAIConnection();
    console.log('Basic test response:', basicResponse);
    console.log('');
    
    // Step 3: Test with custom message
    console.log('Step 3: Testing with custom message...');
    const customMessage = "Please respond with exactly: 'WordWise OpenAI integration is working perfectly!'";
    const customResponse = await testOpenAIConnection(customMessage);
    console.log('Custom test response:', customResponse);
    console.log('');
    
    // Step 4: Test rap-related functionality (preview of Phase 3)
    console.log('Step 4: Testing rap-related AI capability...');
    const rapTestMessage = "Complete this rap lyric with one rhyming line: 'I'm coding all day, building features that shine'";
    const rapResponse = await testOpenAIConnection(rapTestMessage);
    console.log('Rap test response:', rapResponse);
    console.log('');
    
    console.log('🎉 All OpenAI tests completed successfully!');
    console.log('✅ OpenAI service is ready for Phase 3 implementation');
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure OPENAI_API_KEY is set in .env.local');
    console.log('2. Verify your API key is valid and has sufficient credits');
    console.log('3. Check your internet connection');
    console.log('4. Ensure the OpenAI service is not experiencing outages');
    
    process.exit(1);
  }
}

// Run the test
runOpenAITest(); 