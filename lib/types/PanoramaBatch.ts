export interface PanoramaFile {
  id: string;
  file: File;
  thumbnails: Blob[];
  selectedThumbnailIndex: number;
  qualities: {
    panorama_thumbnail?: Blob;
    light?: Blob;
    medium?: Blob;
    heavy?: Blob;
    original?: Blob;
  };
  uploadStatus: 'pending' | 'generating' | 'ready' | 'uploading' | 'completed' | 'error';
  uploadProgress?: number;
  error?: string;
}

export interface QualityConfig {
  name: 'panorama_thumbnail' | 'light' | 'medium' | 'heavy' | 'original';
  maxWidth?: number;
  quality?: number;
  suffix: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  type: 'thumbnail' | 'panorama_thumbnail' | 'light' | 'medium' | 'heavy' | 'original';
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
}

export interface BatchUploadSummary {
  totalFiles: number;
  totalSize: number;
  estimatedCompressedSize: number;
  readyFiles: number;
}

// Camera angles for thumbnail generation (in degrees)
export const THUMBNAIL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// Quality configurations for panorama compression
export const QUALITY_CONFIGS: QualityConfig[] = [
  { name: 'panorama_thumbnail', maxWidth: 1024, quality: 30, suffix: 'panorama_thumbnail' },
  { name: 'light', maxWidth: 4096, quality: 60, suffix: 'light' },
  { name: 'medium', maxWidth: 8192, quality: 80, suffix: 'medium' },
  { name: 'heavy', maxWidth: 16384, quality: 95, suffix: 'heavy' },
  { name: 'original', suffix: 'original' }
];