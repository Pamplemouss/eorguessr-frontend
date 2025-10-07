import { useMap } from '@/app/providers/MapContextProvider';
import React from 'react'

const MapSettings = ({
    showPolygonsEditor,
    setShowPolygonsEditor,
    dragMode,
    setDragMode
} : {
    showPolygonsEditor: boolean;
    setShowPolygonsEditor: React.Dispatch<React.SetStateAction<boolean>>;
    dragMode: boolean;
    setDragMode: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { changeMapEnabled, setChangeMapEnabled } = useMap();
    return (
        <div className="flex flex-col gap-2">
            <button
                className={`p-2 border rounded shadow ${changeMapEnabled ? "bg-blue-200" : "bg-white"}`}
                onClick={() => setChangeMapEnabled(!changeMapEnabled)}
            >
                {changeMapEnabled
                    ? "Désactiver le changement de map au clic sur marker"
                    : "Activer le changement de map au clic sur marker"}
            </button>
            <button
                className="p-2 bg-white border rounded shadow"
                onClick={() => setShowPolygonsEditor(v => !v)}
            >
                {showPolygonsEditor ? "Masquer l'éditeur de polygones" : "Afficher l'éditeur de polygones"}
            </button>
            <button
                className={`p-2 border rounded shadow ${dragMode ? "bg-blue-200" : "bg-white"}`}
                onClick={() => setDragMode(v => !v)}
            >
                {dragMode ? "Désactiver le déplacement des markers" : "Activer le déplacement des markers"}
            </button>
        </div>
    )
}

export default MapSettings