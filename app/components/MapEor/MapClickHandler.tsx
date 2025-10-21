"use client";

import React from 'react';
import { useMapEvents } from 'react-leaflet';
import { Map } from '@/lib/types/Map';
import { MapType } from '@/lib/types/MapType';
import getBoundsFromMap from '@/lib/utils/getBoundsFromMap';

interface MapClickHandlerProps {
    currentMap: Map;
    disabled?: boolean;
    hasSubmittedGuess?: boolean;
    onMapClick?: (lat: number, lng: number) => void;
}

const MapClickHandler = ({ currentMap, disabled, hasSubmittedGuess, onMapClick }: MapClickHandlerProps) => {
    useMapEvents({
        click: (e) => {
            // Check if clicking is disabled
            if (disabled || hasSubmittedGuess) return;
            
            // Only allow pin placement on MAP and DUNGEON types
            if (currentMap.type !== MapType.MAP && currentMap.type !== MapType.DUNGEON) {
                return;
            }
            
            // Check if the click is on the map itself, not a marker or other element
            const target = e.originalEvent?.target as HTMLElement;
            if (target && (target.classList.contains('leaflet-marker-icon') || target.closest('.leaflet-marker-icon'))) {
                return; // Don't handle clicks on markers
            }
            
            if (!currentMap.size) return;
            
            const bounds = getBoundsFromMap(currentMap) as [[number, number], [number, number]];
            
            // Check if coordinates are within bounds
            if (e.latlng.lat >= bounds[0][0] && e.latlng.lat <= bounds[1][0] &&
                e.latlng.lng >= bounds[0][1] && e.latlng.lng <= bounds[1][1]) {
                
                // Convert to real FFXIV coordinates
                const leafletMapXSize = bounds[1][1] - bounds[0][1];
                const leafletMapYSize = bounds[1][0] - bounds[0][0];
                const eorMapXSize = currentMap.size.x - 1;
                const eorMapYSize = currentMap.size.y - 1;

                const scaleX = eorMapXSize / leafletMapXSize;
                const scaleY = eorMapYSize / leafletMapYSize;

                const realX = (e.latlng.lng + leafletMapXSize / 2) * scaleX + 1;
                const realY = (-e.latlng.lat + leafletMapYSize / 2) * scaleY + 1;
                
                if (onMapClick) {
                    onMapClick(realY, realX); // Note: lat, lng order
                }
            }
        },
    });

    return null; // This component doesn't render anything visible
};

export default MapClickHandler;