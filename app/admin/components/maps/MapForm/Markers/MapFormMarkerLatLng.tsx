import { Marker } from '@/lib/types/Marker';
import React, { useState } from 'react'

const MapFormMarkerLatLng = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
    const [inputValue, setInputValue] = useState(JSON.stringify(draft.latLng));

    const parseLatLngString = (text: string): [number, number] | null => {
        try {
            const arr = JSON.parse(text);
            if (
                Array.isArray(arr) &&
                arr.length === 2 &&
                typeof arr[0] === "number" &&
                typeof arr[1] === "number"
            ) {
                return [arr[0], arr[1]];
            }
        } catch (err) {
            // Ignore parse errors
        }
        return null;
    };

    const handleInputChange = (value: string) => {
        setInputValue(value);
        
        const parsed = parseLatLngString(value);
        if (parsed) {
            setDraft({
                ...draft,
                latLng: parsed,
            });
        }
    };

    return (
        <div>
            <label className="text-sm font-medium text-gray-700">Lat/Lng</label>
            <input
                className="border p-2 w-full font-mono text-xs"
                placeholder='[8.37109375,-6.2900390625]'
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
            />
        </div>
    )
}

export default MapFormMarkerLatLng

