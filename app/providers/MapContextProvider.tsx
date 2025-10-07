"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Map } from "@/lib/types/Map";
import { createEmptyMap } from "@/lib/utils/createEmptyMap";

interface MapContextType {
    maps: Map[];
    currentMap: Map;
    isLoading: boolean;
    error: string | null;
    setCurrentMapById: (mapId: string | null) => void;
    refreshMaps: () => Promise<void>;
    saveMap: (map: Partial<Map>) => Promise<Map>;
    setCurrentMap: (map: Map) => void;
    deleteMap: (mapId: string) => Promise<void>;
    changeMapEnabled: boolean;
    setChangeMapEnabled: (enabled: boolean) => void;
}

const MapContext = createContext<MapContextType>({
    maps: [],
    currentMap: {} as Map,
    isLoading: false,
    error: null,
    setCurrentMapById: () => { },
    refreshMaps: async () => { },
    setCurrentMap: (map) => { },
    saveMap: async () => ({} as Map),
    deleteMap: async () => { },
    changeMapEnabled: true,
    setChangeMapEnabled: () => { },
});

export function MapProvider({ children }: { children: ReactNode }) {
    const [maps, setMaps] = useState<Map[]>([]);
    const [currentMap, setCurrentMap] = useState<Map>(createEmptyMap());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [changeMapEnabled, setChangeMapEnabled] = useState(true);

    const fetchMaps = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/maps");
            if (!response.ok) {
                throw new Error(`Failed to fetch maps: ${response.statusText}`);
            }

            const data = await response.json();
            setMaps(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
            setError(errorMessage);
            console.error("Error fetching maps:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const setCurrentMapById = (mapId: string | null) => {
        const foundMap = maps.find(map => map.id === mapId);
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
            // Ensure region is set for REGION maps (same logic as in page.tsx)
            let formToSave = { ...mapData };
            if (formToSave.type === "REGION") {
                formToSave.region = formToSave.id;
            }

            // Ensure specialBounds is null if not a WORLD_MAP
            if (formToSave.type !== "WORLD_MAP") {
                formToSave.specialBounds = undefined;
            }

            const response = await fetch(`/api/maps/${formToSave.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formToSave),
            });

            if (!response.ok) {
                throw new Error(`Failed to update map: ${response.statusText}`);
            }

            const savedMap = await response.json();

            // Update maps array
            const existingMapIndex = maps.findIndex(m => m.id === savedMap.id);
            if (existingMapIndex >= 0) {
                // Update existing map
                setMaps(maps.map(m => m.id === savedMap.id ? savedMap : m));
            } else {
                // Add new map
                setMaps([...maps, savedMap]);
            }

            // Update current map if it's the same one
            if (currentMap?.id === savedMap.id) {
                setCurrentMap(savedMap);
            }

            return savedMap;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update map";
            setError(errorMessage);
            console.error("Error updating map:", err);
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
                throw new Error(`Failed to delete map: ${response.statusText}`);
            }

            // Remove map from array
            setMaps(maps.filter(m => m.id !== mapId));

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

    useEffect(() => {
        if (!currentMap) {
            setCurrentMap(createEmptyMap());
        }
    }, [currentMap, setCurrentMap]);

    return (
        <MapContext.Provider
            value={{
                maps,
                currentMap,
                isLoading,
                error,
                setCurrentMapById,
                refreshMaps,
                setCurrentMap,
                saveMap,
                deleteMap,
                changeMapEnabled,
                setChangeMapEnabled,
            }}
        >
            {children}
        </MapContext.Provider>
    );
}

export function useMap(): MapContextType {
    return useContext(MapContext);
}