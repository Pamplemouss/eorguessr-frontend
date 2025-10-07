import { useMap } from '@/app/providers/MapContextProvider';
import { Marker } from '@/lib/types/Marker';
import React from 'react'

const MapFormMarkerTarget = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
    const { maps } = useMap();

    return (
        <select
            value={draft.target}
            onChange={(e) => setDraft({ ...draft, target: e.target.value })}
            className="border p-2"
        >
            <option value="">Sélectionner la map cible</option>
            {maps.map((map) => (
                <option key={map.id} value={map.id}>
                    {map.name["en"] || "Sans nom"}
                </option>
            ))}
        </select>
    )
}

export default MapFormMarkerTarget