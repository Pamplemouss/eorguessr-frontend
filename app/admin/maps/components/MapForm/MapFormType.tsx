import { useMap } from '@/app/providers/MapContextProvider';
import { MapType } from '@/lib/types/MapType';
import React from 'react'

const MapFormType = () => {
    const { currentMap, setCurrentMap } = useMap();

    return (
        <select
            value={currentMap?.type || MapType.MAP}
            onChange={(e) =>
                setCurrentMap({ ...currentMap, type: e.target.value as MapType })
            }
            className="border p-2"
        >
            {Object.values(MapType).map((type) => (
                <option key={type} value={type}>
                    {type}
                </option>
            ))}
        </select>
    )
}

export default MapFormType