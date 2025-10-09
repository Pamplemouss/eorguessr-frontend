"use client";

import MapEor from "../../components/MapEor/MapEor";
import MapList from "./components/MapList";
import AdminLocaleSelector from "./components/AdminLocaleSelector";
import AdminExpansionSelector from "./components/AdminExpansionSelector";
import AdminMapTypeSelector from "./components/AdminMapTypeSelector";
import MapForm from "./components/MapForm/MapForm";
import AdminMapError from "./components/AdminMapError";
import { useState } from "react";
import MapSettings from "./components/MapSettings";

export default function AdminMapsPage() {
    const [showPolygonsEditor, setShowPolygonsEditor] = useState(false);
    const [dragMode, setDragMode] = useState(false);
    
    return (
        <div className="flex h-screen w-screen">
            <div className="p-4 flex flex-col gap-4">
                <h1 className="text-2xl mb-4">Admin - Maps</h1>
                <AdminMapError />
                <AdminLocaleSelector />
                <AdminExpansionSelector />
                <AdminMapTypeSelector />
                <MapList />
                <MapForm />
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center gap-10">
                <MapSettings
                    showPolygonsEditor={showPolygonsEditor}
                    setShowPolygonsEditor={setShowPolygonsEditor}
                    dragMode={dragMode}
                    setDragMode={setDragMode}
                />
                <MapEor
                    showPolygonsEditor={showPolygonsEditor}
                    dragMode={dragMode}
                />
            </div>
        </div>
    );
}
