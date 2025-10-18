'use client';

import { useState, useCallback } from 'react';
import {
	PanoramaFile,
	BatchUploadSummary,
	UploadProgress,
	QUALITY_CONFIGS
} from '@/lib/types/PanoramaBatch';
import {
	generateThumbnailsFromPanorama,
	generateQualityVersions,
	generatePanoramaId,
	parseFilenameMetadata
} from '@/lib/utils/panoramaUtils';

interface UsePanoramaUploaderReturn {
	panoramaFiles: PanoramaFile[];
	batchSummary: BatchUploadSummary;
	uploadProgress: UploadProgress[];
	isProcessing: boolean;
	isUploading: boolean;

	// Actions
	addFiles: (files: File[]) => Promise<void>;
	removeFile: (fileId: string) => void;
	selectThumbnail: (fileId: string, thumbnailIndex: number) => void;
	generateQualities: (fileId: string) => Promise<void>;
	retryMapValidation: (fileId: string) => Promise<void>;
	retryDuplicateCheck: (fileId: string) => Promise<void>;
	uploadBatch: () => Promise<void>;
	reset: () => void;
}

export const usePanoramaUploader = (): UsePanoramaUploaderReturn => {
	const [panoramaFiles, setPanoramaFiles] = useState<PanoramaFile[]>([]);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Check for duplicate photosphere
	const checkDuplicate = useCallback(async (fileId: string, metadata: any, mapId: string) => {
		try {
			console.log('Starting duplicate check for file:', fileId, {
				coord: metadata.coord,
				weather: metadata.weather,
				time: metadata.time,
				mapId: mapId
			});

			const response = await fetch('/api/photospheres/check-duplicate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					coord: metadata.coord,
					weather: metadata.weather,
					time: metadata.time,
					mapId: mapId
				})
			});

			const result = await response.json();
			console.log('Duplicate check result:', result);

			setPanoramaFiles(prev => prev.map(pf =>
				pf.id === fileId
					? {
						...pf,
						duplicateCheck: {
							isChecking: false,
							isDuplicate: result.isDuplicate,
							existingPhotosphere: result.existingPhotosphere,
							message: result.message
						}
					}
					: pf
			));

			// If duplicate found, set the file status to error
			if (result.isDuplicate) {
				setPanoramaFiles(prev => prev.map(pf =>
					pf.id === fileId
						? {
							...pf,
							uploadStatus: 'error',
							error: `Doublon détecté: ${result.message}`,
							qualities: {} // Clear any existing qualities
						}
						: pf
				));
			}
		} catch (error) {
			console.error(`Duplicate check failed for file ${fileId}:`, error);
			setPanoramaFiles(prev => prev.map(pf =>
				pf.id === fileId
					? {
						...pf,
						duplicateCheck: {
							isChecking: false,
							isDuplicate: false,
							message: 'Erreur lors de la vérification des doublons'
						},
						uploadStatus: 'error',
						error: 'Erreur lors de la vérification des doublons'
					}
					: pf
			));
		}
	}, []);

	// Validate map for a specific panorama file
	const validateMap = useCallback(async (fileId: string, mapName: string) => {
		try {
			const response = await fetch('/api/maps/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mapName })
			});

			const result = await response.json();

			setPanoramaFiles(prev => prev.map(pf =>
				pf.id === fileId
					? {
						...pf,
						mapValidation: {
							isValidating: false,
							isValid: result.isValid,
							mapId: result.mapId,
							error: result.error
						}
					}
					: pf
			));

			// If map validation failed, set the file status to error and prevent quality generation
			if (!result.isValid) {
				setPanoramaFiles(prev => prev.map(pf =>
					pf.id === fileId
						? {
							...pf,
							uploadStatus: 'error',
							error: `Map validation failed: ${result.error}`,
							qualities: {} // Clear any existing qualities
						}
						: pf
				));
			} else {
				// Map validation successful, now check for duplicates
				// We need to get the current metadata and trigger duplicate check
				setPanoramaFiles(prev => {
					const panoramaFile = prev.find(pf => pf.id === fileId);
					if (panoramaFile?.metadata && result.mapId) {
						// Initialize duplicate check state
						const updatedFiles = prev.map(pf =>
							pf.id === fileId
								? { 
									...pf, 
									duplicateCheck: { 
										isChecking: true, 
										isDuplicate: false 
									} 
								}
								: pf
						);

						// Trigger duplicate check asynchronously
						setTimeout(() => {
							checkDuplicate(fileId, panoramaFile.metadata!, result.mapId);
						}, 0);
						
						return updatedFiles;
					}
					return prev;
				});
			}
		} catch (error) {
			console.error(`Map validation failed for file ${fileId}:`, error);
			setPanoramaFiles(prev => prev.map(pf =>
				pf.id === fileId
					? {
						...pf,
						mapValidation: {
							isValidating: false,
							isValid: false,
							error: 'Network error during map validation'
						},
						uploadStatus: 'error',
						error: 'Map validation failed due to network error'
					}
					: pf
			));
		}
	}, [panoramaFiles, checkDuplicate]);

	// Add new files to the batch
	const addFiles = useCallback(async (files: File[]) => {
		setIsProcessing(true);

		const newPanoramaFiles: PanoramaFile[] = [];

		for (const file of files) {
			// Extract metadata from filename
			const metadata = parseFilenameMetadata(file.name);
			
			const panoramaFile: PanoramaFile = {
				id: generatePanoramaId(),
				file,
				metadata,
				thumbnails: [],
				selectedThumbnailIndex: 0,
				qualities: {},
				uploadStatus: 'generating'
			};

			newPanoramaFiles.push(panoramaFile);
		}

		// Add files immediately so user sees them
		setPanoramaFiles(prev => [...prev, ...newPanoramaFiles]);

		// Generate thumbnails and validate maps for each file
		for (let i = 0; i < newPanoramaFiles.length; i++) {
			const panoramaFile = newPanoramaFiles[i];

			// Start both thumbnail generation and map validation in parallel
			try {
				// Initialize map validation state if metadata exists
				if (panoramaFile.metadata) {
					setPanoramaFiles(prev => prev.map(pf =>
						pf.id === panoramaFile.id
							? { 
								...pf, 
								mapValidation: { 
									isValidating: true, 
									isValid: false 
								} 
							}
							: pf
					));

					// Validate map in parallel
					validateMap(panoramaFile.id, panoramaFile.metadata.map);
				}

				const thumbnails = await generateThumbnailsFromPanorama(panoramaFile.file);

				setPanoramaFiles(prev => prev.map(pf =>
					pf.id === panoramaFile.id
						? { ...pf, thumbnails, uploadStatus: 'ready' }
						: pf
				));
			} catch (error) {
				console.error(`Failed to generate thumbnails for ${panoramaFile.file.name}:`, error);
				setPanoramaFiles(prev => prev.map(pf =>
					pf.id === panoramaFile.id
						? { ...pf, uploadStatus: 'error', error: 'Thumbnail generation failed' }
						: pf
				));
			}
		}

		setIsProcessing(false);
	}, []);

	// Remove a file from the batch
	const removeFile = useCallback((fileId: string) => {
		setPanoramaFiles(prev => prev.filter(pf => pf.id !== fileId));
		setUploadProgress(prev => prev.filter(up => up.fileId !== fileId));
	}, []);

	// Select a thumbnail for a panorama
	const selectThumbnail = useCallback((fileId: string, thumbnailIndex: number) => {
		setPanoramaFiles(prev => prev.map(pf =>
			pf.id === fileId
				? { ...pf, selectedThumbnailIndex: thumbnailIndex }
				: pf
		));
	}, []);

	// Generate quality versions for a specific file
	const generateQualities = useCallback(async (fileId: string) => {
		const panoramaFile = panoramaFiles.find(pf => pf.id === fileId);
		if (!panoramaFile) return;

		setPanoramaFiles(prev => prev.map(pf =>
			pf.id === fileId
				? { ...pf, uploadStatus: 'generating' }
				: pf
		));

		try {
			const qualities = await generateQualityVersions(panoramaFile.file, QUALITY_CONFIGS);

			setPanoramaFiles(prev => prev.map(pf =>
				pf.id === fileId
					? { ...pf, qualities, uploadStatus: 'ready' }
					: pf
			));
		} catch (error) {
			console.error(`Failed to generate qualities for ${panoramaFile.file.name}:`, error);
			setPanoramaFiles(prev => prev.map(pf =>
				pf.id === fileId
					? { ...pf, uploadStatus: 'error', error: 'Quality generation failed' }
					: pf
			));
		}
	}, [panoramaFiles]);

	// Upload a single file with all its variants
	const uploadSingleFile = useCallback(async (panoramaFile: PanoramaFile) => {
		const panoId = panoramaFile.id;
		const baseKey = `photospheres/${panoId}`;

		// Files to upload: thumbnail + all quality versions + metadata
		const filesToUpload: { key: string; blob: Blob; type: string }[] = [];

		// Add thumbnail
		if (panoramaFile.thumbnails[panoramaFile.selectedThumbnailIndex]) {
			filesToUpload.push({
				key: `${baseKey}/thumbnail.webp`,
				blob: panoramaFile.thumbnails[panoramaFile.selectedThumbnailIndex],
				type: 'thumbnail'
			});
		}

		// Add quality versions
		QUALITY_CONFIGS.forEach(config => {
			const blob = panoramaFile.qualities[config.name];
			if (blob) {
				// Special handling for panorama_thumbnail to avoid double "panorama_" prefix
				const fileName = config.name === 'panorama_thumbnail' 
					? `panorama_thumbnail.webp`
					: `panorama_${config.suffix}.webp`;
				
				filesToUpload.push({
					key: `${baseKey}/${fileName}`,
					blob,
					type: config.name
				});
			}
		});

		// Add metadata.json if metadata exists
		if (panoramaFile.metadata) {
			// Add uploadedAt field with current date in dd/mm/yyyy format
			const currentDate = new Date();
			const uploadedAt = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
			
			const metadataWithUploadDate = {
				...panoramaFile.metadata,
				uploadedAt
			};
			
			const metadataJson = JSON.stringify(metadataWithUploadDate, null, 2);
			const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
			filesToUpload.push({
				key: `${baseKey}/metadata.json`,
				blob: metadataBlob,
				type: 'metadata'
			});
		}

		// Initialize progress tracking
		const progressEntries: UploadProgress[] = filesToUpload.map(({ type }) => ({
			fileId: panoramaFile.id,
			fileName: panoramaFile.file.name,
			type: type as any,
			status: 'pending',
			progress: 0
		}));

		setUploadProgress(prev => [...prev, ...progressEntries]);

		// Upload each file
		for (let i = 0; i < filesToUpload.length; i++) {
			const { key, blob, type } = filesToUpload[i];

			try {
				// Update status to uploading
				setUploadProgress(prev => prev.map(up =>
					up.fileId === panoramaFile.id && up.type === type
						? { ...up, status: 'uploading' }
						: up
				));

				// Get signed URL
				const res = await fetch('/api/upload-url', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						fileName: key.split('/').pop(),
						fileType: blob.type || (type === 'metadata' ? 'application/json' : 'image/webp'),
						customKey: key
					})
				});

				if (!res.ok) {
					throw new Error(`Failed to get upload URL for ${key}`);
				}

				const { uploadUrl } = await res.json();

				// Upload to S3
				const uploadRes = await fetch(uploadUrl, {
					method: 'PUT',
					headers: { 'Content-Type': blob.type || (type === 'metadata' ? 'application/json' : 'image/webp') },
					body: blob
				});

				if (!uploadRes.ok) {
					throw new Error(`Failed to upload ${key}`);
				}

				// Update progress to completed
				setUploadProgress(prev => prev.map(up =>
					up.fileId === panoramaFile.id && up.type === type
						? { ...up, status: 'completed', progress: 100 }
						: up
				));

			} catch (error) {
				console.error(`Upload failed for ${key}:`, error);
				setUploadProgress(prev => prev.map(up =>
					up.fileId === panoramaFile.id && up.type === type
						? { ...up, status: 'error', progress: 0 }
						: up
				));
				// If any upload fails, throw to stop the entire file upload
				throw error;
			}
		}

		// After all files are successfully uploaded to S3, create MongoDB entry
		if (panoramaFile.metadata && panoramaFile.mapValidation?.isValid && panoramaFile.mapValidation.mapId) {
			try {
				// Add MongoDB progress entry
				setUploadProgress(prev => [...prev, {
					fileId: panoramaFile.id,
					fileName: panoramaFile.file.name,
					type: 'mongodb',
					status: 'uploading',
					progress: 0
				}]);

				// Add a small delay so users can see the MongoDB step
				await new Promise(resolve => setTimeout(resolve, 1500));

				const createRes = await fetch('/api/photospheres/create-direct', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: panoramaFile.id,
						coord: panoramaFile.metadata.coord,
						weather: panoramaFile.metadata.weather,
						time: panoramaFile.metadata.time,
						mapId: panoramaFile.mapValidation.mapId
					})
				});

				if (!createRes.ok) {
					const errorData = await createRes.json();
					throw new Error(`Failed to create MongoDB entry: ${errorData.error}`);
				}

				// Mark MongoDB creation as completed
				setUploadProgress(prev => prev.map(up =>
					up.fileId === panoramaFile.id && up.type === 'mongodb'
						? { ...up, status: 'completed', progress: 100 }
						: up
				));

				console.log(`Successfully created MongoDB entry for photosphere ${panoramaFile.id}`);
			} catch (error) {
				console.error(`MongoDB creation failed for ${panoramaFile.id}:`, error);
				
				// Clean up S3 files since MongoDB creation failed
				try {
					console.log(`Cleaning up S3 files for failed photosphere ${panoramaFile.id}`);
					const cleanupRes = await fetch('/api/photospheres/cleanup', {
						method: 'DELETE',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ photosphereId: panoramaFile.id })
					});

					if (cleanupRes.ok) {
						console.log(`Successfully cleaned up S3 files for ${panoramaFile.id}`);
					} else {
						console.warn(`Failed to cleanup S3 files for ${panoramaFile.id}`);
					}
				} catch (cleanupError) {
					console.error(`Error during S3 cleanup for ${panoramaFile.id}:`, cleanupError);
				}

				// Update existing MongoDB progress entry to error state
				setUploadProgress(prev => prev.map(up =>
					up.fileId === panoramaFile.id && up.type === 'mongodb'
						? { ...up, status: 'error', progress: 0 }
						: up
				));

				// Throw to stop processing this file
				throw new Error(`MongoDB creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		}
	}, []);

	// Upload the entire batch
	const uploadBatch = useCallback(async () => {
		setIsUploading(true);

		const readyFiles = panoramaFiles.filter(pf => {
			// Basic readiness checks
			if (pf.uploadStatus !== 'ready' || pf.thumbnails.length === 0 || Object.keys(pf.qualities).length === 0) {
				return false;
			}

			// If file has metadata, ensure map validation and duplicate check passed
			if (pf.metadata && pf.mapValidation) {
				// Map validation must pass
				if (!pf.mapValidation.isValid || pf.mapValidation.isValidating) {
					return false;
				}

				// If duplicate check was performed, it must pass (no duplicates found)
				if (pf.duplicateCheck) {
					if (pf.duplicateCheck.isChecking) {
						return false; // Still checking
					}
					if (pf.duplicateCheck.isDuplicate) {
						return false; // Duplicate found
					}
				} else {
					// No duplicate check performed yet - not ready
					return false;
				}

				return true;
			}

			// Files without metadata are ready (though they won't create MongoDB entries)
			return true;
		});

		// Mark files as uploading
		setPanoramaFiles(prev => prev.map(pf =>
			readyFiles.some(rf => rf.id === pf.id)
				? { ...pf, uploadStatus: 'uploading' }
				: pf
		));

		// Upload files one by one (could be parallelized for better performance)
		for (const panoramaFile of readyFiles) {
			try {
				await uploadSingleFile(panoramaFile);

				// Mark as completed
				setPanoramaFiles(prev => prev.map(pf =>
					pf.id === panoramaFile.id
						? { ...pf, uploadStatus: 'completed' }
						: pf
				));
			} catch (error) {
				console.error(`Upload failed for file ${panoramaFile.file.name}:`, error);
				
				// Mark this file as failed but continue with others
				setPanoramaFiles(prev => prev.map(pf =>
					pf.id === panoramaFile.id
						? { 
							...pf, 
							uploadStatus: 'error', 
							error: error instanceof Error ? error.message : 'Upload failed'
						}
						: pf
				));
			}
		}

		setIsUploading(false);
	}, [panoramaFiles, uploadSingleFile]);

	// Retry map validation for a specific file
	const retryMapValidation = useCallback(async (fileId: string) => {
		const panoramaFile = panoramaFiles.find(pf => pf.id === fileId);
		if (!panoramaFile?.metadata) return;

		// Reset validation state and file error
		setPanoramaFiles(prev => prev.map(pf =>
			pf.id === fileId
				? {
					...pf,
					mapValidation: { isValidating: true, isValid: false },
					duplicateCheck: undefined, // Clear previous duplicate check
					uploadStatus: 'ready', // Reset from error state
					error: undefined,
					qualities: {} // Clear qualities so they can be regenerated if validation passes
				}
				: pf
		));

		await validateMap(fileId, panoramaFile.metadata.map);
	}, [panoramaFiles, validateMap]);

	// Retry duplicate check for a specific file
	const retryDuplicateCheck = useCallback(async (fileId: string) => {
		const panoramaFile = panoramaFiles.find(pf => pf.id === fileId);
		if (!panoramaFile?.metadata || !panoramaFile.mapValidation?.mapId) return;

		// Reset duplicate check state
		setPanoramaFiles(prev => prev.map(pf =>
			pf.id === fileId
				? {
					...pf,
					duplicateCheck: { isChecking: true, isDuplicate: false },
					uploadStatus: 'ready', // Reset from error state
					error: undefined
				}
				: pf
		));

		await checkDuplicate(fileId, panoramaFile.metadata, panoramaFile.mapValidation.mapId);
	}, [panoramaFiles, checkDuplicate]);

	// Reset the entire state
	const reset = useCallback(() => {
		setPanoramaFiles([]);
		setUploadProgress([]);
		setIsProcessing(false);
		setIsUploading(false);
	}, []);

	// Calculate batch summary
	const batchSummary: BatchUploadSummary = {
		totalFiles: panoramaFiles.length,
		totalSize: panoramaFiles.reduce((sum, pf) => sum + pf.file.size, 0),
		estimatedCompressedSize: panoramaFiles.reduce((sum, pf) => {
			// Total estimated size for all quality variants of this file is 123% of original
			return sum + Math.round(pf.file.size * 1.23);
		}, 0),
		readyFiles: panoramaFiles.filter(pf => {
			// Check if file is ready and has thumbnails
			if (pf.uploadStatus !== 'ready' || pf.thumbnails.length === 0) {
				return false;
			}
			
			// Check if all expected quality variants are generated
			const expectedQualities = QUALITY_CONFIGS.length;
			const actualQualities = Object.keys(pf.qualities).length;
			
			if (actualQualities !== expectedQualities) {
				return false;
			}

			// Check if map validation and duplicate check passed (if metadata exists)
			if (pf.metadata && pf.mapValidation) {
				// Map validation must pass
				if (!pf.mapValidation.isValid || pf.mapValidation.isValidating) {
					return false;
				}

				// Duplicate check must also pass (no duplicates found)
				if (pf.duplicateCheck) {
					if (pf.duplicateCheck.isChecking) {
						return false; // Still checking
					}
					if (pf.duplicateCheck.isDuplicate) {
						return false; // Duplicate found
					}
				} else {
					// No duplicate check performed yet - not ready
					return false;
				}

				return true;
			}

			// If no metadata, file is ready
			return true;
		}).length
	};

	return {
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
		retryDuplicateCheck,
		uploadBatch,
		reset
	};
};