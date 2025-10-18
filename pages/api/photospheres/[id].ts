import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { connectToDB } from '@/lib/mongoose';
import { PhotosphereModel } from '@/lib/models/PhotosphereModel';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(`API call to photospheres/[id] - Method: ${req.method}, ID: ${req.query.id}`);
    
    const { id } = req.query;

    if (typeof id !== 'string') {
        console.error('Invalid ID type:', typeof id, id);
        return res.status(400).json({ error: 'Invalid photosphere ID' });
    }

    if (!id.trim()) {
        console.error('Empty ID provided');
        return res.status(400).json({ error: 'Photosphere ID cannot be empty' });
    }

    if (req.method === 'DELETE') {
        try {
            // Check if required environment variables are set
            const bucketName = process.env.AWS_S3_BUCKET;
            const region = process.env.AWS_REGION;
            const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

            if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
                console.error('Missing AWS environment variables:', {
                    bucketName: !!bucketName,
                    region: !!region,
                    accessKeyId: !!accessKeyId,
                    secretAccessKey: !!secretAccessKey
                });
                return res.status(500).json({ error: 'AWS configuration is incomplete' });
            }

            const folderPrefix = `photospheres/${id}/`;
            console.log(`Attempting to delete photosphere folder: ${folderPrefix}`);

            // First, list all objects in the photosphere folder
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: folderPrefix,
            });

            console.log('Listing objects in S3...');
            const listResponse = await s3.send(listCommand);
            const objects = listResponse.Contents || [];
            console.log(`Found ${objects.length} objects to delete:`, objects.map(o => o.Key));

            if (objects.length === 0) {
                return res.status(404).json({ error: 'Photosphere not found' });
            }

            // Delete all objects in the folder using batch delete
            const objectsToDelete = objects.filter(obj => obj.Key).map(obj => ({ Key: obj.Key! }));
            
            if (objectsToDelete.length > 0) {
                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: bucketName,
                    Delete: {
                        Objects: objectsToDelete,
                        Quiet: false
                    }
                });

                console.log('Executing batch delete...');
                const deleteResult = await s3.send(deleteCommand);
                console.log('Batch delete result:', deleteResult);
                
                // Check if there were any errors in the batch delete
                if (deleteResult.Errors && deleteResult.Errors.length > 0) {
                    console.error('Batch delete had errors:', deleteResult.Errors);
                    
                    // Check if all deletions failed due to permissions
                    const allPermissionErrors = deleteResult.Errors.every(error => 
                        error.Code === 'AccessDenied'
                    );
                    
                    if (allPermissionErrors) {
                        return res.status(403).json({
                            error: 'Insufficient permissions to delete photosphere',
                            details: 'The AWS user does not have s3:DeleteObject permission',
                            awsErrors: deleteResult.Errors
                        });
                    }
                    
                    // Some deletions failed, some might have succeeded
                    const successfulDeletes = (deleteResult.Deleted || []).length;
                    const failedDeletes = deleteResult.Errors.length;
                    
                    return res.status(207).json({
                        error: 'Partial deletion failure',
                        message: `${successfulDeletes} files deleted, ${failedDeletes} failed`,
                        successfulDeletes,
                        failedDeletes,
                        awsErrors: deleteResult.Errors
                    });
                }
                
                // All deletions succeeded
                const deletedCount = (deleteResult.Deleted || []).length;
                console.log(`Successfully deleted ${deletedCount} objects for photosphere ${id}`);
            } else {
                console.log('No objects to delete');
            }

            // After successful S3 deletion, delete from MongoDB
            try {
                await connectToDB();
                const deletedPhotosphere = await PhotosphereModel.findOneAndDelete({ id });
                
                if (deletedPhotosphere) {
                    console.log(`Successfully deleted photosphere ${id} from MongoDB`);
                } else {
                    console.log(`Photosphere ${id} not found in MongoDB (may have been deleted already)`);
                }
            } catch (mongoError) {
                console.error('Error deleting photosphere from MongoDB:', mongoError);
                // Don't fail the entire operation if MongoDB deletion fails
                // S3 files are already deleted, just log the warning
                console.warn(`Warning: S3 files deleted but MongoDB deletion failed for photosphere ${id}`);
            }

            return res.status(200).json({ 
                success: true, 
                message: `Photosphere ${id} and all its variants deleted successfully from S3 and MongoDB`,
                deletedFiles: objects.length
            });

        } catch (error) {
            console.error('Error deleting photosphere:', error);
            
            // Provide more detailed error information
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorName = error instanceof Error ? error.name : 'UnknownError';
            
            return res.status(500).json({ 
                error: 'Failed to delete photosphere from S3',
                details: errorMessage,
                type: errorName
            });
        }
    }

    if (req.method === 'GET') {
        // Test endpoint - just return the photosphere info
        try {
            const bucketName = process.env.AWS_S3_BUCKET!;
            const folderPrefix = `photospheres/${id}/`;

            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: folderPrefix,
            });

            const listResponse = await s3.send(listCommand);
            const objects = listResponse.Contents || [];

            return res.status(200).json({ 
                id,
                folderPrefix,
                objectCount: objects.length,
                objects: objects.map(o => ({ key: o.Key, size: o.Size, lastModified: o.LastModified }))
            });

        } catch (error) {
            console.error('Error testing photosphere:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ error: 'Failed to test photosphere', details: errorMessage });
        }
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}