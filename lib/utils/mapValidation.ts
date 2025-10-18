import { MapModel } from '@/lib/models/MapModel';
import { connectToDB } from '@/lib/mongoose';

export interface MapValidationResult {
  isValid: boolean;
  mapId?: string;
  error?: string;
  maps?: Array<{ id: string; name: any }>;
}

/**
 * Validate if a map exists by English name
 * Returns validation result with map ID if found, or error details
 */
export async function validateMapName(mapName: string): Promise<MapValidationResult> {
  try {
    await connectToDB();
    
    // Find maps by English name (case sensitive)
    const maps = await MapModel.find({ 'name.en': mapName });

    if (maps.length === 0) {
      return {
        isValid: false,
        error: `Map with English name "${mapName}" not found. Please check the map name is exactly as stored in the database (case sensitive).`
      };
    }

    if (maps.length > 1) {
      return {
        isValid: false,
        error: `Multiple maps found with English name "${mapName}". Please contact an administrator to resolve this conflict.`,
        maps: maps.map(m => ({ id: m.id, name: m.name }))
      };
    }

    // Single map found - valid
    return {
      isValid: true,
      mapId: maps[0].id
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Database error while validating map: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get all available maps for reference
 */
export async function getAvailableMaps() {
  try {
    await connectToDB();
    const maps = await MapModel.find({}, { id: 1, 'name.en': 1 }).sort({ 'name.en': 1 });
    return maps.map(m => ({ id: m.id, name: m.name.en }));
  } catch (error) {
    console.error('Error fetching available maps:', error);
    return [];
  }
}