'use client';

import { useState, useCallback } from 'react';
import { toCamelCase, compressImageToWebP, validateImageFile } from '@/lib/utils/mapImageUtils';
import { generateMapFilename } from '@/lib/services/ffxivAPI';

interface MapImageUploadState {
    isUploading: boolean;
    progress: number;
    error?: string;
    uploadedUrl?: string;
}

interface UseMapImageUploaderReturn {
    uploadState: MapImageUploadState;
    uploadMapImage: (file: File, mapNameEn: string, subareaCustomNameEn?: string, expansion?: string, mapType?: string) => Promise<string | null>;
    reset: () => void;
}

export const useMapImageUploader = (): UseMapImageUploaderReturn => {
    const [uploadState, setUploadState] = useState<MapImageUploadState>({
        isUploading: false,
        progress: 0
    });

    const uploadMapImage = useCallback(async (file: File, mapNameEn: string, subareaCustomNameEn?: string, expansion?: string, mapType?: string): Promise<string | null> => {
        // Reset state
        setUploadState({
            isUploading: true,
            progress: 0
        });

        try {
            // Validate file
            const validation = validateImageFile(file);
            if (!validation.isValid) {
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: validation.error
                });
                return null;
            }

            // Check if map name is provided
            if (!mapNameEn?.trim()) {
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: 'Le nom de la carte en anglais est requis pour générer le nom du fichier.'
                });
                return null;
            }

            setUploadState(prev => ({ ...prev, progress: 20 }));

            // Compress image to WebP
            const compressedBlob = await compressImageToWebP(file, 0.7, 2048, 2048);
            
            setUploadState(prev => ({ ...prev, progress: 40 }));

            // Generate filename using centralized sanitization
            const fileName = generateMapFilename(mapNameEn.trim(), subareaCustomNameEn?.trim(), expansion, mapType);
            const s3Key = `maps/${fileName}`;

            setUploadState(prev => ({ ...prev, progress: 60 }));

            // Get signed URL for upload
            const urlResponse = await fetch('/api/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName,
                    fileType: 'image/webp',
                    customKey: s3Key
                })
            });

            if (!urlResponse.ok) {
                const errorData = await urlResponse.json();
                throw new Error(errorData.error || 'Échec de la génération de l\'URL de téléchargement');
            }

            const { uploadUrl, fileUrl } = await urlResponse.json();

            setUploadState(prev => ({ ...prev, progress: 80 }));

            // Upload to S3
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/webp' },
                body: compressedBlob
            });

            if (!uploadResponse.ok) {
                throw new Error('Échec du téléchargement vers S3');
            }

            setUploadState({
                isUploading: false,
                progress: 100,
                uploadedUrl: fileUrl
            });

            // Return just the filename for the imagePath field
            return fileName;

        } catch (error) {
            console.error('Map image upload failed:', error);
            setUploadState({
                isUploading: false,
                progress: 0,
                error: error instanceof Error ? error.message : 'Erreur lors du téléchargement'
            });
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        setUploadState({
            isUploading: false,
            progress: 0
        });
    }, []);

    return {
        uploadState,
        uploadMapImage,
        reset
    };
};