"use client";

import React from "react";
import { MapType } from "@/lib/types/MapType";
import { useAdminMapConfig } from "@/app/providers/AdminMapConfigContextProvider";

const AdminMapTypeSelector = () => {
    const { selectedMapTypes, toggleMapType, setSelectedMapTypes } = useAdminMapConfig();

    const mapTypeLabels: Record<MapType, string> = {
        [MapType.WORLD_MAP]: "World Map",
        [MapType.REGION]: "Region",
        [MapType.MAP]: "Map",
        [MapType.DUNGEON]: "Dungeon",
    };

    const handleSelectAll = () => {
        setSelectedMapTypes(Object.values(MapType));
    };

    const handleSelectNone = () => {
        setSelectedMapTypes([]);
    };

    return (
        <div className="border p-4 rounded max-w-md">
            <h3 className="text-lg font-semibold mb-3">Filter by Map Types</h3>
            
            <div className="flex gap-2 mb-3">
                <button
                    onClick={handleSelectAll}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Select All
                </button>
                <button
                    onClick={handleSelectNone}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Select None
                </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {Object.values(MapType).map((mapType) => (
                    <label
                        key={mapType}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                        <input
                            type="checkbox"
                            checked={selectedMapTypes.includes(mapType)}
                            onChange={() => toggleMapType(mapType)}
                            className="rounded"
                        />
                        <span className="text-sm">
                            {mapTypeLabels[mapType]}
                        </span>
                    </label>
                ))}
            </div>

            <div className="mt-3 text-xs text-gray-600">
                Selected: {selectedMapTypes.length} / {Object.values(MapType).length}
            </div>
        </div>
    );
};

export default AdminMapTypeSelector;