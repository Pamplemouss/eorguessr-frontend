"use client";

import React from "react";
import MapEor from "./MapEor";
import { useMainMap } from "@/app/providers/MainMapContextProvider";
import { Marker, Circle } from "react-leaflet";
import L from "leaflet";
import getBoundsFromMap from "@/lib/utils/getBoundsFromMap";
import { RoundResult } from "@/lib/types/common/GameState";

interface RecapMapEorProps {
    roundResult: RoundResult;
    fixed?: boolean;
}

// Create icons for different elements
const createPhotosphereIcon = () => {
    return L.divIcon({
        html: `<div style="
            width: 32px; 
            height: 32px; 
            background-color: #22c55e; 
            border: 4px solid white; 
            border-radius: 50%; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
        ">✓</div>`,
        className: 'photosphere-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

const createPlayerIcon = (playerName: string, color: string) => {
    return L.divIcon({
        html: `<div style="
            width: 24px; 
            height: 24px; 
            background-color: ${color}; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
        ">${playerName.charAt(0).toUpperCase()}</div>`,
        className: 'player-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

export default function RecapMapEor({ roundResult, fixed = false }: RecapMapEorProps) {
    const { allMaps } = useMainMap();
    
    // Find the map that corresponds to the photosphere
    const photosphereMap = allMaps.find(map => map.id === roundResult.photosphere.mapId);
    
    if (!photosphereMap) {
        return (
            <div className="text-center py-8 text-gray-500">
                Carte non trouvée pour cette photosphère
            </div>
        );
    }

    // Convert real coordinates to leaflet coordinates
    const getLeafletCoords = (realX: number, realY: number) => {
        if (!photosphereMap.size) return null;
        
        const bounds = getBoundsFromMap(photosphereMap) as [[number, number], [number, number]];
        
        const leafletMapXSize = bounds[1][1] - bounds[0][1];
        const leafletMapYSize = bounds[1][0] - bounds[0][0];
        const eorMapXSize = photosphereMap.size.x - 1;
        const eorMapYSize = photosphereMap.size.y - 1;

        const scaleX = eorMapXSize / leafletMapXSize;
        const scaleY = eorMapYSize / leafletMapYSize;

        // Reverse the coordinate transformation
        const leafletLng = (realX - 1) / scaleX - leafletMapXSize / 2;
        const leafletLat = -((realY - 1) / scaleY - leafletMapYSize / 2);

        return [leafletLat, leafletLng] as [number, number];
    };

    // Get photosphere position
    const photosphereCoords = getLeafletCoords(
        roundResult.photosphere.coord.x,
        roundResult.photosphere.coord.y
    );

    // Player colors for differentiation
    const playerColors = [
        '#ef4444', '#3b82f6', '#f59e0b', '#10b981', 
        '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
    ];

    // Create markers for all players who guessed on this map
    const playerMarkers: React.ReactNode[] = [];
    let colorIndex = 0;

    Array.from(roundResult.playerResults.entries()).forEach(([sessionId, player]) => {
        const guess = player.guesses.get(roundResult.roundNumber.toString());
        
        if (guess && guess.mapId === roundResult.photosphere.mapId) {
            const playerCoords = getLeafletCoords(guess.x, guess.y);
            
            if (playerCoords) {
                playerMarkers.push(
                    <Marker
                        key={`player-${sessionId}`}
                        position={playerCoords}
                        icon={createPlayerIcon(player.name, playerColors[colorIndex % playerColors.length])}
                        zIndexOffset={100}
                    />
                );
                colorIndex++;
            }
        }
    });

    // Create all custom markers
    const customMarkers = photosphereCoords ? (
        <>
            {/* Photosphere marker */}
            <Marker
                key="photosphere"
                position={photosphereCoords}
                icon={createPhotosphereIcon()}
                zIndexOffset={200}
            />
            
            {/* Scoring circle with radius 0.5 */}
            <Circle
                key="scoring-circle"
                center={photosphereCoords}
                radius={0.5}
                pathOptions={{
                    color: '#22c55e',
                    weight: 2,
                    opacity: 0.8,
                    fillColor: '#22c55e',
                    fillOpacity: 0.1,
                }}
            />
            
            {/* Player markers */}
            {playerMarkers}
        </>
    ) : null;

    return (
        <div className="relative">
            <MapEor
                currentMap={photosphereMap}
                allMaps={[photosphereMap]} // Only show this map
                showMapDetails={true}
                changeMapEnabled={false}
                fixed={fixed}
                customMarkers={customMarkers}
            />
            
            {/* Legend */}
            <div className="absolute top-4 left-4 z-[1001] bg-white rounded-lg shadow-lg p-3 max-w-xs">
                <h4 className="font-semibold mb-2 text-sm">Légende</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">✓</div>
                        <span>Position correcte</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                        <span>Suppositions des joueurs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 border border-green-500 bg-green-100"></div>
                        <span>Zone de bonus (+2 pts)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}