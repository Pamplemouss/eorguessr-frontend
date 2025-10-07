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

    return (
        <div className="p-4 border rounded max-w-md">
            <h3 className="text-lg mb-2">Markers</h3>
            <MapFormMarkersList
                setDraft={setDraft}
                editingIndex={editingIndex}
                setEditingIndex={setEditingIndex}
            />
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
                />
            </div>
        </div>
    );
}
