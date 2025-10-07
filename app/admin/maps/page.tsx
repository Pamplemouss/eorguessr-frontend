"use client";

import MapEor from "../../components/MapEor/MapEor";
import MapList from "./components/MapList";
import AdminLocaleSelector from "./components/AdminLocaleSelector";
import MapForm from "./components/MapForm";
import AdminMapError from "./components/AdminMapError";

export default function AdminMapsPage() {
    return (
        <div className="flex h-screen w-screen">
            <div className="p-4 flex flex-col gap-4">
                <h1 className="text-2xl mb-4">Admin - Maps</h1>
                <AdminMapError />
                <AdminLocaleSelector />
                <MapList />
                <MapForm />
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center">
                <MapEor />
            </div>
        </div>
    );
}
