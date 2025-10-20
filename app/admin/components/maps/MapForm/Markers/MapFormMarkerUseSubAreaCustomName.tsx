import { Marker } from '@/lib/types/Marker';
import React from 'react'

const MapFormMarkerUseSubAreaCustomName = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
    return (
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id="useSubAreaCustomName"
                checked={draft.useSubAreaCustomName || false}
                onChange={(e) => setDraft({ 
                    ...draft, 
                    useSubAreaCustomName: e.target.checked 
                })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="useSubAreaCustomName" className="text-sm font-medium text-gray-700">
                Utiliser le nom personnalisé de la sous-zone
            </label>
        </div>
    )
}

export default MapFormMarkerUseSubAreaCustomName