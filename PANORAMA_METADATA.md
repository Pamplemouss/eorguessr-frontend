# Panorama Metadata Extraction

## Overview

The batch panorama uploader now automatically extracts metadata from panorama filenames and creates a `metadata.json` file for each uploaded panorama.

## Filename Format

The expected filename format is:
```
ZoneName_Weather_X_Y_Z_IngameTime.webp
```

### Example
```
New Gridania_Fair Skies_9.11_11.68_0.00_1457.webp
```

This will be parsed as:
- **Map**: "New Gridania"
- **Weather**: "Fair Skies"
- **X Coordinate**: 9.11
- **Y Coordinate**: 11.68
- **Z Coordinate**: 0.00
- **Time**: 1457

## Generated metadata.json

For each panorama, a `metadata.json` file will be created with the following structure:

```json
{
  "map": "New Gridania",
  "weather": "Fair Skies",
  "coord": {
    "x": 9.11,
    "y": 11.68,
    "z": 0.00
  },
  "time": "1457"
}
```

> **Note**: The `time` field is stored as a string with leading zeros preserved (e.g., "0015" for 12:15 AM). This ensures that early morning times like 00:15 maintain their proper formatting.

## Upload Structure

Each panorama will be uploaded with the following structure:
```
photospheres/
├── {panorama-id}/
    ├── thumbnail.webp
    ├── panorama_thumbnail.webp
    ├── panorama_light.webp
    ├── panorama_medium.webp
    ├── panorama_heavy.webp
    ├── panorama_original.webp
    └── metadata.json
```

## Features

### Intelligent Weather Detection
The parser uses weather keywords to intelligently split zone names from weather conditions:
- Weather keywords: clear, fair, skies, clouds, cloudy, overcast, rain, rainy, storm, stormy, snow, snowy, fog, foggy, mist, misty, thunder, lightning, drizzle, sunshine, sunny, night, dawn, dusk

### Error Handling
- If filename doesn't match the expected format, metadata extraction will fail gracefully
- Files without metadata will still be uploaded but without the metadata.json file
- Warning indicators show which files lack metadata in the upload summary

### Visual Feedback
- Metadata information is displayed in the batch summary
- Upload progress shows metadata.json upload status
- Clear warnings for files with parsing issues

## Usage

1. Ensure your panorama files follow the naming convention
2. Upload files through the batch uploader
3. Review metadata in the summary step
4. Upload will include metadata.json for properly named files

## Troubleshooting

### Common Issues

1. **Metadata not extracted**: Check filename format
2. **Wrong zone/weather split**: Use weather keywords or adjust manually
3. **Invalid coordinates**: Ensure X, Y, Z, and time are valid numbers

### Best Practices

- Use clear weather descriptions with keywords
- Keep coordinate precision reasonable (2-3 decimal places)
- Use underscores only as separators
- Avoid special characters in zone names and weather descriptions