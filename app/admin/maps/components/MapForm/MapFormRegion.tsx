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
            name: region.name?.en || "Sans nom"
        }));
    const isDisabled = currentMap.type === MapType.REGION || currentMap.type === MapType.WORLD_MAP;

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentMap({ ...currentMap, region: e.target.value });
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="font-bold">Carte région:</label>
            <select
                value={value}
                onChange={handleRegionChange}
                disabled={isDisabled}
                className="border p-2"
            >
                <option value="">Aucune région</option>
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