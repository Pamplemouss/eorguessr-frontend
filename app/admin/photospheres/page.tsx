"use client";

import { useState } from "react";
import PhotospherUpload from "./components/PhotospherUpload";
import PhotospherList from "./components/PhotospherList";
import PhotospeherPreview from "./components/PhotospeherPreview";
import PhotospeherStats from "./components/PhotospeherStats";

interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date;
    size: number;
}

export default function AdminPhotospheresPage() {
    const [photospheres, setPhotospheres] = useState<Photosphere[]>([
        // Exemple de données pour la démonstration
        {
            id: "1",
            name: "photosphere_demo.webp",
            url: "/photospheres/476.webp",
            uploadDate: new Date(2024, 9, 10),
            size: 2048576
        }
    ]);
    const [selectedPhotosphere, setSelectedPhotosphere] = useState<Photosphere | null>(null);

    const handlePhotosphereAdded = (newPhotosphere: Photosphere) => {
        setPhotospheres(prev => [...prev, newPhotosphere]);
        // Automatically select the newly uploaded photosphere
        setSelectedPhotosphere(newPhotosphere);
    };

    const handleDeletePhotosphere = (id: string) => {
        setPhotospheres(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="flex h-screen w-screen">
            {/* Sidebar */}
            <div className="p-4 pb-0 flex flex-col gap-4 h-screen overflow-auto w-96 border-r border-gray-200 bg-gray-50">
                <h1 className="text-2xl mb-4 font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Admin - Photosphères
                </h1>
                
                <PhotospeherStats photospheres={photospheres} />
                <PhotospherUpload onPhotosphereAdded={handlePhotosphereAdded} />
                <PhotospherList 
                    photospheres={photospheres}
                    selectedPhotosphere={selectedPhotosphere}
                    onSelectPhotosphere={setSelectedPhotosphere}
                    onDeletePhotosphere={handleDeletePhotosphere}
                />
            </div>

            {/* Main content */}
            <div className="w-full h-full flex flex-col p-4">
                <PhotospeherPreview photosphere={selectedPhotosphere} />
            </div>
        </div>
    );
}
