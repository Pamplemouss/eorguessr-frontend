import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { fileName, fileType, customKey } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({ error: 'Missing fileName or fileType' });
        }

        // Use custom key if provided, otherwise generate default key
        const key = customKey || `photospheres/${crypto.randomUUID()}__${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

        return res.status(200).json({
            uploadUrl,
            fileUrl: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${key}`,
        });
    } catch (error) {
        console.error('Error generating S3 upload URL:', error);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
}
