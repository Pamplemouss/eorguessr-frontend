import { useMap } from '@/app/providers/MapContextProvider';
import { useMapImageUploader } from '@/app/hooks/useMapImageUploader';
import React, { useRef, useState } from 'react';
import { FaUpload, FaSpinner, FaCheck, FaExclamationTriangle, FaGamepad } from 'react-icons/fa';
import FFXIVImageSearch from './FFXIVImageSearch';
import { compressImageToWebP } from '@/lib/utils/mapImageUtils';

const MapFormImagePath = () => {
    const { currentMap, setCurrentMap } = useMap();
    const { uploadState, uploadMapImage, reset } = useMapImageUploader();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showFFXIVSearch, setShowFFXIVSearch] = useState(false);
    const [isDownloadingFFXIV, setIsDownloadingFFXIV] = useState(false);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset file input
        event.target.value = '';

        // Check if we have the English name for generating the filename
        const mapNameEn = currentMap?.name?.en;
        if (!mapNameEn?.trim()) {
            alert('Veuillez d\'abord saisir le nom de la carte en anglais pour générer le nom du fichier.');
            return;
        }

        const uploadedPath = await uploadMapImage(
            file,
            mapNameEn,
            currentMap?.subAreaCustomName?.en,
            currentMap?.expansion,
            currentMap?.type
        );
        if (uploadedPath && currentMap) {
            setCurrentMap({ ...currentMap, imagePath: uploadedPath });
        }
    };

    const handleFFXIVImageSelect = async (imageUrl: string, filename: string) => {
        setIsDownloadingFFXIV(true);
        try {
            // Download the image from FFXIV API
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.status}`);
            }

            const blob = await response.blob();

            // Convert blob to File object
            const file = new File([blob], filename, { type: blob.type });

            // Compress to WebP using existing utility
            const compressedBlob = await compressImageToWebP(file, 0.7, 2048, 2048);

            // Get signed URL for upload
            const s3Key = `maps/${filename}`;
            const urlResponse = await fetch('/api/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: filename,
                    fileType: 'image/webp',
                    customKey: s3Key
                })
            });

            if (!urlResponse.ok) {
                const errorData = await urlResponse.json();
                throw new Error(errorData.error || 'Failed to get upload URL');
            }

            const { uploadUrl } = await urlResponse.json();

            // Upload to S3
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/webp' },
                body: compressedBlob
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload to S3');
            }

            // Update the map with the new image path
            if (currentMap) {
                setCurrentMap({ ...currentMap, imagePath: filename });
            }

            setShowFFXIVSearch(false);

        } catch (error) {
            console.error('FFXIV image download/upload failed:', error);
            throw error; // Re-throw so the modal can show the error
        } finally {
            setIsDownloadingFFXIV(false);
        }
    };

    const handleFFXIVSearchClick = () => {
        // Check if we have the English name for searching
        const mapNameEn = currentMap?.name?.en;
        if (!mapNameEn?.trim()) {
            alert('Veuillez d\'abord saisir le nom de la carte en anglais pour rechercher des images FFXIV.');
            return;
        }
        setShowFFXIVSearch(true);
    };

    const handleUploadClick = () => {
        if (uploadState.isUploading) return;
        reset();
        fileInputRef.current?.click();
    };

    const getUploadButtonContent = () => {
        if (uploadState.isUploading) {
            return (
                <>
                    <FaSpinner className="animate-spin" />
                    <span>{uploadState.progress}%</span>
                </>
            );
        }

        if (uploadState.error) {
            return (
                <>
                    <FaExclamationTriangle className="text-red-500" />
                    <span>Erreur</span>
                </>
            );
        }

        if (uploadState.uploadedUrl) {
            return (
                <>
                    <FaCheck className="text-green-500" />
                    <span>Téléchargé</span>
                </>
            );
        }

        return (
            <>
                <FaUpload />
                <span>Télécharger</span>
            </>
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Image Path"
                    value={currentMap?.imagePath || ""}
                    onChange={(e) => currentMap && setCurrentMap({ ...currentMap, imagePath: e.target.value })}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleUploadClick}
                        disabled={uploadState.isUploading}
                        className={`px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors ${uploadState.isUploading
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : uploadState.error
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : uploadState.uploadedUrl
                                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            }`}
                        title={uploadState.error || 'Télécharger une image de carte'}
                    >
                        {getUploadButtonContent()}
                    </button>
                    <button
                        type="button"
                        onClick={handleFFXIVSearchClick}
                        disabled={isDownloadingFFXIV}
                        className={`px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors ${isDownloadingFFXIV
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                            }`}
                        title="Rechercher des images FFXIV pour cette carte"
                    >
                        {isDownloadingFFXIV ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>FFXIV</span>
                            </>
                        ) : (
                            <>
                                <FaGamepad />
                                <span>FFXIV</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {uploadState.error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                    {uploadState.error}
                </div>
            )}

            {uploadState.uploadedUrl && (
                <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                    Image téléchargée avec succès !
                </div>
            )}

            <div className="text-xs text-gray-500">
                L'image sera compressée en WebP (70% qualité) et nommée d'après le nom anglais de la carte.
                <br />
                Formats acceptés: JPEG, PNG, WebP (max 20MB). Utilisez le bouton FFXIV pour rechercher des images officielles.
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* FFXIV Image Search Modal */}
            {showFFXIVSearch && currentMap?.name?.en && (
                <FFXIVImageSearch
                    mapName={currentMap.name.en}
                    onImageSelect={handleFFXIVImageSelect}
                    onClose={() => setShowFFXIVSearch(false)}
                />
            )}
        </div>
    )
}

export default MapFormImagePath