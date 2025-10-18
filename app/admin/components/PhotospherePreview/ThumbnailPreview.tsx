import React from 'react';

interface ThumbnailPreviewProps {
    thumbnailUrl: string;
    onThumbnailClick: () => void;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
    thumbnailUrl,
    onThumbnailClick
}) => {
    return (
        <div className="absolute top-[-53px] right-0">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Miniature</label>
            <div
                className="w-24 h-14 bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
                onClick={onThumbnailClick}
                title="Cliquer pour agrandir"
            >
                <img
                    src={thumbnailUrl}
                    alt="Miniature"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default ThumbnailPreview;