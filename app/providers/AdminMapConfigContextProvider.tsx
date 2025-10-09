"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Expansion } from "@/lib/types/Expansion";
import { MapType } from "@/lib/types/MapType";

type AdminMapConfigContextType = {
    selectedExpansions: Expansion[];
    setSelectedExpansions: (expansions: Expansion[]) => void;
    toggleExpansion: (expansion: Expansion) => void;
    selectedMapTypes: MapType[];
    setSelectedMapTypes: (mapTypes: MapType[]) => void;
    toggleMapType: (mapType: MapType) => void;
};

const AdminMapConfigContext = createContext<AdminMapConfigContextType>({
    selectedExpansions: [],
    setSelectedExpansions: () => {},
    toggleExpansion: () => {},
    selectedMapTypes: [],
    setSelectedMapTypes: () => {},
    toggleMapType: () => {},
});

export function AdminMapConfigProvider({ children }: { children: ReactNode }) {
    const [selectedExpansions, setSelectedExpansionsState] = useState<Expansion[]>([]);
    const [selectedMapTypes, setSelectedMapTypesState] = useState<MapType[]>([]);

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

    return (
        <AdminMapConfigContext.Provider value={{ 
            selectedExpansions, 
            setSelectedExpansions, 
            toggleExpansion,
            selectedMapTypes,
            setSelectedMapTypes,
            toggleMapType
        }}>
            {children}
        </AdminMapConfigContext.Provider>
    );
}

export function useAdminMapConfig(): AdminMapConfigContextType {
    return useContext(AdminMapConfigContext);
}