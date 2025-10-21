import React from 'react';
import { FaEye, FaExpand } from 'react-icons/fa';

interface ViewModeToggleProps {
    viewMode: 'image' | 'sphere';
    onViewModeChange: (mode: 'image' | 'sphere') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => onViewModeChange('sphere')}
                className={`
                    px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                    ${viewMode === 'sphere'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                `}
            >
                <FaExpand />
                Vue 360°
            </button>
            <button
                onClick={() => onViewModeChange('image')}
                className={`
                    px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                    ${viewMode === 'image'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                `}
            >
                <FaEye />
                Vue Image
            </button>
        </div>
    );
};

export default ViewModeToggle;

