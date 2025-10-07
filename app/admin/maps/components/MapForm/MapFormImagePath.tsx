import { useMap } from '@/app/providers/MapContextProvider';
import React from 'react'

const MapFormImagePath = () => {
    const { currentMap, setCurrentMap } = useMap();
    
    return (
        <input
            type="text"
            placeholder="Image Path"
            value={currentMap?.imagePath || ""}
            onChange={(e) => setCurrentMap({ ...currentMap, imagePath: e.target.value })}
            className="border p-2"
        />
    )
}

export default MapFormImagePath