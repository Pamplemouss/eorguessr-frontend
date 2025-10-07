import { Marker } from '@/lib/types/Marker';
import React from 'react'

const MapFormMarkerLatLng = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
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
        <div>
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
        </div>
    )
}

export default MapFormMarkerLatLng