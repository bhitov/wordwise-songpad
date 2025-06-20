/**
 * Test script for the new "Generate Verses from Description" functionality
 */

import { generateVersesFromDescription } from '../src/lib/ai/openai';
import type { Genre } from '../src/types';

interface TestCase {
  name: string;
  description: string;
  fullText: string;
  genre: Genre;
  expectedVerseCount: number;
}

/**
 * Test the generate verses functionality
 */
async function testGenerateVerses() {
  console.log('🎵 Testing Generate Verses from Description functionality...\n');

  const testCases: TestCase[] = [
    {
      name: 'New song - Rap genre',
      description: 'A story about overcoming challenges and pursuing dreams despite obstacles and setbacks',
      fullText: '',
      genre: 'rap',
      expectedVerseCount: 3,
    },
    {
      name: 'Existing song - Rock genre',
      description: 'Breaking free from limitations and finding inner strength to face the world',
      fullText: `I've been walking down this road so long
Every step feels like I don't belong
But something's calling me to carry on
Through the darkness until the dawn`,
      genre: 'rock',
      expectedVerseCount: 2,
    },
    {
      name: 'Country storytelling',
      description: 'Small town memories and the people who shaped my journey home',
      fullText: '',
      genre: 'country',
      expectedVerseCount: 3,
    },
  ];

  let successCount = 0;
  const totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`📝 Test: ${testCase.name}`);
      console.log(`   Description: "${testCase.description}"`);
      console.log(`   Genre: ${testCase.genre}`);
      console.log(`   Has existing content: ${testCase.fullText ? 'Yes' : 'No'}`);
      console.log(`   Expected verses: ${testCase.expectedVerseCount}`);

      const startTime = Date.now();
      const result = await generateVersesFromDescription(
        testCase.description,
        testCase.fullText,
        testCase.genre
      );
      const duration = Date.now() - startTime;

      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   📊 Result length: ${result.length} characters`);
      console.log(`   🎵 Generated verses:`);
      console.log('   ---');
      console.log(result.split('\n').map(line => `   ${line}`).join('\n'));
      console.log('   ---');

      // Basic validation
      const verseCount = result.split('\n\n').filter(verse => verse.trim().length > 0).length;
      console.log(`   📈 Actual verse count: ${verseCount}`);

      if (verseCount >= 2 && verseCount <= 3) {
        console.log(`   ✅ PASS - Generated appropriate number of verses\n`);
        successCount++;
      } else {
        console.log(`   ❌ FAIL - Expected ${testCase.expectedVerseCount} verses, got ${verseCount}\n`);
      }

    } catch (error) {
      console.error(`   ❌ FAIL - Error: ${error instanceof Error ? error.message : String(error)}\n`);
    }
  }

  console.log(`📊 Test Results: ${successCount}/${totalTests} tests passed`);
  
  if (successCount === totalTests) {
    console.log('🎉 All tests passed! Generate Verses functionality is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }
}

// Run the tests
testGenerateVerses().catch(console.error); 