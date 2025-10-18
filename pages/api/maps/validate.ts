import type { NextApiRequest, NextApiResponse } from 'next';
import { validateMapName, getAvailableMaps } from '@/lib/utils/mapValidation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		try {
			const { mapName } = req.body;

			if (!mapName || typeof mapName !== 'string') {
				return res.status(400).json({ error: 'Missing or invalid mapName' });
			}

			const result = await validateMapName(mapName);
			return res.status(200).json(result);

		} catch (error) {
			console.error('Error validating map:', error);
			return res.status(500).json({ 
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	if (req.method === 'GET') {
		try {
			const maps = await getAvailableMaps();
			return res.status(200).json({ maps });
		} catch (error) {
			console.error('Error fetching maps:', error);
			return res.status(500).json({ 
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	res.setHeader('Allow', ['GET', 'POST']);
	res.status(405).end(`Method ${req.method} Not Allowed`);
}