import { useAdmin } from '@/app/providers/AdminContextProvider';
import { Map } from '@/lib/types/Map';
import isEqual from 'lodash.isequal';
import React, { useEffect, useState } from 'react'

const MapFormActions = () => {
    const { saveMap, deleteMap, isLoading, setCurrentMapById, currentMap, setCurrentMap } = useAdmin();
    const [cleanMapCopy, setCleanMapCopy] = useState<Map | null>(null);

    // Create a clean copy when currentMap ID changes
    useEffect(() => {
        if (currentMap) {
            setCleanMapCopy(JSON.parse(JSON.stringify(currentMap)));
        }
    }, [currentMap?.id]);

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

    const isMapDirty = () => {
        return !isEqual(currentMap, cleanMapCopy);
    };


    return (
        <div className="sticky bottom-0 bg-white mt-auto p-3 border border-black/30 shadow-lg flex gap-2 justify-end z-10">
            <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 flex items-center gap-2 relative"
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
    )
}

export default MapFormActions

