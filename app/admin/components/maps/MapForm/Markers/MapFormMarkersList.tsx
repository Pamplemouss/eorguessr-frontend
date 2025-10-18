import { useMap } from '@/app/providers/MapContextProvider';
import { Marker } from '@/lib/types/Marker';
import { createEmptyMarker } from '@/lib/utils/createEmptyMarker';
import React, { useState } from 'react'
import { BiPolygon } from 'react-icons/bi';
import { FaPen, FaTrash } from 'react-icons/fa';

const MapFormMarkersList = ({
    editingIndex,
    setEditingIndex,
    setDraft,
    setShowForm
}: {
    editingIndex: number | null,
    setEditingIndex: (i: number | null) => void,
    setDraft: (d: Marker) => void,
    setShowForm: (show: boolean) => void,
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
            setShowForm(false);
        } else {
            setDraft(currentMap.markers[idx]);
            setShowForm(true);
        }
    };

    return (
        <ul className="mb-4 grid grid-cols-2">
            {currentMap.markers.length === 0 && <li className="text-gray-500">Aucun marker.</li>}
            {currentMap.markers.map((marker, idx) => (
                <li
                    key={idx}
                    className={`flex items-center gap-1 ${editingIndex === idx ? 'bg-blue-100 border border-blue-300 rounded px-2 py-1' : ''
                        }`}
                >
                    <span className="font-mono">{getMapName(marker.target)}</span>
                    <span className="text-xs text-gray-500">
                        [{marker.latLng[0]}, {marker.latLng[1]}]
                    </span>
                    {marker.geojson && marker.geojson.area &&
                        (marker.geojson.area.length > 0 || marker.geojson.hitbox.length > 0) && (
                            <span className="text-sm text-green-600 flex items-center">+<BiPolygon /></span>
                        )}
                    <button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs p-1 rounded-lg"
                        onClick={() => handleEdit(idx)}
                        type="button"
                    >
                        <FaPen />
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white text-xs p-1 rounded-lg"
                        onClick={() => handleDelete(idx)}
                        type="button"
                    >
                        <FaTrash />
                    </button>
                </li>
            ))}
        </ul>
    )
}

export default MapFormMarkersList