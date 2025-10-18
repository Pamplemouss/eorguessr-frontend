# Panorama Batch Uploader

A comprehensive React component for batch uploading panorama files with automatic thumbnail generation and multi-quality compression.

## 🎯 Features

- **Batch Upload**: Upload multiple .webp panorama files at once
- **Automatic Thumbnail Generation**: Generate 8 thumbnails from different camera angles (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
- **Thumbnail Selection**: Let users choose the best representative thumbnail for each panorama
- **Multi-Quality Compression**: Generate 4 quality levels:
  - Light: 4096px width, 60% quality
  - Medium: 8192px width, 80% quality  
  - Heavy: 16384px width, 95% quality
  - Original: Unchanged
- **AWS S3 Upload**: Upload to S3 with organized folder structure
- **Progress Tracking**: Real-time upload progress for each file and quality variant
- **Responsive UI**: Clean, modern interface built with Tailwind CSS

## 🏗️ Architecture

### Core Components

1. **PanoramaBatchUploader**: Main component orchestrating the entire flow
2. **ThumbnailSelector**: Displays generated thumbnails and allows selection
3. **BatchSummary**: Shows overview before upload confirmation
4. **UploadProgress**: Real-time progress tracking during upload
5. **PanoramaUploaderModal**: Modal wrapper for integration

### Custom Hook

- **usePanoramaUploader**: Manages all state and logic for the upload process

### Utilities

- **panoramaUtils.ts**: Three.js-based thumbnail generation and image compression
- **PanoramaBatch.ts**: TypeScript interfaces and configuration

## 📁 File Structure

After upload, files are organized in S3 as:

```
photospheres/
├── {panoramaId1}/
│   ├── thumbnail.webp
│   ├── panorama_light.webp
│   ├── panorama_medium.webp
│   ├── panorama_heavy.webp
│   └── panorama_original.webp
├── {panoramaId2}/
│   ├── thumbnail.webp
│   ├── panorama_light.webp
│   ├── panorama_medium.webp
│   ├── panorama_heavy.webp
│   └── panorama_original.webp
└── ...
```

## 🚀 Usage

### Basic Integration

```tsx
import PanoramaBatchUploader from '@/app/components/PanoramaBatchUploader/PanoramaBatchUploader';

function MyComponent() {
  const handleUploadComplete = (uploadedFiles: string[]) => {
    console.log('Uploaded panorama IDs:', uploadedFiles);
  };

  return (
    <PanoramaBatchUploader onComplete={handleUploadComplete} />
  );
}
```

### Modal Integration

```tsx
import { PanoramaBatchUploaderTrigger } from '@/app/components/PanoramaBatchUploader';

function MyComponent() {
  const handleUploadComplete = (uploadedFiles: string[]) => {
    console.log('Uploaded panorama IDs:', uploadedFiles);
  };

  return (
    <PanoramaBatchUploaderTrigger
      onComplete={handleUploadComplete}
      className="custom-button-styles"
    />
  );
}
```

### Standalone Page

A complete demo page is available at `/admin/photospheres` under the "Upload en Lot" tab.

## 🔧 Configuration

### Quality Settings

Modify quality configurations in `lib/types/PanoramaBatch.ts`:

```typescript
export const QUALITY_CONFIGS: QualityConfig[] = [
  { name: 'light', maxWidth: 4096, quality: 60, suffix: 'light' },
  { name: 'medium', maxWidth: 8192, quality: 80, suffix: 'medium' },
  { name: 'heavy', maxWidth: 16384, quality: 95, suffix: 'heavy' },
  { name: 'original', suffix: 'original' }
];
```

### Thumbnail Angles

Customize thumbnail generation angles:

```typescript
export const THUMBNAIL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
```

## 🛠️ Technical Details

### Dependencies

- **three**: 3D rendering for panorama thumbnail generation
- **browser-image-compression**: Client-side image compression
- **react-dropzone**: Drag & drop file interface
- **@aws-sdk/client-s3**: S3 upload functionality

### Processing Flow

1. **File Selection**: Drag & drop or click to select .webp files
2. **Thumbnail Generation**: Use Three.js to render panorama at different angles
3. **Thumbnail Selection**: User chooses the best representative thumbnail
4. **Quality Generation**: Compress images to different quality levels
5. **Batch Summary**: Show final overview before upload
6. **S3 Upload**: Upload all variants with progress tracking
7. **Completion**: Success summary and cleanup

### Performance Considerations

- Thumbnails are generated using WebGL for optimal performance
- Image compression runs in Web Workers when possible
- Uploads are processed sequentially to avoid overwhelming the server
- Object URLs are properly cleaned up to prevent memory leaks

## 🎨 Styling

The component uses Tailwind CSS with a clean, modern design:

- Responsive grid layouts
- Progress bars and status indicators
- Hover effects and transitions
- Color-coded status states
- Mobile-friendly interface

## 🔍 Error Handling

The component includes comprehensive error handling:

- File validation (format, size)
- Thumbnail generation failures
- Compression errors
- Upload failures with retry capability
- User-friendly error messages

## 🧪 Testing

To test the component:

1. Navigate to `/admin/photospheres`
2. Click on the "Upload en Lot" tab
3. Select multiple .webp panorama files
4. Choose thumbnails for each panorama
5. Review the batch summary
6. Confirm upload and monitor progress

## 📝 API Requirements

The component requires the following API endpoint:

```typescript
POST /api/upload-url
{
  fileName: string;
  fileType: string;
  customKey?: string;  // For organized S3 structure
}

Response:
{
  uploadUrl: string;
  fileUrl: string;
}
```

## 🔧 Environment Variables

Required environment variables:

```env
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_S3_BUCKET_URL=https://your-bucket.s3.amazonaws.com
```

## 🎉 Integration

The component has been fully integrated into the photospheres admin page at `/admin/photospheres`. You can access it by:

1. Starting the development server
2. Navigating to `/admin/photospheres`
3. Clicking on the "Upload en Lot" tab
4. Enjoying the complete batch upload experience

This provides a complete, production-ready solution for batch panorama uploads with automatic thumbnail generation and multi-quality compression, seamlessly integrated into your existing photospheres management interface!