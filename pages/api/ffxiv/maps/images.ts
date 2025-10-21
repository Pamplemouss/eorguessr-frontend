import { NextApiRequest, NextApiResponse } from 'next';
import { generateMapFilename } from '@/lib/services/ffxivAPI';

const FFXIV_API_BASE = 'https://v2.xivapi.com/api';
const SUPPORTED_LANGUAGES = ['en', 'fr', 'ja', 'de'];

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

interface FFXIVMapImageResult {
    mapId: number;
    mapName: Record<string, string>;
    mapImageId: number;
    imageUrl: string;
    suggestedFilename: string;
    placeName: Record<string, string>;
    placeNameSub: Record<string, string>;
    placeNameRegion: Record<string, string>;
    expansion: Record<string, string>;
}

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

async function getFFXIVMapImageData(mapId: number): Promise<FFXIVMapImageResult | null> {
    try {
        const languagePromises = SUPPORTED_LANGUAGES.map(lang => 
            getFFXIVMapDetails(mapId, lang).catch(error => {
                console.warn(`Failed to get details for map ${mapId} in language ${lang}:`, error.message);
                return null;
            })
        );
        
        const languageResults = await Promise.all(languagePromises);
        
        const mapName: Record<string, string> = {};
        const placeName: Record<string, string> = {};
        const placeNameSub: Record<string, string> = {};
        const placeNameRegion: Record<string, string> = {};
        const expansion: Record<string, string> = {};
        let mapImageId: number | undefined;
        
        languageResults.forEach((result, index) => {
            const language = SUPPORTED_LANGUAGES[index];
            
            if (result) {
                mapName[language] = result.fields.PlaceName?.fields?.Name || '';
                placeName[language] = result.fields.PlaceName?.fields?.Name || '';
                placeNameSub[language] = result.fields.PlaceNameSub?.fields?.Name || '';
                placeNameRegion[language] = result.fields.PlaceNameRegion?.fields?.Name || '';
                expansion[language] = result.fields.TerritoryType?.fields?.ExVersion?.fields?.Name || '';
                
                if (language === 'en') {
                    mapImageId = result.fields.Id; // Correct ID for map images
                }
            }
        });

        if (!mapImageId) {
            return null;
        }

        const imageUrl = `${FFXIV_API_BASE}/asset/map/${mapImageId}`;
        const suggestedFilename = generateMapFilename(
            placeName.en || 'unknown',
            placeNameSub.en,
            expansion.en,
            'map'
        );

        return {
            mapId,
            mapName,
            mapImageId,
            imageUrl,
            suggestedFilename,
            placeName,
            placeNameSub,
            placeNameRegion,
            expansion
        };
    } catch (error) {
        console.warn(`Failed to process map ${mapId}:`, error);
        return null;
    }
}

async function searchAndGetFFXIVMapImages(name: string, language: string = 'en'): Promise<FFXIVMapImageResult[]> {
    const searchResults = await searchFFXIVMaps(name, language);
    
    if (searchResults.length === 0) {
        return [];
    }
    
    const imagePromises = searchResults.map(result => 
        getFFXIVMapImageData(result.row_id)
    );
    
    const images = await Promise.all(imagePromises);
    
    return images.filter((image): image is FFXIVMapImageResult => 
        image !== null
    );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { mapName, language = 'en' } = req.query;

        if (!mapName || typeof mapName !== 'string') {
            return res.status(400).json({ error: 'mapName parameter is required' });
        }

        if (!SUPPORTED_LANGUAGES.includes(language as string)) {
            return res.status(400).json({
                error: 'Unsupported language. Supported languages: ' + SUPPORTED_LANGUAGES.join(', ')
            });
        }

        const images = await searchAndGetFFXIVMapImages(mapName, language as string);

        return res.status(200).json({
            success: true,
            images: images.slice(0, 10), // Limit to 10 results
            total: images.length
        });

    } catch (error) {
        console.error('Error in FFXIV map images search API:', error);
        
        return res.status(500).json({
            error: 'Failed to search map images',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}