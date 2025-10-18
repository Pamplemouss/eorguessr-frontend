import React, { useState, useEffect } from 'react'
import { FaEye, FaDownload, FaInfoCircle, FaLayerGroup, FaExpand, FaMapMarkerAlt, FaCloud, FaClock, FaCalendarAlt } from 'react-icons/fa'
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"
import PhotosphereCard from './PhotosphereCard'

interface PhotospherePreviewProps {
    photosphere?: {
        id: string;
        name: string;
        url: string;
        uploadDate: Date | string;
        size: number;
        totalStorage?: number;
        thumbnailUrl?: string;
        metadata?: {
            map: string;
            weather: string;
            x: number;
            y: number;
            z: number;
            time: number;
            uploadedAt?: string;
        };
        variants?: {
            panorama_thumbnail?: string;
            light?: string;
            medium?: string;
            heavy?: string;
            original?: string;
        };
    } | null;
}

const PhotospherePreview = ({ photosphere }: PhotospherePreviewProps) => {
    const [selectedQuality, setSelectedQuality] = useState<string>('light');
    const [viewMode, setViewMode] = useState<'image' | 'sphere'>('sphere');
    const [showThumbnailModal, setShowThumbnailModal] = useState(false);
    const [variantSizes, setVariantSizes] = useState<Record<string, number>>({});

    // Reset quality selection when photosphere changes
    useEffect(() => {
        if (photosphere?.variants?.light) {
            setSelectedQuality('light');
        } else if (photosphere?.variants?.panorama_thumbnail) {
            setSelectedQuality('panorama_thumbnail');
        } else if (photosphere) {
            const availableQualities = getAvailableQualities();
            if (availableQualities.length > 0) {
                setSelectedQuality(availableQualities[0].key);
            }
        }
    }, [photosphere]);

    // Fetch file sizes for variants
    useEffect(() => {
        const fetchVariantSizes = async () => {
            if (!photosphere?.variants) return;

            const sizes: Record<string, number> = {};

            for (const [key, url] of Object.entries(photosphere.variants)) {
                if (url) {
                    try {
                        const response = await fetch(url, { method: 'HEAD' });
                        const contentLength = response.headers.get('Content-Length');
                        if (contentLength) {
                            sizes[key] = parseInt(contentLength, 10);
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch size for variant ${key}:`, error);
                    }
                }
            }

            // Add original size
            sizes.original = photosphere.size;
            setVariantSizes(sizes);
        };

        if (photosphere) {
            fetchVariantSizes();
        }
    }, [photosphere]);

    // Handle escape key for thumbnail modal
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showThumbnailModal) {
                setShowThumbnailModal(false);
            }
        };

        if (showThumbnailModal) {
            document.addEventListener('keydown', handleKeyPress);
            return () => document.removeEventListener('keydown', handleKeyPress);
        }
    }, [showThumbnailModal]);

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date: Date | string) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleDateString('fr-FR');
        } catch (error) {
            return 'Date inconnue';
        }
    };

    const getDisplayUrl = () => {
        if (!photosphere) return '';

        if (selectedQuality === 'original') return photosphere.url;

        const variant = photosphere.variants?.[selectedQuality as keyof typeof photosphere.variants];
        return variant || photosphere.variants?.light || photosphere.variants?.panorama_thumbnail || photosphere.url;
    };

    const getAvailableQualities = () => {
        if (!photosphere?.variants) return [{ key: 'original', label: 'Original', url: photosphere?.url }];

        const qualities = [];

        if (photosphere.variants.panorama_thumbnail) qualities.push({ key: 'panorama_thumbnail', label: 'Miniature Panorama', url: photosphere.variants.panorama_thumbnail });
        if (photosphere.variants.light) qualities.push({ key: 'light', label: 'Léger', url: photosphere.variants.light });
        if (photosphere.variants.medium) qualities.push({ key: 'medium', label: 'Moyen', url: photosphere.variants.medium });
        if (photosphere.variants.heavy) qualities.push({ key: 'heavy', label: 'Lourd', url: photosphere.variants.heavy });
        qualities.push({ key: 'original', label: 'Original', url: photosphere.url });

        return qualities;
    };

    const getCurrentQualitySize = () => {
        if (!photosphere) return 0;

        // Use the fetched variant size if available
        if (variantSizes[selectedQuality]) {
            return variantSizes[selectedQuality];
        }

        // Fallback to original size
        return photosphere.size;
    };

    return (
        <PhotosphereCard
            title="Aperçu"
            icon={<FaEye />}
        >
            {!photosphere ? (
                <div className="text-center py-12 text-gray-500">
                    <FaInfoCircle className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>Sélectionnez une photosphère pour voir l'aperçu</p>
                </div>
            ) : (
                <div className="space-y-4 relative">
                    {/* Thumbnail preview if available */}
                    {photosphere.thumbnailUrl && (
                        <div className="absolute top-[-53px] right-0">
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Miniature</label>
                            <div
                                className="w-24 h-14 bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
                                onClick={() => setShowThumbnailModal(true)}
                                title="Cliquer pour agrandir"
                            >
                                <img
                                    src={photosphere.thumbnailUrl}
                                    alt="Miniature"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                    {/* View Mode Toggle */}
                    <div className="flex gap-2 mb-4 justify-between items-start">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('sphere')}
                                className={`
                                    px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                                    ${viewMode === 'sphere'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <FaExpand />
                                Vue 360°
                            </button>
                            <button
                                onClick={() => setViewMode('image')}
                                className={`
                                    px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                                    ${viewMode === 'image'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <FaEye />
                                Vue Image
                            </button>
                        </div>
                    </div>

                    {/* Quality Selector */}
                    {photosphere.variants && Object.keys(photosphere.variants).length > 0 && (
                        <div>
                            <label className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                                <FaLayerGroup />
                                Qualité d'affichage
                            </label>
                            <div className="flex gap-2 flex-wrap justify-between items-center">
                                <div className="flex gap-2 flex-wrap">
                                    {getAvailableQualities().map((quality) => (
                                        <button
                                            key={quality.key}
                                            onClick={() => setSelectedQuality(quality.key)}
                                            className={`
                                                px-3 py-1 rounded-full text-sm font-medium transition-colors
                                                ${selectedQuality === quality.key
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            {quality.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Current Quality Size */}
                                <div className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                                    <span className="text-purple-600 font-mono font-medium text-sm">
                                        {formatFileSize(getCurrentQualitySize())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Photosphere Viewer */}
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {viewMode === 'sphere' ? (
                            <div className="relative w-full h-full">
                                <ReactPhotoSphereViewer
                                    src={getDisplayUrl()}
                                    height="100%"
                                    width="100%"
                                    containerClass="photosphere-container"
                                    littlePlanet={false}
                                    navbar={[
                                        'autorotate',
                                        'zoom',
                                        'move',
                                        'fullscreen'
                                    ]}
                                />
                            </div>
                        ) : (
                            <img
                                src={getDisplayUrl()}
                                alt={photosphere.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/api/placeholder/400/225';
                                }}
                            />
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        {/* Metadata Section */}
                        {photosphere.metadata && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <label className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                    <FaInfoCircle />
                                    Métadonnées du panorama
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaMapMarkerAlt className="text-blue-500" />
                                            <span className="font-medium text-blue-700">Carte:</span>
                                            <span className="text-blue-900">{photosphere.metadata.map}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaMapMarkerAlt className="text-green-500" />
                                            <span className="font-medium text-blue-700">X:</span>
                                            <span className="text-blue-900">{photosphere.metadata.x.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaCloud className="text-sky-500" />
                                            <span className="font-medium text-blue-700">Météo:</span>
                                            <span className="text-blue-900">{photosphere.metadata.weather}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaMapMarkerAlt className="text-green-500" />
                                            <span className="font-medium text-blue-700">Y:</span>
                                            <span className="text-blue-900">{photosphere.metadata.y.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaClock className="text-amber-500" />
                                            <span className="font-medium text-blue-700">Temps:</span>
                                            <span className="text-blue-900">{photosphere.metadata.time.toString().padStart(4, '0')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaMapMarkerAlt className="text-green-500" />
                                            <span className="font-medium text-blue-700">Z:</span>
                                            <span className="text-blue-900">{photosphere.metadata.z.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {photosphere.metadata.uploadedAt && (
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FaCalendarAlt className="text-purple-500" />
                                                <span className="font-medium text-blue-700">Uploadé le:</span>
                                                <span className="text-blue-900">{photosphere.metadata.uploadedAt}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Thumbnail Modal */}
            {showThumbnailModal && photosphere?.thumbnailUrl && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur z-[1000] flex items-center justify-center p-4"
                    onClick={() => setShowThumbnailModal(false)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={photosphere.thumbnailUrl}
                            alt="Miniature agrandie"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setShowThumbnailModal(false)}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white w-7 h-7 transition-all duration-200"
                            title="Fermer"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </PhotosphereCard>
    )
}

export default PhotospherePreview