import React from 'react'
import { FaCog, FaEdit, FaArrowsAlt } from 'react-icons/fa';

const MapSettings = ({
    showPolygonsEditor,
    setShowPolygonsEditor,
    dragMode,
    setDragMode
} : {
    showPolygonsEditor: boolean;
    setShowPolygonsEditor: React.Dispatch<React.SetStateAction<boolean>>;
    dragMode: boolean;
    setDragMode: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
                <FaCog className="text-gray-500" />
                <span className="font-medium text-gray-700">Paramètres de la carte:</span>
            </div>
            
            <button
                className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                    showPolygonsEditor 
                        ? "bg-blue-100 text-blue-700 border border-blue-300" 
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => setShowPolygonsEditor(v => !v)}
            >
                <FaEdit />
                {showPolygonsEditor ? "Masquer polygones" : "Éditeur polygones"}
            </button>
            
            <button
                className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                    dragMode 
                        ? "bg-green-100 text-green-700 border border-green-300" 
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => setDragMode(v => !v)}
            >
                <FaArrowsAlt />
                {dragMode ? "Déplacement ON" : "Déplacement OFF"}
            </button>
        </div>
    )
}

export default MapSettings

