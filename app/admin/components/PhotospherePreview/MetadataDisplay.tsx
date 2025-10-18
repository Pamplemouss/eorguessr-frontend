import React from 'react';
import { FaInfoCircle, FaMapMarkerAlt, FaCloud, FaClock, FaCalendarAlt } from 'react-icons/fa';

interface Metadata {
    map: string;
    weather: string;
    x: number;
    y: number;
    z: number;
    time: number;
    uploadedAt?: string;
}

interface MetadataDisplayProps {
    metadata: Metadata;
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <FaInfoCircle />
                Métadonnées du panorama
            </label>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="font-medium text-blue-700">Carte:</span>
                        <span className="text-blue-900">{metadata.map}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaMapMarkerAlt className="text-green-500" />
                        <span className="font-medium text-blue-700">X:</span>
                        <span className="text-blue-900">{metadata.x.toFixed(2)}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaCloud className="text-sky-500" />
                        <span className="font-medium text-blue-700">Météo:</span>
                        <span className="text-blue-900">{metadata.weather}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaMapMarkerAlt className="text-green-500" />
                        <span className="font-medium text-blue-700">Y:</span>
                        <span className="text-blue-900">{metadata.y.toFixed(2)}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaClock className="text-amber-500" />
                        <span className="font-medium text-blue-700">Temps:</span>
                        <span className="text-blue-900">{metadata.time.toString().padStart(4, '0')}</span>
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaMapMarkerAlt className="text-green-500" />
                        <span className="font-medium text-blue-700">Z:</span>
                        <span className="text-blue-900">{metadata.z.toFixed(2)}</span>
                    </div>
                </div>
                {metadata.uploadedAt && (
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 text-sm">
                            <FaCalendarAlt className="text-purple-500" />
                            <span className="font-medium text-blue-700">Uploadé le:</span>
                            <span className="text-blue-900">{metadata.uploadedAt}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetadataDisplay;