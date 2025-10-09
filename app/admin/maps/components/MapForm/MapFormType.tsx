import { useMap } from '@/app/providers/MapContextProvider';
import { MapType } from '@/lib/types/MapType';
import React from 'react'

const MapFormType = () => {
    const { currentMap, setCurrentMap } = useMap();

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Map Type</label>
            <select
                value={currentMap?.type || MapType.MAP}
                onChange={(e) =>
                    setCurrentMap({ ...currentMap, type: e.target.value as MapType })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
                {Object.values(MapType).map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default MapFormType