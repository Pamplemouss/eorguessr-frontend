import { Marker } from "@/lib/types/Marker";
import React, { useState } from "react";

interface MarkerFormListProps {
    markers: Marker[];
    onChange: (markers: Marker[]) => void;
}

const emptyMarker = (): Marker => ({
    target: "",
    latLng: [0, 0],
    geojson: { area: [], hitbox: [] },
});

export default function MarkerFormList({ markers, onChange }: MarkerFormListProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draft, setDraft] = useState<Marker>(emptyMarker());

    const handleEdit = (idx: number) => {
        setEditingIndex(idx);
        setDraft(markers[idx]);
    };

    const handleDelete = (idx: number) => {
        if (window.confirm("Supprimer ce marker ?")) {
            const newMarkers = markers.slice();
            newMarkers.splice(idx, 1);
            onChange(newMarkers);
            setEditingIndex(null);
        }
    };

    const handleSave = () => {
        if (!draft.target) {
            alert("Le nom du marker est requis !");
            return;
        }
        const newMarkers = markers.slice();
        if (editingIndex !== null) {
            newMarkers[editingIndex] = draft;
        } else {
            newMarkers.push({ ...draft });
        }
        onChange(newMarkers);
        setEditingIndex(null);
        setDraft(emptyMarker());
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setDraft(emptyMarker());
    };

    /** Conversion textarea → array */
    const parseTextarea = (text: string): [number, number][] => {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return parsed as [number, number][];
            }
        } catch (err) {
            console.warn("Invalid JSON:", err);
        }
        return [];
    };
    console.log(markers);
    return (
        <div className="p-4 border rounded max-w-md">
            <h3 className="text-lg mb-2">Markers</h3>
            <ul className="mb-4">
                {markers.length === 0 && <li className="text-gray-500">Aucun marker.</li>}
                {markers.map((marker, idx) => (
                    <li key={idx} className="mb-2 flex items-center gap-2">
                        <span className="font-mono">{marker.target}</span>
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

            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Nom du marker"
                    value={draft.target}
                    onChange={(e) => setDraft({ ...draft, target: e.target.value })}
                    className="border p-2"
                />
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Latitude"
                        value={draft.latLng[0]}
                        onChange={(e) =>
                            setDraft({
                                ...draft,
                                latLng: [parseFloat(e.target.value) || 0, draft.latLng[1]],
                            })
                        }
                        className="border p-2 w-1/2"
                    />
                    <input
                        type="number"
                        placeholder="Longitude"
                        value={draft.latLng[1]}
                        onChange={(e) =>
                            setDraft({
                                ...draft,
                                latLng: [draft.latLng[0], parseFloat(e.target.value) || 0],
                            })
                        }
                        className="border p-2 w-1/2"
                    />
                </div>

                {/* GeoJSON editing */}
                <div className="mt-4">
                    <h4 className="font-semibold">GeoJSON</h4>

                    <label className="block mt-2 text-sm font-medium">Area</label>
                    <textarea
                        className="border p-2 w-full font-mono text-xs"
                        rows={4}
                        value={JSON.stringify(draft.geojson?.area || [])}
                        onChange={(e) =>
                            setDraft({
                                ...draft,
                                geojson: {
                                    area: parseTextarea(e.target.value),
                                    hitbox: draft.geojson?.hitbox ?? [],
                                },
                            })
                        }
                    />

                    <label className="block mt-2 text-sm font-medium">Hitbox</label>
                    <textarea
                        className="border p-2 w-full font-mono text-xs"
                        rows={4}
                        value={JSON.stringify(draft.geojson?.hitbox || [])}
                        onChange={(e) =>
                            setDraft({
                                ...draft,
                                geojson: {
                                    area: draft.geojson?.area ?? [],
                                    hitbox: parseTextarea(e.target.value),
                                },
                            })
                        }
                    />
                </div>

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
            </div>
        </div>
    );
}
