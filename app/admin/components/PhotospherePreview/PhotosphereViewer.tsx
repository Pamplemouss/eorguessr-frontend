import React from 'react';
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

interface PhotosphereViewerProps {
    viewMode: 'image' | 'sphere';
    imageUrl: string;
    imageName: string;
}

const PhotosphereViewer: React.FC<PhotosphereViewerProps> = ({
    viewMode,
    imageUrl,
    imageName
}) => {
    return (
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {viewMode === 'sphere' ? (
                <div className="relative w-full h-full">
                    <ReactPhotoSphereViewer
                        src={imageUrl}
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
                    src={imageUrl}
                    alt={imageName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/400/225';
                    }}
                />
            )}
        </div>
    );
};

export default PhotosphereViewer;