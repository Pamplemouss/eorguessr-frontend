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
	generatePanoramaId
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
	uploadBatch: () => Promise<void>;
	reset: () => void;
}

export const usePanoramaUploader = (): UsePanoramaUploaderReturn => {
	const [panoramaFiles, setPanoramaFiles] = useState<PanoramaFile[]>([]);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	// Add new files to the batch
	const addFiles = useCallback(async (files: File[]) => {
		setIsProcessing(true);

		const newPanoramaFiles: PanoramaFile[] = [];

		for (const file of files) {
			const panoramaFile: PanoramaFile = {
				id: generatePanoramaId(),
				file,
				thumbnails: [],
				selectedThumbnailIndex: 0,
				qualities: {},
				uploadStatus: 'generating'
			};

			newPanoramaFiles.push(panoramaFile);
		}

		// Add files immediately so user sees them
		setPanoramaFiles(prev => [...prev, ...newPanoramaFiles]);

		// Generate thumbnails for each file
		for (let i = 0; i < newPanoramaFiles.length; i++) {
			const panoramaFile = newPanoramaFiles[i];

			try {
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

		// Files to upload: thumbnail + all quality versions
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
						fileType: blob.type || 'image/webp',
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
					headers: { 'Content-Type': blob.type || 'image/webp' },
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
			}
		}
	}, []);

	// Upload the entire batch
	const uploadBatch = useCallback(async () => {
		setIsUploading(true);

		const readyFiles = panoramaFiles.filter(pf =>
			pf.uploadStatus === 'ready' &&
			pf.thumbnails.length > 0 &&
			Object.keys(pf.qualities).length > 0
		);

		// Mark files as uploading
		setPanoramaFiles(prev => prev.map(pf =>
			readyFiles.some(rf => rf.id === pf.id)
				? { ...pf, uploadStatus: 'uploading' }
				: pf
		));

		// Upload files one by one (could be parallelized for better performance)
		for (const panoramaFile of readyFiles) {
			await uploadSingleFile(panoramaFile);

			// Mark as completed
			setPanoramaFiles(prev => prev.map(pf =>
				pf.id === panoramaFile.id
					? { ...pf, uploadStatus: 'completed' }
					: pf
			));
		}

		setIsUploading(false);
	}, [panoramaFiles, uploadSingleFile]);

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
			// Total estimated size for all quality variants of this file is 120% of original
			return sum + Math.round(pf.file.size * 1.2);
		}, 0),
		readyFiles: panoramaFiles.filter(pf => {
			// Check if file is ready and has thumbnails
			if (pf.uploadStatus !== 'ready' || pf.thumbnails.length === 0) {
				return false;
			}
			
			// Check if all expected quality variants are generated
			const expectedQualities = QUALITY_CONFIGS.length;
			const actualQualities = Object.keys(pf.qualities).length;
			
			return actualQualities === expectedQualities;
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
		uploadBatch,
		reset
	};
};