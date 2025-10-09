import { useMap } from '@/app/providers/MapContextProvider';
import { Expansion } from '@/lib/types/Expansion';
import React from 'react'

const MapFormExpansion = () => {
    const { currentMap, setCurrentMap } = useMap();
    
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Expansion</label>
            <select
                value={currentMap?.expansion || Expansion.ARR}
                onChange={(e) =>
                    setCurrentMap({ ...currentMap, expansion: e.target.value as Expansion })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
                {Object.values(Expansion).map((exp) => (
                    <option key={exp} value={exp}>
                        {exp}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default MapFormExpansion