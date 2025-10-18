import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/lib/mongoose';
import { PhotosphereModel } from '@/lib/models/PhotosphereModel';

interface DuplicateCheckRequest {
    coord: {
        x: number;
        y: number;
        z: number;
    };
    weather: string;
    time: string;
    mapId: string;
}

interface DuplicateCheckResponse {
    isDuplicate: boolean;
    existingPhotosphere?: {
        id: string;
        coord: {
            x: number;
            y: number;
            z: number;
        };
        weather: string;
        time: string;
        uploadedAt: Date;
    };
    message?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<DuplicateCheckResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectToDB();

        const { coord, weather, time, mapId }: DuplicateCheckRequest = req.body;

        // Validate input
        if (!coord || typeof coord.x !== 'number' || typeof coord.y !== 'number' || typeof coord.z !== 'number') {
            return res.status(400).json({ error: 'Invalid coordinates provided' });
        }

        if (!weather || !time || !mapId) {
            return res.status(400).json({ error: 'Missing required fields: weather, time, or mapId' });
        }

        // Check for existing photosphere with similar characteristics
        // We use a tolerance of 0.1 for coordinates to account for minor variations
        const tolerance = 0.1;
        
        console.log('Checking for duplicates with criteria:', {
            map: mapId,
            weather,
            time,
            coordRange: {
                x: `${coord.x - tolerance} to ${coord.x + tolerance}`,
                y: `${coord.y - tolerance} to ${coord.y + tolerance}`,
                z: `${coord.z - tolerance} to ${coord.z + tolerance}`
            }
        });

        // First, let's see all photospheres for this map to debug
        const allPhotospheresForMap = await PhotosphereModel.find({ map: mapId });
        console.log(`Found ${allPhotospheresForMap.length} total photospheres for map ${mapId}:`, 
            allPhotospheresForMap.map(p => ({
                id: p.id,
                coord: p.coord,
                weather: p.weather,
                time: p.time,
                exactMatch: p.weather === weather && p.time === time &&
                           Math.abs(p.coord.x - coord.x) <= tolerance &&
                           Math.abs(p.coord.y - coord.y) <= tolerance &&
                           Math.abs(p.coord.z - coord.z) <= tolerance
            }))
        );
        
        const existingPhotosphere = await PhotosphereModel.findOne({
            map: mapId,
            weather: weather,
            time: time,
            'coord.x': { $gte: coord.x - tolerance, $lte: coord.x + tolerance },
            'coord.y': { $gte: coord.y - tolerance, $lte: coord.y + tolerance },
            'coord.z': { $gte: coord.z - tolerance, $lte: coord.z + tolerance }
        });

        console.log('Existing photosphere found:', existingPhotosphere ? {
            id: existingPhotosphere.id,
            coord: existingPhotosphere.coord,
            weather: existingPhotosphere.weather,
            time: existingPhotosphere.time,
            map: existingPhotosphere.map
        } : 'None');

        if (existingPhotosphere) {
            return res.status(200).json({
                isDuplicate: true,
                existingPhotosphere: {
                    id: existingPhotosphere.id,
                    coord: existingPhotosphere.coord,
                    weather: existingPhotosphere.weather,
                    time: existingPhotosphere.time,
                    uploadedAt: existingPhotosphere.uploadedAt
                },
                message: `Une photosphère similaire existe déjà à ces coordonnées (${existingPhotosphere.coord.x}, ${existingPhotosphere.coord.y}, ${existingPhotosphere.coord.z}) avec les mêmes conditions (${existingPhotosphere.weather}, ${existingPhotosphere.time}).`
            });
        }

        return res.status(200).json({
            isDuplicate: false,
            message: 'Aucune photosphère similaire trouvée, upload autorisé.'
        });

    } catch (error) {
        console.error('Error checking for duplicate photosphere:', error);
        return res.status(500).json({ 
            error: 'Erreur lors de la vérification des doublons' 
        });
    }
}