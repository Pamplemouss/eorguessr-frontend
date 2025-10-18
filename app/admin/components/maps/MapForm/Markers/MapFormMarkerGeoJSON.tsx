import { Marker } from '@/lib/types/Marker'
import React, { useState } from 'react'

const MapFormMarkerGeoJSON = ({
    draft,
    setDraft
}: {
    draft: Marker,
    setDraft: (d: Marker) => void
}) => {
    const [areaValue, setAreaValue] = useState(JSON.stringify(draft.geojson?.area || []));
    const [hitboxValue, setHitboxValue] = useState(JSON.stringify(draft.geojson?.hitbox || []));

    const parseTextarea = (text: string): [number, number][] => {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return parsed as [number, number][];
            }
        } catch (err) {
            // Ignore parse errors
        }
        return [];
    };

    const handleAreaChange = (value: string) => {
        setAreaValue(value);
        const parsed = parseTextarea(value);
        if (parsed.length > 0 || value === '[]') {
            setDraft({
                ...draft,
                geojson: {
                    area: parsed,
                    hitbox: draft.geojson?.hitbox ?? [],
                },
            });
        }
    };

    const handleHitboxChange = (value: string) => {
        setHitboxValue(value);
        const parsed = parseTextarea(value);
        if (parsed.length > 0 || value === '[]') {
            setDraft({
                ...draft,
                geojson: {
                    area: draft.geojson?.area ?? [],
                    hitbox: parsed,
                },
            });
        }
    };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Area</label>
                    <textarea
                        className="border p-2 w-full font-mono text-xs"
                        rows={4}
                        value={areaValue}
                        onChange={(e) => handleAreaChange(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Hitbox</label>
                    <textarea
                        className="border p-2 w-full font-mono text-xs"
                        rows={4}
                        value={hitboxValue}
                        onChange={(e) => handleHitboxChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}

export default MapFormMarkerGeoJSON