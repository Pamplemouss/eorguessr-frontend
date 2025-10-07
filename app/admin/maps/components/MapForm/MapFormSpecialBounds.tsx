import { useMap } from '@/app/providers/MapContextProvider';
import { MapType } from '@/lib/types/MapType';
import React from 'react'

const MapFormSpecialBounds = () => {
    const { currentMap, setCurrentMap } = useMap();

    const parseBoundsString = (text: string): L.LatLngBoundsExpression | undefined => {
        try {
            const arr = JSON.parse(text);
            if (
                Array.isArray(arr) &&
                arr.length === 2 &&
                Array.isArray(arr[0]) &&
                Array.isArray(arr[1]) &&
                arr[0].length === 2 &&
                arr[1].length === 2 &&
                typeof arr[0][0] === "number" &&
                typeof arr[0][1] === "number" &&
                typeof arr[1][0] === "number" &&
                typeof arr[1][1] === "number"
            ) {
                return arr as L.LatLngBoundsExpression;
            }
        } catch (err) {
            // Ignore parse errors
        }
        return currentMap.specialBounds;
    };

    const defaultBounds: L.LatLngBoundsExpression = [[-100, -100], [100, 100]];
    const bounds = currentMap.specialBounds || defaultBounds;

    if (currentMap.type !== MapType.WORLD_MAP) return null;

    return (
        <div>
            <label className="block text-sm font-medium mt-2">Special Bounds</label>
            <input
                type="text"
                placeholder='[[-90,-180],[90,180]]'
                value={JSON.stringify(bounds)}
                onChange={(e) =>
                    setCurrentMap({
                        ...currentMap,
                        specialBounds: parseBoundsString(e.target.value),
                    })
                }
                className="border p-2 w-full font-mono text-xs mb-2"
            />

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs text-gray-600">Southwest Corner</label>
                    <div className="flex gap-1">
                        <input
                            type="number"
                            placeholder="Lat"
                            value={Array.isArray(bounds) && Array.isArray(bounds[0]) ? bounds[0][0] : ''}
                            onChange={(e) => {
                                const newLat = parseFloat(e.target.value) || 0;
                                const currentBounds = Array.isArray(bounds) ? bounds : defaultBounds;
                                const sw = Array.isArray(currentBounds[0]) ? currentBounds[0] : [-90, -180];
                                const ne = Array.isArray(currentBounds[1]) ? currentBounds[1] : [90, 180];
                                setCurrentMap({
                                    ...currentMap,
                                    specialBounds: [[newLat, sw[1]], ne] as L.LatLngBoundsExpression,
                                });
                            }}
                            className="border p-1 w-1/2 text-xs"
                        />
                        <input
                            type="number"
                            placeholder="Lng"
                            value={Array.isArray(bounds) && Array.isArray(bounds[0]) ? bounds[0][1] : ''}
                            onChange={(e) => {
                                const newLng = parseFloat(e.target.value) || 0;
                                const currentBounds = Array.isArray(bounds) ? bounds : defaultBounds;
                                const sw = Array.isArray(currentBounds[0]) ? currentBounds[0] : [-90, -180];
                                const ne = Array.isArray(currentBounds[1]) ? currentBounds[1] : [90, 180];
                                setCurrentMap({
                                    ...currentMap,
                                    specialBounds: [[sw[0], newLng], ne] as L.LatLngBoundsExpression,
                                });
                            }}
                            className="border p-1 w-1/2 text-xs"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-600">Northeast Corner</label>
                    <div className="flex gap-1">
                        <input
                            type="number"
                            placeholder="Lat"
                            value={Array.isArray(bounds) && Array.isArray(bounds[1]) ? bounds[1][0] : ''}
                            onChange={(e) => {
                                const newLat = parseFloat(e.target.value) || 0;
                                const currentBounds = Array.isArray(bounds) ? bounds : defaultBounds;
                                const sw = Array.isArray(currentBounds[0]) ? currentBounds[0] : [-90, -180];
                                const ne = Array.isArray(currentBounds[1]) ? currentBounds[1] : [90, 180];
                                setCurrentMap({
                                    ...currentMap,
                                    specialBounds: [sw, [newLat, ne[1]]] as L.LatLngBoundsExpression,
                                });
                            }}
                            className="border p-1 w-1/2 text-xs"
                        />
                        <input
                            type="number"
                            placeholder="Lng"
                            value={Array.isArray(bounds) && Array.isArray(bounds[1]) ? bounds[1][1] : ''}
                            onChange={(e) => {
                                const newLng = parseFloat(e.target.value) || 0;
                                const currentBounds = Array.isArray(bounds) ? bounds : defaultBounds;
                                const sw = Array.isArray(currentBounds[0]) ? currentBounds[0] : [-90, -180];
                                const ne = Array.isArray(currentBounds[1]) ? currentBounds[1] : [90, 180];
                                setCurrentMap({
                                    ...currentMap,
                                    specialBounds: [sw, [ne[0], newLng]] as L.LatLngBoundsExpression,
                                });
                            }}
                            className="border p-1 w-1/2 text-xs"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapFormSpecialBounds