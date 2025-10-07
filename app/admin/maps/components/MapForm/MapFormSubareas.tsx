import { useMap } from '@/app/providers/MapContextProvider';
import React, { useEffect, useState } from 'react'

const MapFormSubareas = () => {
    const { maps, currentMap, setCurrentMap } = useMap();
    const [subareasEnabled, setSubareasEnabled] = useState(false);

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

    useEffect(() => {
        setSubareasEnabled((currentMap?.subAreas && currentMap.subAreas.length > 0) || false);
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
    )
}

export default MapFormSubareas