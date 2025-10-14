import React from 'react'
import { FaEye, FaDownload, FaInfoCircle } from 'react-icons/fa'
import PhotosphereCard from './PhotosphereCard'

interface PhotospeherPreviewProps {
    photosphere?: {
        id: string;
        name: string;
        url: string;
        uploadDate: Date;
        size: number;
    } | null;
}

const PhotospeherPreview = ({ photosphere }: PhotospeherPreviewProps) => {
    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDownload = () => {
        if (photosphere?.url) {
            const link = document.createElement('a');
            link.href = photosphere.url;
            link.download = photosphere.name;
            link.click();
        }
    };

    const handleView = () => {
        if (photosphere?.url) {
            window.open(photosphere.url, '_blank');
        }
    };

    return (
        <PhotosphereCard
            title="Aperçu"
            icon={<FaEye />}
        >
            {!photosphere ? (
                <div className="text-center py-12 text-gray-500">
                    <FaInfoCircle className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>Sélectionnez une photosphère pour voir l'aperçu</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Image preview */}
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={photosphere.url}
                            alt={photosphere.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/400/225';
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                            <button
                                onClick={handleView}
                                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110"
                                title="Voir en grand"
                            >
                                <FaEye />
                            </button>
                            <button
                                onClick={handleDownload}
                                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full transition-all duration-200 hover:scale-110"
                                title="Télécharger"
                            >
                                <FaDownload />
                            </button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Nom du fichier</label>
                            <p className="text-gray-900 bg-gray-50 p-2 rounded border">{photosphere.name}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Taille</label>
                                <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                                    {formatFileSize(photosphere.size)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Date d'upload</label>
                                <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                                    {photosphere.uploadDate.toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">URL</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={photosphere.url}
                                    readOnly
                                    className="flex-1 text-gray-900 bg-gray-50 p-2 rounded border text-sm"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(photosphere.url)}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors"
                                >
                                    Copier
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <button
                            onClick={handleView}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
                        >
                            <FaEye />
                            Voir
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
                        >
                            <FaDownload />
                            Télécharger
                        </button>
                    </div>
                </div>
            )}
        </PhotosphereCard>
    )
}

export default PhotospeherPreview