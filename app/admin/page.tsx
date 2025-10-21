"use client";

import { useState, useEffect } from "react";
import AdminHeader from "./components/AdminHeader";
import AdminTabNavigation from "./components/AdminTabNavigation";
import PhotosphereUploadTab from "./components/PhotosphereUploadTab";
import PhotosphereLibraryTab from "./components/PhotosphereLibraryTab";
import MapsTab from "./components/MapsTab";
import { usePhotosphereManager } from "./hooks/usePhotosphereManager";
import { TabType } from "./types/Photosphere";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabType>('photosphere-library');
    const {
        photospheres,
        selectedPhotosphere,
        setSelectedPhotosphere,
        loading,
        fetchPhotospheres,
        handleDeletePhotosphere,
    } = usePhotosphereManager();

    // Handle URL hash navigation
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash && ['photosphere-upload', 'photosphere-library', 'maps'].includes(hash)) {
            setActiveTab(hash as TabType);
        }
    }, []);

    // Load photospheres when switching to library tab
    useEffect(() => {
        if (activeTab === 'photosphere-library') {
            fetchPhotospheres();
        }
    }, [activeTab, fetchPhotospheres]);

    // Update URL hash when tab changes
    useEffect(() => {
        window.location.hash = activeTab;
    }, [activeTab]);

    const handleBatchUploadComplete = (uploadedFiles: string[]) => {
        console.log('Batch upload completed:', uploadedFiles);
        // Refresh the photospheres list to include new uploads
        fetchPhotospheres();
        // Switch to library tab to see the results
        setActiveTab('photosphere-library');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader 
                activeTab={activeTab} 
                photospheresCount={photospheres.length} 
            />
            
            <AdminTabNavigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'photosphere-upload' && (
                    <PhotosphereUploadTab onComplete={handleBatchUploadComplete} />
                )}

                {activeTab === 'photosphere-library' && (
                    <PhotosphereLibraryTab
                        photospheres={photospheres}
                        selectedPhotosphere={selectedPhotosphere}
                        onSelectPhotosphere={setSelectedPhotosphere}
                        onDeletePhotosphere={handleDeletePhotosphere}
                        loading={loading}
                        onRefresh={fetchPhotospheres}
                    />
                )}

                {activeTab === 'maps' && (
                    <MapsTab />
                )}
            </div>
        </div>
    );
}

