"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Map } from "@/lib/types/Map";
import { Expansion } from "@/lib/types/Expansion";
import { MapType } from "@/lib/types/MapType";
import { useMainMap } from "./MainMapContextProvider";
import useFilterMaps from "@/lib/utils/useFilterMaps";

interface AdminContextType {
    // Map-related (filtered based on admin selections)
    filteredMaps: Map[];
    maps: Map[]; // Alias for filteredMaps for backward compatibility
    currentMap: Map;
    isLoading: boolean;
    error: string | null;
    setCurrentMapById: (mapId: string | null) => void;
    setCurrentMap: (map: Map) => void;
    refreshMaps: () => Promise<void>;
    saveMap: (map: Partial<Map>) => Promise<Map>;
    deleteMap: (mapId: string) => Promise<void>;
    
    // Admin UI states
    changeMapEnabled: boolean;
    setChangeMapEnabled: (enabled: boolean) => void;
    showMapDetails: boolean;
    setShowMapDetails: (show: boolean) => void;
    
    // Map filtering (integrated from AdminMapConfigProvider)
    selectedExpansions: Expansion[];
    setSelectedExpansions: (expansions: Expansion[]) => void;
    toggleExpansion: (expansion: Expansion) => void;
    selectedMapTypes: MapType[];
    setSelectedMapTypes: (mapTypes: MapType[]) => void;
    toggleMapType: (mapType: MapType) => void;
}

const AdminContext = createContext<AdminContextType>({
    // Map-related
    filteredMaps: [],
    maps: [], // Alias for filteredMaps
    currentMap: {} as Map,
    isLoading: false,
    error: null,
    setCurrentMapById: () => { },
    setCurrentMap: () => { },
    refreshMaps: async () => { },
    saveMap: async () => ({} as Map),
    deleteMap: async () => { },
    
    // Admin UI states
    changeMapEnabled: true,
    setChangeMapEnabled: () => { },
    showMapDetails: true,
    setShowMapDetails: () => { },
    
    // Map filtering
    selectedExpansions: [],
    setSelectedExpansions: () => {},
    toggleExpansion: () => {},
    selectedMapTypes: [],
    setSelectedMapTypes: () => {},
    toggleMapType: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
    // Use the main map context
    const mainMapContext = useMainMap();
    
    // Admin UI states
    const [changeMapEnabled, setChangeMapEnabled] = useState(true); // Always enabled by default
    const [showMapDetails, setShowMapDetails] = useState(true);
    
    // Map filtering states (integrated from AdminMapConfigProvider)
    const [selectedExpansions, setSelectedExpansionsState] = useState<Expansion[]>([]);
    const [selectedMapTypes, setSelectedMapTypesState] = useState<MapType[]>([]);

    // Load filtering preferences from localStorage
    useEffect(() => {
        // Load expansions from localStorage
        const storedExpansions = localStorage.getItem("selectedExpansions");
        if (storedExpansions) {
            try {
                const parsed = JSON.parse(storedExpansions);
                setSelectedExpansionsState(parsed);
            } catch (error) {
                console.error("Failed to parse stored expansions:", error);
            }
        }

        // Load map types from localStorage
        const storedMapTypes = localStorage.getItem("selectedMapTypes");
        if (storedMapTypes) {
            try {
                const parsed = JSON.parse(storedMapTypes);
                setSelectedMapTypesState(parsed);
            } catch (error) {
                console.error("Failed to parse stored map types:", error);
            }
        }
    }, []);

    const setSelectedExpansions = (expansions: Expansion[]) => {
        setSelectedExpansionsState(expansions);
        localStorage.setItem("selectedExpansions", JSON.stringify(expansions));
    };

    const toggleExpansion = (expansion: Expansion) => {
        const newExpansions = selectedExpansions.includes(expansion)
            ? selectedExpansions.filter(exp => exp !== expansion)
            : [...selectedExpansions, expansion];
        
        setSelectedExpansions(newExpansions);
    };

    const setSelectedMapTypes = (mapTypes: MapType[]) => {
        setSelectedMapTypesState(mapTypes);
        localStorage.setItem("selectedMapTypes", JSON.stringify(mapTypes));
    };

    const toggleMapType = (mapType: MapType) => {
        const newMapTypes = selectedMapTypes.includes(mapType)
            ? selectedMapTypes.filter(type => type !== mapType)
            : [...selectedMapTypes, mapType];
        
        setSelectedMapTypes(newMapTypes);
    };

    // Filter maps based on admin selections
    const filteredMaps = useFilterMaps(mainMapContext.allMaps, selectedExpansions, selectedMapTypes);

    return (
        <AdminContext.Provider
            value={{
                // Map-related (filtered)
                filteredMaps,
                maps: filteredMaps, // Alias for backward compatibility
                currentMap: mainMapContext.currentMap,
                isLoading: mainMapContext.isLoading,
                error: mainMapContext.error,
                setCurrentMapById: mainMapContext.setCurrentMapById,
                setCurrentMap: mainMapContext.setCurrentMap,
                refreshMaps: mainMapContext.refreshMaps,
                saveMap: mainMapContext.saveMap,
                deleteMap: mainMapContext.deleteMap,
                
                // Admin UI states
                changeMapEnabled,
                setChangeMapEnabled,
                showMapDetails,
                setShowMapDetails,
                
                // Map filtering
                selectedExpansions,
                setSelectedExpansions,
                toggleExpansion,
                selectedMapTypes,
                setSelectedMapTypes,
                toggleMapType,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin(): AdminContextType {
    return useContext(AdminContext);
}