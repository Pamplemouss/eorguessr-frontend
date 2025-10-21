import { useAdmin } from '@/app/providers/AdminContextProvider';
import { Marker } from '@/lib/types/Marker';
import React, { useState, useMemo } from 'react'

const MapFormMarkerTarget = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
    const { maps } = useAdmin();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMaps = useMemo(() => {
        if (!searchTerm) return maps;
        return maps.filter(map => 
            (map.name["en"] || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [maps, searchTerm]);

    return (
        <div className="grid grid-cols-2 gap-2">
            <input
                type="text"
                placeholder="Rechercher une map..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <select
                value={draft.target}
                onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
                <option value="">Sélectionner la map cible</option>
                {filteredMaps.map((map) => (
                    <option key={map.id} value={map.id}>
                        {map.name["en"] || "Sans nom"} [{map.expansion}]
                    </option>
                ))}
            </select>
        </div>
    )
}

export default MapFormMarkerTarget

