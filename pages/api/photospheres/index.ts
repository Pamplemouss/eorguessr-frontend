import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

interface PanoramaMetadata {
    map: string;
    weather: string;
    coord: {
        x: number;
        y: number;
        z: number;
    };
    time: string;
    uploadedAt: string;
}

interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date;
    size: number;
    totalStorage: number;
    thumbnailUrl?: string;
    metadata?: PanoramaMetadata;
    variants?: {
        panorama_thumbnail?: string;
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
            const thumbnailFile = files.find(f => f.Key?.endsWith('thumbnail.webp') && !f.Key?.includes('panorama_thumbnail'));
            const panoramaThumbnailFile = files.find(f => f.Key?.includes('panorama_thumbnail.webp'));
            const lightFile = files.find(f => f.Key?.includes('panorama_light.webp'));
            const mediumFile = files.find(f => f.Key?.includes('panorama_medium.webp'));
            const heavyFile = files.find(f => f.Key?.includes('panorama_heavy.webp'));
            const originalFile = files.find(f => f.Key?.includes('panorama_original.webp'));
            const metadataFile = files.find(f => f.Key?.includes('metadata.json'));

            // Fetch metadata if available
            let metadata: PanoramaMetadata | undefined;
            if (metadataFile && metadataFile.Key) {
                try {
                    const getMetadataCommand = new GetObjectCommand({
                        Bucket: bucketName,
                        Key: metadataFile.Key,
                    });
                    const metadataResponse = await s3.send(getMetadataCommand);
                    if (metadataResponse.Body) {
                        const metadataText = await metadataResponse.Body.transformToString();
                        metadata = JSON.parse(metadataText) as PanoramaMetadata;
                    }
                } catch (error) {
                    console.warn(`Failed to fetch metadata for ${panoramaId}:`, error);
                }
            }

            // Use medium quality as main URL, fallback to original, then any available
            const mainFile = mediumFile || originalFile || lightFile || heavyFile || panoramaThumbnailFile || files[0];
            
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
                metadata, // Add metadata if available
                variants: {
                    panorama_thumbnail: panoramaThumbnailFile ? `${baseUrl}/${panoramaThumbnailFile.Key}` : undefined,
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
