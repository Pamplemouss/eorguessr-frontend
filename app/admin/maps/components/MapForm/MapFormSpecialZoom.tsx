import { useMap } from '@/app/providers/MapContextProvider';
import { MapType } from '@/lib/types/MapType';
import React from 'react'

const MapFormSpecialZoom = () => {
    const { currentMap, setCurrentMap } = useMap();

    const parseZoomString = (text: string): number | undefined => {
        try {
            const parsed = JSON.parse(text);
            if (typeof parsed === "number" && parsed >= 0) {
                return parsed;
            }
        } catch (err) {
            // Ignore parse errors
        }
        return currentMap.specialZoom;
    };

    const specialZoom: number = 1;
    const zoom = currentMap.specialZoom ?? specialZoom;

    if (currentMap.type !== MapType.WORLD_MAP) return null;

    return (
        <div>
            <label className="block text-sm font-medium mt-2">Default Zoom</label>
            <input
                type="text"
                placeholder='2'
                value={JSON.stringify(zoom)}
                onChange={(e) =>
                    setCurrentMap({
                        ...currentMap,
                        specialZoom: parseZoomString(e.target.value),
                    })
                }
                className="border p-2 w-full font-mono text-xs mb-2"
            />

            <div>
                <label className="block text-xs text-gray-600">Zoom Level</label>
                <input
                    type="number"
                    placeholder="Zoom Level"
                    min="0"
                    max="18"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => {
                        const newZoom = parseFloat(e.target.value);
                        if (!isNaN(newZoom) && newZoom >= 0) {
                            setCurrentMap({
                                ...currentMap,
                                specialZoom: newZoom,
                            });
                        }
                    }}
                    className="border p-1 w-full text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Zoom levels typically range from 0 (world view) to 18 (street level)
                </p>
            </div>
        </div>
    )
}

export default MapFormSpecialZoom