"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const PolygonsEditor = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;


        (map as any).pm.addControls({
            position: "topleft",
        });


        map.on("pm:create", (e: any) => {
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
        });
    }, [map]);

    return null; // rien à afficher, c'est juste un hook qui étend la map
};

export default PolygonsEditor;
