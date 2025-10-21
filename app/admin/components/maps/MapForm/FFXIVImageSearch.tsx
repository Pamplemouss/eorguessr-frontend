import React, { useState } from 'react';
import { FaSearch, FaSpinner, FaTimes, FaDownload, FaGamepad } from 'react-icons/fa';

interface FFXIVImageResult {
    mapId: number;
    mapName: Record<string, string>;
    mapImageId: number;
    imageUrl: string;
    suggestedFilename: string;
    placeName: Record<string, string>;
    placeNameSub: Record<string, string>;
    placeNameRegion: Record<string, string>;
    expansion: Record<string, string>;
}

interface FFXIVImageSearchProps {
    mapName: string;
    onImageSelect: (imageUrl: string, filename: string) => Promise<void>;
    onClose: () => void;
}

const FFXIVImageSearch: React.FC<FFXIVImageSearchProps> = ({ mapName, onImageSelect, onClose }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<FFXIVImageResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [downloadingImageId, setDownloadingImageId] = useState<number | null>(null);

    React.useEffect(() => {
        if (mapName.trim()) {
            handleSearch();
        }
    }, [mapName]);

    const handleSearch = async () => {
        if (!mapName.trim()) return;

        setIsSearching(true);
        setError(null);
        setSearchResults([]);

        try {
            console.log('Searching for FFXIV images with mapName:', mapName);
            const response = await fetch(`/api/ffxiv/maps/images?mapName=${encodeURIComponent(mapName)}&language=en`);
            
            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            if (data.success && Array.isArray(data.images)) {
                console.log('Found images:', data.images.length);
                setSearchResults(data.images);
            } else {
                console.warn('Unexpected response format:', data);
                throw new Error(data.error || 'Search failed - unexpected response format');
            }
        } catch (err) {
            console.error('FFXIV image search error:', err);
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleImageSelect = async (image: FFXIVImageResult) => {
        setDownloadingImageId(image.mapImageId);
        try {
            await onImageSelect(image.imageUrl, image.suggestedFilename);
        } catch (error) {
            console.error('Failed to download image:', error);
            alert('Failed to download and upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setDownloadingImageId(null);
        }
    };

    const getDisplayName = (image: FFXIVImageResult) => {
        return image.placeName.en || image.mapName.en || 'Unknown';
    };

    const getDisplaySubName = (image: FFXIVImageResult) => {
        return image.placeNameSub.en || '';
    };

    const getDisplayRegion = (image: FFXIVImageResult) => {
        return image.placeNameRegion.en || '';
    };

    const getDisplayExpansion = (image: FFXIVImageResult) => {
        return image.expansion.en || '';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FaGamepad />
                                FFXIV Map Images
                            </h2>
                            <p className="text-purple-100 mt-1">
                                Search results for: "{mapName}"
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="animate-spin text-blue-500 mr-3" size={24} />
                            <span className="text-gray-600">Searching FFXIV database...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-red-600 mb-4">{error}</div>
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Retry Search
                            </button>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {searchResults.map((image) => (
                                <div key={image.mapImageId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    {/* Image Preview */}
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                                        <img
                                            src={image.imageUrl}
                                            alt={getDisplayName(image)}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                                if (fallback) {
                                                    fallback.style.display = 'flex';
                                                }
                                            }}
                                        />
                                        <div className="fallback-icon absolute inset-0 hidden items-center justify-center text-gray-400">
                                            <FaGamepad size={48} />
                                        </div>
                                    </div>

                                    {/* Image Info */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-lg text-gray-900">
                                            {getDisplayName(image)}
                                        </h4>
                                        
                                        {getDisplaySubName(image) && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>📍</span>
                                                <span>{getDisplaySubName(image)}</span>
                                            </div>
                                        )}

                                        {getDisplayRegion(image) && (
                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                                <span>🗺️</span>
                                                <span>{getDisplayRegion(image)}</span>
                                            </div>
                                        )}

                                        {getDisplayExpansion(image) && (
                                            <div className="flex items-center gap-2 text-sm text-purple-600">
                                                <span>🎮</span>
                                                <span>{getDisplayExpansion(image)}</span>
                                            </div>
                                        )}

                                        <div className="bg-gray-50 rounded-md p-2">
                                            <div className="text-xs text-gray-500 mb-1">Filename:</div>
                                            <div className="font-mono text-sm text-gray-800">{image.suggestedFilename}</div>
                                        </div>

                                        {/* Download Button */}
                                        <button
                                            onClick={() => handleImageSelect(image)}
                                            disabled={downloadingImageId === image.mapImageId}
                                            className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
                                                downloadingImageId === image.mapImageId
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                        >
                                            {downloadingImageId === image.mapImageId ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    <span>Downloading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaDownload />
                                                    <span>Download & Upload</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No images found for "{mapName}". Try a different search term.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FFXIVImageSearch;