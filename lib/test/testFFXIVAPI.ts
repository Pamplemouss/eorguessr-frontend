// Simple test to verify FFXIV API is working
import { searchAndGetFFXIVMaps } from '@/lib/services/ffxivAPI';

export async function testFFXIVAPI() {
  try {
    console.log('Testing FFXIV API...');
    
    // Test search for a well-known map
    const results = await searchAndGetFFXIVMaps('Ul\'dah', 'en');
    
    console.log('FFXIV API test results:', {
      searchTerm: 'Ul\'dah',
      resultsCount: results.length,
      firstResult: results[0] || null
    });
    
    return results;
  } catch (error) {
    console.error('FFXIV API test failed:', error);
    throw error;
  }
}