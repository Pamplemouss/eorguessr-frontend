import { useMap } from '@/app/providers/MapContextProvider';
import React from 'react'

const MapFormId = () => {
    const { currentMap } = useMap();
    return (
        <input
            type="text"
            value={currentMap?.id || ""}
            disabled
            className="border p-2 bg-gray-100 text-gray-500"
        />
    )
}

export default MapFormId