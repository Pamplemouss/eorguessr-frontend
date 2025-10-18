import React from 'react';

interface ThumbnailModalProps {
    isOpen: boolean;
    thumbnailUrl: string;
    onClose: () => void;
}

const ThumbnailModal: React.FC<ThumbnailModalProps> = ({
    isOpen,
    thumbnailUrl,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur z-[1000] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-full">
                <img
                    src={thumbnailUrl}
                    alt="Miniature agrandie"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white w-7 h-7 transition-all duration-200"
                    title="Fermer"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default ThumbnailModal;