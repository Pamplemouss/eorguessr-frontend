"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const PolygonsEditor = ({ visible }: { visible: boolean }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        if (visible) {
            (map as any).pm.addControls({ position: "topleft" });
        } else {
            (map as any).pm.removeControls();
        }

        // Cleanup on unmount
        return () => {
            (map as any).pm.removeControls();
        };
    }, [map, visible]);

    useEffect(() => {
        if (!map || !visible) return;

        const handleCreate = (e: any) => {
            if (e.shape === "Polygon") {
                const latlngs = e.layer.getLatLngs();
                const polygon: any[] = [];

                if (Array.isArray(latlngs[0])) {
                    latlngs[0].forEach((latlng: any) => {
                        polygon.push([latlng.lat, latlng.lng]);
                    });
                }

                console.log("Polygon créé : " + JSON.stringify(polygon));
            } else if (e.shape === "Circle") {
                const center = e.layer.getLatLng();
                console.log("Cercle créé, centre : " + JSON.stringify([center.lat, center.lng]));
            }
        };

        map.on("pm:create", handleCreate);

        return () => {
            map.off("pm:create", handleCreate);
        };
    }, [map, visible]);

    return null;
};

export default PolygonsEditor;
