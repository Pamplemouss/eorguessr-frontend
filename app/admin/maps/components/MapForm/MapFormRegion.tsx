import { useMap } from '@/app/providers/MapContextProvider';
import { MapType } from '@/lib/types/MapType';
import React from 'react'

const MapFormRegion = () => {
    const { maps, currentMap, setCurrentMap } = useMap();
    const value = currentMap?.region || "";
    const options = maps
        .filter((m) => m.type === MapType.REGION)
        .map((region) => ({
            id: region.id,
            name: region.name?.en || "Unnamed"
        }));
    const isDisabled = currentMap.type === MapType.REGION || currentMap.type === MapType.WORLD_MAP;

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentMap({ ...currentMap, region: e.target.value });
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Region Map</label>
            <select
                value={value}
                onChange={handleRegionChange}
                disabled={isDisabled}
                className={`px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                    isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                }`}
            >
                <option value="">No region</option>
                {options.map((region) => (
                    <option key={region.id} value={region.id}>
                        {region.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default MapFormRegion