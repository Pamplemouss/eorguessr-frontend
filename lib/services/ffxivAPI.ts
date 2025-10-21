export interface FFXIVMapSearchResult {
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

export interface FFXIVMapDetails {
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

export interface FFXIVMapTranslations {
    id: number;
    mapName: Record<string, string>; // language -> name
    placeNameSub: Record<string, string>; // language -> subname
    placeNameRegion: Record<string, string>; // language -> region name
    expansion: Record<string, string>; // language -> expansion name
    mapImageId?: number; // The actual ID used for map images
    sizeFactor: number;
}

export interface FFXIVMapImage {
    imageId: number;
    imageUrl: string;
    suggestedFilename: string;
}

const FFXIV_API_BASE = 'https://v2.xivapi.com/api';
const SUPPORTED_LANGUAGES = ['en', 'fr', 'ja', 'de'];

/**
 * Search for maps by name in FFXIV API
 * Note: This function is designed to be used on the server-side (API routes)
 * For client-side usage, use the /api/ffxiv/maps/search endpoint instead
 */
export async function searchFFXIVMaps(name: string, language: string = 'en'): Promise<FFXIVMapSearchResult[]> {
    const searchUrl = `${FFXIV_API_BASE}/search?sheets=Map&query=PlaceName.Name@${language}~"${encodeURIComponent(name)}"`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error searching FFXIV maps:', error);
        throw error;
    }
}

/**
 * Get map details for a specific map ID in a specific language
 * Note: This function is designed to be used on the server-side (API routes)
 */
export async function getFFXIVMapDetails(mapId: number, language: string): Promise<FFXIVMapDetails> {
    const detailsUrl = `${FFXIV_API_BASE}/sheet/Map/${mapId}?language=${language}`;

    try {
        const response = await fetch(detailsUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting FFXIV map details:', error);
        throw error;
    }
}

/**
 * Generate sanitized filename from map names
 */
export function generateMapFilename(mapName: string, subName?: string, expansion?: string, mapType?: string): string {
    const sanitizeName = (name: string) => name
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars except spaces
        .replace(/\s+/g, '') // Remove spaces
        .toLowerCase();

    const mainName = sanitizeName(mapName);
    const sanitizedSubName = subName ? sanitizeName(subName) : '';
    const sanitizedExpansion = expansion ? sanitizeName(expansion) : 'unknown';
    const sanitizedMapType = mapType ? sanitizeName(mapType) : 'map';
    
    // Build filename parts - always include expansion and map type
    const parts = [mainName];
    
    if (sanitizedSubName) {
        parts.push(sanitizedSubName);
    }
    
    // Always add expansion and map type
    parts.push(sanitizedExpansion);
    parts.push(sanitizedMapType);
    
    return `${parts.join('_')}.webp`;
}

/**
 * Get complete map information with all language translations (without image)
 */
export async function getFFXIVMapTranslations(mapId: number): Promise<FFXIVMapTranslations> {
    try {
        // Get map details in all supported languages
        const languagePromises = SUPPORTED_LANGUAGES.map(lang =>
            getFFXIVMapDetails(mapId, lang)
        );

        const languageResults = await Promise.allSettled(languagePromises);

        const mapName: Record<string, string> = {};
        const placeNameSub: Record<string, string> = {};
        const placeNameRegion: Record<string, string> = {};
        const expansion: Record<string, string> = {};
        let sizeFactor = 100;
        let mapImageId: number | undefined;

        // Process results for each language
        languageResults.forEach((result, index) => {
            const language = SUPPORTED_LANGUAGES[index];

            if (result.status === 'fulfilled' && result.value) {
                const details = result.value;
                mapName[language] = details.fields.PlaceName?.fields?.Name || '';
                placeNameSub[language] = details.fields.PlaceNameSub?.fields?.Name || '';
                placeNameRegion[language] = details.fields.PlaceNameRegion?.fields?.Name || '';
                expansion[language] = details.fields.TerritoryType?.fields?.ExVersion?.fields?.Name || '';

                // Use English result for numeric values
                if (language === 'en') {
                    sizeFactor = details.fields.SizeFactor || 100;
                    mapImageId = details.fields.Id; // This is the correct ID for map images
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
    } catch (error) {
        console.error('Error getting FFXIV map translations:', error);
        throw error;
    }
}

/**
 * Search and get complete map information including all translations
 */
export async function searchAndGetFFXIVMaps(name: string, language: string = 'en'): Promise<FFXIVMapTranslations[]> {
    try {
        // First, search for maps
        const searchResults = await searchFFXIVMaps(name, language);

        if (searchResults.length === 0) {
            return [];
        }

        // Get complete translations for each found map
        const translationPromises = searchResults.map(result =>
            getFFXIVMapTranslations(result.row_id)
        );

        const translations = await Promise.allSettled(translationPromises);

        // Filter out failed requests and return successful ones
        return translations
            .filter((result): result is PromiseFulfilledResult<FFXIVMapTranslations> =>
                result.status === 'fulfilled'
            )
            .map(result => result.value);

    } catch (error) {
        console.error('Error searching and getting FFXIV maps:', error);
        throw error;
    }
}