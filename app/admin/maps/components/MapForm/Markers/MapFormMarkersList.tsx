import { useMap } from '@/app/providers/MapContextProvider';
import { Marker } from '@/lib/types/Marker';
import { createEmptyMarker } from '@/lib/utils/createEmptyMarker';
import React, { useState } from 'react'

const MapFormMarkersList = ({
    editingIndex,
    setEditingIndex,
    setDraft
}: {
    editingIndex: number | null,
    setEditingIndex: (i: number | null) => void,
    setDraft: (d: Marker) => void,
}) => {
    const { maps, currentMap, setCurrentMap } = useMap();

    const getMapName = (id: string) => maps.find(m => m.id === id)?.name["en"] || id;

    const handleDelete = (idx: number) => {
        if (window.confirm("Supprimer ce marker ?")) {
            const newMarkers = currentMap.markers.slice();
            newMarkers.splice(idx, 1);
            setCurrentMap({ ...currentMap, markers: newMarkers });
            handleEdit(null);
        }
    };

    const handleEdit = (idx: number | null) => {
        setEditingIndex(idx);
        if (idx === null) {
            setDraft(createEmptyMarker());
        } else {
            setDraft(currentMap.markers[idx]);
        }
    };

    return (
        <ul className="mb-4">
            {currentMap.markers.length === 0 && <li className="text-gray-500">Aucun marker.</li>}
            {currentMap.markers.map((marker, idx) => (
                <li
                    key={idx}
                    className={`mb-2 flex items-center gap-2 ${editingIndex === idx ? 'bg-blue-100 border border-blue-300 rounded px-2 py-1' : ''
                        }`}
                >
                    <span className="font-mono">{getMapName(marker.target)}</span>
                    <span className="text-xs text-gray-500">
                        [{marker.latLng[0]}, {marker.latLng[1]}]
                    </span>
                    {marker.geojson && marker.geojson.area &&
                        (marker.geojson.area.length > 0 || marker.geojson.hitbox.length > 0) && (
                            <span className="text-xs text-green-600">+ GeoJSON</span>
                        )}
                    <button
                        className="text-blue-500 underline"
                        onClick={() => handleEdit(idx)}
                        type="button"
                    >
                        Éditer
                    </button>
                    <button
                        className="text-red-500 underline"
                        onClick={() => handleDelete(idx)}
                        type="button"
                    >
                        Supprimer
                    </button>
                </li>
            ))}
        </ul>
    )
}

export default MapFormMarkersList