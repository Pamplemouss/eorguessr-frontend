import React from 'react'
import { FaChartBar, FaImages, FaHdd, FaCalendar } from 'react-icons/fa'
import PhotosphereCard from './PhotosphereCard'

interface PhotospeherStatsProps {
    photospheres: Array<{
        id: string;
        name: string;
        url: string;
        uploadDate: Date;
        size: number;
    }>;
}

const PhotospeherStats = ({ photospheres }: PhotospeherStatsProps) => {
    const totalSize = photospheres.reduce((acc, p) => acc + p.size, 0);
    const totalCount = photospheres.length;
    
    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getRecentUploads = () => {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return photospheres.filter(p => p.uploadDate > lastWeek).length;
    };

    const getAverageFileSize = () => {
        if (totalCount === 0) return 0;
        return totalSize / totalCount;
    };

    return (
        <PhotosphereCard
            title="Statistiques"
            icon={<FaChartBar />}
        >
            <div className="grid grid-cols-2 gap-4">
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

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FaHdd className="text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Stockage</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                        {formatFileSize(totalSize)}
                    </div>
                    <div className="text-xs text-blue-600">
                        utilisé
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FaCalendar className="text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Cette semaine</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                        {getRecentUploads()}
                    </div>
                    <div className="text-xs text-green-600">
                        nouveaux uploads
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FaChartBar className="text-orange-600" />
                        <span className="text-sm font-semibold text-orange-800">Taille moy.</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                        {formatFileSize(getAverageFileSize())}
                    </div>
                    <div className="text-xs text-orange-600">
                        par fichier
                    </div>
                </div>
            </div>

            {totalCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Répartition par taille</h4>
                    <div className="space-y-2">
                        {(() => {
                            const small = photospheres.filter(p => p.size < 1024 * 1024).length; // < 1MB
                            const medium = photospheres.filter(p => p.size >= 1024 * 1024 && p.size < 10 * 1024 * 1024).length; // 1-10MB
                            const large = photospheres.filter(p => p.size >= 10 * 1024 * 1024).length; // > 10MB
                            
                            return (
                                <>
                                    <div className="flex justify-between text-xs">
                                        <span>Petites (&lt; 1MB)</span>
                                        <span>{small}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Moyennes (1-10MB)</span>
                                        <span>{medium}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Grandes (&gt; 10MB)</span>
                                        <span>{large}</span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </PhotosphereCard>
    )
}

export default PhotospeherStats