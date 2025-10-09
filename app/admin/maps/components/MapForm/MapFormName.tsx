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

    const isFieldEmpty = (locale: keyof MapName) => {
        return !currentMap?.name?.[locale]?.trim();
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${
                isFieldEmpty("en") 
                    ? "bg-red-50 border-red-300" 
                    : "bg-blue-50 border-blue-200"
            }`}>
                <span className={`px-3 py-2 text-xs font-medium ${
                    isFieldEmpty("en")
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                }`}>EN</span>
                <input
                    type="text"
                    placeholder="English name"
                    value={currentMap?.name?.en || ""}
                    onChange={(e) => updateMapNameLocale("en", e.target.value)}
                    className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${
                        isFieldEmpty("en") ? "placeholder-red-400" : ""
                    }`}
                />
                {isFieldEmpty("en") && (
                    <span className="px-2 text-red-500 text-xs">*</span>
                )}
            </div>
            <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${
                isFieldEmpty("fr") 
                    ? "bg-red-50 border-red-300" 
                    : "bg-green-50 border-green-200"
            }`}>
                <span className={`px-3 py-2 text-xs font-medium ${
                    isFieldEmpty("fr")
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                }`}>FR</span>
                <input
                    type="text"
                    placeholder="French name"
                    value={currentMap?.name?.fr || ""}
                    onChange={(e) => updateMapNameLocale("fr", e.target.value)}
                    className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${
                        isFieldEmpty("fr") ? "placeholder-red-400" : ""
                    }`}
                />
                {isFieldEmpty("fr") && (
                    <span className="px-2 text-red-500 text-xs">*</span>
                )}
            </div>
            <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${
                isFieldEmpty("de") 
                    ? "bg-red-50 border-red-300" 
                    : "bg-orange-50 border-orange-200"
            }`}>
                <span className={`px-3 py-2 text-xs font-medium ${
                    isFieldEmpty("de")
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                }`}>DE</span>
                <input
                    type="text"
                    placeholder="German name"
                    value={currentMap?.name?.de || ""}
                    onChange={(e) => updateMapNameLocale("de", e.target.value)}
                    className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${
                        isFieldEmpty("de") ? "placeholder-red-400" : ""
                    }`}
                />
                {isFieldEmpty("de") && (
                    <span className="px-2 text-red-500 text-xs">*</span>
                )}
            </div>
            <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${
                isFieldEmpty("ja") 
                    ? "bg-red-50 border-red-300" 
                    : "bg-purple-50 border-purple-200"
            }`}>
                <span className={`px-3 py-2 text-xs font-medium ${
                    isFieldEmpty("ja")
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                }`}>JA</span>
                <input
                    type="text"
                    placeholder="Japanese name"
                    value={currentMap?.name?.ja || ""}
                    onChange={(e) => updateMapNameLocale("ja", e.target.value)}
                    className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${
                        isFieldEmpty("ja") ? "placeholder-red-400" : ""
                    }`}
                />
                {isFieldEmpty("ja") && (
                    <span className="px-2 text-red-500 text-xs">*</span>
                )}
            </div>
        </div>
    )
}

export default MapFormName