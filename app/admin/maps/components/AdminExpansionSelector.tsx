"use client";

import React from "react";
import { Expansion } from "@/lib/types/Expansion";
import { useAdminMapConfig } from "@/app/providers/AdminMapConfigContextProvider";

const AdminExpansionSelector = () => {
    const { selectedExpansions, toggleExpansion, setSelectedExpansions } = useAdminMapConfig();

    const expansionLabels: Record<Expansion, string> = {
        [Expansion.ARR]: "A Realm Reborn",
        [Expansion.HW]: "Heavensward",
        [Expansion.SB]: "Stormblood",
        [Expansion.ShB]: "Shadowbringers",
        [Expansion.EW]: "Endwalker",
        [Expansion.DT]: "Dawntrail",
    };

    const handleSelectAll = () => {
        setSelectedExpansions(Object.values(Expansion));
    };

    const handleSelectNone = () => {
        setSelectedExpansions([]);
    };

    return (
        <div className="border p-4 rounded max-w-md">
            <h3 className="text-lg font-semibold mb-3">Filter by Expansions</h3>
            
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
                {Object.values(Expansion).map((expansion) => (
                    <label
                        key={expansion}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                        <input
                            type="checkbox"
                            checked={selectedExpansions.includes(expansion)}
                            onChange={() => toggleExpansion(expansion)}
                            className="rounded"
                        />
                        <span className="text-sm">
                            {expansionLabels[expansion]} ({expansion})
                        </span>
                    </label>
                ))}
            </div>

            <div className="mt-3 text-xs text-gray-600">
                Selected: {selectedExpansions.length} / {Object.values(Expansion).length}
            </div>
        </div>
    );
};

export default AdminExpansionSelector;