'use client';

import React, { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';
import { THUMBNAIL_ANGLES } from '@/lib/types/PanoramaBatch';

interface ThumbnailSelectorProps {
  thumbnails: Blob[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const ThumbnailSelector: React.FC<ThumbnailSelectorProps> = ({
  thumbnails,
  selectedIndex,
  onSelect
}) => {
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);

  useEffect(() => {
    // Create object URLs for displaying thumbnails
    const urls = thumbnails.map(thumbnail => URL.createObjectURL(thumbnail));
    setThumbnailUrls(urls);

    // Cleanup function
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [thumbnails]);

  if (thumbnails.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune miniature générée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Sélectionnez une miniature représentative :
        </h4>
        <p className="text-xs text-gray-500">
          Ces miniatures ont été générées automatiquement à partir de différents angles de vue.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {thumbnailUrls.map((url, index) => (
          <div
            key={index}
            className={`
              relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200
              ${selectedIndex === index
                ? 'ring-4 ring-blue-500 shadow-lg scale-105'
                : 'ring-2 ring-gray-200 hover:ring-blue-300 hover:shadow-md'
              }
            `}
            onClick={() => onSelect(index)}
          >
            <img
              src={url}
              alt={`Miniature ${index + 1} (${THUMBNAIL_ANGLES[index]}°)`}
              className="w-full h-full object-cover"
            />
            
            {/* Angle indicator */}
            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
              {THUMBNAIL_ANGLES[index]}°
            </div>
            
            {/* Selection indicator */}
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <div className="bg-blue-500 text-white rounded-full p-2">
                  <FaCheck />
                </div>
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
          </div>
        ))}
      </div>

      {/* Selected info */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">Miniature sélectionnée :</span> 
        {' '}Angle {THUMBNAIL_ANGLES[selectedIndex]}° ({selectedIndex + 1}/{thumbnails.length})
      </div>
    </div>
  );
};

export default ThumbnailSelector;