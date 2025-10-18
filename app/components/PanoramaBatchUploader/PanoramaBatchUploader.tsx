'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
	FaCloudUploadAlt,
	FaImages,
	FaCheckCircle,
	FaSpinner,
	FaExclamationTriangle,
	FaTimes,
	FaEye,
	FaUpload,
	FaTrash,
	FaDatabase
} from 'react-icons/fa';
import { usePanoramaUploader } from '@/app/hooks/usePanoramaUploader';
import ThumbnailSelector from '@/app/components/PanoramaBatchUploader/ThumbnailSelector';
import BatchSummary from '@/app/components/PanoramaBatchUploader/BatchSummary';
import UploadProgress from '@/app/components/PanoramaBatchUploader/UploadProgress';
import { formatFileSize } from '@/lib/utils/panoramaUtils';
import { QUALITY_CONFIGS } from '@/lib/types/PanoramaBatch';

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
		retryMapValidation,
		uploadBatch,
		reset
	} = usePanoramaUploader();

	const [currentStep, setCurrentStep] = useState<Step>('selection');

	// Auto-generate qualities when entering summary step (only for files with valid maps)
	useEffect(() => {
		if (currentStep === 'summary') {
			panoramaFiles.forEach(pf => {
				// Only generate qualities if:
				// 1. No qualities exist yet
				// 2. File is ready
				// 3. Either no metadata OR map validation passed
				const shouldGenerateQualities = Object.keys(pf.qualities).length === 0 && 
					pf.uploadStatus === 'ready' &&
					(!pf.metadata || (pf.mapValidation?.isValid && !pf.mapValidation.isValidating));

				if (shouldGenerateQualities) {
					generateQualities(pf.id);
				}
			});
		}
	}, [currentStep, panoramaFiles, generateQualities]);

	// Call onComplete when reaching completed step
	useEffect(() => {
		if (currentStep === 'completed' && onComplete) {
			const uploadedFiles = panoramaFiles.map(pf => pf.id);
			onComplete(uploadedFiles);
		}
	}, [currentStep, onComplete, panoramaFiles]);

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

	// Check if all files are ready for upload (including map validation)
	const allFilesReady = panoramaFiles.length > 0 &&
		panoramaFiles.every(pf => {
			const basicReady = pf.uploadStatus === 'ready' && pf.thumbnails.length > 0;
			
			// If file has metadata, map validation must also pass
			if (pf.metadata && pf.mapValidation) {
				return basicReady && pf.mapValidation.isValid && !pf.mapValidation.isValidating;
			}
			
			// Files without metadata are ready if basic conditions are met
			return basicReady;
		});

	// Check if all qualities are generated for upload step
	const allQualitiesReady = panoramaFiles.length > 0 &&
		panoramaFiles.every(pf =>
			pf.uploadStatus === 'ready' &&
			pf.thumbnails.length > 0 &&
			Object.keys(pf.qualities).length === QUALITY_CONFIGS.length // All quality configs
		);

	const handleNextStep = () => {
		if (currentStep === 'thumbnails' && allFilesReady) {
			setCurrentStep('summary');
		} else if (currentStep === 'summary' && allQualitiesReady) {
			setCurrentStep('uploading');
			uploadBatch().then(() => {
				setCurrentStep('completed');
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
			case 'uploading': return 'Upload et sauvegarde en cours';
			case 'completed': return 'Processus terminé';
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
								currentStep === 'thumbnails' ? 20 :
									currentStep === 'summary' ? 40 :
										currentStep === 'uploading' ? 80 :
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
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1 mr-4">
									<h3 className="text-lg font-semibold text-gray-800">
										{panoramaFile.file.name}
									</h3>
									<p className="text-sm text-gray-500">
										{formatFileSize(panoramaFile.file.size)}
									</p>
								</div>

								<div className="flex items-center gap-3 flex-shrink-0">
									{panoramaFile.uploadStatus === 'generating' && (
										<div className="flex items-center gap-2 text-blue-600">
											<FaSpinner className="animate-spin" />
											<span className="text-sm">Génération...</span>
										</div>
									)}

									{panoramaFile.uploadStatus === 'ready' && (
										<div className="flex items-center gap-2">
											{/* Show different status based on map validation */}
											{panoramaFile.metadata && panoramaFile.mapValidation?.isValidating ? (
												<>
													<FaSpinner className="animate-spin text-blue-600" />
													<span className="text-sm text-blue-600">Validation carte...</span>
												</>
											) : panoramaFile.metadata && panoramaFile.mapValidation?.isValid === false ? (
												<>
													<FaExclamationTriangle className="text-red-600" />
													<span className="text-sm text-red-600">Carte invalide</span>
												</>
											) : (
												<>
													<FaCheckCircle className="text-green-600" />
													<span className="text-sm text-green-600">Prêt</span>
												</>
											)}
										</div>
									)}

									{panoramaFile.uploadStatus === 'error' && (
										<div className="flex items-center gap-2 text-red-600">
											<FaExclamationTriangle />
											<span className="text-sm">Erreur</span>
										</div>
									)}

									<button
										onClick={() => {
											const fileName = panoramaFile.file.name.length > 30 
												? panoramaFile.file.name.substring(0, 30) + '...'
												: panoramaFile.file.name;
											if (confirm(`Êtes-vous sûr de vouloir supprimer "${fileName}" du lot d'upload ?`)) {
												removeFile(panoramaFile.id);
											}
										}}
										className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 hover:shadow-sm hover:scale-105 active:scale-95"
										title="Supprimer ce fichier du lot d'upload"
									>
										<FaTrash className="text-xs group-hover:scale-110 transition-transform duration-200" />
										<span className="hidden sm:inline">Supprimer</span>
										<span className="inline sm:hidden">✕</span>
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
									<div className="flex items-center justify-between">
										<p className="text-red-700 flex-1">
											{panoramaFile.error || 'Une erreur est survenue lors du traitement de ce fichier.'}
										</p>
										{/* Show retry button if it's a map validation error */}
										{panoramaFile.metadata && panoramaFile.mapValidation && !panoramaFile.mapValidation.isValid && (
											<button
												onClick={() => retryMapValidation(panoramaFile.id)}
												className="ml-3 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors"
											>
												Réessayer
											</button>
										)}
									</div>
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
						onRetryMapValidation={retryMapValidation}
					/>

					<div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 mt-6">
						<button
							onClick={() => setCurrentStep('thumbnails')}
							className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
						>
							Retour
						</button>

						<div className="flex flex-col items-end gap-2">
							{!allQualitiesReady && (
								<div className="text-sm text-amber-600">
									⏳ Génération des qualités en cours...
								</div>
							)}
							<button
								onClick={handleNextStep}
								disabled={!allQualitiesReady}
								className={`
									px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
									${allQualitiesReady
										? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg'
										: 'bg-gray-300 text-gray-500 cursor-not-allowed'
									}
								`}
							>
								<FaUpload />
								{allQualitiesReady ? 'Commencer l\'upload' : 'Préparation en cours...'}
							</button>
						</div>
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



			{/* Step 6: Final Completed */}
			{currentStep === 'completed' && (
				<div className="bg-white rounded-lg shadow-md p-8 text-center">
					<div className="text-4xl text-blue-500 mb-4">
						🚀
					</div>

					<h2 className="text-xl font-bold text-gray-800 mb-4">
						Processus terminé !
					</h2>

					<p className="text-gray-600 mb-6">
						Vous pouvez maintenant uploader d'autres photosphères ou retourner à l'administration.
					</p>

					<button
						onClick={handleReset}
						className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
					>
						Uploader d'autres photosphères
					</button>
				</div>
			)}
		</div>
	);
};

export default PanoramaBatchUploader;