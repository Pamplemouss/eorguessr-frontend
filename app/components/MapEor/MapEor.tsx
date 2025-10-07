"use client";

import { MapContainer, Polygon, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useState } from "react";
import { useMap } from "@/app/providers/MapContextProvider";
import MapControl from "./MapControl";
import SubAreaControl from "./SubAreaControl";
import PolygonsEditor from "./PolygonsEditor";
import MapMarker from "./MapMarker";

export default function MapEor({
    showPolygonsEditor = false,
    dragMode = false,
}: {
    showPolygonsEditor?: boolean;
    dragMode?: boolean;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const { currentMap } = useMap();

    const defaultBounds: L.LatLngBoundsExpression = [[-119.5, -119.5], [119.5, 119.5]];

    const specialBounds: Record<string, L.LatLngBoundsExpression> = {
        "d05cc1fd-77f8-45d8-935a-8948e4c336f0": [[-110, -258], [110, 258]], // The Source
        "24dafd75-1150-4a15-b2cc-31a9d3f1e228": [[-110, -196], [110, 196]], // The First
    };

    const bounds =
        currentMap.id && specialBounds[currentMap.id] ? specialBounds[currentMap.id] : defaultBounds;

    // Calculate maxBounds as bounds + 30 on each side
    const boundsArray = Array.isArray(bounds) ? bounds : [bounds.getSouthWest(), bounds.getNorthEast()];
    // Ensure southWest and northEast are always LatLngTuple (array of [number, number])
    const toLatLngTuple = (latLng: L.LatLng | L.LatLngTuple): [number, number] =>
        Array.isArray(latLng)
            ? [latLng[0], latLng[1]]
            : [latLng.lat, latLng.lng];

    const southWest = toLatLngTuple(boundsArray[0]);
    const northEast = toLatLngTuple(boundsArray[1]);

    const maxBounds: L.LatLngBoundsExpression = [
        [southWest[0] - 30, southWest[1] - 30], // Southwest corner - 30
        [northEast[0] + 30, northEast[1] + 30]   // Northeast corner + 30
    ];

    const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
    const imageUrl = `${baseUrl}/maps/${currentMap.imagePath}`;

    return (
        <div className="border rounded aspect-square overflow-hidden w-[30rem] h-[30rem] pointer-events-auto shadow-[0px_0px_30px_black,0px_0px_30px_black] border-2 border-x-[#c0a270] border-y-[#e0c290] rounded-xl relative">
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_rgba(0,0,0,0.5)] rounded-lg z-[1000]"></div>
            <MapContainer
                maxBounds={maxBounds}
                center={[0, 0]}
                className="h-full w-full"
                crs={L.CRS.Simple}
                key={currentMap.id}
                attributionControl={false}
                zoomControl={false}
                scrollWheelZoom={true}
                doubleClickZoom={false}
                zoomSnap={0.1}
                zoom={1}
                minZoom={1}
                maxZoom={5}
            >
                <MapControl />
                <SubAreaControl />
                {currentMap.imagePath && <ImageOverlay url={imageUrl} bounds={bounds} />}
                <PolygonsEditor visible={showPolygonsEditor} />
                {currentMap.markers?.map((marker, idx) => (
                    <React.Fragment key={idx}>
                        <MapMarker
                            marker={marker}
                            hoveredIdx={hoveredIdx}
                            setHoveredIdx={setHoveredIdx}
                            dragMode={dragMode}
                            idx={idx}
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
    );
}
