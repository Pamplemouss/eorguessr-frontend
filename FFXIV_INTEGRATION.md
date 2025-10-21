# FFXIV Map Integration

This feature allows you to search and import maps from the Final Fantasy XIV database directly into Eorguessr.

## How it works

### 1. Search Interface
- Click the "Import from FFXIV" button in the map form
- Enter a map name in English (or any supported language)
- Select the search language (English, French, Japanese, German)
- Click "Search" to find matching maps

### 2. Search Results
The search will display:
- Map images (when available)
- Map names in all languages
- Sub-area names
- Map ID and size factor

### 3. Map Import
When you select a map from the results:
- All language names are automatically filled
- Map image URL is set (if available)
- Map size is calculated based on FFXIV's size factor
- A new map is created with proper structure

## Technical Implementation

### API Endpoints Used
- Search: `https://v2.xivapi.com/api/search?sheets=Map&query=PlaceName.Name@{lang}~"{name}"`
- Details: `https://v2.xivapi.com/api/sheet/Map/{id}?language={lang}`
- Images: `https://v2.xivapi.com/api/asset/map/{mapId}`

### Files Added/Modified

#### New Files:
- `lib/services/ffxivAPI.ts` - FFXIV API service functions
- `pages/api/ffxiv/maps/search.ts` - Backend API endpoint
- `app/admin/components/maps/MapForm/FFXIVMapSearch.tsx` - Search modal component
- `lib/test/testFFXIVAPI.ts` - API testing utility

#### Modified Files:
- `app/admin/components/maps/MapForm/MapFormName.tsx` - Added FFXIV search button and integration

### Data Mapping
FFXIV map data is mapped to Eorguessr format as follows:
- `PlaceName.Name` → `map.name[language]`
- `PlaceNameSub.Name` → Used for reference (not currently stored)
- `SizeFactor` → Used to calculate `map.size.x` and `map.size.y`
- Map image URL → `map.imagePath`

### Size Calculation
The map size is calculated using the formula:
```typescript
const calculatedSize = Math.max(ffxivMap.sizeFactor / 100 * 41.0, 1.0);
```

This formula is based on FFXIV's coordinate system and may need adjustment based on testing.

## Usage Tips

### Popular Search Terms
- City-states: Ul'dah, Gridania, Limsa Lominsa
- Regions: The Black Shroud, Coerthas, Mor Dhona
- Zones: Eastern Thanalan, Central Shroud, Western La Noscea
- Dungeons: Search for specific dungeon names

### Language Support
The system supports all four FFXIV languages:
- English (EN)
- French (FR) 
- Japanese (JA)
- German (DE)

### Error Handling
The system includes comprehensive error handling for:
- Network connectivity issues
- API rate limiting
- Invalid search terms
- Missing map data

## Future Enhancements

Potential improvements could include:
1. Caching search results to reduce API calls
2. Batch import of multiple maps
3. Integration with expansion and map type detection
4. Automatic marker placement based on FFXIV data
5. Support for sub-area mapping