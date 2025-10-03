import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { connectToDB } from '@/lib/mongoose';
import { MapModel } from '@/lib/models/MapModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    await connectToDB();

    const { id } = req.query;
    try {
        if (req.method === 'GET') {
            const map = await MapModel.findOne({ id });
            return res.status(200).json(map);
        }

        if (req.method === 'PUT') {
            const updatedMap = await MapModel.findOneAndUpdate(
                { id },
                req.body,
                { new: true, upsert: true }
            );
            return res.status(200).json(updatedMap);
        }

        if (req.method === 'DELETE') {
            await MapModel.deleteOne({ id });
            return res.status(200).json({ success: true });
        }

        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: (error as Error).message });
    }
}
