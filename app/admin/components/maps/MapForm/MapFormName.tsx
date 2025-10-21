import { useMap } from '@/app/providers/MapContextProvider';
import { MapName } from '@/lib/types/Map';
import { Expansion } from '@/lib/types/Expansion';
import { MapType } from '@/lib/types/MapType';
import { createEmptyMap } from '@/lib/utils/createEmptyMap';
import { FFXIVMapTranslations, generateMapFilename } from '@/lib/services/ffxivAPI';
import { useMapImageUploader } from '@/app/hooks/useMapImageUploader';
import { compressImageToWebP } from '@/lib/utils/mapImageUtils';
import FFXIVMapSearch from './FFXIVMapSearch';
import React, { useState } from 'react'
import { FaGamepad, FaExclamationTriangle } from 'react-icons/fa';

const MapFormName = () => {
    const { currentMap, setCurrentMap, maps } = useMap();
    const [dataInput, setDataInput] = useState('');
    const [dataError, setDataError] = useState('');
    const [showImportSection, setShowImportSection] = useState(false);
    const [showFFXIVSearch, setShowFFXIVSearch] = useState(false);
    const [sizeFactorWarning, setSizeFactorWarning] = useState<string | null>(null);

    function updateMapNameLocale(
        locale: keyof MapName,
        value: string
    ) {
        if (!currentMap) return;
        setCurrentMap({
            ...currentMap,
            name: {
                en: currentMap?.name?.en ?? "",
                fr: currentMap?.name?.fr ?? "",
                de: currentMap?.name?.de ?? "",
                ja: currentMap?.name?.ja ?? "",
                [locale]: value
            }
        });
    }

    const isFieldEmpty = (locale: keyof MapName) => {
        return !currentMap?.name?.[locale]?.trim();
    };

    const parseAndApplyData = () => {
        try {
            setDataError('');

            if (!currentMap) return;

            const newMapName = {
                en: currentMap?.name?.en ?? "",
                fr: currentMap?.name?.fr ?? "",
                de: currentMap?.name?.de ?? "",
                ja: currentMap?.name?.ja ?? "",
            };

            // Split input into lines and process each line
            const lines = dataInput.trim().split('\n');

            lines.forEach((line: string) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return; // Skip empty lines

                // Split by tab or multiple spaces/tabs
                const parts = trimmedLine.split(/\t+|\s{2,}/).map((part: string) => part.trim());

                if (parts.length >= 3) {
                    // Expected format: [id, language, mapName, ...]
                    const [, language, mapName] = parts;

                    if (language && mapName) {
                        const lang = language as keyof MapName;
                        if (lang in newMapName) {
                            newMapName[lang] = mapName;
                        }
                    }
                }
            });

            setCurrentMap({
                ...currentMap,
                name: newMapName
            });

            setDataInput(''); // Clear the input after successful application
        } catch (error) {
            setDataError('Invalid format. Please check your input.');
        }
    };

    const { uploadMapImage } = useMapImageUploader();
    
    /**
     * Calculate map size based on FFXIV size factor
     */
    const calculateMapSize = (sizeFactor: number): { x: number; y: number; warning?: string } => {
        switch (sizeFactor) {
            case 200:
                return { x: 21.4, y: 21.4 };
            case 100:
                return { x: 41.9, y: 41.9 };
            default:
                return { 
                    x: 41.9, 
                    y: 41.9, 
                    warning: `Unknown size factor: ${sizeFactor}. Using default size (41.9x41.9). Please check this manually.`
                };
        }
    };
    
    const handleFFXIVMapSelect = async (ffxivMap: FFXIVMapTranslations, selectedMapType: MapType) => {
        try {
            // Create a new map with FFXIV data
            const newMap = createEmptyMap();
            
            // Set the map type from the selector
            newMap.type = selectedMapType;
            
            // Set the map names from FFXIV data
            newMap.name = {
                en: ffxivMap.mapName.en || '',
                fr: ffxivMap.mapName.fr || '',
                de: ffxivMap.mapName.de || '',
                ja: ffxivMap.mapName.ja || ''
            };
            
            // Map FFXIV expansion to our expansion enum
            const expansionMapping: Record<string, Expansion> = {
                'A Realm Reborn': Expansion.ARR,
                'Heavensward': Expansion.HW,
                'Stormblood': Expansion.SB,
                'Shadowbringers': Expansion.ShB,
                'Endwalker': Expansion.EW,
                'Dawntrail': Expansion.DT
            };
            
            const ffxivExpansion = ffxivMap.expansion.en || '';
            newMap.expansion = expansionMapping[ffxivExpansion] || Expansion.ARR;
            
            // Calculate map size based on FFXIV size factor
            const sizeResult = calculateMapSize(ffxivMap.sizeFactor);
            newMap.size = {
                x: sizeResult.x,
                y: sizeResult.y
            };
            
            // Show warning if unknown size factor
            if (sizeResult.warning) {
                setSizeFactorWarning(sizeResult.warning);
            }
            
            // Auto-enable subareas if there's a sub place name
            const hasSubName = ffxivMap.placeNameSub.en?.trim();
            if (hasSubName) {
                newMap.subAreas = []; // Enable subareas (ensureSelfInSubAreas will add the map ID)
                newMap.subAreaCustomName = {
                    en: ffxivMap.placeNameSub.en || '',
                    fr: ffxivMap.placeNameSub.fr || '',
                    de: ffxivMap.placeNameSub.de || '',
                    ja: ffxivMap.placeNameSub.ja || ''
                };
            }
            
            // Try to find a matching region by name (English) if we have region data
            if (ffxivMap.placeNameRegion.en) {
                const matchingRegion = maps
                    .filter(m => m.type === 'REGION')
                    .find(region => {
                        const regionName = region.name?.en?.toLowerCase() || '';
                        const ffxivRegionName = ffxivMap.placeNameRegion.en.toLowerCase();
                        return regionName.includes(ffxivRegionName) || ffxivRegionName.includes(regionName);
                    });
                
                if (matchingRegion) {
                    newMap.region = matchingRegion.id;
                }
            }
            
            // Handle image download and upload if available
            if (ffxivMap.mapImageId) {
                try {
                    // Get image info from our API
                    const imageResponse = await fetch('/api/ffxiv/maps/image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            mapImageId: ffxivMap.mapImageId,
                            mapName: ffxivMap.mapName,
                            placeNameSub: ffxivMap.placeNameSub,
                            expansion: newMap.expansion,
                            mapType: selectedMapType
                        })
                    });
                    
                    if (imageResponse.ok) {
                        const { image } = await imageResponse.json();
                        
                        // Download the image
                        const imageBlob = await fetch(image.imageUrl);
                        const imageFile = new File([await imageBlob.blob()], image.suggestedFilename);
                        
                        // Convert to WebP and upload directly to S3 using the suggested filename
                        const webpBlob = await compressImageToWebP(imageFile, 0.8);
                        const webpFile = new File([webpBlob], image.suggestedFilename, { type: 'image/webp' });
                        
                        // Upload directly to S3 using the suggested filename
                        const s3Key = `maps/${image.suggestedFilename}`;
                        
                        // Get signed URL for upload
                        const urlResponse = await fetch('/api/upload-url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                fileName: image.suggestedFilename,
                                fileType: 'image/webp',
                                customKey: s3Key
                            })
                        });

                        if (urlResponse.ok) {
                            const { uploadUrl, fileUrl } = await urlResponse.json();

                            // Upload to S3
                            const uploadResponse = await fetch(uploadUrl, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'image/webp' },
                                body: webpBlob
                            });

                            if (uploadResponse.ok) {
                                // Set the imagePath to just the filename (as expected by the system)
                                newMap.imagePath = image.suggestedFilename;
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Failed to process FFXIV image:', error);
                    // Continue without image - user can upload manually later
                }
            }
            
            // Store FFXIV metadata for reference
            console.log('FFXIV Map Data imported:', {
                mapId: ffxivMap.id,
                imageId: ffxivMap.mapImageId,
                region: ffxivMap.placeNameRegion,
                subArea: ffxivMap.placeNameSub,
                expansion: ffxivMap.expansion,
                sizeFactor: ffxivMap.sizeFactor,
                size: newMap.size
            });
            
            // Set the new map as current
            setCurrentMap(newMap);
            setShowFFXIVSearch(false);
            
            // Clear any previous warnings if this import is successful with known size factor
            if (ffxivMap.sizeFactor === 100 || ffxivMap.sizeFactor === 200) {
                setSizeFactorWarning(null);
            }
            
        } catch (error) {
            console.error('Error importing FFXIV map:', error);
            alert('Error importing map. Please try again.');
        }
    };

    return (
        <div className="space-y-4">
            {/* Size Factor Warning */}
            {sizeFactorWarning && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-red-800 text-sm font-medium">Size Factor Warning</p>
                        <p className="text-red-700 text-sm">{sizeFactorWarning}</p>
                    </div>
                    <button
                        onClick={() => setSizeFactorWarning(null)}
                        className="text-red-400 hover:text-red-600"
                    >
                        ×
                    </button>
                </div>
            )}
            
            {/* Individual Name Fields */}
            <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("en")
                    ? "bg-red-50 border-red-300"
                    : "bg-blue-50 border-blue-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("en")
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                        }`}>EN</span>
                    <input
                        type="text"
                        placeholder="English name"
                        value={currentMap?.name?.en || ""}
                        onChange={(e) => updateMapNameLocale("en", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("en") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("en") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("fr")
                    ? "bg-red-50 border-red-300"
                    : "bg-green-50 border-green-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("fr")
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                        }`}>FR</span>
                    <input
                        type="text"
                        placeholder="French name"
                        value={currentMap?.name?.fr || ""}
                        onChange={(e) => updateMapNameLocale("fr", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("fr") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("fr") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("de")
                    ? "bg-red-50 border-red-300"
                    : "bg-orange-50 border-orange-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("de")
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                        }`}>DE</span>
                    <input
                        type="text"
                        placeholder="German name"
                        value={currentMap?.name?.de || ""}
                        onChange={(e) => updateMapNameLocale("de", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("de") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("de") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("ja")
                    ? "bg-red-50 border-red-300"
                    : "bg-purple-50 border-purple-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("ja")
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                        }`}>JA</span>
                    <input
                        type="text"
                        placeholder="Japanese name"
                        value={currentMap?.name?.ja || ""}
                        onChange={(e) => updateMapNameLocale("ja", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("ja") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("ja") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
            </div>
            {/* Data Input Section */}
            {showImportSection && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Import Names from Tab-Separated Data</h3>
                    <div className="space-y-2">
                        <textarea
                            value={dataInput}
                            onChange={(e) => setDataInput(e.target.value)}
                            placeholder={`Paste tab-separated data here, e.g.:
6	fr	Forêt du sud
6	en	South Shroud
6	ja	黒衣森：南部森林
6	de	Südwald`}
                            className="w-full h-24 p-2 text-xs border border-gray-300 rounded-md resize-none font-mono"
                        />
                        {dataError && (
                            <p className="text-red-600 text-xs">{dataError}</p>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={parseAndApplyData}
                                disabled={!dataInput.trim()}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Apply Data
                            </button>
                            <button
                                type="button"
                                onClick={() => { setDataInput(''); setDataError(''); }}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toggle Button */}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={() => setShowFFXIVSearch(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 border border-blue-600 flex items-center gap-2 text-sm font-medium"
                >
                    <FaGamepad />
                    Import from FFXIV
                </button>
                
                <button
                    type="button"
                    onClick={() => setShowImportSection(!showImportSection)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 border border-gray-300"
                >
                    {showImportSection ? 'Hide Import' : 'Import from Text'}
                </button>
            </div>
            
            {/* FFXIV Search Modal */}
            {showFFXIVSearch && (
                <FFXIVMapSearch
                    onMapSelect={handleFFXIVMapSelect}
                    onClose={() => setShowFFXIVSearch(false)}
                />
            )}
        </div>
    )
}

export default MapFormName