"use client";

import React from "react";
import { Expansion } from "@/lib/types/Expansion";
import { useAdmin } from "@/app/providers/AdminContextProvider";
import { FaGamepad } from "react-icons/fa";

const AdminExpansionSelector = () => {
    const { selectedExpansions, toggleExpansion, setSelectedExpansions } = useAdmin();

    const handleSelectAll = () => {
        setSelectedExpansions(Object.values(Expansion));
    };

    const handleSelectNone = () => {
        setSelectedExpansions([]);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
                <FaGamepad className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">Filtrer par Extensions</h3>
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

            <div className="space-y-2 max-h-48 overflow-y-auto grid grid-cols-3">
                {Object.values(Expansion).map((expansion) => (
                    <label
                        key={expansion}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                        <input
                            type="checkbox"
                            checked={selectedExpansions.includes(expansion)}
                            onChange={() => toggleExpansion(expansion)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                            {expansion}
                        </span>
                    </label>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                Sélectionnées: {selectedExpansions.length} / {Object.values(Expansion).length}
            </div>
        </div>
    );
};

export default AdminExpansionSelector;

