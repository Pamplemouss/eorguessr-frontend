import { useMap } from '@/app/providers/MapContextProvider';
import React, { useEffect, useState } from 'react'

const MapFormSubareas = () => {
    const { maps, currentMap, setCurrentMap } = useMap();
    const [subareasEnabled, setSubareasEnabled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
    }, [currentMap?.id]);

    useEffect(() => {
        // Clear search when switching maps
        setSearchTerm('');
    }, [currentMap?.id]);

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
                    {/* Custom name for this map when used as a subarea */}
                    <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded border border-blue-200">
                        <label className="text-sm font-medium">Nom personnalisé pour cette carte (quand utilisée comme sous-zone):</label>
                        <input
                            type="text"
                            placeholder={`Ex: "Merchant Strip" pour Limsa`}
                            value={currentMap?.subAreaCustomName || ''}
                            onChange={e => {
                                if (!currentMap) return;
                                setCurrentMap({ ...currentMap, subAreaCustomName: e.target.value || "" });
                            }}
                            className="border p-2 rounded"
                        />
                        <p className="text-xs text-gray-600">
                            Ce nom sera affiché à la place du nom normal quand cette carte est incluse dans les sous-zones d'une autre carte.
                        </p>
                    </div>

                    {/* Subareas List with reorder/remove */}
                    <ul className="mb-2">
                        {(currentMap?.subAreas || []).map((id, idx) => {
                            const map = maps.find(m => m.id === id);
                            return (
                                <li key={id} className="flex items-center gap-2 mb-1">
                                    <span className="flex-1">{map?.subAreaCustomName || map?.name?.en || id}</span>
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
                                {currentSubAreas.includes(m.id) ? "✓ " : ""}{m.name?.en || "Sans nom"}
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