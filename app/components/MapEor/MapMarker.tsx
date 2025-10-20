import React from 'react'
import { useLocale } from '@/app/providers/LocalContextProvider';
import { Marker as MarkerType } from '@/lib/types/Marker';
import { Map } from '@/lib/types/Map';
import { isMapExit } from '@/lib/utils/isMapExit';
import { useMap } from '@/app/providers/MapContextProvider';
import { MapType } from '@/lib/types/MapType';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { getMapById } from '@/lib/utils/getMapById';

const MapMarker = ({
    marker,
    hoveredIdx,
    setHoveredIdx,
    dragMode,
    idx,
}: {
    marker: MarkerType;
    hoveredIdx: number | null;
    setHoveredIdx: React.Dispatch<React.SetStateAction<number | null>>;
    dragMode: boolean;
    idx: number;
}) => {
    const { currentMap, maps, setCurrentMapById, changeMapEnabled, setCurrentMap } = useMap();
    const { locale } = useLocale();

    function getTextIcon(markerMap: Map | undefined, isHovered: boolean) {
        if (!currentMap) return;
        
        let text = "Unknown";
        if (markerMap) {
            if (marker.useSubAreaCustomName && markerMap.subAreaCustomName) {
                // Use the custom sub-area name if the option is enabled and it exists
                text = markerMap.subAreaCustomName[locale as keyof typeof markerMap.subAreaCustomName] || 
                       markerMap.name[locale as keyof typeof markerMap.name] || "Unknown";
            } else {
                // Use the regular map name
                text = markerMap.name[locale as keyof typeof markerMap.name] || "Unknown";
            }
        }
        
        const isExit = markerMap ? isMapExit(currentMap, markerMap) : false;
        const isDungeon = markerMap?.type === MapType.DUNGEON;
        const html = `
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center marker whitespace-nowrap tracking-wide font-myriad-cond text-lg !cursor-pointer">
            ${isDungeon ? `<img src="/map/dungeon_icon.webp" class="w-5 h-5 mr-1" />` : ""}
            <span>${text}</span>
        </div>
        `;
        return L.divIcon({
            className: getMarkerClass(isHovered, isDungeon, isExit),
            html,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
        });
    }

    function handleMarkerDrag(idx: number, newLatLng: [number, number]) {
        if (!currentMap || !currentMap.markers) return;
        const updatedMarkers = currentMap.markers.map((m, i) =>
            i === idx ? { ...m, latLng: newLatLng } : m
        );
        const updatedMap = { ...currentMap, markers: updatedMarkers };
        setCurrentMap(updatedMap);
    }

    function getMarkerClass(isHovered: boolean, isDungeon: boolean, isExit: boolean) {
        const classes = [];
        if (isHovered) classes.push("hovered");
        if (isDungeon) classes.push("dungeon");
        if (isExit) classes.push("exit");
        return classes.join(" ");
    }

    return (
        <Marker
            position={marker.latLng}
            icon={getTextIcon(getMapById(maps, marker.target), hoveredIdx === idx)}
            draggable={dragMode}
            eventHandlers={{
                mouseover: () => setHoveredIdx(idx),
                mouseout: () => setHoveredIdx(null),
                dragend: (e) => {
                    if (dragMode) {
                        const latlng = e.target.getLatLng();
                        handleMarkerDrag(idx, [latlng.lat, latlng.lng]);
                    }
                },
                click: () => {
                    if (changeMapEnabled && marker.target) {
                        setCurrentMapById(marker.target);
                    }
                },
            }}
        />
    )
}

export default MapMarker