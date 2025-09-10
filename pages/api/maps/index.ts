import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDB } from '@/lib/mongoose';
import { MapModel } from '@/lib/models/MapModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await connectToDB();

	if (req.method === 'GET') {
		const maps = await MapModel.find();
		return res.status(200).json(maps);
	}

	res.setHeader('Allow', ['GET']);
	res.status(405).end(`Method ${req.method} Not Allowed`);
}
