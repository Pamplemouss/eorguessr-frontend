import React, { useState } from "react";
import { Marker } from "@/lib/types/Marker";
import { createEmptyMarker } from "@/lib/utils/createEmptyMarker";
import MapFormMarkersList from "./MapFormMarkersList";
import MapFormMarkerTarget from "./MapFormMarkerTarget";
import MapFormMarkerLatLng from "./MapFormMarkerLatLng";
import MapFormMarkerGeoJSON from "./MapFormMarkerGeoJSON";
import MapFormMarkerActions from "./MapFormMarkerActions";

export default function MapFormMarkers() {
    const [draft, setDraft] = useState<Marker>(createEmptyMarker());
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);

    return (
        <div>
            <MapFormMarkersList
                setDraft={setDraft}
                editingIndex={editingIndex}
                setEditingIndex={setEditingIndex}
                setShowForm={setShowForm}
            />
            
            {!showForm && (
                <button
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1"
                    onClick={() => {
                        setShowForm(true);
                        setEditingIndex(null);
                        setDraft(createEmptyMarker());
                    }}
                    type="button"
                >
                    Ajouter un marker
                </button>
            )}

            {showForm && (
                <div className="flex flex-col gap-2">
                    <MapFormMarkerTarget
                        draft={draft}
                        setDraft={setDraft}
                    />
                    <MapFormMarkerLatLng
                        draft={draft}
                        setDraft={setDraft}
                    />
                    <MapFormMarkerGeoJSON
                        draft={draft}
                        setDraft={setDraft}
                    />
                    <MapFormMarkerActions
                        draft={draft}
                        setDraft={setDraft}
                        editingIndex={editingIndex}
                        setEditingIndex={setEditingIndex}
                        setShowForm={setShowForm}
                    />
                </div>
            )}
        </div>
    );
}
