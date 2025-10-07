import { useMap } from '@/app/providers/MapContextProvider';
import { createEmptyMap } from '@/lib/utils/createEmptyMap';
import React, { useState } from 'react'

const MapList = () => {
    const { maps, currentMap, setCurrentMapById, setCurrentMap } = useMap();
    const [search, setSearch] = useState("");
    const filteredMaps = maps.filter((m) =>
        (m.name["en"] || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 w-64"
                />
                <button
                    className="bg-green-500 text-white px-4 py-2"
                    onClick={() => setCurrentMap(createEmptyMap())}
                >
                    + Créer une nouvelle map
                </button>
            </div>

            <div className="border p-2 rounded max-w-md">
                {filteredMaps.length === 0 ? (
                    <p>Aucune map trouvée.</p>
                ) : (
                    <ul>
                        {filteredMaps.map((m) => (
                            <li
                                key={m.id}
                                className={`p-2 cursor-pointer hover:bg-gray-100 ${currentMap?.id === m.id ? "bg-gray-200" : ""
                                    }`}
                                onClick={() => setCurrentMapById(m.id)}
                            >
                                <span className="font-bold">{m.name?.en || "Sans nom"}</span>{" "}
                                {m.type && (
                                    <span className="text-gray-500">({m.type})</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div></div>
    )
}

export default MapList