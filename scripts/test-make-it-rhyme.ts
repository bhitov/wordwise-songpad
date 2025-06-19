/**
 * Make It Rhyme Test Script
 * 
 * Tests the "Make it Rhyme" functionality using our centralized OpenAI service
 * to ensure our prompt and logic work correctly.
 */

import { config } from 'dotenv';
import { makeItRhyme } from '../src/lib/ai/openai';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function runTests() {
  console.log('🎤 Starting Make it Rhyme Tests\n');

  const testCases = [
    {
      name: 'Simple two sentences',
      selectedText: 'I love to code every day. It brings me so much joy.',
      fullText: 'Welcome to my coding journey. I love to code every day. It brings me so much joy. This is my passion.',
    },
    {
      name: 'Rap-style content',
      selectedText: 'I wake up in the morning feeling fresh. My mind is clear and ready for success.',
      fullText: 'Here is my daily routine. I wake up in the morning feeling fresh. My mind is clear and ready for success. Then I start working on my projects.',
    },
    {
      name: 'Without context',
      selectedText: 'Programming is my passion. I write code all night long.',
      fullText: '',
    },
    {
      name: 'Longer content',
      selectedText: 'I started coding when I was young. The computer became my best friend. Now I build apps that help people around the world.',
      fullText: 'This is my story. I started coding when I was young. The computer became my best friend. Now I build apps that help people around the world. Technology is amazing.',
    },
    {
      name: 'Real rap lyrics',
      selectedText: "I'm having a good time here at the studio. It's pretty challenging but I'm enjoying myself.",
      fullText: "Yo, welcome to my world. I'm having a good time here at the studio. It's pretty challenging but I'm enjoying myself. Building beats and dropping rhymes all day long.",
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test ${i + 1}: ${testCase.name} ---`);
    console.log('Selected text:', testCase.selectedText);
    console.log('Has full text context:', testCase.fullText.length > 0);
    
    try {
      const result = await makeItRhyme(testCase.selectedText, testCase.fullText);
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

  console.log('\n🎉 Make it Rhyme tests completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Open a document in the editor');
  console.log('3. Type multiple sentences');
  console.log('4. Select 2+ sentences');
  console.log('5. Click "Make it Rhyme" from the contextual menu');
  console.log('6. Watch the magic happen! ✨');
}

// Run the tests
runTests().catch(console.error); 