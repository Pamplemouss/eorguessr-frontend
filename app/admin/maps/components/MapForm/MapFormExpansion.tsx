import { useMap } from '@/app/providers/MapContextProvider';
import { Expansion } from '@/lib/types/Expansion';
import React from 'react'

const MapFormExpansion = () => {
    const { currentMap, setCurrentMap } = useMap();
    
    return (
        <select
            value={currentMap?.expansion || Expansion.ARR}
            onChange={(e) =>
                setCurrentMap({ ...currentMap, expansion: e.target.value as Expansion })
            }
            className="border p-2"
        >
            {Object.values(Expansion).map((exp) => (
                <option key={exp} value={exp}>
                    {exp}
                </option>
            ))}
        </select>
    )
}

export default MapFormExpansion