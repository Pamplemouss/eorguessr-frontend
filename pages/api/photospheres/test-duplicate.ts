import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/lib/mongoose';
import { PhotosphereModel } from '@/lib/models/PhotosphereModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        await connectToDB();

        // Get all photospheres in the database
        const allPhotospheres = await PhotosphereModel.find({}).limit(20);
        
        console.log(`Found ${allPhotospheres.length} photospheres in database`);
        
        return res.status(200).json({
            success: true,
            count: allPhotospheres.length,
            photospheres: allPhotospheres.map(p => ({
                id: p.id,
                coord: p.coord,
                weather: p.weather,
                time: p.time,
                map: p.map,
                uploadedAt: p.uploadedAt
            }))
        });

    } catch (error) {
        console.error('Error testing duplicate check:', error);
        return res.status(500).json({ 
            error: 'Erreur lors du test de vérification des doublons',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}