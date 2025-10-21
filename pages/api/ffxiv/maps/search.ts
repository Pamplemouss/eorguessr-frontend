import { NextApiRequest, NextApiResponse } from 'next';

interface FFXIVMapSearchResult {
  row_id: number;
  fields: {
    PlaceName: {
      fields: {
        Name: string;
      };
    };
    PlaceNameSub: {
      fields: {
        Name: string;
      };
    };
    Id: number;
  };
}

interface FFXIVMapDetails {
  row_id: number;
  fields: {
    PlaceName: {
      fields: {
        Name: string;
      };
    };
    PlaceNameSub: {
      fields: {
        Name: string;
      };
    };
    PlaceNameRegion: {
      fields: {
        Name: string;
      };
    };
    TerritoryType: {
      fields: {
        ExVersion: {
          fields: {
            Name: string;
          };
        };
      };
    };
    Id: number;
    SizeFactor: number;
  };
}

interface FFXIVMapTranslations {
  id: number;
  mapName: Record<string, string>;
  placeNameSub: Record<string, string>;
  placeNameRegion: Record<string, string>;
  expansion: Record<string, string>;
  mapImageId?: number;
  sizeFactor: number;
}

interface FFXIVMapImage {
  imageId: number;
  imageUrl: string;
  suggestedFilename: string;
}

const FFXIV_API_BASE = 'https://v2.xivapi.com/api';
const SUPPORTED_LANGUAGES = ['en', 'fr', 'ja', 'de'];

async function searchFFXIVMaps(name: string, language: string = 'en'): Promise<FFXIVMapSearchResult[]> {
  const searchUrl = `${FFXIV_API_BASE}/search?sheets=Map&query=PlaceName.Name@${language}~"${encodeURIComponent(name)}"`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Eorguessr/1.0',
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`FFXIV API error: ${response.status} ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON but received: ${contentType}`);
  }
  
  const data = await response.json();
  return data.results || [];
}

async function getFFXIVMapDetails(mapId: number, language: string): Promise<FFXIVMapDetails> {
  const detailsUrl = `${FFXIV_API_BASE}/sheet/Map/${mapId}?language=${language}`;
  
  const response = await fetch(detailsUrl, {
    headers: {
      'User-Agent': 'Eorguessr/1.0',
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`FFXIV API error: ${response.status} ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON but received: ${contentType}`);
  }
  
  return await response.json();
}

async function getFFXIVMapTranslations(mapId: number): Promise<FFXIVMapTranslations> {
  const languagePromises = SUPPORTED_LANGUAGES.map(lang => 
    getFFXIVMapDetails(mapId, lang).catch(error => {
      console.warn(`Failed to get details for map ${mapId} in language ${lang}:`, error.message);
      return null;
    })
  );
  
  const languageResults = await Promise.all(languagePromises);
  
  const mapName: Record<string, string> = {};
  const placeNameSub: Record<string, string> = {};
  const placeNameRegion: Record<string, string> = {};
  const expansion: Record<string, string> = {};
  let sizeFactor = 100;
  let mapImageId: number | undefined;
  
  languageResults.forEach((result, index) => {
    const language = SUPPORTED_LANGUAGES[index];
    
    if (result) {
      mapName[language] = result.fields.PlaceName?.fields?.Name || '';
      placeNameSub[language] = result.fields.PlaceNameSub?.fields?.Name || '';
      placeNameRegion[language] = result.fields.PlaceNameRegion?.fields?.Name || '';
      expansion[language] = result.fields.TerritoryType?.fields?.ExVersion?.fields?.Name || '';
      
      if (language === 'en') {
        sizeFactor = result.fields.SizeFactor || 100;
        mapImageId = result.fields.Id; // Correct ID for map images
      }
    }
  });
  
  return {
    id: mapId,
    mapName,
    placeNameSub,
    placeNameRegion,
    expansion,
    mapImageId,
    sizeFactor
  };
}

async function searchAndGetFFXIVMaps(name: string, language: string = 'en'): Promise<FFXIVMapTranslations[]> {
  const searchResults = await searchFFXIVMaps(name, language);
  
  if (searchResults.length === 0) {
    return [];
  }
  
  const translationPromises = searchResults.map(result => 
    getFFXIVMapTranslations(result.row_id).catch(error => {
      console.warn(`Failed to get translations for map ${result.row_id}:`, error.message);
      return null;
    })
  );
  
  const translations = await Promise.all(translationPromises);
  
  return translations.filter((translation): translation is FFXIVMapTranslations => 
    translation !== null
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, language = 'en' } = req.query;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Map name is required' });
    }

    if (!SUPPORTED_LANGUAGES.includes(language as string)) {
      return res.status(400).json({
        error: 'Unsupported language. Supported languages: ' + SUPPORTED_LANGUAGES.join(', ')
      });
    }

    const maps = await searchAndGetFFXIVMaps(name, language as string);

    return res.status(200).json({
      success: true,
      maps,
      total: maps.length
    });

  } catch (error) {
    console.error('Error in FFXIV maps search API:', error);
    
    return res.status(500).json({
      error: 'Failed to search FFXIV maps',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}