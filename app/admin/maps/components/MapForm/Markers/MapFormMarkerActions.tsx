import { useMap } from '@/app/providers/MapContextProvider';
import { Marker } from '@/lib/types/Marker';
import { createEmptyMarker } from '@/lib/utils/createEmptyMarker';
import React from 'react'

const MapFormMarkerActions = ({
    editingIndex,
    setEditingIndex,
    draft,
    setDraft
} : {
    editingIndex: number | null,
    setEditingIndex: (i: number | null) => void,
    draft: Marker,
    setDraft: (d: Marker) => void,
}) => {
    const { currentMap, setCurrentMap } = useMap();

    const handleCancel = () => {
        setEditingIndex(null);
        setDraft(createEmptyMarker());
    };

    const handleSave = () => {
        if (!draft.target) {
            alert("Le nom du marker est requis !");
            return;
        }
        const newMarkers = currentMap.markers.slice();
        if (editingIndex !== null) {
            newMarkers[editingIndex] = draft;
        } else {
            newMarkers.push({ ...draft });
        }
        setCurrentMap({ ...currentMap, markers: newMarkers });
        setEditingIndex(null);
        setDraft(createEmptyMarker());
    };

    return (
        <div className="flex gap-2 mt-2">
            <button
                className="bg-blue-500 text-white px-3 py-1"
                onClick={handleSave}
                type="button"
            >
                {editingIndex !== null ? "Mettre à jour" : "Ajouter"}
            </button>
            {editingIndex !== null && (
                <button
                    className="bg-gray-300 px-3 py-1"
                    onClick={handleCancel}
                    type="button"
                >
                    Annuler
                </button>
            )}
        </div>
    )
}

export default MapFormMarkerActions