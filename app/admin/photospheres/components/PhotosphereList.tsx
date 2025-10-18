import React, { useState } from 'react'
import { FaImages, FaTrash, FaEye, FaSpinner, FaSync } from 'react-icons/fa'
import PhotosphereCard from './PhotosphereCard'

interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date | string;
    size: number;
    totalStorage?: number;
    thumbnailUrl?: string;
    variants?: {
        light?: string;
        medium?: string;
        heavy?: string;
        original?: string;
    };
}

interface PhotosphereListProps {
    photospheres: Photosphere[];
    selectedPhotosphere: Photosphere | null;
    onSelectPhotosphere: (photosphere: Photosphere | null) => void;
    onDeletePhotosphere: (id: string) => void;
    loading?: boolean;
    onRefresh?: () => void;
}

const PhotosphereList = ({ 
    photospheres, 
    selectedPhotosphere, 
    onSelectPhotosphere, 
    onDeletePhotosphere,
    loading = false,
    onRefresh
}: PhotosphereListProps) => {
    const [search, setSearch] = useState("");

    const filteredPhotospheres = photospheres.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette photosphère ?")) {
            onDeletePhotosphere(id);
            if (selectedPhotosphere?.id === id) {
                onSelectPhotosphere(null);
            }
        }
    };

    const formatDate = (date: Date | string) => {
        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleDateString();
        } catch (error) {
            return 'Date inconnue';
        }
    };

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <PhotosphereCard
            title="Photosphères"
            icon={<FaImages />}
        >
            <>
                <div className="flex items-center gap-2 mb-4">
                    <input
                        placeholder="Rechercher une photosphère..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 p-2 rounded grow focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                            title="Actualiser"
                        >
                            <FaSync className={loading ? "animate-spin" : ""} />
                        </button>
                    )}
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <FaSpinner className="animate-spin text-2xl text-gray-400" />
                        <span className="ml-2 text-gray-600">Chargement des photosphères...</span>
                    </div>
                ) : filteredPhotospheres.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {photospheres.length === 0 ? "Aucune photosphère uploadée." : "Aucune photosphère trouvée."}
                    </p>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        <div className="grid gap-2">
                            {filteredPhotospheres.map((photosphere) => (
                                <div
                                    key={photosphere.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 overflow-hidden w-full ${
                                        selectedPhotosphere?.id === photosphere.id ? "bg-purple-50 border-purple-300" : "border-gray-200"
                                    }`}
                                    onClick={() => onSelectPhotosphere(photosphere)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Thumbnail preview if available */}
                                            {photosphere.thumbnailUrl && (
                                                <div className="w-10 h-6 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img 
                                                        src={photosphere.thumbnailUrl} 
                                                        alt="Thumbnail"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {photosphere.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>{formatFileSize(photosphere.size)}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(photosphere.uploadDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(photosphere.url, '_blank');
                                                }}
                                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Voir la photosphère"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(photosphere.id);
                                                }}
                                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                title="Supprimer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        </PhotosphereCard>
    )
}

export default PhotosphereList