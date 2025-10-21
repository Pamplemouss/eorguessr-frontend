import { Map } from '@/lib/types/Map';
import getBoundsFromMap from '@/lib/utils/getBoundsFromMap';
import React, { useState } from 'react'
import { useMapEvents } from 'react-leaflet';

const MapMouseTracker = ({ currentMap }: { currentMap: Map }) => {
    const [cursorCoord, setCursorCoord] = useState<{ lat: number; lng: number } | null>(null);

    const bounds = getBoundsFromMap(currentMap) as [[number, number], [number, number]];

    const leafletMapXSize = bounds[1][1] - bounds[0][1];
    const leafletMapYSize = bounds[1][0] - bounds[0][0];
    const eorMapXSize = currentMap.size?.x - 1;
    const eorMapYSize = currentMap.size?.y - 1;

    const scaleX = eorMapXSize / leafletMapXSize;
    const scaleY = eorMapYSize / leafletMapYSize;

    const realCursorXCoord = cursorCoord ? (cursorCoord.lng + leafletMapXSize / 2) * scaleX + 1: 0;
    const realCursorYCoord = cursorCoord ? (-cursorCoord.lat + leafletMapYSize / 2) * scaleY + 1: 0;
    const realCursorCoordText = cursorCoord ? `X: ${realCursorXCoord.toFixed(1)} Y: ${realCursorYCoord.toFixed(1)}` : "";
    
    useMapEvents({
        mousemove: (e) => {
            // Check if the event target is the map itself, not a marker or other element
            const target = e.originalEvent?.target as HTMLElement;
            if (target && (target.classList.contains('leaflet-marker-icon') || target.closest('.leaflet-marker-icon'))) {
                return; // Don't update coordinates when over a marker
            }
            
            // If coordinates outside bounds, set to null
            if (e.latlng.lat < bounds[0][0] || e.latlng.lat > bounds[1][0] ||
                e.latlng.lng < bounds[0][1] || e.latlng.lng > bounds[1][1]) {
                setCursorCoord(null);
                return;
            }
            setCursorCoord({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
        mouseout: () => setCursorCoord(null), // Reset coordinates on mouse out
    });

    return (
        <div className="bg-gradient-to-b from-[#6F6F6F] via-[#575757] via-90% to-transparent w-full h-6 z-[400] relative pointer-events-none">
            <span className="absolute right-2 top-0.5 text-sm font-mono text-[#CCCCCC] italic select-none flex">
                <span>{cursorCoord ? realCursorCoordText :""}</span>
            </span>
        </div>
    )
}

export default MapMouseTracker