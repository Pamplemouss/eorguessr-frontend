import { Marker } from "@/lib/types/Marker";
import React, { useState } from "react";
import { useMap } from "@/app/providers/MapContextProvider";

const emptyMarker = (): Marker => ({
    target: "",
    latLng: [0, 0],
    geojson: { area: [], hitbox: [] },
});

export default function MarkerFormList() {
    const { currentMap, setCurrentMap, maps } = useMap();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [draft, setDraft] = useState<Marker>(emptyMarker());

    if (!currentMap) return;

    const handleEdit = (idx: number) => {
        setEditingIndex(idx);
        setDraft(currentMap.markers[idx]);
    };

    const handleDelete = (idx: number) => {
        if (window.confirm("Supprimer ce marker ?")) {
            const newMarkers = currentMap.markers.slice();
            newMarkers.splice(idx, 1);
            setCurrentMap({ ...currentMap, markers: newMarkers });
            setEditingIndex(null);
        }
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
        setDraft(emptyMarker());
    };

    const handleCancel = () => {
        setEditingIndex(null);
        setDraft(emptyMarker());
    };

    // Helper to get map name from ID
    const getMapName = (id: string) => maps.find(m => m.id === id)?.name["en"] || id;

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
    /** Parse latLng from string like "[8.37109375,-6.2900390625]" */
    const parseLatLngString = (text: string): [number, number] => {
        try {
            const arr = JSON.parse(text);
            if (
                Array.isArray(arr) &&
                arr.length === 2 &&
                typeof arr[0] === "number" &&
                typeof arr[1] === "number"
            ) {
                return [arr[0], arr[1]];
            }
        } catch (err) {
            // Ignore parse errors
        }
        return draft.latLng;
    };

    return (
        <div className="p-4 border rounded max-w-md">
            <h3 className="text-lg mb-2">Markers</h3>
            <ul className="mb-4">
                {currentMap.markers.length === 0 && <li className="text-gray-500">Aucun marker.</li>}
                {currentMap.markers.map((marker, idx) => (
                    <li key={idx} className="mb-2 flex items-center gap-2">
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

            <div className="flex flex-col gap-2">
                {/* Target dropdown */}
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

                {/* Lat/Lng text input */}
                <label className="block text-sm font-medium mt-2">Lat/Lng (paste [lat,lng])</label>
                <input
                    type="text"
                    placeholder='[8.37109375,-6.2900390625]'
                    value={JSON.stringify(draft.latLng)}
                    onChange={(e) =>
                        setDraft({
                            ...draft,
                            latLng: parseLatLngString(e.target.value),
                        })
                    }
                    className="border p-2 w-full font-mono text-xs"
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
