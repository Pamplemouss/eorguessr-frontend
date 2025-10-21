import { useMap } from '@/app/providers/MapContextProvider';
import { MapName } from '@/lib/types/Map';
import React, { useEffect, useState } from 'react'

const MapFormSubareas = () => {
    const { maps, currentMap, setCurrentMap } = useMap();
    const [subareasEnabled, setSubareasEnabled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customNameEnabled, setCustomNameEnabled] = useState(false);
    const [showImportSection, setShowImportSection] = useState(false);
    const [dataInput, setDataInput] = useState('');
    const [dataError, setDataError] = useState('');

    function updateSubAreaCustomNameLocale(
        locale: keyof MapName,
        value: string
    ) {
        if (!currentMap) return;
        setCurrentMap({
            ...currentMap,
            subAreaCustomName: {
                en: currentMap?.subAreaCustomName?.en ?? "",
                fr: currentMap?.subAreaCustomName?.fr ?? "",
                de: currentMap?.subAreaCustomName?.de ?? "",
                ja: currentMap?.subAreaCustomName?.ja ?? "",
                [locale]: value
            }
        });
    }

    const isFieldEmpty = (locale: keyof MapName) => {
        return !currentMap?.subAreaCustomName?.[locale]?.trim();
    };

    const parseAndApplyData = () => {
        try {
            setDataError('');

            if (!currentMap) return;

            const newSubAreaCustomName = {
                en: currentMap?.subAreaCustomName?.en ?? "",
                fr: currentMap?.subAreaCustomName?.fr ?? "",
                de: currentMap?.subAreaCustomName?.de ?? "",
                ja: currentMap?.subAreaCustomName?.ja ?? "",
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
                        if (lang in newSubAreaCustomName) {
                            newSubAreaCustomName[lang] = mapName;
                        }
                    }
                }
            });

            setCurrentMap({
                ...currentMap,
                subAreaCustomName: newSubAreaCustomName
            });

            setDataInput(''); // Clear the input after successful application
        } catch (error) {
            setDataError('Invalid format. Please check your input.');
        }
    };

    function moveSubArea(index: number, direction: "up" | "down") {
        const arr = [...(currentMap?.subAreas || [])];
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === arr.length - 1)
        ) return;
        const swapWith = direction === "up" ? index - 1 : index + 1;
        [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
        setSubAreasSafe(arr);
    }

    function ensureSelfInSubAreas() {
        if (!currentMap?.id) return;
        if (!currentMap.subAreas?.includes(currentMap.id)) {
            setSubAreasSafe([currentMap.id, ...(currentMap.subAreas || []).filter(id => id !== currentMap.id)]);
        }
    }

    function setSubAreasSafe(newSubAreas: string[]) {
        if (!currentMap) return;
        const unique = Array.from(new Set(newSubAreas));
        setCurrentMap({ ...currentMap, subAreas: unique });
    }

    // Get currently selected subareas (excluding self)
    const currentSubAreas = (currentMap?.subAreas || []).filter(id => id !== currentMap?.id);

    // Filter maps based on search term
    const filteredMaps = maps
        .filter(m => m.id !== currentMap?.id)
        .filter(m => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                m.name?.en?.toLowerCase().includes(searchLower) ||
                m.name?.fr?.toLowerCase().includes(searchLower) ||
                m.id.toLowerCase().includes(searchLower)
            );
        });

    // Include already selected maps that don't match the search to preserve them
    const mapsToShow = [
        ...filteredMaps,
        ...maps.filter(m =>
            m.id !== currentMap?.id &&
            currentSubAreas.includes(m.id) &&
            !filteredMaps.some(fm => fm.id === m.id)
        )
    ].sort((a, b) => {
        // Sort so selected items appear first, then alphabetically
        const aSelected = currentSubAreas.includes(a.id);
        const bSelected = currentSubAreas.includes(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return (a.name?.en || a.id).localeCompare(b.name?.en || b.id);
    });

    useEffect(() => {
        setSubareasEnabled((currentMap?.subAreas && currentMap.subAreas.length > 0) || false);

        // Check if custom name is enabled by checking if any translation exists
        const hasCustomName = currentMap?.subAreaCustomName &&
            Object.values(currentMap.subAreaCustomName).some(value => value && value.trim() !== '');
        setCustomNameEnabled(!!hasCustomName);
    }, [currentMap?.id]);

    useEffect(() => {
        // Clear search when switching maps
        setSearchTerm('');
    }, [currentMap?.id]);

    const handleCustomNameToggle = (enabled: boolean) => {
        if (enabled) {
            setCustomNameEnabled(true);
            setCurrentMap({
                ...currentMap!,
                subAreaCustomName: { en: "", fr: "", de: "", ja: "" }
            });
        } else {
            // Show confirmation dialog
            const confirmed = window.confirm(
                "Êtes-vous sûr de vouloir désactiver et effacer tous les noms personnalisés de sous-zone ? Cette action ne peut pas être annulée."
            );
            if (confirmed) {
                setCustomNameEnabled(false);
                if (currentMap) {
                    setCurrentMap({
                        ...currentMap,
                        subAreaCustomName: {
                            en: "",
                            fr: "",
                            de: "",
                            ja: ""
                        }
                    });
                }
            }
        }
    };

    // useEffect, if subAreasCustomName change and is not empty, enable toggle
    useEffect(() => {
        if (currentMap?.subAreaCustomName && Object.values(currentMap.subAreaCustomName).some(name => name.trim() !== "")) {
            setSubareasEnabled(true);
            ensureSelfInSubAreas();
        }
    }, [currentMap?.subAreaCustomName]);

    return (
        <div className="flex flex-col gap-2">
            <label className="font-bold flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={subareasEnabled}
                    onChange={e => {
                        const enabled = e.target.checked;
                        setSubareasEnabled(enabled);
                        if (enabled) {
                            ensureSelfInSubAreas();
                        } else {
                            setSubAreasSafe([]);
                        }
                    }}
                />
                Activer les sous-zones (subareas)
            </label>
            {subareasEnabled && (
                <>
                    {/* Custom name toggle and fields */}
                    <div className="flex flex-col gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <label className="font-bold flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={customNameEnabled}
                                onChange={e => handleCustomNameToggle(e.target.checked)}
                            />
                            Nom personnalisé pour cette carte (quand utilisée comme sous-zone)
                        </label>

                        {customNameEnabled && (
                            <>
                                <p className="text-xs text-gray-600">
                                    Ces noms seront affichés à la place du nom normal quand cette carte est incluse dans les sous-zones d'une autre carte.
                                </p>

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
                                            placeholder="English custom name"
                                            value={currentMap?.subAreaCustomName?.en || ""}
                                            onChange={(e) => updateSubAreaCustomNameLocale("en", e.target.value)}
                                            className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("en") ? "placeholder-red-400" : ""
                                                }`}
                                        />
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
                                            placeholder="French custom name"
                                            value={currentMap?.subAreaCustomName?.fr || ""}
                                            onChange={(e) => updateSubAreaCustomNameLocale("fr", e.target.value)}
                                            className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("fr") ? "placeholder-red-400" : ""
                                                }`}
                                        />
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
                                            placeholder="German custom name"
                                            value={currentMap?.subAreaCustomName?.de || ""}
                                            onChange={(e) => updateSubAreaCustomNameLocale("de", e.target.value)}
                                            className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("de") ? "placeholder-red-400" : ""
                                                }`}
                                        />
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
                                            placeholder="Japanese custom name"
                                            value={currentMap?.subAreaCustomName?.ja || ""}
                                            onChange={(e) => updateSubAreaCustomNameLocale("ja", e.target.value)}
                                            className={`flex-1 px-3 py-2 bg-transparent outline-none text-sm min-w-0 ${isFieldEmpty("ja") ? "placeholder-red-400" : ""
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Data Input Section */}
                                {showImportSection && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Import Custom Names from Tab-Separated Data</h3>
                                        <div className="space-y-2">
                                            <textarea
                                                value={dataInput}
                                                onChange={(e) => setDataInput(e.target.value)}
                                                placeholder={`Paste tab-separated data here, e.g.:
6	fr	Quartier Marchand
6	en	Merchant Quarter
6	ja	商人区
6	de	Händlerviertel`}
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
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {showImportSection ? "Hide" : "Show"} Import Section
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Subareas List with reorder/remove */}
                    <ul className="mb-2">
                        {(currentMap?.subAreas || []).map((id, idx) => {
                            const map = maps.find(m => m.id === id);
                            const displayName = map?.subAreaCustomName?.en || map?.name?.en || id;
                            return (
                                <li key={id} className="flex items-center gap-2 mb-1">
                                    <span className="flex-1">{displayName}</span>
                                    <button
                                        disabled={idx === 0}
                                        onClick={() => moveSubArea(idx, "up")}
                                        className="px-2"
                                        title="Monter"
                                    >↑</button>
                                    <button
                                        disabled={idx === (currentMap?.subAreas?.length || 1) - 1}
                                        onClick={() => moveSubArea(idx, "down")}
                                        className="px-2"
                                        title="Descendre"
                                    >↓</button>
                                    <button
                                        onClick={() => {
                                            if (id !== currentMap?.id) setSubAreasSafe((currentMap?.subAreas || []).filter(sid => sid !== id));
                                        }}
                                        className="px-2 text-red-500"
                                        title="Retirer"
                                    >X</button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Search input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Rechercher des cartes:</label>
                        <input
                            type="text"
                            placeholder="Tapez pour rechercher..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="border p-2 rounded"
                        />
                    </div>

                    {/* Add subareas select */}
                    <label className="text-sm text-gray-500 mb-1">
                        (Hold <kbd>Ctrl</kbd> or <kbd>Shift</kbd> to select multiple maps)
                    </label>
                    <select
                        multiple
                        value={currentSubAreas}
                        onChange={e => {
                            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                            const newSubAreas = [currentMap?.id as string, ...selected];
                            setSubAreasSafe(newSubAreas);
                        }}
                        className="border p-2 h-32"
                    >
                        {mapsToShow.map(m => (
                            <option
                                key={m.id}
                                value={m.id}
                                className={currentSubAreas.includes(m.id) ? "bg-blue-100" : ""}
                            >
                                {currentSubAreas.includes(m.id) ? "✓ " : ""}{m.name?.en || "Sans nom"}{m.subAreaCustomName?.en ? ` (${m.subAreaCustomName.en})` : ""}
                            </option>
                        ))}
                    </select>
                    {searchTerm && filteredMaps.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Aucune carte trouvée pour "{searchTerm}"</p>
                    )}
                </>
            )}
        </div>
    )
}

export default MapFormSubareas