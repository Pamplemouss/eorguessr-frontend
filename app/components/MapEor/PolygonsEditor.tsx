"use client";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

const PolygonsEditor = ({ visible }: { visible: boolean }) => {
    const map = useMap();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const showNotification = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

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

        const copyToClipboard = async (text: string) => {
            try {
                await navigator.clipboard.writeText(text);
                console.log("Coordinates copied to clipboard!");
                showNotification("📋 Coordinates copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy to clipboard:", err);
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                console.log("Coordinates copied to clipboard (fallback)!");
                showNotification("📋 Coordinates copied to clipboard!");
            }
        };

        const handleCreate = (e: any) => {
            if (e.shape === "Polygon") {
                const latlngs = e.layer.getLatLngs();
                const polygon: any[] = [];

                if (Array.isArray(latlngs[0])) {
                    latlngs[0].forEach((latlng: any) => {
                        polygon.push([latlng.lat, latlng.lng]);
                    });
                }

                const polygonString = JSON.stringify(polygon);
                console.log("Polygon créé : " + polygonString);
                copyToClipboard(polygonString);
            } else if (e.shape === "Circle") {
                const center = e.layer.getLatLng();
                const circleString = JSON.stringify([center.lat, center.lng]);
                console.log("Cercle créé, centre : " + circleString);
                copyToClipboard(circleString);
            }
        };

        map.on("pm:create", handleCreate);

        return () => {
            map.off("pm:create", handleCreate);
        };
    }, [map, visible]);

    return (
        <>
            {showToast && (
                <div
                    style={{
                        position: "fixed",
                        top: "20px",
                        right: "20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: "12px 20px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        zIndex: 1000,
                        fontSize: "14px",
                        fontWeight: "500",
                        animation: "fadeInOut 2s ease-in-out",
                    }}
                >
                    {toastMessage}
                </div>
            )}
            <style jsx>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `}</style>
        </>
    );
};

export default PolygonsEditor;
