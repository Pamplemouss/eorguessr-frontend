"use client";
import { useState, useEffect, useRef } from "react";
import { createEmptyMapForm } from "@/lib/utils/createEmptyMapForm";
import { MapType } from "@/lib/types/MapTypeEnum";
import { Map, MapName } from "@/lib/types/Map";
import { Expansion } from "@/lib/types/ExpansionEnum";
import dynamic from "next/dynamic";
import MarkerFormList from "./MarkerFormList";
import { useLocale } from "@/app/components/contexts/LocalContextProvider";
import { useMap } from "@/app/components/contexts/MapContextProvider";
import isEqual from "lodash.isequal";

const MapEor = dynamic(() => import("./MapEor"), { ssr: false });

export default function AdminMapsPage() {
    const { locale, setLocale } = useLocale();
    const { maps, saveMap, deleteMap, isLoading, error, setCurrentMapById, currentMap } = useMap();
    const [search, setSearch] = useState("");
    const [draft, setDraft] = useState<Partial<Map>>(createEmptyMapForm());
    const [subareasEnabled, setSubareasEnabled] = useState((draft.subAreas && draft.subAreas.length > 0) || false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (currentMap?.id) {
            const m = maps.find((m) => m.id === currentMap.id);
            if (m) setDraft(m);
        } else {
            setDraft(createEmptyMapForm());
        }
    }, [currentMap?.id, maps]);

    useEffect(() => {
        setSubareasEnabled((draft.subAreas && draft.subAreas.length > 0) || false);
    }, [draft.id]);

    const filteredMaps = maps.filter((m) =>
        (m.name["en"] || "").toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        setIsDirty(currentMap ? !isEqual(draft, currentMap) : false);
    }, [draft, currentMap?.id, maps, currentMap?.markers]);

    const handleSave = async () => {
        if (!draft.name) return alert("Le nom est requis !");

        try {
            const savedMap = await saveMap(draft);
            if (!currentMap?.id) {
                setCurrentMapById(savedMap.id);
            }
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
            setDraft(createEmptyMapForm());
        } catch (err) {
            alert("Erreur lors de la suppression");
            console.error("Delete error:", err);
        }
    };

    function updateMapNameLocale(
        locale: keyof MapName,
        value: string
    ) {
        setDraft({
            ...draft,
            name: {
                en: draft.name?.en ?? "",
                fr: draft.name?.fr ?? "",
                de: draft.name?.de ?? "",
                ja: draft.name?.ja ?? "",
                [locale]: value
            }
        });
    }

    // Helper to update subareas and ensure uniqueness
    function setSubAreasSafe(newSubAreas: string[]) {
        const unique = Array.from(new Set(newSubAreas));
        setDraft({ ...draft, subAreas: unique });
    }

    // Helper to add self map if not present
    function ensureSelfInSubAreas() {
        if (!draft.id) return;
        if (!draft.subAreas?.includes(draft.id)) {
            setSubAreasSafe([draft.id, ...(draft.subAreas || []).filter(id => id !== draft.id)]);
        }
    }

    // Helper to remove self map
    function removeSelfFromSubAreas() {
        setSubAreasSafe((draft.subAreas || []).filter(id => id !== draft.id));
    }

    // Helper to move subarea up/down
    function moveSubArea(index: number, direction: "up" | "down") {
        const arr = [...(draft.subAreas || [])];
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === arr.length - 1)
        ) return;
        const swapWith = direction === "up" ? index - 1 : index + 1;
        [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
        setSubAreasSafe(arr);
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
                        value={draft.id || ""}
                        disabled
                        className="border p-2 bg-gray-100 text-gray-500"
                    />

                    {/* Map Name Locales */}
                    <div className="flex flex-col gap-2">
                        <label className="font-bold">Nom de la map (locales):</label>
                        <input
                            type="text"
                            placeholder="Nom (EN)"
                            value={draft.name?.en || ""}
                            onChange={(e) => updateMapNameLocale("en", e.target.value)}
                            className="border p-2"
                        />
                        <input
                            type="text"
                            placeholder="Nom (FR)"
                            value={draft.name?.fr || ""}
                            onChange={(e) => updateMapNameLocale("fr", e.target.value)}
                            className="border p-2"
                        />
                        <input
                            type="text"
                            placeholder="Nom (DE)"
                            value={draft.name?.de || ""}
                            onChange={(e) => updateMapNameLocale("de", e.target.value)}
                            className="border p-2"
                        />
                        <input
                            type="text"
                            placeholder="Nom (JA)"
                            value={draft.name?.ja || ""}
                            onChange={(e) => updateMapNameLocale("ja", e.target.value)}
                            className="border p-2"
                        />
                    </div>

                    {/* Expansion */}
                    <select
                        value={draft.expansion || Expansion.ARR}
                        onChange={(e) =>
                            setDraft({ ...draft, expansion: e.target.value as Expansion })
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
                        value={draft.type || MapType.MAP}
                        onChange={(e) =>
                            setDraft({ ...draft, type: e.target.value as MapType })
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
                            value={draft.parentMap || ""}
                            onChange={(e) =>
                                setDraft({ ...draft, parentMap: e.target.value || null })
                            }
                            className="border p-2"
                        >
                            <option value="">Aucune carte parente</option>
                            {maps
                                .filter((m) => m.id !== draft.id) // Exclude current map
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
                            draft.type === MapType.WORLD_MAP
                                ? ""
                                : draft.type === MapType.REGION
                                    ? draft.id || ""
                                    : draft.region || ""
                        }
                        disabled={
                            draft.type === MapType.WORLD_MAP ||
                            draft.type === MapType.REGION
                        }
                        onChange={(e) =>
                            setDraft({ ...draft, region: e.target.value })
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
                                    {(draft.subAreas || []).map((id, idx) => {
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
                                                    disabled={idx === (draft.subAreas?.length || 1) - 1}
                                                    onClick={() => moveSubArea(idx, "down")}
                                                    className="px-2"
                                                    title="Descendre"
                                                >↓</button>
                                                <button
                                                    onClick={() => {
                                                        if (id !== draft.id) setSubAreasSafe((draft.subAreas || []).filter(sid => sid !== id));
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
                                    value={(draft.subAreas || []).filter(id => id !== draft.id)}
                                    onChange={e => {
                                        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                        const newSubAreas = [draft.id as string, ...selected];
                                        setSubAreasSafe(newSubAreas);
                                    }}
                                    className="border p-2 h-32"
                                >
                                    {maps
                                        .filter(m => m.id !== draft.id)
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
                        value={draft.imagePath || ""}
                        onChange={(e) => setDraft({ ...draft, imagePath: e.target.value })}
                        className="border p-2"
                    />

                    <div className="flex gap-2 mt-2">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 flex items-center gap-2 relative"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isDirty && !isLoading && (
                                <span
                                    className="inline-block w-3 h-3 rounded-full bg-red-500 absolute -right-1.5 -top-1.5"
                                    title="Des modifications non sauvegardées"
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
                {draft && (
                    <MapEor />
                )}
            </div>
        </div>
    );
}
