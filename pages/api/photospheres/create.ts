import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/lib/mongoose';
import { PhotosphereModel } from '@/lib/models/PhotosphereModel';
import { MapModel } from '@/lib/models/MapModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
	}

	try {
		await connectToDB();

		const { id, coord, weather, time, mapName } = req.body;

		// Validate required fields
		if (!id || !coord || !weather || typeof time !== 'string' || !mapName) {
			return res.status(400).json({ 
				error: 'Missing required fields: id, coord, weather, time, mapName' 
			});
		}

		if (!coord.x || !coord.y || typeof coord.z !== 'number') {
			return res.status(400).json({ 
				error: 'Invalid coord format. Must have x, y, z properties' 
			});
		}

		// Find map by English name (case sensitive)
		const maps = await MapModel.find({ 'name.en': mapName });

		if (maps.length === 0) {
			return res.status(404).json({ 
				error: `Map with English name "${mapName}" not found`,
				suggestion: 'Please check the map name is exactly as stored in the database (case sensitive)'
			});
		}

		if (maps.length > 1) {
			return res.status(409).json({ 
				error: `Multiple maps found with English name "${mapName}"`,
				maps: maps.map(m => ({ id: m.id, name: m.name })),
				suggestion: 'Multiple maps have the same English name. Please contact an administrator to resolve this conflict.'
			});
		}

		const map = maps[0];

		// Check if photosphere with this ID already exists
		const existingPhotosphere = await PhotosphereModel.findOne({ id });
		if (existingPhotosphere) {
			return res.status(409).json({ 
				error: `Photosphere with ID "${id}" already exists` 
			});
		}

		// Create new photosphere
		const photosphere = new PhotosphereModel({
			id,
			coord,
			weather,
			time,
			map: map.id
		});

		await photosphere.save();

		return res.status(201).json({ 
			success: true,
			photosphere: {
				id: photosphere.id,
				coord: photosphere.coord,
				weather: photosphere.weather,
				time: photosphere.time,
				map: {
					id: map.id,
					name: map.name
				},
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