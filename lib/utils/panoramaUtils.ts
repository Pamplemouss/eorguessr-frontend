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

/**
 * Panorama metadata extracted from filename
 */
export interface PanoramaMetadata {
	map: string;
	weather: string;
	coord: {
		x: number;
		y: number;
		z: number;
	};
	time: string;
	uploadedAt?: string; // Optional since it's added during upload, not parsing
}

/**
 * Parse filename to extract panorama metadata
 * Expected format: ZoneName_Weather_X_Y_Z_IngameTime.webp
 * Example: "New Gridania_Fair Skies_9.11_11.68_0.00_1457.webp"
 */
export const parseFilenameMetadata = (filename: string): PanoramaMetadata | null => {
	try {
		// Remove file extension
		const nameWithoutExt = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '');
		
		// Split by underscore to get parts
		const parts = nameWithoutExt.split('_');
		
		// We need at least 6 parts: ZoneName, Weather, X, Y, Z, IngameTime
		if (parts.length < 6) {
			console.warn(`Filename "${filename}" does not match expected format: ZoneName_Weather_X_Y_Z_IngameTime`);
			return null;
		}
		
		// Extract the last 4 parts which are always X, Y, Z, IngameTime
		const time = parseFloat(parts[parts.length - 1]);
		const z = parseFloat(parts[parts.length - 2]);
		const y = parseFloat(parts[parts.length - 3]);
		const x = parseFloat(parts[parts.length - 4]);
		
		// Validate that coordinates and time are valid numbers
		if (isNaN(x) || isNaN(y) || isNaN(z) || isNaN(time)) {
			console.warn(`Filename "${filename}" contains invalid coordinate or time values`);
			return null;
		}
		
		// Everything before the last 4 parts contains zone name and weather
		const nameAndWeatherParts = parts.slice(0, -4);
		
		if (nameAndWeatherParts.length < 2) {
			console.warn(`Filename "${filename}" does not contain both zone name and weather`);
			return null;
		}
		
		// Simple approach: assume the last part before coordinates is weather
		// and everything before that is zone name
		const weather = nameAndWeatherParts[nameAndWeatherParts.length - 1];
		const map = nameAndWeatherParts.slice(0, -1).join(' ');
		
		return {
			map: map.trim(),
			weather: weather.trim(),
			coord: {
				x,
				y,
				z
			},
			time: time.toString().padStart(4, '0') // Convert to string and pad with zeros
		};
		
	} catch (error) {
		console.error(`Error parsing filename "${filename}":`, error);
		return null;
	}
};