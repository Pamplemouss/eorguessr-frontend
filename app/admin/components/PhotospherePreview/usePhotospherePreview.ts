import { useState, useEffect } from 'react';

interface Photosphere {
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
}

export const usePhotospherePreview = (photosphere: Photosphere | null | undefined) => {
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

    const getDisplayUrl = () => {
        if (!photosphere) return '';

        if (selectedQuality === 'original') return photosphere.url;

        const variant = photosphere.variants?.[selectedQuality as keyof typeof photosphere.variants];
        return variant || photosphere.variants?.light || photosphere.variants?.panorama_thumbnail || photosphere.url;
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

    return {
        selectedQuality,
        setSelectedQuality,
        viewMode,
        setViewMode,
        showThumbnailModal,
        setShowThumbnailModal,
        variantSizes,
        getDisplayUrl,
        getCurrentQualitySize,
        getAvailableQualities
    };
};