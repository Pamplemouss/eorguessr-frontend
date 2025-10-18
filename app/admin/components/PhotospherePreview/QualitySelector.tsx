import React from 'react';
import { FaLayerGroup } from 'react-icons/fa';

interface QualityOption {
    key: string;
    label: string;
    url: string;
}

interface QualitySelectorProps {
    variants?: Record<string, string>;
    originalUrl: string;
    selectedQuality: string;
    onQualityChange: (quality: string) => void;
    currentSize: number;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({
    variants,
    originalUrl,
    selectedQuality,
    onQualityChange,
    currentSize
}) => {
    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getAvailableQualities = (): QualityOption[] => {
        if (!variants) return [{ key: 'original', label: 'Original', url: originalUrl }];

        const qualities: QualityOption[] = [];

        if (variants.panorama_thumbnail) qualities.push({ key: 'panorama_thumbnail', label: 'Miniature Panorama', url: variants.panorama_thumbnail });
        if (variants.light) qualities.push({ key: 'light', label: 'Léger', url: variants.light });
        if (variants.medium) qualities.push({ key: 'medium', label: 'Moyen', url: variants.medium });
        if (variants.heavy) qualities.push({ key: 'heavy', label: 'Lourd', url: variants.heavy });
        qualities.push({ key: 'original', label: 'Original', url: originalUrl });

        return qualities;
    };

    const qualities = getAvailableQualities();

    if (!variants || Object.keys(variants).length === 0) {
        return null;
    }

    return (
        <div>
            <label className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <FaLayerGroup />
                Qualité d'affichage
            </label>
            <div className="flex gap-2 flex-wrap justify-between items-center">
                <div className="flex gap-2 flex-wrap">
                    {qualities.map((quality) => (
                        <button
                            key={quality.key}
                            onClick={() => onQualityChange(quality.key)}
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
                        {formatFileSize(currentSize)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QualitySelector;