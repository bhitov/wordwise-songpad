/**
 * Convert to Lyrics Action Test Script
 * 
 * Tests the getConvertToLyricsAction function to ensure it returns
 * the correct labels and descriptions for each genre.
 */

import { getConvertToLyricsAction } from '../src/lib/ai/actions-handler';
import type { Genre } from '../src/types';

function runTests() {
  console.log('🎯 Testing getConvertToLyricsAction function\n');

  const genres: Genre[] = ['rap', 'rock', 'country'];

  genres.forEach((genre) => {
    console.log(`--- Testing ${genre.toUpperCase()} genre ---`);
    
    try {
      const action = getConvertToLyricsAction(genre);
      
      console.log('ID:', action.id);
      console.log('Type:', action.type);
      console.log('Label:', action.label);
      console.log('Description:', action.description);
      
      // Validate that we get expected results
      if (!action.id || !action.type || !action.label || !action.description) {
        throw new Error('Missing required action properties');
      }
      
      // Check that ID and type are consistent
      if (action.id !== 'convert-to-lyrics' || action.type !== 'convert-to-lyrics') {
        throw new Error(`Expected id and type to be 'convert-to-lyrics', got id: '${action.id}', type: '${action.type}'`);
      }
      
      // Check genre-specific expectations
      switch (genre) {
        case 'rap':
          if (action.label !== 'Make it Rhyme') {
            throw new Error(`Expected "Make it Rhyme" for rap, got "${action.label}"`);
          }
          break;
        case 'rock':
          if (!action.label.includes('Rock')) {
            throw new Error(`Expected Rock in label for rock genre, got "${action.label}"`);
          }
          break;
        case 'country':
          if (!action.label.includes('Country')) {
            throw new Error(`Expected Country in label for country genre, got "${action.label}"`);
          }
          break;
      }
      
      console.log('✅ Success!\n');
      
    } catch (error) {
      console.error('❌ Failed:', error instanceof Error ? error.message : error);
      console.log('');
    }
  });

  console.log('🎉 getConvertToLyricsAction tests completed!');
  console.log('\nExpected results:');
  console.log('- All genres: id="convert-to-lyrics", type="convert-to-lyrics"');
  console.log('- RAP: "Make it Rhyme" with rhyming description');
  console.log('- ROCK: "Convert to Rock Lyrics" with energy/attitude description');
  console.log('- COUNTRY: "Convert to Country Lyrics" with storytelling description');
}

// Run the tests
runTests(); 