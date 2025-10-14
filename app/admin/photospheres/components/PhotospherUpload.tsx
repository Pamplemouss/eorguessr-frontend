import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa'
import PhotosphereCard from './PhotosphereCard'

interface UploadStatus {
    status: 'idle' | 'uploading' | 'success' | 'error';
    message?: string;
    progress?: number;
}

interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date;
    size: number;
}

interface PhotospherUploadProps {
    onPhotosphereAdded: (photosphere: Photosphere) => void;
}

const PhotospherUpload = ({ onPhotosphereAdded }: PhotospherUploadProps) => {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' });
    const [dragActive, setDragActive] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploadStatus({ status: 'uploading', message: 'Préparation de l\'upload...', progress: 0 });

        try {
            // Simulation de progression
            setUploadStatus({ status: 'uploading', message: 'Demande d\'URL signée...', progress: 20 });

            // Demande une URL signée
            const res = await fetch("/api/upload-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: file.name, fileType: file.type }),
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la génération de l\'URL de upload');
            }

            const { uploadUrl, fileUrl } = await res.json();
            
            setUploadStatus({ status: 'uploading', message: 'Upload vers S3...', progress: 50 });

            // Upload direct vers S3
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!uploadResponse.ok) {
                throw new Error('Erreur lors de l\'upload vers S3');
            }

            setUploadStatus({ status: 'uploading', message: 'Finalisation...', progress: 90 });

            // Créer l'objet photosphère
            const newPhotosphere: Photosphere = {
                id: crypto.randomUUID(),
                name: file.name,
                url: fileUrl,
                size: file.size,
                uploadDate: new Date()
            };

            // Optionnel : créer une entrée en DB
            await fetch("/api/photospheres", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPhotosphere),
            });

            // Ajouter à la liste
            onPhotosphereAdded(newPhotosphere);

            setUploadStatus({ 
                status: 'success', 
                message: `${file.name} uploadé avec succès !`,
                progress: 100 
            });

            // Reset après 3 secondes
            setTimeout(() => {
                setUploadStatus({ status: 'idle' });
            }, 3000);

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus({ 
                status: 'error', 
                message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'upload'
            });
            
            // Reset après 5 secondes
            setTimeout(() => {
                setUploadStatus({ status: 'idle' });
            }, 5000);
        }
    }, [onPhotosphereAdded]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ 
        onDrop,
        accept: { "image/*": ['.jpg', '.jpeg', '.png', '.webp'] },
        multiple: false,
        onDragEnter: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
        onDropAccepted: () => setDragActive(false),
        onDropRejected: () => setDragActive(false)
    });

    const getStatusIcon = () => {
        switch (uploadStatus.status) {
            case 'uploading':
                return <FaSpinner className="animate-spin text-blue-500" />;
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'error':
                return <FaExclamationTriangle className="text-red-500" />;
            default:
                return <FaCloudUploadAlt className={isDragActive ? "text-purple-500" : "text-gray-400"} />;
        }
    };

    const getDropzoneClasses = () => {
        const baseClasses = "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 min-h-[200px] flex flex-col items-center justify-center gap-4";
        
        if (uploadStatus.status === 'uploading') {
            return `${baseClasses} bg-blue-50 border-blue-300`;
        }
        
        if (uploadStatus.status === 'success') {
            return `${baseClasses} bg-green-50 border-green-300`;
        }
        
        if (uploadStatus.status === 'error') {
            return `${baseClasses} bg-red-50 border-red-300`;
        }
        
        if (isDragReject) {
            return `${baseClasses} bg-red-50 border-red-300`;
        }
        
        if (isDragActive || dragActive) {
            return `${baseClasses} bg-purple-50 border-purple-400 scale-105`;
        }
        
        return `${baseClasses} bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400`;
    };

    return (
        <PhotosphereCard
            title="Upload"
            icon={<FaCloudUploadAlt />}
        >
            <div
                {...getRootProps()}
                className={getDropzoneClasses()}
            >
                <input {...getInputProps()} />
                
                <div className="text-4xl">
                    {getStatusIcon()}
                </div>
                
                {uploadStatus.status === 'idle' && (
                    <>
                        <div className="text-lg font-semibold text-gray-700">
                            {isDragReject ? "Format de fichier non supporté" :
                             isDragActive ? "Relâchez pour uploader" : 
                             "Glissez-déposez votre photosphère ici"}
                        </div>
                        <div className="text-sm text-gray-500">
                            ou cliquez pour sélectionner un fichier
                        </div>
                        <div className="text-xs text-gray-400">
                            Formats supportés: JPG, PNG, WebP
                        </div>
                    </>
                )}
                
                {uploadStatus.status === 'uploading' && (
                    <>
                        <div className="text-lg font-semibold text-blue-700">
                            Upload en cours...
                        </div>
                        <div className="text-sm text-blue-600">
                            {uploadStatus.message}
                        </div>
                        {uploadStatus.progress !== undefined && (
                            <div className="w-full max-w-xs">
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadStatus.progress}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-center mt-1 text-blue-600">
                                    {uploadStatus.progress}%
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                {uploadStatus.status === 'success' && (
                    <>
                        <div className="text-lg font-semibold text-green-700">
                            Upload réussi !
                        </div>
                        <div className="text-sm text-green-600">
                            {uploadStatus.message}
                        </div>
                    </>
                )}
                
                {uploadStatus.status === 'error' && (
                    <>
                        <div className="text-lg font-semibold text-red-700">
                            Erreur d'upload
                        </div>
                        <div className="text-sm text-red-600">
                            {uploadStatus.message}
                        </div>
                        <div className="text-xs text-gray-500">
                            Cliquez pour réessayer
                        </div>
                    </>
                )}
            </div>
        </PhotosphereCard>
    )
}

export default PhotospherUpload