import React from 'react'
import { FaChartBar, FaImages, FaHdd, FaSpinner, FaLayerGroup } from 'react-icons/fa'
import PhotosphereCard from './PhotosphereCard'

interface PhotospeherStatsProps {
    photospheres: Array<{
        id: string;
        name: string;
        url: string;
        uploadDate: Date | string;
        size: number;
        totalStorage?: number;
        thumbnailUrl?: string;
        variants?: {
            light?: string;
            medium?: string;
            heavy?: string;
            original?: string;
        };
    }>;
    loading?: boolean;
}

const PhotospeherStats = ({ photospheres, loading = false }: PhotospeherStatsProps) => {
    // Calculate cumulative storage using actual file sizes from S3
    const getTotalStorage = () => {
        return photospheres.reduce((acc, p) => {
            // Use actual total storage if available, otherwise fall back to original size
            return acc + (p.totalStorage || p.size);
        }, 0);
    };

    const totalSize = getTotalStorage();
    const totalCount = photospheres.length;
    
    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getVariantsStats = () => {
        const withThumbnails = photospheres.filter(p => p.thumbnailUrl).length;
        const withVariants = photospheres.filter(p => p.variants && Object.keys(p.variants).length > 0).length;
        const totalVariants = photospheres.reduce((acc, p) => {
            return acc + (p.variants ? Object.values(p.variants).filter(Boolean).length : 0);
        }, 0);
        
        return { withThumbnails, withVariants, totalVariants };
    };

    const variantsStats = getVariantsStats();

    if (loading) {
        return (
            <PhotosphereCard
                title="Statistiques"
                icon={<FaChartBar />}
            >
                <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-gray-400" />
                    <span className="ml-2 text-gray-600">Chargement des statistiques...</span>
                </div>
            </PhotosphereCard>
        );
    }

    return (
        <PhotosphereCard
            title="Statistiques"
            icon={<FaChartBar />}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FaImages className="text-purple-600" />
                        <span className="text-sm font-semibold text-purple-800">Total</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                        {totalCount}
                    </div>
                    <div className="text-xs text-purple-600">
                        photosphères
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FaLayerGroup className="text-orange-600" />
                        <span className="text-sm font-semibold text-orange-800">Variants</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                        {variantsStats.totalVariants}
                    </div>
                    <div className="text-xs text-orange-600">
                        fichiers totaux
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FaHdd className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Stockage</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                        {formatFileSize(totalSize)}
                    </div>
                    <div className="text-xs text-blue-600">
                        utilisé (tous variants)
                    </div>
                </div>
            </div>
        </PhotosphereCard>
    )
}

export default PhotospeherStats