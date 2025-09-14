"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const PolygonsEditor = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Ajoute les contrôles Geoman
        (map as any).pm.addControls({
            position: "topleft",
            drawCircle: false,
        });

        // Événement création de polygone/marker
        map.on("pm:create", (e: any) => {
            const latlngs = e.layer.getLatLngs();
            const polygon: any[] = [];

            // Convertit en format [lng, lat]
            if (Array.isArray(latlngs[0])) {
                latlngs[0].forEach((latlng: any) => {
                    polygon.push([latlng.lng, latlng.lat]);
                });
            }

            alert("Polygon créé : " + JSON.stringify(polygon));
        });
    }, [map]);

    return null; // rien à afficher, c'est juste un hook qui étend la map
};

export default PolygonsEditor;
