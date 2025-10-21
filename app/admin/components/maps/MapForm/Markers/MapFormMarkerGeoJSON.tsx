import { Marker } from '@/lib/types/Marker'
import React, { useState, useEffect } from 'react'

const MapFormMarkerGeoJSON = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
    // Ensure backward compatibility - convert old format to new format if needed
    const normalizeArea = (area: any): [number, number][][] => {
        if (!area) return [];
        if (!Array.isArray(area)) return [];
        
        // If it's already the new format (array of arrays of coordinates)
        if (area.length > 0 && Array.isArray(area[0]) && Array.isArray(area[0][0])) {
            return area as [number, number][][];
        }
        
        // If it's the old format (flat array of coordinates), wrap it in an array
        if (area.length > 0 && Array.isArray(area[0]) && typeof area[0][0] === 'number') {
            return [area as [number, number][]];
        }
        
        return [];
    };

    const normalizedArea = normalizeArea(draft.geojson?.area);
    const normalizedHitbox = normalizeArea(draft.geojson?.hitbox);
    
    const [areaValue, setAreaValue] = useState(JSON.stringify(normalizedArea));
    const [hitboxValue, setHitboxValue] = useState(JSON.stringify(normalizedHitbox));

    // Update draft with normalized data if it was converted (only on mount)
    useEffect(() => {
        const hasChanges = draft.geojson && (
            JSON.stringify(draft.geojson.area) !== JSON.stringify(normalizedArea) ||
            JSON.stringify(draft.geojson.hitbox) !== JSON.stringify(normalizedHitbox)
        );
        
        if (hasChanges) {
            setDraft({
                ...draft,
                geojson: {
                    area: normalizedArea,
                    hitbox: normalizedHitbox,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount to avoid infinite loops

    const parseAreaTextarea = (text: string): [number, number][][] => {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return parsed as [number, number][][];
            }
        } catch (err) {
            // Ignore parse errors
        }
        return [];
    };

    const parseHitboxTextarea = (text: string): [number, number][][] => {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return parsed as [number, number][][];
            }
        } catch (err) {
            // Ignore parse errors
        }
        return [];
    };


    const handleAreaChange = (value: string) => {
        setAreaValue(value);
        let parsed: [number, number][][] = [];
        try {
            parsed = JSON.parse(value);
        } catch {}
        if (Array.isArray(parsed)) {
            setDraft({
                ...draft,
                geojson: {
                    area: parsed,
                    hitbox: draft.geojson?.hitbox ?? [],
                },
            });
        }
    };

    const handleHitboxChange = (value: string) => {
        setHitboxValue(value);
        let parsed: [number, number][][] = [];
        try {
            parsed = JSON.parse(value);
        } catch {}
        if (Array.isArray(parsed)) {
            setDraft({
                ...draft,
                geojson: {
                    area: draft.geojson?.area ?? [],
                    hitbox: parsed,
                },
            });
        }
    };

    const addAreaFromClipboard = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const currentArea = draft.geojson?.area || [];
            
            // Parse the clipboard content as a polygon (array of coordinates)
            const newPolygon = JSON.parse(clipboardText) as [number, number][];
            
            if (Array.isArray(newPolygon) && newPolygon.length > 0) {
                // Validate that each coordinate is a valid [number, number] pair
                const validCoordinates = newPolygon.filter(coord => 
                    Array.isArray(coord) && coord.length === 2 && 
                    typeof coord[0] === 'number' && typeof coord[1] === 'number'
                ) as [number, number][];
                
                if (validCoordinates.length > 0) {
                    // Add the new polygon to the existing area array
                    const updatedArea = [...currentArea, validCoordinates];
                    
                    setAreaValue(JSON.stringify(updatedArea));
                    setDraft({
                        ...draft,
                        geojson: {
                            area: updatedArea,
                            hitbox: draft.geojson?.hitbox ?? [],
                        },
                    });
                } else {
                    alert('Invalid coordinates format in clipboard.');
                }
            }
        } catch (err) {
            console.error('Failed to read from clipboard or parse coordinates:', err);
            alert('Failed to add area from clipboard. Make sure you have valid coordinates copied.');
        }
    };

    const addHitboxFromClipboard = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const currentHitbox = draft.geojson?.hitbox || [];
            
            // Parse the clipboard content as a polygon (array of coordinates)
            const newPolygon = JSON.parse(clipboardText) as [number, number][];
            
            if (Array.isArray(newPolygon) && newPolygon.length > 0) {
                // Validate that each coordinate is a valid [number, number] pair
                const validCoordinates = newPolygon.filter(coord => 
                    Array.isArray(coord) && coord.length === 2 && 
                    typeof coord[0] === 'number' && typeof coord[1] === 'number'
                ) as [number, number][];
                
                if (validCoordinates.length > 0) {
                    // Add the new polygon to the existing hitbox array
                    const updatedHitbox = [...currentHitbox, validCoordinates];
                    
                    setHitboxValue(JSON.stringify(updatedHitbox));
                    setDraft({
                        ...draft,
                        geojson: {
                            area: draft.geojson?.area ?? [],
                            hitbox: updatedHitbox,
                        },
                    });
                } else {
                    alert('Invalid coordinates format in clipboard.');
                }
            }
        } catch (err) {
            console.error('Failed to read from clipboard or parse coordinates:', err);
            alert('Failed to add hitbox from clipboard. Make sure you have valid coordinates copied.');
        }
    };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Area</label>
                        <button
                            type="button"
                            onClick={addAreaFromClipboard}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Add from Clipboard
                        </button>
                    </div>
                    <textarea
                        className="border p-2 w-full font-mono text-xs"
                        rows={4}
                        value={areaValue}
                        onChange={(e) => handleAreaChange(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Hitbox</label>
                        <button
                            type="button"
                            onClick={addHitboxFromClipboard}
                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                            Add from Clipboard
                        </button>
                    </div>
                    <textarea
                        className="border p-2 w-full font-mono text-xs"
                        rows={4}
                        value={hitboxValue}
                        onChange={(e) => handleHitboxChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}

export default MapFormMarkerGeoJSON

