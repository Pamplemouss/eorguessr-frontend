import { useAdminMapConfig } from '@/app/providers/AdminMapConfigContextProvider';
import { useMap } from '@/app/providers/MapContextProvider';
import { createEmptyMap } from '@/lib/utils/createEmptyMap';
import useFilterMaps from '@/lib/utils/useFilterMaps';
import React, { useState } from 'react'
import { FaPlus, FaMap } from 'react-icons/fa';

const MapList = () => {
    const { maps, currentMap, setCurrentMapById, setCurrentMap } = useMap();
    const { selectedExpansions, selectedMapTypes } = useAdminMapConfig();
    const [search, setSearch] = useState("");
    const filteredMaps = useFilterMaps(maps, selectedExpansions, selectedMapTypes)
        .filter((m) =>
            m.name?.en?.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <FaMap />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Liste des Cartes
                </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
                <input
                    placeholder="Rechercher une carte..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 p-2 rounded grow focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                    onClick={() => setCurrentMap(createEmptyMap())}
                    title="Créer une nouvelle carte"
                >
                    <FaPlus />
                </button>
            </div>
            
            {filteredMaps.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune carte trouvée.</p>
            ) : (
                <div className="max-h-[700px] overflow-y-auto">
                    <div className="space-y-2">
                        {filteredMaps.map((m) => (
                            <div
                                key={m.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                                    currentMap?.id === m.id 
                                        ? "bg-purple-50 border-purple-300" 
                                        : "border-gray-200 hover:bg-gray-50"
                                }`}
                                onClick={() => setCurrentMapById(m.id)}
                            >
                                <div className="font-semibold text-gray-900">
                                    {m.name?.en || "Sans nom"}
                                </div>
                                {m.expansion && (
                                    <div className="text-sm text-gray-500">
                                        Expansion: {m.expansion}
                                    </div>
                                )}
                                {m.type && (
                                    <div className="text-sm text-gray-500">
                                        Type: {m.type}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MapList