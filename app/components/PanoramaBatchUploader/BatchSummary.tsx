'use client';

import React from 'react';
import { 
  FaFile, 
  FaHdd, 
  FaCompressArrowsAlt, 
  FaCheck,
  FaImage
} from 'react-icons/fa';
import { PanoramaFile, BatchUploadSummary, QUALITY_CONFIGS } from '@/lib/types/PanoramaBatch';
import { formatFileSize } from '@/lib/utils/panoramaUtils';

interface BatchSummaryProps {
  panoramaFiles: PanoramaFile[];
  batchSummary: BatchUploadSummary;
}

const BatchSummary: React.FC<BatchSummaryProps> = ({ panoramaFiles, batchSummary }) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaFile className="text-blue-500" />
            <span className="text-sm font-semibold text-gray-600">Fichiers</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {batchSummary.totalFiles}
          </div>
          <div className="text-xs text-gray-500">
            panoramas à traiter
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaHdd className="text-orange-500" />
            <span className="text-sm font-semibold text-gray-600">Taille originale</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {formatFileSize(batchSummary.totalSize)}
          </div>
          <div className="text-xs text-gray-500">
            taille totale des fichiers
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaCompressArrowsAlt className="text-green-500" />
            <span className="text-sm font-semibold text-gray-600">Après compression</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {formatFileSize(batchSummary.estimatedCompressedSize)}
          </div>
          <div className="text-xs text-gray-500">
            estimation totale
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <FaCheck className="text-purple-500" />
            <span className="text-sm font-semibold text-gray-600">Prêts</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {batchSummary.readyFiles}
          </div>
          <div className="text-xs text-gray-500">
            fichiers configurés
          </div>
        </div>
      </div>

      {/* File Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Détails des fichiers
        </h3>
        
        <div className="space-y-4">
          {panoramaFiles.map((panoramaFile) => (
            <div key={panoramaFile.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">
                    {panoramaFile.file.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(panoramaFile.file.size)} • {panoramaFile.file.type}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-green-600">
                  <FaCheck className="text-sm" />
                  <span className="text-sm font-medium">Configuré</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selected Thumbnail */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">
                    Miniature sélectionnée
                  </label>
                  {panoramaFile.thumbnails[panoramaFile.selectedThumbnailIndex] && (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-48">
                      <img
                        src={URL.createObjectURL(panoramaFile.thumbnails[panoramaFile.selectedThumbnailIndex])}
                        alt="Miniature sélectionnée"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                        <FaImage className="inline mr-1" />
                        Miniature
                      </div>
                    </div>
                  )}
                </div>

                {/* Quality Versions */}
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">
                    Versions de qualité
                  </label>
                  <div className="space-y-2">
                    {QUALITY_CONFIGS.map((config) => {
                      const hasQuality = panoramaFile.qualities[config.name];
                      return (
                        <div 
                          key={config.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className={`
                            ${hasQuality ? 'text-gray-700' : 'text-gray-400'}
                          `}>
                            {config.name === 'original' ? 'Original' : 
                             config.name === 'light' ? 'Léger' :
                             config.name === 'medium' ? 'Moyen' : 'Lourd'}
                          </span>
                          <div className="flex items-center gap-2">
                            {config.maxWidth && (
                              <span className="text-gray-500 text-xs">
                                {config.maxWidth}px
                              </span>
                            )}
                            {hasQuality ? (
                              <FaCheck className="text-green-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-200" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Structure Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Structure d'upload prévue
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700">
          <div>photospheres/</div>
          {panoramaFiles.slice(0, 2).map((panoramaFile) => (
            <div key={panoramaFile.id} className="ml-4">
              <div>├── {panoramaFile.id}/</div>
              <div className="ml-4">
                <div>├── thumbnail.webp</div>
                <div>├── panorama_light.webp</div>
                <div>├── panorama_medium.webp</div>
                <div>├── panorama_heavy.webp</div>
                <div>└── panorama_original.webp</div>
              </div>
            </div>
          ))}
          {panoramaFiles.length > 2 && (
            <div className="ml-4 text-gray-500">
              └── ... et {panoramaFiles.length - 2} autre(s) panorama(s)
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Chaque panorama sera uploadé avec ses 4 versions de qualité plus une miniature représentative.
            Total estimé : <strong>{panoramaFiles.length * 5} fichiers</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BatchSummary;