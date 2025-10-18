# PhotospherePreview Components

This directory contains the refactored PhotospherePreview component, split into smaller, more manageable components for better maintainability and reusability.

## Component Structure

### Main Component
- **PhotospherePreview.tsx** - Main component that orchestrates all sub-components

### Sub-Components
- **QualitySelector.tsx** - Handles quality selection and displays file sizes
- **ViewModeToggle.tsx** - Toggle between sphere and image view modes
- **PhotosphereViewer.tsx** - Renders the actual photosphere viewer (360° or image)
- **MetadataDisplay.tsx** - Displays photosphere metadata in a structured format
- **ThumbnailModal.tsx** - Modal for displaying enlarged thumbnail images
- **ThumbnailPreview.tsx** - Small thumbnail preview component

### Custom Hook
- **usePhotospherePreview.ts** - Custom hook managing state and side effects

### Exports
- **index.ts** - Barrel export for easy importing

## Benefits of This Structure

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other parts of the application
3. **Maintainability** - Easier to debug and modify individual features
4. **Testability** - Smaller components are easier to unit test
5. **Code Organization** - Related functionality is grouped together

## Usage

```tsx
import PhotospherePreview from './PhotospherePreview';

// Or import individual components
import { QualitySelector, ViewModeToggle } from './PhotospherePreview';
```