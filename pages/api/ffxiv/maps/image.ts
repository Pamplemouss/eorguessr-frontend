import { NextApiRequest, NextApiResponse } from 'next';
import { generateMapFilename } from '@/lib/services/ffxivAPI';

const FFXIV_API_BASE = 'https://v2.xivapi.com/api';

interface FFXIVMapImage {
	imageId: number;
	imageUrl: string;
	suggestedFilename: string;
}

async function getFFXIVMapImage(
	mapImageId: number,
	mapName: Record<string, string>,
	placeNameSub: Record<string, string>,
	expansion?: string,
	mapType?: string
): Promise<FFXIVMapImage> {
	const imageUrl = `${FFXIV_API_BASE}/asset/map/${mapImageId}`;

	const response = await fetch(imageUrl, {
		method: 'HEAD',
		headers: {
			'User-Agent': 'Eorguessr/1.0',
		},
	});

	if (!response.ok) {
		throw new Error(`Image not available: ${response.status}`);
	}

	const suggestedFilename = generateMapFilename(
		mapName.en || 'unknown',
		placeNameSub.en,
		expansion,
		mapType
	);

	return {
		imageId: mapImageId,
		imageUrl,
		suggestedFilename
	};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { mapImageId, mapName, placeNameSub, expansion, mapType } = req.body;

		if (!mapImageId || !mapName) {
			return res.status(400).json({ error: 'mapImageId and mapName are required' });
		}
		//all consoel log
		console.log('Received request for mapImageId:', mapImageId, 'mapName:', mapName, 'placeNameSub:', placeNameSub, 'expansion:', expansion, 'mapType:', mapType);
		const imageInfo = await getFFXIVMapImage(mapImageId, mapName, placeNameSub || {}, expansion, mapType);

		return res.status(200).json({
			success: true,
			image: imageInfo
		});

	} catch (error) {
		console.error('Error getting FFXIV map image:', error);

		return res.status(500).json({
			error: 'Failed to get map image',
			details: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}