"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Map } from "@/lib/types/Map";
import { createEmptyMap } from "@/lib/utils/createEmptyMap";
import useGameFilterMaps from "@/lib/utils/useGameFilterMaps";
import { useGame } from "./GameContextProvider";

interface GameMapContextType {
    availableMaps: Map[];
    currentMap: Map;
    isLoading: boolean;
    error: string | null;
    setCurrentMapById: (mapId: string | null) => void;
    refreshMaps: () => Promise<void>;
}

const GameMapContext = createContext<GameMapContextType>({
    availableMaps: [],
    currentMap: {} as Map,
    isLoading: false,
    error: null,
    setCurrentMapById: () => { },
    refreshMaps: async () => { },
});

export function GameMapProvider({ children }: { children: ReactNode }) {
    const [allMaps, setAllMaps] = useState<Map[]>([]);
    const [currentMap, setCurrentMap] = useState<Map>(createEmptyMap());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { gameState } = useGame();

    // Get filtered maps based on game state selections
    const selectedExpansions = gameState?.selectedExpansions ? Array.from(gameState.selectedExpansions) : [];
    const selectedMapTypes = gameState?.selectedMapTypes ? Array.from(gameState.selectedMapTypes) : [];
    
    const availableMaps = useGameFilterMaps(allMaps, selectedExpansions, selectedMapTypes);

    const fetchMaps = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/maps");
            if (!response.ok) {
                throw new Error(`Failed to fetch maps: ${response.statusText}`);
            }

            const data = await response.json();
            setAllMaps(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
            setError(errorMessage);
            console.error("Error fetching maps:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const setCurrentMapById = (mapId: string | null) => {
        const foundMap = availableMaps.find(map => map.id === mapId);
        if (foundMap) {
            setCurrentMap(foundMap);
        }
    };

    const refreshMaps = async () => {
        await fetchMaps();
    };

    // Fetch maps on mount
    useEffect(() => {
        fetchMaps();
    }, []);

    // Auto-select the first world map when available maps change
    useEffect(() => {
        if (availableMaps.length > 0 && (!currentMap?.id || !availableMaps.find(m => m.id === currentMap.id))) {
            // Find the first world map, or fallback to first map
            const firstWorldMap = availableMaps.find(m => m.type === 'WORLD_MAP');
            const mapToSelect = firstWorldMap || availableMaps[0];
            setCurrentMap(mapToSelect);
        }
    }, [availableMaps, currentMap]);

    return (
        <GameMapContext.Provider
            value={{
                availableMaps,
                currentMap,
                isLoading,
                error,
                setCurrentMapById,
                refreshMaps,
            }}
        >
            {children}
        </GameMapContext.Provider>
    );
}

export function useGameMap(): GameMapContextType {
    return useContext(GameMapContext);
}