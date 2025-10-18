import { useMap } from '@/app/providers/MapContextProvider';
import { MapName } from '@/lib/types/Map';
import React, { useState } from 'react'

const MapFormName = () => {
    const { currentMap, setCurrentMap } = useMap();
    const [dataInput, setDataInput] = useState('');
    const [dataError, setDataError] = useState('');
    const [showImportSection, setShowImportSection] = useState(false);

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

    const parseAndApplyData = () => {
        try {
            setDataError('');

            if (!currentMap) return;

            const newMapName = {
                en: currentMap?.name?.en ?? "",
                fr: currentMap?.name?.fr ?? "",
                de: currentMap?.name?.de ?? "",
                ja: currentMap?.name?.ja ?? "",
            };

            // Split input into lines and process each line
            const lines = dataInput.trim().split('\n');

            lines.forEach((line: string) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return; // Skip empty lines

                // Split by tab or multiple spaces/tabs
                const parts = trimmedLine.split(/\t+|\s{2,}/).map((part: string) => part.trim());

                if (parts.length >= 3) {
                    // Expected format: [id, language, mapName, ...]
                    const [, language, mapName] = parts;

                    if (language && mapName) {
                        const lang = language as keyof MapName;
                        if (lang in newMapName) {
                            newMapName[lang] = mapName;
                        }
                    }
                }
            });

            setCurrentMap({
                ...currentMap,
                name: newMapName
            });

            setDataInput(''); // Clear the input after successful application
        } catch (error) {
            setDataError('Invalid format. Please check your input.');
        }
    };

    return (
        <div className="space-y-4">
            {/* Individual Name Fields */}
            <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("en")
                    ? "bg-red-50 border-red-300"
                    : "bg-blue-50 border-blue-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("en")
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                        }`}>EN</span>
                    <input
                        type="text"
                        placeholder="English name"
                        value={currentMap?.name?.en || ""}
                        onChange={(e) => updateMapNameLocale("en", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("en") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("en") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("fr")
                    ? "bg-red-50 border-red-300"
                    : "bg-green-50 border-green-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("fr")
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                        }`}>FR</span>
                    <input
                        type="text"
                        placeholder="French name"
                        value={currentMap?.name?.fr || ""}
                        onChange={(e) => updateMapNameLocale("fr", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("fr") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("fr") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("de")
                    ? "bg-red-50 border-red-300"
                    : "bg-orange-50 border-orange-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("de")
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                        }`}>DE</span>
                    <input
                        type="text"
                        placeholder="German name"
                        value={currentMap?.name?.de || ""}
                        onChange={(e) => updateMapNameLocale("de", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("de") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("de") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
                <div className={`flex items-center rounded-full border overflow-hidden min-w-0 flex-1 ${isFieldEmpty("ja")
                    ? "bg-red-50 border-red-300"
                    : "bg-purple-50 border-purple-200"
                    }`}>
                    <span className={`px-3 py-2 text-xs font-medium ${isFieldEmpty("ja")
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                        }`}>JA</span>
                    <input
                        type="text"
                        placeholder="Japanese name"
                        value={currentMap?.name?.ja || ""}
                        onChange={(e) => updateMapNameLocale("ja", e.target.value)}
                        className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("ja") ? "placeholder-red-400" : ""
                            }`}
                    />
                    {isFieldEmpty("ja") && (
                        <span className="px-2 text-red-500 text-xs">*</span>
                    )}
                </div>
            </div>
            {/* Data Input Section */}
            {showImportSection && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Import Names from Tab-Separated Data</h3>
                    <div className="space-y-2">
                        <textarea
                            value={dataInput}
                            onChange={(e) => setDataInput(e.target.value)}
                            placeholder={`Paste tab-separated data here, e.g.:
6	fr	Forêt du sud
6	en	South Shroud
6	ja	黒衣森：南部森林
6	de	Südwald`}
                            className="w-full h-24 p-2 text-xs border border-gray-300 rounded-md resize-none font-mono"
                        />
                        {dataError && (
                            <p className="text-red-600 text-xs">{dataError}</p>
                        )}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={parseAndApplyData}
                                disabled={!dataInput.trim()}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Apply Data
                            </button>
                            <button
                                type="button"
                                onClick={() => { setDataInput(''); setDataError(''); }}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Toggle Button */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => setShowImportSection(!showImportSection)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 border border-gray-300"
                >
                    {showImportSection ? 'Hide Import' : 'Import from Text'}
                </button>
            </div>
        </div>
    )
}

export default MapFormName