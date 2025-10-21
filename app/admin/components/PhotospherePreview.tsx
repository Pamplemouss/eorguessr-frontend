import React from 'react'
import { FaEye, FaInfoCircle } from 'react-icons/fa'
import PhotosphereCard from './PhotosphereCard'
import {
    QualitySelector,
    ViewModeToggle,
    PhotosphereViewer,
    MetadataDisplay,
    ThumbnailModal,
    ThumbnailPreview
} from './PhotospherePreview/index'
import { usePhotospherePreview } from './PhotospherePreview/usePhotospherePreview'

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
            coord: {
                x: number;
                y: number;
                z: number;
            };
            time: string;
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
    const {
        selectedQuality,
        setSelectedQuality,
        viewMode,
        setViewMode,
        showThumbnailModal,
        setShowThumbnailModal,
        getDisplayUrl,
        getCurrentQualitySize
    } = usePhotospherePreview(photosphere);

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
                        <ThumbnailPreview
                            thumbnailUrl={photosphere.thumbnailUrl}
                            onThumbnailClick={() => setShowThumbnailModal(true)}
                        />
                    )}

                    {/* View Mode Toggle */}
                    <div className="flex gap-2 mb-4 justify-between items-start">
                        <ViewModeToggle
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />
                    </div>

                    {/* Quality Selector */}
                    <QualitySelector
                        variants={photosphere.variants}
                        originalUrl={photosphere.url}
                        selectedQuality={selectedQuality}
                        onQualityChange={setSelectedQuality}
                        currentSize={getCurrentQualitySize()}
                    />

                    {/* Photosphere Viewer */}
                    <PhotosphereViewer
                        viewMode={viewMode}
                        imageUrl={getDisplayUrl()}
                        imageName={photosphere.name}
                    />

                    {/* Details */}
                    <div className="space-y-3">
                        {/* Metadata Section */}
                        {photosphere.metadata && (
                            <MetadataDisplay metadata={photosphere.metadata} />
                        )}
                    </div>
                </div>
            )}

            {/* Thumbnail Modal */}
            <ThumbnailModal
                isOpen={showThumbnailModal}
                thumbnailUrl={photosphere?.thumbnailUrl || ''}
                onClose={() => setShowThumbnailModal(false)}
            />
        </PhotosphereCard>
    )
}

export default PhotospherePreview

