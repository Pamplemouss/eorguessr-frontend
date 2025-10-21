import { useAdmin } from '@/app/providers/AdminContextProvider';
import React from 'react'

const MapFormId = () => {
    const { currentMap } = useAdmin();
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

