import { useMap } from '@/app/providers/MapContextProvider';
import React from 'react'

const MapFormParent = () => {
    const { maps, currentMap, setCurrentMap } = useMap();

    return (
        <div className="flex flex-col gap-1">
            <label className="font-bold">Carte parente:</label>
            <select
                value={currentMap?.parentMap || ""}
                onChange={(e) =>
                    setCurrentMap({ ...currentMap, parentMap: e.target.value || null })
                }
                className="border p-2"
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