import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { connectToDB } from '@/lib/mongoose';
import { MapModel } from '@/lib/models/MapModel';
import { generateMapFilename } from '@/lib/services/ffxivAPI';
import { S3Client, CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

interface MigrationResult {
    mapId: string;
    mapName: string;
    oldImagePath: string;
    newImagePath: string;
    updated: boolean;
    s3Updated: boolean;
    error?: string;
}

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

async function renameS3File(oldKey: string, newKey: string): Promise<boolean> {
    try {
        // Check if old file exists
        await s3Client.send(new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: oldKey
        }));

        // Copy to new location
        await s3Client.send(new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            CopySource: `${BUCKET_NAME}/${oldKey}`,
            Key: newKey
        }));

        // Delete old file
        await s3Client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: oldKey
        }));

        return true;
    } catch (error) {
        console.error(`Failed to rename S3 file from ${oldKey} to ${newKey}:`, error);
        return false;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { dryRun = true } = req.body;

    try {
        await connectToDB();
        
        // Get all maps with imagePath
        const maps = await MapModel.find({ 
            imagePath: { $exists: true, $nin: [null, ''] }
        }).lean();

        const results: MigrationResult[] = [];
        
        for (const map of maps) {
            const result: MigrationResult = {
                mapId: map._id.toString(),
                mapName: map.name?.en || 'Unknown',
                oldImagePath: map.imagePath || '',
                newImagePath: '',
                updated: false,
                s3Updated: false
            };

            try {
                // Generate new filename using the map name
                if (!map.name?.en) {
                    result.error = 'No English name available for filename generation';
                    results.push(result);
                    continue;
                }

                const newFilename = generateMapFilename(
                    map.name.en, 
                    map.subAreaCustomName?.en, 
                    map.expansion, 
                    map.type
                );
                result.newImagePath = newFilename;

                // Check if filename needs to be updated
                if (map.imagePath === newFilename) {
                    result.error = 'Filename already matches new format';
                    results.push(result);
                    continue;
                }

                // Only update if not a dry run
                if (!dryRun) {
                    // First, try to rename the S3 file
                    const oldS3Key = `maps/${map.imagePath}`;
                    const newS3Key = `maps/${newFilename}`;
                    
                    const s3Success = await renameS3File(oldS3Key, newS3Key);
                    result.s3Updated = s3Success;

                    // Update MongoDB regardless of S3 success (filename might not exist on S3)
                    await MapModel.updateOne(
                        { _id: new ObjectId(map._id) },
                        { $set: { imagePath: newFilename } }
                    );
                    result.updated = true;

                    // Add warning if S3 rename failed
                    if (!s3Success) {
                        result.error = `MongoDB updated but S3 file rename failed (file might not exist on S3)`;
                    }
                }

            } catch (error) {
                result.error = error instanceof Error ? error.message : 'Unknown error';
            }

            results.push(result);
        }

        // Summary stats
        const totalMaps = results.length;
        const needsUpdate = results.filter(r => !r.error || r.error === 'Filename already matches new format').length;
        const alreadyCorrect = results.filter(r => r.error === 'Filename already matches new format').length;
        const errors = results.filter(r => r.error && r.error !== 'Filename already matches new format' && !r.error.includes('S3 file rename failed')).length;
        const updated = results.filter(r => r.updated).length;
        const s3Updated = results.filter(r => r.s3Updated).length;
        const s3Warnings = results.filter(r => r.error?.includes('S3 file rename failed')).length;

        res.status(200).json({
            success: true,
            dryRun,
            summary: {
                totalMaps,
                needsUpdate: needsUpdate - alreadyCorrect,
                alreadyCorrect,
                errors,
                updated,
                s3Updated,
                s3Warnings
            },
            results
        });

    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ 
            error: 'Failed to migrate map filenames',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}