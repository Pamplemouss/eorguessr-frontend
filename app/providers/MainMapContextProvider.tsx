"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Map } from "@/lib/types/Map";
import { createEmptyMap } from "@/lib/utils/createEmptyMap";

interface MainMapContextType {
    allMaps: Map[];
    currentMap: Map;
    isLoading: boolean;
    error: string | null;
    setCurrentMapById: (mapId: string | null) => void;
    setCurrentMap: (map: Map) => void;
    refreshMaps: () => Promise<void>;
    saveMap: (map: Partial<Map>) => Promise<Map>;
    deleteMap: (mapId: string) => Promise<void>;
}

const MainMapContext = createContext<MainMapContextType>({
    allMaps: [],
    currentMap: {} as Map,
    isLoading: false,
    error: null,
    setCurrentMapById: () => { },
    setCurrentMap: () => { },
    refreshMaps: async () => { },
    saveMap: async () => ({} as Map),
    deleteMap: async () => { },
});

export function MainMapProvider({ children }: { children: ReactNode }) {
    const [allMaps, setAllMaps] = useState<Map[]>([]);
    const [currentMap, setCurrentMap] = useState<Map>(createEmptyMap());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        const foundMap = allMaps.find(map => map.id === mapId);
        if (foundMap) {
            setCurrentMap(foundMap);
        }
    };

    const refreshMaps = async () => {
        await fetchMaps();
    };

    const saveMap = async (mapData: Partial<Map>): Promise<Map> => {
        if (!mapData.name) {
            throw new Error("Map name is required");
        }

        setIsLoading(true);
        setError(null);

        try {
            // Ensure region is set for REGION maps
            let formToSave = { ...mapData };
            if (formToSave.type === "REGION") {
                formToSave.region = formToSave.id;
            }

            // Ensure specialBounds is undefined if not a WORLD_MAP
            if (formToSave.type !== "WORLD_MAP") {
                formToSave.specialBounds = undefined;
            }

            const url = formToSave.id ? `/api/maps/${formToSave.id}` : "/api/maps";
            const method = formToSave.id ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formToSave),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save map: ${response.statusText}`);
            }

            const savedMap = await response.json();

            // Update maps list
            if (formToSave.id) {
                // Update existing map
                setAllMaps(prevMaps => 
                    prevMaps.map(map => map.id === savedMap.id ? savedMap : map)
                );
            } else {
                // Add new map
                setAllMaps(prevMaps => [...prevMaps, savedMap]);
            }

            // Update current map if it's the one being saved
            if (currentMap.id === savedMap.id || !formToSave.id) {
                setCurrentMap(savedMap);
            }

            return savedMap;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to save map";
            setError(errorMessage);
            console.error("Error saving map:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMap = async (mapId: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/maps/${mapId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete map: ${response.statusText}`);
            }

            // Remove map from list
            setAllMaps(prevMaps => prevMaps.filter(map => map.id !== mapId));

            // Clear current map if it's the deleted one
            if (currentMap?.id === mapId) {
                setCurrentMap(createEmptyMap());
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete map";
            setError(errorMessage);
            console.error("Error deleting map:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch maps on mount
    useEffect(() => {
        fetchMaps();
    }, []);

    // Ensure currentMap is always set
    useEffect(() => {
        if (!currentMap || !currentMap.id) {
            setCurrentMap(createEmptyMap());
        }
    }, [currentMap]);

    return (
        <MainMapContext.Provider
            value={{
                allMaps,
                currentMap,
                isLoading,
                error,
                setCurrentMapById,
                setCurrentMap,
                refreshMaps,
                saveMap,
                deleteMap,
            }}
        >
            {children}
        </MainMapContext.Provider>
    );
}

export function useMainMap(): MainMapContextType {
    return useContext(MainMapContext);
}