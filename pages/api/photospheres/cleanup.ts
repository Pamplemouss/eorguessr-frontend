import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { photosphereId } = req.body;

        if (!photosphereId || typeof photosphereId !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid photosphereId' });
        }

        const bucketName = process.env.AWS_S3_BUCKET!;
        const folderPrefix = `photospheres/${photosphereId}/`;

        // List all objects in the photosphere folder
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: folderPrefix,
        });

        const listResponse = await s3.send(listCommand);
        const objects = listResponse.Contents || [];

        if (objects.length === 0) {
            return res.status(404).json({ error: 'Photosphere not found in S3' });
        }

        // Delete all objects
        const deleteCommand = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: objects.map(obj => ({ Key: obj.Key! })),
            },
        });

        await s3.send(deleteCommand);

        return res.status(200).json({ 
            success: true,
            message: `Cleaned up ${objects.length} files for photosphere ${photosphereId}`,
            deletedFiles: objects.length
        });

    } catch (error) {
        console.error('Error cleaning up S3 files:', error);
        return res.status(500).json({ 
            error: 'Failed to cleanup S3 files',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}