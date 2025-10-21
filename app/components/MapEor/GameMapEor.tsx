"use client";

import React, { useState } from "react";
import MapEor, { MapEorProps } from "./MapEor";
import { useGameMap } from "@/app/providers/NewGameMapContextProvider";
import { Marker } from "react-leaflet";
import L from "leaflet";
import getBoundsFromMap from "@/lib/utils/getBoundsFromMap";
import { MapType } from "@/lib/types/MapType";
import MapClickHandler from "./MapClickHandler";

interface GameMapEorProps extends Omit<MapEorProps, 'currentMap' | 'showMapDetails' | 'changeMapEnabled' | 'onMapChange' | 'customMarkers'> {
    onGuessSubmit?: (mapId: string, x: number, y: number) => void;
    disabled?: boolean;
    recapMarkers?: React.ReactNode;
}

// Create a custom red pin icon for guess marker
const createGuessIcon = () => {
    return L.divIcon({
        html: `<div style="
            width: 24px; 
            height: 24px; 
            background-color: #ef4444; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            position: relative;
        "><div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 12px solid #ef4444;
        "></div></div>`,
        className: 'custom-guess-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
    });
};

export default function GameMapEor(props: GameMapEorProps) {
    const { currentMap, availableMaps, setCurrentMapById } = useGameMap();
    const [showMapDetails, setShowMapDetails] = useState(true);
    const [guessPosition, setGuessPosition] = useState<{lat: number, lng: number} | null>(null);
    const [hasSubmittedGuess, setHasSubmittedGuess] = useState(false);

    const handleMapClick = (lat: number, lng: number) => {
        console.log('Map clicked at:', { lat, lng });
        setGuessPosition({ lat, lng });
    };

    const submitGuess = () => {
        if (guessPosition && props.onGuessSubmit && !props.disabled && !hasSubmittedGuess) {
            // Submit the map ID and the real coordinates
            props.onGuessSubmit(currentMap.id, guessPosition.lng, guessPosition.lat);
            setHasSubmittedGuess(true);
        }
    };

    // Reset guess when disabled changes (new round) or when map changes
    React.useEffect(() => {
        if (props.disabled) {
            setGuessPosition(null);
            setHasSubmittedGuess(false);
        }
    }, [props.disabled]);

    // Clear guess when switching maps
    React.useEffect(() => {
        if (!hasSubmittedGuess) {
            setGuessPosition(null);
        }
    }, [currentMap.id, hasSubmittedGuess]);

    // Convert real coordinates back to leaflet coordinates for display
    const getLeafletCoords = (realLat: number, realLng: number) => {
        if (!currentMap.size) return null;
        
        const bounds = getBoundsFromMap(currentMap) as [[number, number], [number, number]];
        
        const leafletMapXSize = bounds[1][1] - bounds[0][1];
        const leafletMapYSize = bounds[1][0] - bounds[0][0];
        const eorMapXSize = currentMap.size.x - 1;
        const eorMapYSize = currentMap.size.y - 1;

        const scaleX = eorMapXSize / leafletMapXSize;
        const scaleY = eorMapYSize / leafletMapYSize;

        // Reverse the coordinate transformation from MapMouseTracker
        const leafletLng = (realLng - 1) / scaleX - leafletMapXSize / 2;
        const leafletLat = -((realLat - 1) / scaleY - leafletMapYSize / 2);

        return [leafletLat, leafletLng] as [number, number];
    };

    // Create guess marker if position exists
    const guessMarker = guessPosition && !hasSubmittedGuess && currentMap.size ? (() => {
        const leafletCoords = getLeafletCoords(guessPosition.lat, guessPosition.lng);
        if (!leafletCoords) return null;
        
        return (
            <Marker 
                key="guess-marker"
                position={leafletCoords}
                icon={createGuessIcon()}
                zIndexOffset={1000}
            />
        );
    })() : null;

    // Combine guess marker with recap markers if provided
    const allMarkers = props.recapMarkers ? (
        <>
            {guessMarker}
            {props.recapMarkers}
        </>
    ) : guessMarker;

    const canPlacePin = currentMap.type === MapType.MAP || currentMap.type === MapType.DUNGEON;

    return (
        <div className="relative">
            <MapEor
                {...props}
                currentMap={currentMap}
                allMaps={availableMaps}
                showMapDetails={showMapDetails}
                onShowMapDetailsChange={setShowMapDetails}
                changeMapEnabled={true}
                onMapChange={setCurrentMapById}
                customMarkers={
                    <>
                        {allMarkers}
                        <MapClickHandler 
                            currentMap={currentMap}
                            disabled={props.disabled}
                            hasSubmittedGuess={hasSubmittedGuess}
                            onMapClick={handleMapClick}
                        />
                    </>
                }
            />
            
            {/* Pin Placement Restriction Notice */}
            {!canPlacePin && !props.disabled && (
                <div className="absolute top-4 left-4 z-[1001]">
                    <div className="px-4 py-2 bg-yellow-500 text-white rounded font-semibold shadow-lg">
                        ⚠️ Placement de marqueurs uniquement sur cartes MAP et DUNGEON
                    </div>
                </div>
            )}
            
            {/* Guess Submission Button */}
            {guessPosition && !hasSubmittedGuess && !props.disabled && (
                <div className="absolute bottom-4 left-4 z-[1001]">
                    <button
                        onClick={submitGuess}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold shadow-lg"
                    >
                        Confirmer la supposition
                    </button>
                </div>
            )}
            
            {hasSubmittedGuess && (
                <div className="absolute bottom-4 left-4 z-[1001]">
                    <div className="px-4 py-2 bg-blue-500 text-white rounded font-semibold shadow-lg">
                        ✅ Supposition envoyée
                    </div>
                </div>
            )}
        </div>
    );
}