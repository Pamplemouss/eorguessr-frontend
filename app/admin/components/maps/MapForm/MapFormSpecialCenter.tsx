import { useAdmin } from '@/app/providers/AdminContextProvider';
import { MapType } from '@/lib/types/MapType';
import React, { useState, useEffect } from 'react'

const MapFormSpecialCenter = () => {
    const { currentMap, setCurrentMap } = useAdmin();
    const [inputValue, setInputValue] = useState('');

    // Initialize input value from currentMap
    useEffect(() => {
        const specialCenter: [number, number] = [0, 0];
        const center: [number, number] = Array.isArray(currentMap.specialCenter) && currentMap.specialCenter.length === 2
            ? [Number(currentMap.specialCenter[0]), Number(currentMap.specialCenter[1])]
            : specialCenter;
        setInputValue(JSON.stringify(center));
    }, [currentMap.specialCenter]);

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
            // Return undefined for invalid input
        }
        return undefined;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        
        const parsed = parseCenterString(value);
        setCurrentMap({
            ...currentMap,
            specialCenter: parsed,
        });
    };

    if (currentMap.type !== MapType.WORLD_MAP) return null;

    return (
        <div>
            <label className="text-sm font-medium text-gray-700">Default center</label>
            <input
                type="text"
                placeholder='[0,0]'
                value={inputValue}
                onChange={handleInputChange}
                className="border p-2 w-full font-mono text-xs mb-2"
            />
        </div>
    )
}

export default MapFormSpecialCenter

