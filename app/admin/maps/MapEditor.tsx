"use client";
import { MapContainer, Marker, Polygon, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { IMap } from "@/lib/models/MapModel";
import React from "react";
import PolygonsEditor from "./PolygonsEditor";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapEditor({ form }: { form: Partial<IMap> }) {
    const defaultBounds: L.LatLngBoundsExpression = [[-100, -100], [100, 100]];

    const specialBounds: Record<string, L.LatLngBoundsExpression> = {
        "d05cc1fd-77f8-45d8-935a-8948e4c336f0": [[-110, -258], [110, 258]], // The Source
        "24dafd75-1150-4a15-b2cc-31a9d3f1e228": [[-110, -196], [110, 196]], // The First
    };

    const bounds = form.id && specialBounds[form.id]
        ? specialBounds[form.id]
        : defaultBounds;

    const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
    const imageUrl = `${baseUrl}/maps/${form.imagePath}`;
    

    return (
        <div className="border rounded h-[500px] aspect-square overflow-hidden w-[30rem] h-[30rem] pointer-events-auto shadow-[0px_0px_30px_black,0px_0px_30px_black] border-2 border-x-[#c0a270] border-y-[#e0c290] rounded-xl">
            <MapContainer center={[0, 0]} zoom={1} className="h-full w-full" crs={L.CRS.Simple}>
                {form.imagePath && (
                    <ImageOverlay
                        url={imageUrl}
                        bounds={bounds}
                    />
                )}
                <PolygonsEditor />

                {form.markers?.map((marker, idx) => (
                    <Marker key={idx} position={marker.latLng} />
                ))}

                {form.markers?.map((marker, idx) =>
                    marker.geojson?.area ? (
                        <Polygon
                            key={`poly-${idx}`}
                            positions={marker.geojson.area}
                            pathOptions={{ color: "blue" }}
                        />
                    ) : null
                )}
            </MapContainer>
        </div>
    );
}
