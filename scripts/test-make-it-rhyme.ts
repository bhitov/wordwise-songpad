/**
 * Convert to Lyrics Test Script
 * 
 * Tests the "Convert to Lyrics" functionality using our centralized OpenAI service
 * with different genres to ensure our prompt and logic work correctly.
 */

import { config } from 'dotenv';
import { makeItRhyme } from '../src/lib/ai/openai';
import type { Genre } from '../src/types';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function runTests() {
  console.log('🎤 Starting Convert to Lyrics Tests with Genre Support\n');

  const testCases = [
    {
      name: 'Simple rap transformation',
      selectedText: 'I love to code every day. It brings me so much joy.',
      fullText: 'Welcome to my coding journey. I love to code every day. It brings me so much joy. This is my passion.',
      genre: 'rap' as Genre,
    },
    {
      name: 'Rock style transformation',
      selectedText: 'I wake up in the morning feeling fresh. My mind is clear and ready for success.',
      fullText: 'Here is my daily routine. I wake up in the morning feeling fresh. My mind is clear and ready for success. Then I start working on my projects.',
      genre: 'rock' as Genre,
    },
    {
      name: 'Country style transformation',
      selectedText: 'Programming is my passion. I write code all night long.',
      fullText: 'This is my story about coding. Programming is my passion. I write code all night long. It helps me solve problems.',
      genre: 'country' as Genre,
    },
    {
      name: 'Rap without context',
      selectedText: 'I started coding when I was young. The computer became my best friend.',
      fullText: '',
      genre: 'rap' as Genre,
    },
    {
      name: 'Rock anthem style',
      selectedText: "I'm building something amazing. It's going to change the world.",
      fullText: "This is my mission. I'm building something amazing. It's going to change the world. Nothing can stop me now.",
      genre: 'rock' as Genre,
    },
    {
      name: 'Country storytelling',
      selectedText: "I grew up in a small town. Technology wasn't everywhere back then.",
      fullText: "Let me tell you about my journey. I grew up in a small town. Technology wasn't everywhere back then. But I had big dreams.",
      genre: 'country' as Genre,
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test ${i + 1}: ${testCase.name} (${testCase.genre.toUpperCase()}) ---`);
    console.log('Selected text:', testCase.selectedText);
    console.log('Has full text context:', testCase.fullText.length > 0);
    console.log('Genre:', testCase.genre);
    
    try {
      const result = await makeItRhyme(testCase.selectedText, testCase.fullText, testCase.genre);
      console.log('Transformed text:', result);
      console.log('✅ Success!');
    } catch (error) {
      console.error('❌ Failed:', error instanceof Error ? error.message : error);
    }
    
    // Add delay between requests to be respectful to the API
    if (i < testCases.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n🎉 Convert to Lyrics tests completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Open a document in the editor');
  console.log('3. Type multiple sentences');
  console.log('4. Select 2+ sentences');
  console.log('5. Click "Convert to Lyrics" from the contextual menu');
  console.log('6. Watch the magic happen with genre-specific transformations! ✨');
}

// Run the tests
runTests().catch(console.error); 