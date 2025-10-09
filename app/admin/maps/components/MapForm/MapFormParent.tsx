import { useMap } from '@/app/providers/MapContextProvider';
import React from 'react'

const MapFormParent = () => {
    const { maps, currentMap, setCurrentMap } = useMap();

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Parent Map</label>
            <select
                value={currentMap?.parentMap || ""}
                onChange={(e) =>
                    setCurrentMap({ ...currentMap, parentMap: e.target.value || null })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
                <option value="">Aucune carte parente</option>
                {maps
                    .filter((m) => m.id !== currentMap?.id) // Exclude current map
                    .map((parentMap) => (
                        <option key={parentMap.id} value={parentMap.id}>
                            {parentMap.name?.en || "Sans nom"}
                        </option>
                    ))}
            </select>
        </div>
    )
}

export default MapFormParent