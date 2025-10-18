"use client";

import React from "react";
import { MapType } from "@/lib/types/MapType";
import { useAdminMapConfig } from "@/app/providers/AdminMapConfigContextProvider";
import { FaLayerGroup } from "react-icons/fa";

const AdminMapTypeSelector = () => {
    const { selectedMapTypes, toggleMapType, setSelectedMapTypes } = useAdminMapConfig();

    const mapTypeLabels: Record<MapType, string> = {
        [MapType.WORLD_MAP]: "World Map",
        [MapType.REGION]: "Région",
        [MapType.MAP]: "Carte",
        [MapType.DUNGEON]: "Donjon",
    };

    const handleSelectAll = () => {
        setSelectedMapTypes(Object.values(MapType));
    };

    const handleSelectNone = () => {
        setSelectedMapTypes([]);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
                <FaLayerGroup className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">Filtrer par Types de Cartes</h3>
            </div>
            
            <div className="flex gap-2 mb-3">
                <button
                    onClick={handleSelectAll}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                    Tout sélectionner
                </button>
                <button
                    onClick={handleSelectNone}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                    Aucune
                </button>
            </div>

            <div className="space-y-2 grid grid-cols-2">
                {Object.values(MapType).map((mapType) => (
                    <label
                        key={mapType}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                        <input
                            type="checkbox"
                            checked={selectedMapTypes.includes(mapType)}
                            onChange={() => toggleMapType(mapType)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                            {mapTypeLabels[mapType]}
                        </span>
                    </label>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                Sélectionnées: {selectedMapTypes.length} / {Object.values(MapType).length}
            </div>
        </div>
    );
};

export default AdminMapTypeSelector;