import { useMap } from '@/app/providers/MapContextProvider';
import { MapType } from '@/lib/types/MapType';
import React from 'react'

const MapFormSpecialCenter = () => {
    const { currentMap, setCurrentMap } = useMap();

    const parseCenterString = (text: string): [number, number] | undefined => {
        try {
            const arr = JSON.parse(text);
            if (
                Array.isArray(arr) &&
                arr.length === 2 &&
                typeof arr[0] === "number" &&
                typeof arr[1] === "number"
            ) {
                return arr as [number, number];
            }
        } catch (err) {
            // Ignore parse errors
        }
        return currentMap.specialCenter as [number, number] | undefined;
    };

    const specialCenter: [number, number] = [0, 0];
    const center: [number, number] = Array.isArray(currentMap.specialCenter) && currentMap.specialCenter.length === 2
        ? [Number(currentMap.specialCenter[0]), Number(currentMap.specialCenter[1])]
        : specialCenter;

    if (currentMap.type !== MapType.WORLD_MAP) return null;

    return (
        <div>
            <label className="block text-sm font-medium mt-2">Default Center</label>
            <input
                type="text"
                placeholder='[0,0]'
                value={JSON.stringify(center)}
                onChange={(e) =>
                    setCurrentMap({
                        ...currentMap,
                        specialCenter: parseCenterString(e.target.value),
                    })
                }
                className="border p-2 w-full font-mono text-xs mb-2"
            />

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs text-gray-600">Latitude</label>
                    <input
                        type="number"
                        placeholder="Latitude"
                        value={center[0]}
                        onChange={(e) => {
                            const newLat = parseFloat(e.target.value) || 0;
                            setCurrentMap({
                                ...currentMap,
                                specialCenter: [newLat, center[1]],
                            });
                        }}
                        className="border p-1 w-full text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-600">Longitude</label>
                    <input
                        type="number"
                        placeholder="Longitude"
                        value={center[1]}
                        onChange={(e) => {
                            const newLng = parseFloat(e.target.value) || 0;
                            setCurrentMap({
                                ...currentMap,
                                specialCenter: [center[0], newLng],
                            });
                        }}
                        className="border p-1 w-full text-xs"
                    />
                </div>
            </div>
        </div>
    )
}

export default MapFormSpecialCenter