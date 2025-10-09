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
            <label className="text-sm font-medium text-gray-700">Default Zoom</label>
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
        </div>
    )
}

export default MapFormSpecialZoom