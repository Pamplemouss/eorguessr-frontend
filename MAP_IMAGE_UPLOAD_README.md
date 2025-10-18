# Map Image Upload Feature Implementation

This implementation adds a map image upload button next to the map path input field in the admin interface.

## Features

### 🖼️ Image Upload & Processing
- **File Validation**: Accepts JPEG, PNG, WebP files up to 20MB
- **Automatic Compression**: Converts images to WebP format with 85% quality
- **Automatic Resizing**: Resizes images to maximum 2048x2048 while maintaining aspect ratio
- **Smart Naming**: Automatically generates filename based on map's English name in camelCase

### 📁 File Organization
- **S3 Structure**: Images are uploaded to `maps/` folder in S3
- **Naming Convention**: `{mapNameEn}.webp` (e.g., "New Gridania" → "newGridania.webp")
- **Path Integration**: Automatically updates the map's imagePath field

### 🎨 User Experience
- **Visual Feedback**: Progress indicator, success/error states with appropriate icons
- **Validation Messages**: Clear error messages for file validation failures
- **Responsive Design**: Clean, modern interface that matches the existing admin design

## Implementation Files

### Core Components
- `MapFormImagePath.tsx` - Updated form component with upload button
- `useMapImageUploader.ts` - Custom hook for handling image uploads
- `mapImageUtils.ts` - Utility functions for image processing and camelCase conversion

### Utility Functions
- `toCamelCase()` - Converts names like "New Gridania" to "newGridania"
- `compressImageToWebP()` - Compresses and converts images to WebP format
- `validateImageFile()` - Validates file type and size

## Usage Example

1. Fill in the map's English name (required for filename generation)
2. Click the upload button next to the image path field
3. Select an image file (JPEG, PNG, or WebP)
4. The image is automatically:
   - Validated for type and size
   - Compressed to WebP format
   - Resized if needed
   - Uploaded to S3 in the maps/ folder
   - Named based on the English map name
   - Path automatically filled in the form

## Dependencies
- Existing upload-url API (already supports custom S3 keys)
- react-icons/fa (already installed)
- HTML5 Canvas API (for image processing)
- AWS S3 (existing configuration)

## Notes
- Requires the map's English name to be filled before uploading
- Images are compressed to reduce storage costs and improve loading times
- Uses existing S3 infrastructure and upload patterns from photosphere uploads