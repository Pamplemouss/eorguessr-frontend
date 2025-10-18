'use client';

import React, { useState } from 'react';
import { FaUpload, FaImage } from 'react-icons/fa';
import PanoramaBatchUploader from './PanoramaBatchUploader';

interface PanoramaUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (uploadedFiles: string[]) => void;
}

const PanoramaUploaderModal: React.FC<PanoramaUploaderModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  if (!isOpen) return null;

  const handleComplete = (uploadedFiles: string[]) => {
    if (onComplete) {
      onComplete(uploadedFiles);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaImage className="text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                Upload en lot de panoramas
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <PanoramaBatchUploader onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

// Simple trigger button component
interface PanoramaBatchUploaderTriggerProps {
  onComplete?: (uploadedFiles: string[]) => void;
  className?: string;
}

export const PanoramaBatchUploaderTrigger: React.FC<PanoramaBatchUploaderTriggerProps> = ({
  onComplete,
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
          hover:bg-blue-600 transition-colors font-medium
          ${className}
        `}
      >
        <FaUpload />
        Upload panoramas en lot
      </button>

      <PanoramaUploaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={onComplete}
      />
    </>
  );
};

export default PanoramaUploaderModal;