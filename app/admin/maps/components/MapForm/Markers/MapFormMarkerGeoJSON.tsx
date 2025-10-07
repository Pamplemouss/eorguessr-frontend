import { Marker } from '@/lib/types/Marker'
import React from 'react'

const MapFormMarkerGeoJSON = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
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

    return (
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
    )
}

export default MapFormMarkerGeoJSON