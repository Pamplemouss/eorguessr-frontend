"use client";

import { useState, useEffect } from "react";
import { FaImage, FaUpload, FaList } from "react-icons/fa";
import PhotosphereUpload from "./components/PhotosphereUpload";
import PhotosphereList from "./components/PhotosphereList";
import PhotospherePreview from "./components/PhotospherePreview";
import PhotosphereStats from "./components/PhotosphereStats";
import PanoramaBatchUploader from "@/app/components/PanoramaBatchUploader/PanoramaBatchUploader";

interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date | string;
    size: number;
    thumbnailUrl?: string;
    variants?: {
        light?: string;
        medium?: string;
        heavy?: string;
        original?: string;
    };
}

type TabType = 'upload' | 'library';

export default function AdminPhotospheresPage() {
    const [photospheres, setPhotospheres] = useState<Photosphere[]>([]);
    const [selectedPhotosphere, setSelectedPhotosphere] = useState<Photosphere | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('upload');
    const [loading, setLoading] = useState(false);

    // Fetch photospheres from S3
    const fetchPhotospheres = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/photospheres');
            if (response.ok) {
                const data = await response.json();
                setPhotospheres(data);
            } else {
                console.error('Failed to fetch photospheres');
            }
        } catch (error) {
            console.error('Error fetching photospheres:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load photospheres on component mount and when switching to library tab
    useEffect(() => {
        if (activeTab === 'library') {
            fetchPhotospheres();
        }
    }, [activeTab]);

    const handlePhotosphereAdded = (newPhotosphere: Photosphere) => {
        setPhotospheres(prev => [...prev, newPhotosphere]);
        setSelectedPhotosphere(newPhotosphere);
        // Optionally switch to library tab to see the new upload
        // setActiveTab('library');
    };

    const handleBatchUploadComplete = (uploadedFiles: string[]) => {
        console.log('Batch upload completed:', uploadedFiles);
        // Refresh the photospheres list to include new uploads
        fetchPhotospheres();
        // Switch to library tab to see the results
        setActiveTab('library');
    };

    const handleDeletePhotosphere = (id: string) => {
        setPhotospheres(prev => prev.filter(p => p.id !== id));
        if (selectedPhotosphere?.id === id) {
            setSelectedPhotosphere(null);
        }
    };

    const tabs = [
        { 
            id: 'upload' as TabType, 
            label: 'Upload', 
            icon: <FaUpload />,
            description: 'Upload simple ou en lot'
        },
        { 
            id: 'library' as TabType, 
            label: 'Bibliothèque', 
            icon: <FaList />,
            description: 'Gérer les photosphères existantes'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <FaImage className="text-2xl text-purple-600" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Admin - Photosphères
                            </h1>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            {photospheres.length} photosphère(s) dans la bibliothèque
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                                    ${activeTab === tab.id
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Upload Tab */}
                {activeTab === 'upload' && (
                    <div className="space-y-8">
                        {/* Upload Section Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                Upload de photosphères
                            </h2>
                            <p className="text-gray-600">
                                Choisissez entre un upload simple ou un upload en lot avec traitement automatique
                            </p>
                        </div>

                        {/* Upload Options */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Single Upload */}
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Upload Simple</h3>
                                    <p className="text-sm text-gray-600">Upload une photosphère à la fois</p>
                                </div>
                                <PhotosphereUpload onPhotosphereAdded={handlePhotosphereAdded} />
                            </div>

                            {/* Batch Upload */}
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Upload en Lot</h3>
                                    <p className="text-sm text-gray-600">Upload multiple avec miniatures automatiques</p>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <PanoramaBatchUploader onComplete={handleBatchUploadComplete} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Library Tab */}
                {activeTab === 'library' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <PhotosphereStats photospheres={photospheres} loading={loading} />
                            <PhotosphereList 
                                photospheres={photospheres}
                                selectedPhotosphere={selectedPhotosphere}
                                onSelectPhotosphere={setSelectedPhotosphere}
                                onDeletePhotosphere={handleDeletePhotosphere}
                                loading={loading}
                                onRefresh={fetchPhotospheres}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <PhotospherePreview photosphere={selectedPhotosphere} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
