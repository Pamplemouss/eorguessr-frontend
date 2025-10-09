"use client";

import MapEor from "../../components/MapEor/MapEor";
import MapList from "./components/MapList";
import AdminLocaleSelector from "./components/AdminLocaleSelector";
import MapForm from "./components/MapForm/MapForm";
import AdminMapError from "./components/AdminMapError";
import { useState } from "react";
import MapSettings from "./components/MapSettings";
import AdminFilters from "./components/AdminFilters";

export default function AdminMapsPage() {
    const [showPolygonsEditor, setShowPolygonsEditor] = useState(false);
    const [dragMode, setDragMode] = useState(false);

    return (
        <div className="flex h-screen w-screen">
            <div className="p-4 pb-0 flex flex-col gap-2 overflow-scroll h-full w-[1000px]">
                <h1 className="text-2xl">Admin - Maps</h1>
                <AdminMapError />
                <AdminLocaleSelector />
                <div className="flex flex-col gap-10">
                    <AdminFilters />
                    <MapList />
                    <MapForm />
                </div>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center gap-10">
                <MapSettings
                    showPolygonsEditor={showPolygonsEditor}
                    setShowPolygonsEditor={setShowPolygonsEditor}
                    dragMode={dragMode}
                    setDragMode={setDragMode}
                />
                
            </div>
        </div>
    );
}
