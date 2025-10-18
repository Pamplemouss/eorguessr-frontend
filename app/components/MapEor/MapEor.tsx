"use client";

import { MapContainer, Polygon, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import React, { useState } from "react";
import { useGameMap } from "@/app/providers/GameMapContextProvider";
import { useMap } from "@/app/providers/MapContextProvider";
import MapControl from "./MapControl";
import SubAreaControl from "./SubAreaControl";
import PolygonsEditor from "./PolygonsEditor";
import MapMarker from "./MapMarker";
import MapMouseTracker from "./MapMouseTracker";
import getBoundsFromMap from "@/lib/utils/getBoundsFromMap";
import getCenterFromMap from "@/lib/utils/getCenterFromMap";
import getZoomFromMap from "@/lib/utils/getZoomFromMap";

export default function MapEor({
    showPolygonsEditor = false,
    dragMode = false,
    fixed = false,
    useGameContext = false,
}: {
    showPolygonsEditor?: boolean;
    dragMode?: boolean;
    fixed?: boolean;
    useGameContext?: boolean;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    
    // Use the appropriate context based on the prop
    const gameContext = useGameContext ? useGameMap() : null;
    const adminContext = !useGameContext ? useMap() : null;
    
    const currentMap = useGameContext ? gameContext!.currentMap : adminContext!.currentMap;

    const bounds = getBoundsFromMap(currentMap);

    const boundsArray = Array.isArray(bounds) ? bounds : [bounds.getSouthWest(), bounds.getNorthEast()];
    const toLatLngTuple = (latLng: L.LatLng | L.LatLngTuple): [number, number] =>
        Array.isArray(latLng)
            ? [latLng[0], latLng[1]]
            : [latLng.lat, latLng.lng];

    const southWest = toLatLngTuple(boundsArray[0]);
    const northEast = toLatLngTuple(boundsArray[1]);

    const center = getCenterFromMap(currentMap);
    const zoom = getZoomFromMap(currentMap);

    const offset = 50
    const maxBounds: L.LatLngBoundsExpression = [
        [southWest[0] - offset, southWest[1] - offset],
        [northEast[0] + offset, northEast[1] + offset],
    ];

    const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
    const imageUrl = `${baseUrl}/maps/${currentMap.imagePath}`;

    const baseClasses = "aspect-square overflow-hidden w-[30rem] h-[30rem] pointer-events-auto shadow-[0px_0px_30px_black,0px_0px_30px_black] border-2 border-x-[#c0a270] border-y-[#e0c290] rounded-lg";
    const positionClasses = fixed ? "fixed bottom-4 right-4 z-50" : "relative";

    return (
        <div className={`${baseClasses} ${positionClasses}`}>
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_rgba(0,0,0,0.5)] rounded z-[1000]"></div>
            <MapContainer
                maxBounds={maxBounds}
                center={center}
                className="h-full w-full"
                crs={L.CRS.Simple}
                key={currentMap.id}
                attributionControl={false}
                zoomControl={false}
                scrollWheelZoom={true}
                doubleClickZoom={false}
                zoomSnap={0.1}
                zoom={zoom}
                minZoom={1}
                maxZoom={5}
            >
                <MapMouseTracker />
                <MapControl useGameContext={useGameContext} />
                <SubAreaControl useGameContext={useGameContext} />
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
            <div
                className="absolute top-0 left-0 w-full h-full z-10 bg-black/80 backdrop-blur pointer-events-none"
            ></div>
        </div>
    );
}
