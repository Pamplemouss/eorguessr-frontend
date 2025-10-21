import { useAdmin } from '@/app/providers/AdminContextProvider';
import { MapType } from '@/lib/types/MapType';
import React, { useState, useEffect } from 'react'

const MapFormSpecialBounds = () => {
    const { currentMap, setCurrentMap } = useAdmin();
    const [inputValue, setInputValue] = useState('');

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
        return undefined;
    };

    const defaultBounds: L.LatLngBoundsExpression = [[-100, -100], [100, 100]];
    const bounds = currentMap.specialBounds || defaultBounds;

    // Initialize input value when currentMap changes
    useEffect(() => {
        setInputValue(JSON.stringify(bounds));
    }, [currentMap.specialBounds]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleBlur = () => {
        const parsedBounds = parseBoundsString(inputValue);
        if (parsedBounds) {
            setCurrentMap({
                ...currentMap,
                specialBounds: parsedBounds,
            });
        } else {
            // Reset to current valid value if invalid
            setInputValue(JSON.stringify(bounds));
        }
    };

    if (currentMap.type !== MapType.WORLD_MAP) return null;

    return (
        <div>
            <label className="text-sm font-medium text-gray-700">Special bounds</label>
            <input
                type="text"
                placeholder='[[-90,-180],[90,180]]'
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="border p-2 w-full font-mono text-xs mb-2"
            />
        </div>
    )
}

export default MapFormSpecialBounds

