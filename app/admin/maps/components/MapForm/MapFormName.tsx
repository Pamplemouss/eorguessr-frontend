import { useMap } from '@/app/providers/MapContextProvider';
import { MapName } from '@/lib/types/Map';
import React from 'react'

const MapFormName = () => {
    const { currentMap, setCurrentMap } = useMap();

    function updateMapNameLocale(
        locale: keyof MapName,
        value: string
    ) {
        if (!currentMap) return;
        setCurrentMap({
            ...currentMap,
            name: {
                en: currentMap?.name?.en ?? "",
                fr: currentMap?.name?.fr ?? "",
                de: currentMap?.name?.de ?? "",
                ja: currentMap?.name?.ja ?? "",
                [locale]: value
            }
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="font-bold">Nom de la map (locales):</label>
            <input
                type="text"
                placeholder="Nom (EN)"
                value={currentMap?.name?.en || ""}
                onChange={(e) => updateMapNameLocale("en", e.target.value)}
                className="border p-2"
            />
            <input
                type="text"
                placeholder="Nom (FR)"
                value={currentMap?.name?.fr || ""}
                onChange={(e) => updateMapNameLocale("fr", e.target.value)}
                className="border p-2"
            />
            <input
                type="text"
                placeholder="Nom (DE)"
                value={currentMap?.name?.de || ""}
                onChange={(e) => updateMapNameLocale("de", e.target.value)}
                className="border p-2"
            />
            <input
                type="text"
                placeholder="Nom (JA)"
                value={currentMap?.name?.ja || ""}
                onChange={(e) => updateMapNameLocale("ja", e.target.value)}
                className="border p-2"
            />
        </div>
    )
}

export default MapFormName