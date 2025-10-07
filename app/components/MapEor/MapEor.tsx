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
import MapMouseTracker from "./MapMouseTracker";
import getBoundsFromMap from "@/lib/utils/getBoundsFromMap";

export default function MapEor({
    showPolygonsEditor = false,
    dragMode = false,
}: {
    showPolygonsEditor?: boolean;
    dragMode?: boolean;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const { currentMap } = useMap();

    const bounds = getBoundsFromMap(currentMap);

    const boundsArray = Array.isArray(bounds) ? bounds : [bounds.getSouthWest(), bounds.getNorthEast()];
    const toLatLngTuple = (latLng: L.LatLng | L.LatLngTuple): [number, number] =>
        Array.isArray(latLng)
            ? [latLng[0], latLng[1]]
            : [latLng.lat, latLng.lng];

    const southWest = toLatLngTuple(boundsArray[0]);
    const northEast = toLatLngTuple(boundsArray[1]);

    const maxBounds: L.LatLngBoundsExpression = [
        [southWest[0] - 30, southWest[1] - 30],
        [northEast[0] + 30, northEast[1] + 30],
    ];

    const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
    const imageUrl = `${baseUrl}/maps/${currentMap.imagePath}`;

    return (
        <div className="aspect-square overflow-hidden w-[30rem] h-[30rem] pointer-events-auto shadow-[0px_0px_30px_black,0px_0px_30px_black] border-2 border-x-[#c0a270] border-y-[#e0c290] rounded-lg relative">
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_20px_rgba(0,0,0,0.5)] rounded z-[1000]"></div>
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
                <MapMouseTracker />
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
