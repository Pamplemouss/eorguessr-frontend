import React, { useState } from 'react'
import { FaImages, FaTrash, FaEye } from 'react-icons/fa'
import PhotosphereCard from './PhotosphereCard'

interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date;
    size: number;
}

interface PhotospherListProps {
    photospheres: Photosphere[];
    selectedPhotosphere: Photosphere | null;
    onSelectPhotosphere: (photosphere: Photosphere | null) => void;
    onDeletePhotosphere: (id: string) => void;
}

const PhotospherList = ({ 
    photospheres, 
    selectedPhotosphere, 
    onSelectPhotosphere, 
    onDeletePhotosphere 
}: PhotospherListProps) => {
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
                </div>
                
                {filteredPhotospheres.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {photospheres.length === 0 ? "Aucune photosphère uploadée." : "Aucune photosphère trouvée."}
                    </p>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        <div className="grid gap-2">
                            {filteredPhotospheres.map((photosphere) => (
                                <div
                                    key={photosphere.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                                        selectedPhotosphere?.id === photosphere.id ? "bg-purple-50 border-purple-300" : "border-gray-200"
                                    }`}
                                    onClick={() => onSelectPhotosphere(photosphere)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {photosphere.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(photosphere.size)} • {photosphere.uploadDate.toLocaleDateString()}
                                            </p>
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

export default PhotospherList