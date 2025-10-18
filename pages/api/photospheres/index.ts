import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date;
    size: number;
    totalStorage: number;
    thumbnailUrl?: string;
    variants?: {
        light?: string;
        medium?: string;
        heavy?: string;
        original?: string;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const bucketName = process.env.AWS_S3_BUCKET!;
        const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL!;

        // List all objects in the photospheres folder
        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: 'photospheres/',
            Delimiter: '/',
        });

        const listResponse = await s3.send(listCommand);
        const photosphereFolders = listResponse.CommonPrefixes || [];

        const photospheres: Photosphere[] = [];

        // Process each photosphere folder
        for (const folder of photosphereFolders) {
            const folderKey = folder.Prefix!;
            const panoramaId = folderKey.replace('photospheres/', '').replace('/', '');
            
            if (!panoramaId) continue;

            // List contents of this photosphere folder
            const folderListCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: folderKey,
            });

            const folderContents = await s3.send(folderListCommand);
            const files = folderContents.Contents || [];

            if (files.length === 0) continue;

            // Find different file types
            const thumbnailFile = files.find(f => f.Key?.includes('thumbnail.webp'));
            const lightFile = files.find(f => f.Key?.includes('panorama_light.webp'));
            const mediumFile = files.find(f => f.Key?.includes('panorama_medium.webp'));
            const heavyFile = files.find(f => f.Key?.includes('panorama_heavy.webp'));
            const originalFile = files.find(f => f.Key?.includes('panorama_original.webp'));

            // Use medium quality as main URL, fallback to original, then any available
            const mainFile = mediumFile || originalFile || lightFile || heavyFile || files[0];
            
            if (!mainFile || !mainFile.Key) continue;

            // Get file metadata for size and date
            let fileSize = mainFile.Size || 0;
            let uploadDate = mainFile.LastModified || new Date();

            // If we have original file, use its size as the "true" size
            if (originalFile && originalFile.Size) {
                fileSize = originalFile.Size;
            }

            // Calculate total storage used by this photosphere (all files combined)
            let totalStorage = 0;
            files.forEach(file => {
                if (file.Size) {
                    totalStorage += file.Size;
                }
            });

            const photosphere: Photosphere = {
                id: panoramaId,
                name: `${panoramaId}.webp`,
                url: `${baseUrl}/${mainFile.Key}`,
                uploadDate,
                size: fileSize, // Keep original size for compatibility
                totalStorage, // Add total storage for all files
                thumbnailUrl: thumbnailFile ? `${baseUrl}/${thumbnailFile.Key}` : undefined,
                variants: {
                    light: lightFile ? `${baseUrl}/${lightFile.Key}` : undefined,
                    medium: mediumFile ? `${baseUrl}/${mediumFile.Key}` : undefined,
                    heavy: heavyFile ? `${baseUrl}/${heavyFile.Key}` : undefined,
                    original: originalFile ? `${baseUrl}/${originalFile.Key}` : undefined,
                }
            };

            photospheres.push(photosphere);
        }

        // Sort by upload date (newest first)
        photospheres.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

        return res.status(200).json(photospheres);

    } catch (error) {
        console.error('Error fetching photospheres:', error);
        return res.status(500).json({ error: 'Failed to fetch photospheres' });
    }
}
