"use client";
import { useState, useEffect } from "react";
import { createEmptyMapForm } from "@/lib/utils/createEmptyMapForm";
import { MapType } from "@/lib/types/MapTypeEnum";
import { Map, MapName } from "@/lib/types/Map";
import { Expansion } from "@/lib/types/ExpansionEnum";
import dynamic from "next/dynamic";
import MarkerFormList from "./MarkerFormList";
import { useLocale } from "@/app/components/contexts/LocalContextProvider";
import { useMap } from "@/app/components/contexts/MapContextProvider";

const MapEor = dynamic(() => import("./MapEor"), { ssr: false });

export default function AdminMapsPage() {
    const { locale, setLocale } = useLocale();
    const { maps, saveMap, deleteMap, isLoading, error, setCurrentMapById, currentMap, setCurrentMap } = useMap();
    const [search, setSearch] = useState("");
    const [subareasEnabled, setSubareasEnabled] = useState(false);
    const [cleanMapCopy, setCleanMapCopy] = useState<Map | null>(null);

    useEffect(() => {
        if (!currentMap) {
            setCurrentMap(createEmptyMapForm());
        }
    }, [currentMap, setCurrentMap]);

    // Create a clean copy when currentMap ID changes
    useEffect(() => {
        if (currentMap) {
            setCleanMapCopy(JSON.parse(JSON.stringify(currentMap)));
        }
    }, [currentMap?.id]);

    useEffect(() => {
        setSubareasEnabled((currentMap?.subAreas && currentMap.subAreas.length > 0) || false);
    }, [currentMap?.id]);

    // Check if current map is dirty
    const isMapDirty = () => {
        if (!currentMap || !cleanMapCopy) return false;
        return JSON.stringify(currentMap) !== JSON.stringify(cleanMapCopy);
    };

    const filteredMaps = maps.filter((m) =>
        (m.name["en"] || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = async () => {
        if (!currentMap?.name) return alert("Le nom est requis !");

        try {
            const savedMap = await saveMap(currentMap);
            if (!currentMap?.id) {
                setCurrentMapById(savedMap.id);
            }
            // Update clean copy after successful save
            setCleanMapCopy(JSON.parse(JSON.stringify(savedMap)));
        } catch (err) {
            alert("Erreur lors de la sauvegarde");
            console.error("Save error:", err);
        }
    };

    const handleDelete = async () => {
        if (!currentMap?.id) return;
        if (!confirm("Supprimer cette map ?")) return;

        try {
            await deleteMap(currentMap.id);
            setCurrentMapById(null);
        } catch (err) {
            alert("Erreur lors de la suppression");
            console.error("Delete error:", err);
        }
    };

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

    // Helper to update subareas and ensure uniqueness
    function setSubAreasSafe(newSubAreas: string[]) {
        if (!currentMap) return;
        const unique = Array.from(new Set(newSubAreas));
        setCurrentMap({ ...currentMap, subAreas: unique });
    }

    // Helper to add self map if not present
    function ensureSelfInSubAreas() {
        if (!currentMap?.id) return;
        if (!currentMap.subAreas?.includes(currentMap.id)) {
            setSubAreasSafe([currentMap.id, ...(currentMap.subAreas || []).filter(id => id !== currentMap.id)]);
        }
    }

    // Helper to move subarea up/down
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

    if (!currentMap) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen w-screen">
            <div className="p-4 flex flex-col gap-4">
                <h1 className="text-2xl mb-4">Admin - Maps</h1>

                {/* Error display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Langue */}
                <div className="flex items-center gap-2 mb-4">
                    <label className="font-bold">Langue:</label>
                    <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value)}
                        className="border p-2"
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                    </select>
                </div>

                {/* Recherche + bouton créer */}
                <div className="flex items-center gap-2 mb-4">
                    <input
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-2 w-64"
                    />
                    <button
                        className="bg-green-500 text-white px-4 py-2"
                        onClick={() => setCurrentMapById(null)}
                    >
                        + Créer une nouvelle map
                    </button>
                </div>

                {/* Liste des maps */}
                <div className="border p-2 rounded max-w-md">
                    {filteredMaps.length === 0 ? (
                        <p>Aucune map trouvée.</p>
                    ) : (
                        <ul>
                            {filteredMaps.map((m) => (
                                <li
                                    key={m.id}
                                    className={`p-2 cursor-pointer hover:bg-gray-100 ${currentMap?.id === m.id ? "bg-gray-200" : ""
                                        }`}
                                    onClick={() => setCurrentMapById(m.id)}
                                >
                                    <span className="font-bold">{m.name?.en || "Sans nom"}</span>{" "}
                                    {m.type && (
                                        <span className="text-gray-500">({m.type})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Formulaire CRUD */}
                <div className="border p-4 rounded max-w-md flex flex-col gap-2">
                    <h2 className="text-xl">
                        {currentMap?.id ? "Éditer la map" : "Créer une map"}
                    </h2>

                    {/* UUID affiché */}
                    <input
                        type="text"
                        value={currentMap?.id || ""}
                        disabled
                        className="border p-2 bg-gray-100 text-gray-500"
                    />

                    {/* Map Name Locales */}
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

                    {/* Expansion */}
                    <select
                        value={currentMap?.expansion || Expansion.ARR}
                        onChange={(e) =>
                            setCurrentMap({ ...currentMap, expansion: e.target.value as Expansion })
                        }
                        className="border p-2"
                    >
                        {Object.values(Expansion).map((exp) => (
                            <option key={exp} value={exp}>
                                {exp}
                            </option>
                        ))}
                    </select>

                    {/* Map Type */}
                    <select
                        value={currentMap?.type || MapType.MAP}
                        onChange={(e) =>
                            setCurrentMap({ ...currentMap, type: e.target.value as MapType })
                        }
                        className="border p-2"
                    >
                        {Object.values(MapType).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>

                    {/* Parent Map Field */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold">Carte parente:</label>
                        <select
                            value={currentMap?.parentMap || ""}
                            onChange={(e) =>
                                setCurrentMap({ ...currentMap, parentMap: e.target.value || null })
                            }
                            className="border p-2"
                        >
                            <option value="">Aucune carte parente</option>
                            {maps
                                .filter((m) => m.id !== currentMap?.id) // Exclude current map
                                .map((parentMap) => (
                                    <option key={parentMap.id} value={parentMap.id}>
                                        {parentMap.name?.en || "Sans nom"}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Region Field */}
                    <select
                        value={
                            currentMap?.type === MapType.WORLD_MAP
                                ? ""
                                : currentMap?.type === MapType.REGION
                                    ? currentMap?.id || ""
                                    : currentMap?.region || ""
                        }
                        disabled={
                            currentMap?.type === MapType.WORLD_MAP ||
                            currentMap?.type === MapType.REGION
                        }
                        onChange={(e) =>
                            setCurrentMap({ ...currentMap, region: e.target.value })
                        }
                        className="border p-2"
                    >
                        <option value="">Aucune région</option>
                        {maps
                            .filter((m) => m.type === MapType.REGION)
                            .map((region) => (
                                <option key={region.id} value={region.id}>
                                    {region.name?.en || "Sans nom"}
                                </option>
                            ))}
                    </select>

                    {/* Subareas Toggle & Editor */}
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
                                {/* Subareas List with reorder/remove */}
                                <ul className="mb-2">
                                    {(currentMap?.subAreas || []).map((id, idx) => {
                                        const map = maps.find(m => m.id === id);
                                        return (
                                            <li key={id} className="flex items-center gap-2 mb-1">
                                                <span className="flex-1">{map?.name?.en || id}</span>
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
                                {/* Add subareas select */}
                                <label className="text-sm text-gray-500 mb-1">
                                    (Hold <kbd>Ctrl</kbd> or <kbd>Shift</kbd> to select multiple maps)
                                </label>
                                <select
                                    multiple
                                    value={(currentMap?.subAreas || []).filter(id => id !== currentMap?.id)}
                                    onChange={e => {
                                        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                        const newSubAreas = [currentMap?.id as string, ...selected];
                                        setSubAreasSafe(newSubAreas);
                                    }}
                                    className="border p-2 h-32"
                                >
                                    {maps
                                        .filter(m => m.id !== currentMap?.id)
                                        .map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name?.en || "Sans nom"}
                                            </option>
                                        ))}
                                </select>
                            </>
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Image Path"
                        value={currentMap?.imagePath || ""}
                        onChange={(e) => setCurrentMap({ ...currentMap, imagePath: e.target.value })}
                        className="border p-2"
                    />

                    <div className="flex gap-2 mt-2">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 flex items-center gap-2 relative"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isMapDirty() && (
                                <span
                                    className="inline-block w-3 h-3 rounded-full bg-red-500 absolute -right-1.5 -top-1.5"
                                    title="Unsaved changes"
                                ></span>
                            )}
                            {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                        {currentMap?.id && (
                            <button
                                className="bg-red-500 text-white px-4 py-2"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                Supprimer
                            </button>
                        )}
                    </div>
                </div>

            </div>
            <div>
                <MarkerFormList />
            </div>
            <div className="w-full h-full flex flex-col items-center justify-center">
                {currentMap && (
                    <MapEor />
                )}
            </div>
        </div>
    );
}
