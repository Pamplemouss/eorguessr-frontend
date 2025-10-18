import * as THREE from 'three';
import imageCompression from 'browser-image-compression';
import { THUMBNAIL_ANGLES, QualityConfig } from '@/lib/types/PanoramaBatch';

/**
 * Generate thumbnails from a panorama file using Three.js
 */
export const generateThumbnailsFromPanorama = async (
	panoramaFile: File,
	thumbnailSize = { width: 400, height: 225 }
): Promise<Blob[]> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous'; // Enable cross-origin to avoid canvas tainting
		img.onload = () => {
			try {
				const thumbnails: Blob[] = [];
				const canvas = document.createElement('canvas');
				const renderer = new THREE.WebGLRenderer({ 
					canvas, 
					preserveDrawingBuffer: true,
					antialias: true,
					powerPreference: "high-performance"
				});

				renderer.setSize(thumbnailSize.width, thumbnailSize.height);
				renderer.setPixelRatio(1);
				// Ensure accurate color reproduction
				renderer.outputColorSpace = THREE.SRGBColorSpace;
				renderer.toneMapping = THREE.NoToneMapping; // Disable tone mapping
				renderer.toneMappingExposure = 1.0;

				// Create scene
				const scene = new THREE.Scene();
				const camera = new THREE.PerspectiveCamera(75, thumbnailSize.width / thumbnailSize.height, 0.1, 1000);

				// Create panorama sphere
				const geometry = new THREE.SphereGeometry(500, 60, 40);
				// Invert the geometry on the x-axis so the image maps correctly
				geometry.scale(-1, 1, 1);

				// Create texture from the image with proper color handling
				const canvas2d = document.createElement('canvas');
				const context = canvas2d.getContext('2d', { 
					colorSpace: 'srgb',
					willReadFrequently: false 
				});
				canvas2d.width = img.width;
				canvas2d.height = img.height;
				
				if (context) {
					// Disable image smoothing to preserve original pixel data
					context.imageSmoothingEnabled = false;
					context.drawImage(img, 0, 0);
				}

				const texture = new THREE.CanvasTexture(canvas2d);
				texture.needsUpdate = true;
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;
				// Set texture color space to match input
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.generateMipmaps = false; // Disable mipmaps to preserve quality

				const material = new THREE.MeshBasicMaterial({ 
					map: texture,
					toneMapped: false // Disable tone mapping to preserve original colors
				});
				const mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);

				// Generate thumbnails for each angle
				let processedCount = 0;

				THUMBNAIL_ANGLES.forEach((yawDegrees, index) => {
					// Convert degrees to radians
					const yawRadians = (yawDegrees * Math.PI) / 180;

					// Set camera position and rotation
					camera.position.set(0, 0, 0);
					camera.rotation.set(0, yawRadians, 0);

					// Render the scene
					renderer.render(scene, camera);

					// Capture the canvas as blob with PNG format for lossless quality
					canvas.toBlob((blob) => {
						if (blob) {
							thumbnails[index] = blob;
						}

						processedCount++;
						if (processedCount === THUMBNAIL_ANGLES.length) {
							// Clean up
							renderer.dispose();
							geometry.dispose();
							material.dispose();
							texture.dispose();

							resolve(thumbnails.filter(Boolean)); // Remove any null entries
						}
					}, 'image/png'); // Use PNG for lossless compression
				});

			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => reject(new Error('Failed to load panorama image'));
		img.src = URL.createObjectURL(panoramaFile);
	});
};

/**
 * Compress and resize panorama to different quality levels
 */
export const generateQualityVersions = async (
	originalFile: File,
	qualityConfigs: QualityConfig[]
): Promise<{ [key: string]: Blob }> => {
	const qualities: { [key: string]: Blob } = {};

	for (const config of qualityConfigs) {
		if (config.name === 'original') {
			// Keep original as-is
			qualities[config.name] = originalFile;
		} else {
			try {
				const options: any = {
					fileType: 'image/webp',
					useWebWorker: true,
				};

				if (config.maxWidth) {
					options.maxWidthOrHeight = config.maxWidth;
				}

				if (config.quality) {
					options.initialQuality = config.quality / 100;
				}

				const compressedFile = await imageCompression(originalFile, options);
				qualities[config.name] = compressedFile;
			} catch (error) {
				console.error(`Failed to compress to ${config.name}:`, error);
				// Fallback to original if compression fails
				qualities[config.name] = originalFile;
			}
		}
	}

	return qualities;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	if (bytes === 0) return '0 Bytes';
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generate unique panorama ID
 */
export const generatePanoramaId = (): string => {
	return crypto.randomUUID();
};