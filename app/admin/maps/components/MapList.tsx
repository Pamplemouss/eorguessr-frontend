import { useAdminMapConfig } from '@/app/providers/AdminMapConfigContextProvider';
import { useMap } from '@/app/providers/MapContextProvider';
import { createEmptyMap } from '@/lib/utils/createEmptyMap';
import useFilterMaps from '@/lib/utils/useFilterMaps';
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import AdminCard from './AdminCard';

const MapList = () => {
    const { maps, currentMap, setCurrentMapById, setCurrentMap } = useMap();
    const { selectedExpansions, selectedMapTypes } = useAdminMapConfig();
    const [search, setSearch] = useState("");
    const filteredMaps = useFilterMaps(maps, selectedExpansions, selectedMapTypes)
        .filter((m) =>
            m.name?.en?.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <AdminCard
            title="Maps list"
            icon={<FaMagnifyingGlass />}
        >
            <>
                <div className="flex items-center gap-2 mb-1">
                    <input
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-2 grow"
                    />
                    <button
                        className="block bg-indigo-500 hover:bg-indigo-600 text-white px-4 h-[42px] rounded"
                        onClick={() => setCurrentMap(createEmptyMap())}
                    >
                        <FaPlus />
                    </button>
                </div>
                {filteredMaps.length === 0 ? (
                    <p>Aucune map trouvée.</p>
                ) : (
                    <ul className="grid grid-cols-2">
                        {filteredMaps.map((m) => (
                            <li
                                key={m.id}
                                className={`p-2 cursor-pointer hover:bg-gray-100 ${currentMap?.id === m.id ? "bg-gray-200" : ""
                                    }`}
                                onClick={() => setCurrentMapById(m.id)}
                            >
                                <span className="font-bold">{m.name?.en || "Sans nom"}</span>{" "}
                                {m.expansion && (
                                    <span className="text-gray-500 ml-1">[{m.expansion}]</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </>
        </AdminCard>
    )
}

export default MapList