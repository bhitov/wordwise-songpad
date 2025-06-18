/**
 * @file Test script for LanguageTool API integration.
 * This script tests both the core checker library and the API route handler.
 * 
 * Run with: npm run test:languagetool
 */

// Test data with intentional errors
const testCases = [
  {
    name: 'Grammar Error',
    text: 'This are a test sentence with grammar error.',
    expectedIssues: ['grammar', 'agreement']
  },
  {
    name: 'Spelling Error',
    text: 'This is a test sentance with speling errors.',
    expectedIssues: ['spelling']
  },
  {
    name: 'Style Issue',
    text: 'This is a test sentence that is very very very very repetitive and redundant.',
    expectedIssues: ['style']
  },
  {
    name: 'Clean Text',
    text: 'This is a perfectly written sentence.',
    expectedIssues: []
  }
];

/**
 * Test the core checker library directly
 */
async function testCoreLibrary() {
  console.log('\n🔍 Testing Core LanguageTool Library...\n');
  
  try {
    // Test the LanguageTool API directly since we can't easily import TS files
    const testText = 'This are a test sentence with grammar error.';
    console.log(`Testing direct API call with: "${testText}"`);
    
    const params = new URLSearchParams();
    params.append('text', testText);
    params.append('language', 'en-US');
    params.append('enabledOnly', 'false');
    params.append('level', 'picky');

    const response = await fetch('http://54.242.206.96:8010/v2/check', {
      method: 'POST',
      body: params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response body: ${errorText}`);
      throw new Error(`LanguageTool API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Direct API call successful: Found ${data.matches.length} matches`);
    
    if (data.matches.length > 0) {
      data.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.rule.issueType}: ${match.shortMessage}`);
        console.log(`     Context: "${match.context.text}"`);
        console.log(`     Suggestions: ${match.replacements.map(r => r.value).join(', ')}`);
      });
    }
    
    console.log(`   Language detected: ${data.language.detectedLanguage.name} (${data.language.detectedLanguage.confidence})`);
    console.log(`   Software: ${data.software.name} v${data.software.version}`);
    
         console.log('---');
    
      } catch (error) {
     console.error('❌ Failed to test LanguageTool API:', error);
   }
}

/**
 * Test the API route handler
 */
async function testAPIHandler() {
  console.log('\n🌐 Testing API Route Handler...\n');
  
  // Check if we're in a development environment
  const baseUrl = process.env.NEXTJS_URL || 'http://localhost:3000';
  
  for (const testCase of testCases) {
    console.log(`Testing API: ${testCase.name}`);
    console.log(`Text: "${testCase.text}"`);
    
    try {
      const response = await fetch(`${baseUrl}/api/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testCase.text,
          language: 'en-US'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ API Success: Found ${data.data.totalMatches} corrections`);
        
        if (data.data.corrections.length > 0) {
          data.data.corrections.forEach((correction, index) => {
            console.log(`  ${index + 1}. ${correction.type}: ${correction.shortMessage}`);
            console.log(`     Original: "${correction.originalText}"`);
            console.log(`     Suggestions: ${correction.suggestions.join(', ')}`);
          });
        }
        
        console.log(`   Language: ${data.data.language.name}`);
        console.log(`   Software: ${data.data.software.name} v${data.data.software.version}`);
        
      } else {
        console.error(`❌ API Error: ${data.error}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to test API for "${testCase.name}":`, error.message);
    }
    
    console.log('---');
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling...\n');
  
  const baseUrl = process.env.NEXTJS_URL || 'http://localhost:3000';
  
  const errorCases = [
    {
      name: 'Empty Text',
      body: { text: '' },
      expectedError: 'Text cannot be empty'
    },
    {
      name: 'Missing Text',
      body: { language: 'en-US' },
      expectedError: 'Invalid request data'
    },
    {
      name: 'Too Long Text',
      body: { text: 'a'.repeat(10001) },
      expectedError: 'Text too long'
    }
  ];
  
  for (const errorCase of errorCases) {
    console.log(`Testing Error: ${errorCase.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/corrections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorCase.body),
      });
      
      const data = await response.json();
      
      if (response.status === 400 && data.error) {
        console.log(`✅ Correctly handled error: ${data.error}`);
      } else {
        console.error(`❌ Expected error but got: ${response.status} - ${JSON.stringify(data)}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to test error case "${errorCase.name}":`, error.message);
    }
    
    console.log('---');
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 LanguageTool API Integration Test');
  console.log('=====================================');
  
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  try {
    if (testType === 'all' || testType === 'core') {
      await testCoreLibrary();
    }
    
    if (testType === 'all' || testType === 'api') {
      await testAPIHandler();
      await testErrorHandling();
    }
    
    console.log('\n✨ Test completed!');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 