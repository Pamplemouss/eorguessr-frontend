import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test FFXIV API connectivity
    const testUrl = 'https://v2.xivapi.com/api/search?sheets=Map&query=PlaceName.Name@en~"Ul\'dah"&limit=1';
    
    console.log('Testing FFXIV API connectivity...');
    console.log('Test URL:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Eorguessr/1.0',
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.log('Non-JSON response:', textResponse.substring(0, 200));
      throw new Error(`Expected JSON but received: ${contentType}. Response: ${textResponse.substring(0, 100)}...`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    return res.status(200).json({
      success: true,
      message: 'FFXIV API is accessible',
      testResult: data,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });

  } catch (error) {
    console.error('FFXIV API test failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'FFXIV API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'The FFXIV API might be down or blocking requests. You can try again later.'
    });
  }
}