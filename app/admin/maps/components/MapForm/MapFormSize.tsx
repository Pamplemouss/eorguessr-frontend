import { useMap } from '@/app/providers/MapContextProvider';
import React from 'react'

const MapFormSize = () => {
    const { currentMap, setCurrentMap } = useMap();

    const handleSizeChange = (dimension: 'x' | 'y', value: string) => {
        if (!currentMap) return;

        const numValue = Math.round((parseFloat(value) || 0) * 10) / 10;
        setCurrentMap({
            ...currentMap,
            size: {
                ...currentMap.size,
                [dimension]: numValue
            }
        });
    };

    return (
        <div className="flex gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Largeur (X)</label>
                <input
                    type="number"
                    min="0"
                    value={currentMap?.size?.x || 0}
                    onChange={(e) => handleSizeChange('x', e.target.value)}
                    className="border rounded px-2 py-1 w-24"
                    placeholder="0.0"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Hauteur (Y)</label>
                <input
                    type="number"
                    min="0"
                    value={currentMap?.size?.y || 0}
                    onChange={(e) => handleSizeChange('y', e.target.value)}
                    className="border rounded px-2 py-1 w-24"
                    placeholder="0.0"
                />
            </div>
        </div>
    )
}

export default MapFormSize