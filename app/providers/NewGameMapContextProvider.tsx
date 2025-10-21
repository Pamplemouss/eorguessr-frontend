"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Map } from "@/lib/types/Map";
import { createEmptyMap } from "@/lib/utils/createEmptyMap";
import useGameFilterMaps from "@/lib/utils/useGameFilterMaps";
import { useGame } from "./GameContextProvider";
import { useMainMap } from "./MainMapContextProvider";

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
    const mainMapContext = useMainMap();
    const { gameState } = useGame();
    const [currentMap, setCurrentMap] = useState<Map>(createEmptyMap());

    // Get filtered maps based on game state selections
    const selectedExpansions = gameState?.selectedExpansions ? Array.from(gameState.selectedExpansions) : [];
    const selectedMapTypes = gameState?.selectedMapTypes ? Array.from(gameState.selectedMapTypes) : [];
    
    const availableMaps = useGameFilterMaps(mainMapContext.allMaps, selectedExpansions, selectedMapTypes);

    const setCurrentMapById = (mapId: string | null) => {
        const foundMap = availableMaps.find(map => map.id === mapId);
        if (foundMap) {
            setCurrentMap(foundMap);
        }
    };

    // Auto-select the first available map when maps change, but allow free navigation
    useEffect(() => {
        if (availableMaps.length > 0 && (!currentMap?.id || !availableMaps.find(m => m.id === currentMap.id))) {
            // Just select the first available map, don't restrict to photosphere map
            setCurrentMap(availableMaps[0]);
        }
    }, [availableMaps, currentMap]);

    return (
        <GameMapContext.Provider
            value={{
                availableMaps,
                currentMap,
                isLoading: mainMapContext.isLoading,
                error: mainMapContext.error,
                setCurrentMapById,
                refreshMaps: mainMapContext.refreshMaps,
            }}
        >
            {children}
        </GameMapContext.Provider>
    );
}

export function useGameMap(): GameMapContextType {
    return useContext(GameMapContext);
}