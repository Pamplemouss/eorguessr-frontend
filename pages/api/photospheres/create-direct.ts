import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/lib/mongoose';
import { PhotosphereModel } from '@/lib/models/PhotosphereModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
	}

	try {
		await connectToDB();

		const { id, coord, weather, time, mapId } = req.body;

		console.log('Creating photosphere with data:', {
			id,
			coord,
			weather,
			time,
			mapId
		});

		// Validate required fields
		if (!id || !coord || !weather || typeof time !== 'string' || !mapId) {
			console.error('Missing required fields:', { id: !!id, coord: !!coord, weather: !!weather, time: typeof time, mapId: !!mapId });
			return res.status(400).json({ 
				error: 'Missing required fields: id, coord, weather, time, mapId' 
			});
		}

		if (!coord.x || !coord.y || typeof coord.z !== 'number') {
			console.error('Invalid coord format:', coord);
			return res.status(400).json({ 
				error: 'Invalid coord format. Must have x, y, z properties' 
			});
		}

		// Check if photosphere with this ID already exists
		const existingPhotosphere = await PhotosphereModel.findOne({ id });
		if (existingPhotosphere) {
			console.log('Photosphere with ID already exists:', id);
			return res.status(409).json({ 
				error: `Photosphere with ID "${id}" already exists` 
			});
		}

		// Create new photosphere (no map lookup needed since mapId is pre-validated)
		const photosphere = new PhotosphereModel({
			id,
			coord,
			weather,
			time,
			map: mapId
		});

		await photosphere.save();
		console.log('Successfully created photosphere:', id);

		return res.status(201).json({ 
			success: true,
			photosphere: {
				id: photosphere.id,
				coord: photosphere.coord,
				weather: photosphere.weather,
				time: photosphere.time,
				mapId: photosphere.map,
				uploadedAt: photosphere.uploadedAt
			}
		});

	} catch (error) {
		console.error('Error creating photosphere:', error);
		return res.status(500).json({ 
			error: 'Internal server error',
			details: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}