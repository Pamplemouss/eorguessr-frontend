"use client";
import { MapContainer, Marker, Polygon, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Map } from "@/lib/types/Map";
import React, { useState } from "react";
import PolygonsEditor from "./PolygonsEditor";
import { getMapById } from "@/lib/utils/getMapById";
import { isMapExit } from "@/lib/utils/isMapExit";
import { useLocale } from "@/app/components/contexts/LocalContextProvider";
import { MapType } from "@/lib/types/MapTypeEnum";
import { Marker as EorMarker } from "@/lib/types/Marker";
import SubAreaControl from "./SubAreaControl";

export default function EditorMap({
    map,
    maps,
    onMarkersChange,
    onMarkerClick,
    changeMapOnMarkerClickEnabled,
}: {
    map: Map;
    maps: Map[];
    onMarkersChange?: (markers: EorMarker[]) => void;
    onMarkerClick?: (mapId: string) => void;
    changeMapOnMarkerClickEnabled?: boolean;
}) {
    const { locale } = useLocale();
    const defaultBounds: L.LatLngBoundsExpression = [[-100, -100], [100, 100]];

    const specialBounds: Record<string, L.LatLngBoundsExpression> = {
        "d05cc1fd-77f8-45d8-935a-8948e4c336f0": [[-110, -258], [110, 258]], // The Source
        "24dafd75-1150-4a15-b2cc-31a9d3f1e228": [[-110, -196], [110, 196]], // The First
    };

    const bounds =
        map.id && specialBounds[map.id] ? specialBounds[map.id] : defaultBounds;

    const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
    const imageUrl = `${baseUrl}/maps/${map.imagePath}`;

    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [showPolygonsEditor, setShowPolygonsEditor] = useState(true);
    const [dragMode, setDragMode] = useState(false);

    function getMarkerClass(isHovered: boolean, isDungeon: boolean, isExit: boolean) {
        const classes = [];
        if (isHovered) classes.push("hovered");
        if (isDungeon) classes.push("dungeon");
        if (isExit) classes.push("exit");
        return classes.join(" ");
    }

    function getTextIcon(markerMap: Map | undefined, isHovered: boolean) {
        const text = markerMap ? markerMap.name[locale as keyof typeof markerMap.name] || "Unknown" : "Unknown";
        const isExit = markerMap ? isMapExit(map, markerMap) : false;
        const isDungeon = markerMap?.type === MapType.DUNGEON;
        const html = `
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center whitespace-nowrap marker tracking-wide font-myriad-cond text-lg">
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
        if (!map.markers) return;
        const updatedMarkers = map.markers.map((m, i) =>
            i === idx ? { ...m, latLng: newLatLng } : m
        );
        if (onMarkersChange) {
            onMarkersChange(updatedMarkers);
        }
    }

    // Handler for subarea click
    function handleSubAreaClick(subAreaId: string) {
        if (changeMapOnMarkerClickEnabled && onMarkerClick && subAreaId) {
            onMarkerClick(subAreaId);
        }
    }

    return (
        <div className="flex flex-col items-center gap-10 z-1000">
            <div className="flex flex-col gap-2">
                <button
                    className="p-2 bg-white border rounded shadow"
                    onClick={() => setShowPolygonsEditor(v => !v)}
                >
                    {showPolygonsEditor ? "Masquer l'éditeur de polygones" : "Afficher l'éditeur de polygones"}
                </button>
                <button
                    className={`p-2 border rounded shadow ${dragMode ? "bg-blue-200" : "bg-white"}`}
                    onClick={() => setDragMode(v => !v)}
                >
                    {dragMode ? "Désactiver le déplacement des markers" : "Activer le déplacement des markers"}
                </button>
            </div>

            <div className="border rounded aspect-square overflow-hidden w-[30rem] h-[30rem] pointer-events-auto shadow-[0px_0px_30px_black,0px_0px_30px_black] border-2 border-x-[#c0a270] border-y-[#e0c290] rounded-xl">
                <MapContainer
                    center={[0, 0]}
                    zoom={1}
                    className="h-full w-full"
                    crs={L.CRS.Simple}
                >
                    <SubAreaControl
                        form={map}
                        maps={maps}
                        onSubAreaClick={handleSubAreaClick}
                    />
                    {map.imagePath && <ImageOverlay url={imageUrl} bounds={bounds} />}
                    <PolygonsEditor visible={showPolygonsEditor} />

                    {map.markers?.map((marker, idx) => (
                        <React.Fragment key={idx}>
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
                                        if (changeMapOnMarkerClickEnabled && onMarkerClick && marker.target) {
                                            onMarkerClick(marker.target);
                                        }
                                    },
                                }}
                            />
                            {marker.geojson?.area && (
                                <Polygon
                                    positions={marker.geojson.area}
                                    pathOptions={{
                                        stroke: false,
                                        fillOpacity: hoveredIdx === idx ? 0.15 : 0,
                                        fillColor: "white",
                                    }}
                                />
                            )}
                            {marker.geojson?.hitbox && (
                                <Polygon
                                    positions={marker.geojson.hitbox}
                                    pathOptions={{
                                        color: "transparent",
                                        fillOpacity: 0,
                                    }}
                                    eventHandlers={{
                                        mouseover: () => setHoveredIdx(idx),
                                        mouseout: () => setHoveredIdx(null),
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
