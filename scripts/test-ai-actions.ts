/**
 * AI Actions Handler Test Script
 * 
 * Tests the AI actions handler to ensure it correctly identifies
 * when to show the "Convert to Lyrics" option based on text selection.
 */

import { getAvailableAIActions, isValidSelection, type TextSelection } from '../src/lib/ai/actions-handler';

function testAIActionsHandler() {
  console.log('🧪 Testing AI Actions Handler\n');

  const testCases: { name: string; selection: TextSelection; expectedActions: string[] }[] = [
    {
      name: 'Single word selection',
      selection: {
        selectedText: 'word',
        fullText: 'This is a test word in a sentence.',
      },
      expectedActions: [],
    },
    {
      name: 'Single sentence selection',
      selection: {
        selectedText: 'This is a test sentence.',
        fullText: 'This is a test sentence. This is another sentence.',
      },
      expectedActions: [],
    },
    {
      name: 'Two sentences selection (should show Convert to Lyrics)',
      selection: {
        selectedText: 'This is the first sentence. This is the second sentence.',
        fullText: 'This is the first sentence. This is the second sentence. This is a third.',
      },
      expectedActions: ['convert-to-lyrics', 'generate-verses'], // 10 words + 2 sentences = both actions
    },
    {
      name: 'Multiple sentences with punctuation',
      selection: {
        selectedText: 'I love to rap! It makes me feel alive.',
        fullText: 'I love to rap! It makes me feel alive. Music is my passion.',
      },
      expectedActions: ['convert-to-lyrics', 'generate-verses'], // 9 words + 2 sentences = both actions
    },
    {
      name: 'Empty selection',
      selection: {
        selectedText: '',
        fullText: 'Some text here.',
      },
      expectedActions: [],
    },
    {
      name: 'Whitespace only selection',
      selection: {
        selectedText: '   ',
        fullText: 'Some text here.',
      },
      expectedActions: [],
    },
    {
      name: 'Three sentences selection',
      selection: {
        selectedText: 'First sentence. Second sentence. Third sentence.',
        fullText: 'First sentence. Second sentence. Third sentence. Fourth sentence.',
      },
      expectedActions: ['convert-to-lyrics'],
    },
    {
      name: 'Partial sentences (no ending punctuation)',
      selection: {
        selectedText: 'This is incomplete and this is also incomplete',
        fullText: 'This is incomplete and this is also incomplete. Complete sentence here.',
      },
      expectedActions: ['generate-verses'], // 8+ words qualifies for generate verses
    },
    {
      name: 'Eight words exactly - should trigger generate verses',
      selection: {
        selectedText: 'A story about love and heartbreak in the city',
        fullText: 'A story about love and heartbreak in the city. More content here.',
      },
      expectedActions: ['generate-verses'],
    },
    {
      name: 'Long description - should trigger both actions',
      selection: {
        selectedText: 'This is a long description about overcoming challenges. It contains multiple sentences and many words.',
        fullText: 'This is a long description about overcoming challenges. It contains multiple sentences and many words. Additional context here.',
      },
      expectedActions: ['convert-to-lyrics', 'generate-verses'],
    },
    {
      name: 'Seven words only - should not trigger generate verses',
      selection: {
        selectedText: 'Short description with only seven words exactly',
        fullText: 'Short description with only seven words exactly. More text.',
      },
      expectedActions: [],
    },
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`  Selected: "${testCase.selection.selectedText}"`);
    
    // Test validation
    const isValid = isValidSelection(testCase.selection);
    console.log(`  Valid selection: ${isValid}`);
    
    // Test actions
    const actions = getAvailableAIActions(testCase.selection);
    const actionIds = actions.map(a => a.id);
    
    console.log(`  Available actions: [${actionIds.join(', ') || 'none'}]`);
    console.log(`  Expected actions: [${testCase.expectedActions.join(', ') || 'none'}]`);
    
    // Check if results match expectations
    const matches = 
      actionIds.length === testCase.expectedActions.length &&
      actionIds.every(id => testCase.expectedActions.includes(id));
    
    if (matches) {
      console.log(`  ✅ PASS\n`);
      passedTests++;
    } else {
      console.log(`  ❌ FAIL\n`);
    }
  });

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! AI Actions Handler is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please review the AI Actions Handler logic.');
  }
}

// Run the tests
testAIActionsHandler(); 