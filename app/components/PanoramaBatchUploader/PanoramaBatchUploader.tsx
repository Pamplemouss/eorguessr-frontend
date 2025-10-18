'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
	FaCloudUploadAlt,
	FaImages,
	FaCheckCircle,
	FaSpinner,
	FaExclamationTriangle,
	FaTimes,
	FaEye,
	FaUpload
} from 'react-icons/fa';
import { usePanoramaUploader } from '@/app/hooks/usePanoramaUploader';
import ThumbnailSelector from '@/app/components/PanoramaBatchUploader/ThumbnailSelector';
import BatchSummary from '@/app/components/PanoramaBatchUploader/BatchSummary';
import UploadProgress from '@/app/components/PanoramaBatchUploader/UploadProgress';
import { formatFileSize } from '@/lib/utils/panoramaUtils';

type Step = 'selection' | 'thumbnails' | 'summary' | 'uploading' | 'completed';

interface PanoramaBatchUploaderProps {
	onComplete?: (uploadedFiles: string[]) => void;
}

const PanoramaBatchUploader: React.FC<PanoramaBatchUploaderProps> = ({ onComplete }) => {
	const {
		panoramaFiles,
		batchSummary,
		uploadProgress,
		isProcessing,
		isUploading,
		addFiles,
		removeFile,
		selectThumbnail,
		generateQualities,
		uploadBatch,
		reset
	} = usePanoramaUploader();

	const [currentStep, setCurrentStep] = useState<Step>('selection');

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: async (acceptedFiles) => {
			await addFiles(acceptedFiles);
			if (acceptedFiles.length > 0) {
				setCurrentStep('thumbnails');
			}
		},
		accept: { 'image/*': ['.webp'] },
		multiple: true
	});

	// Check if all files are ready for upload
	const allFilesReady = panoramaFiles.length > 0 &&
		panoramaFiles.every(pf =>
			pf.uploadStatus === 'ready' &&
			pf.thumbnails.length > 0
		);

	const handleNextStep = () => {
		if (currentStep === 'thumbnails' && allFilesReady) {
			// Generate qualities for all files
			panoramaFiles.forEach(pf => {
				if (Object.keys(pf.qualities).length === 0) {
					generateQualities(pf.id);
				}
			});
			setCurrentStep('summary');
		} else if (currentStep === 'summary') {
			setCurrentStep('uploading');
			uploadBatch().then(() => {
				setCurrentStep('completed');
				if (onComplete) {
					const uploadedFiles = panoramaFiles.map(pf => pf.id);
					onComplete(uploadedFiles);
				}
			});
		}
	};

	const handleReset = () => {
		reset();
		setCurrentStep('selection');
	};

	const getStepTitle = () => {
		switch (currentStep) {
			case 'selection': return 'Sélection des fichiers';
			case 'thumbnails': return 'Sélection des miniatures';
			case 'summary': return 'Résumé du lot';
			case 'uploading': return 'Upload en cours';
			case 'completed': return 'Upload terminé';
			default: return '';
		}
	};

	const getStepIcon = () => {
		switch (currentStep) {
			case 'selection': return <FaCloudUploadAlt />;
			case 'thumbnails': return <FaImages />;
			case 'summary': return <FaEye />;
			case 'uploading': return <FaSpinner className="animate-spin" />;
			case 'completed': return <FaCheckCircle />;
			default: return null;
		}
	};

	return (
		<div className="w-full max-w-7xl mx-auto">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<div className="flex items-center gap-3 mb-4">
					{getStepIcon()}
					<h1 className="text-2xl font-bold text-gray-800">{getStepTitle()}</h1>
				</div>

				{/* Progress bar */}
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="bg-blue-500 h-2 rounded-full transition-all duration-300"
						style={{
							width: `${currentStep === 'selection' ? 0 :
								currentStep === 'thumbnails' ? 25 :
									currentStep === 'summary' ? 50 :
										currentStep === 'uploading' ? 75 :
											100
								}%`
						}}
					/>
				</div>
			</div>

			{/* Step 1: File Selection */}
			{currentStep === 'selection' && (
				<div className="bg-white rounded-lg shadow-md p-8">
					<div
						{...getRootProps()}
						className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
              ${isDragActive
								? 'border-blue-400 bg-blue-50 scale-105'
								: 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
							}
            `}
					>
						<input {...getInputProps()} />

						<div className="text-6xl text-gray-400 mb-6">
							<FaCloudUploadAlt className="mx-auto" />
						</div>

						<div className="text-2xl font-semibold text-gray-700 mb-4">
							{isDragActive
								? "Relâchez pour ajouter les panoramas"
								: "Glissez-déposez vos panoramas ici"
							}
						</div>

						<div className="text-gray-500 mb-4">
							ou cliquez pour sélectionner plusieurs fichiers
						</div>

						<div className="text-sm text-gray-400">
							Formats supportés: WebP uniquement • Upload multiple autorisé
						</div>
					</div>

					{/* Show processing state */}
					{isProcessing && (
						<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-center gap-3">
								<FaSpinner className="animate-spin text-blue-500" />
								<span className="text-blue-700">Génération des miniatures en cours...</span>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Step 2: Thumbnail Selection */}
			{currentStep === 'thumbnails' && (
				<div className="space-y-6">
					{panoramaFiles.map((panoramaFile) => (
						<div key={panoramaFile.id} className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h3 className="text-lg font-semibold text-gray-800">
										{panoramaFile.file.name}
									</h3>
									<p className="text-sm text-gray-500">
										{formatFileSize(panoramaFile.file.size)}
									</p>
								</div>

								<div className="flex items-center gap-2">
									{panoramaFile.uploadStatus === 'generating' && (
										<div className="flex items-center gap-2 text-blue-600">
											<FaSpinner className="animate-spin" />
											<span className="text-sm">Génération...</span>
										</div>
									)}

									{panoramaFile.uploadStatus === 'ready' && (
										<div className="flex items-center gap-2 text-green-600">
											<FaCheckCircle />
											<span className="text-sm">Prêt</span>
										</div>
									)}

									{panoramaFile.uploadStatus === 'error' && (
										<div className="flex items-center gap-2 text-red-600">
											<FaExclamationTriangle />
											<span className="text-sm">Erreur</span>
										</div>
									)}

									<button
										onClick={() => removeFile(panoramaFile.id)}
										className="text-red-500 hover:text-red-700 p-1"
									>
										<FaTimes />
									</button>
								</div>
							</div>

							{panoramaFile.uploadStatus === 'ready' && (
								<ThumbnailSelector
									thumbnails={panoramaFile.thumbnails}
									selectedIndex={panoramaFile.selectedThumbnailIndex}
									onSelect={(index: number) => selectThumbnail(panoramaFile.id, index)}
								/>
							)}

							{panoramaFile.uploadStatus === 'error' && (
								<div className="bg-red-50 border border-red-200 rounded p-4">
									<p className="text-red-700">
										{panoramaFile.error || 'Une erreur est survenue lors du traitement de ce fichier.'}
									</p>
								</div>
							)}
						</div>
					))}

					{/* Navigation */}
					<div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
						<button
							onClick={handleReset}
							className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
						>
							Recommencer
						</button>

						<button
							onClick={handleNextStep}
							disabled={!allFilesReady}
							className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200
                ${allFilesReady
									? 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
								}
              `}
						>
							Continuer
						</button>
					</div>
				</div>
			)}

			{/* Step 3: Batch Summary */}
			{currentStep === 'summary' && (
				<div>
					<BatchSummary
						panoramaFiles={panoramaFiles}
						batchSummary={batchSummary}
					/>

					<div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 mt-6">
						<button
							onClick={() => setCurrentStep('thumbnails')}
							className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
						>
							Retour
						</button>

						<button
							onClick={handleNextStep}
							className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2"
						>
							<FaUpload />
							Commencer l'upload
						</button>
					</div>
				</div>
			)}

			{/* Step 4: Upload Progress */}
			{currentStep === 'uploading' && (
				<div>
					<UploadProgress
						panoramaFiles={panoramaFiles}
						uploadProgress={uploadProgress}
					/>
				</div>
			)}

			{/* Step 5: Completed */}
			{currentStep === 'completed' && (
				<div className="bg-white rounded-lg shadow-md p-8 text-center">
					<div className="text-6xl text-green-500 mb-6">
						<FaCheckCircle className="mx-auto" />
					</div>

					<h2 className="text-2xl font-bold text-gray-800 mb-4">
						Upload terminé avec succès !
					</h2>

					<p className="text-gray-600 mb-6">
						{panoramaFiles.length} panorama(s) ont été uploadés avec leurs miniatures et variantes de qualité.
					</p>

					<button
						onClick={handleReset}
						className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
					>
						Uploader d'autres panoramas
					</button>
				</div>
			)}
		</div>
	);
};

export default PanoramaBatchUploader;