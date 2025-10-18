'use client';

import React from 'react';
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaFile,
  FaImage,
  FaUpload
} from 'react-icons/fa';
import { PanoramaFile, UploadProgress as UploadProgressType } from '@/lib/types/PanoramaBatch';
import { formatFileSize } from '@/lib/utils/panoramaUtils';

interface UploadProgressProps {
  panoramaFiles: PanoramaFile[];
  uploadProgress: UploadProgressType[];
}

const UploadProgress: React.FC<UploadProgressProps> = ({ panoramaFiles, uploadProgress }) => {
  const getOverallProgress = (): number => {
    if (uploadProgress.length === 0) return 0;
    
    const completedUploads = uploadProgress.filter(up => up.status === 'completed').length;
    return Math.round((completedUploads / uploadProgress.length) * 100);
  };

  const getFileProgress = (fileId: string): number => {
    const fileUploads = uploadProgress.filter(up => up.fileId === fileId);
    if (fileUploads.length === 0) return 0;
    
    const completedUploads = fileUploads.filter(up => up.status === 'completed').length;
    return Math.round((completedUploads / fileUploads.length) * 100);
  };

  const getStatusIcon = (status: PanoramaFile['uploadStatus']) => {
    switch (status) {
      case 'uploading':
        return <FaSpinner className="animate-spin text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaFile className="text-gray-400" />;
    }
  };

  const getProgressBarColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getUploadTypeIcon = (type: string) => {
    switch (type) {
      case 'thumbnail':
        return <FaImage className="text-purple-500" />;
      default:
        return <FaUpload className="text-blue-500" />;
    }
  };

  const getUploadTypeLabel = (type: string) => {
    switch (type) {
      case 'thumbnail': return 'Miniature';
      case 'light': return 'Qualité légère';
      case 'medium': return 'Qualité moyenne';
      case 'heavy': return 'Qualité lourde';
      case 'original': return 'Original';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Progression globale</h2>
          <span className="text-sm text-gray-600">
            {uploadProgress.filter(up => up.status === 'completed').length} / {uploadProgress.length} fichiers
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className={`h-4 rounded-full transition-all duration-300 ${getProgressBarColor(getOverallProgress())}`}
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>
        
        <div className="text-center text-lg font-semibold text-gray-700">
          {getOverallProgress()}%
        </div>
      </div>

      {/* Individual File Progress */}
      <div className="space-y-4">
        {panoramaFiles.map((panoramaFile) => {
          const fileUploads = uploadProgress.filter(up => up.fileId === panoramaFile.id);
          const fileProgress = getFileProgress(panoramaFile.id);
          
          return (
            <div key={panoramaFile.id} className="bg-white rounded-lg shadow-md p-6">
              {/* File Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(panoramaFile.uploadStatus)}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {panoramaFile.file.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(panoramaFile.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-700">
                    {fileProgress}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {fileUploads.filter(up => up.status === 'completed').length} / {fileUploads.length}
                  </div>
                </div>
              </div>

              {/* File Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(fileProgress)}`}
                  style={{ width: `${fileProgress}%` }}
                />
              </div>

              {/* Individual Upload Progress */}
              {fileUploads.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Détails de l'upload :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {fileUploads.map((upload, index) => (
                      <div 
                        key={`${upload.fileId}-${upload.type}-${index}`}
                        className={`
                          flex items-center gap-2 p-2 rounded border
                          ${upload.status === 'completed' ? 'bg-green-50 border-green-200' :
                            upload.status === 'uploading' ? 'bg-blue-50 border-blue-200' :
                            upload.status === 'error' ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
                          }
                        `}
                      >
                        <div className="flex-shrink-0">
                          {upload.status === 'uploading' ? (
                            <FaSpinner className="animate-spin text-blue-500 text-sm" />
                          ) : upload.status === 'completed' ? (
                            <FaCheckCircle className="text-green-500 text-sm" />
                          ) : upload.status === 'error' ? (
                            <FaExclamationTriangle className="text-red-500 text-sm" />
                          ) : (
                            getUploadTypeIcon(upload.type)
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-700 truncate">
                            {getUploadTypeLabel(upload.type)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {upload.status === 'uploading' ? 'En cours...' :
                             upload.status === 'completed' ? 'Terminé' :
                             upload.status === 'error' ? 'Erreur' :
                             'En attente'
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé de l'upload</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {uploadProgress.filter(up => up.status === 'uploading').length}
            </div>
            <div className="text-sm text-blue-700">En cours</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {uploadProgress.filter(up => up.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">Terminés</div>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {uploadProgress.filter(up => up.status === 'error').length}
            </div>
            <div className="text-sm text-red-700">Erreurs</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {uploadProgress.filter(up => up.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-700">En attente</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;