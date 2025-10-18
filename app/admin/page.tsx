"use client";

import { useState, useEffect } from "react";
import { FaImage, FaUpload, FaList, FaMap, FaMapMarkedAlt, FaCog } from "react-icons/fa";
import PanoramaBatchUploader from "@/app/components/PanoramaBatchUploader/PanoramaBatchUploader";
import PhotosphereList from "./components/PhotosphereList";
import PhotospherePreview from "./components/PhotospherePreview";
import PhotosphereStats from "./components/PhotosphereStats";
import MapEor from "../components/MapEor/MapEor";
import MapList from "./components/maps/MapList";
import AdminLocaleSelector from "./components/maps/AdminLocaleSelector";
import AdminExpansionSelector from "./components/maps/AdminExpansionSelector";
import AdminMapTypeSelector from "./components/maps/AdminMapTypeSelector";
import MapForm from "./components/maps/MapForm/MapForm";
import AdminMapError from "./components/maps/AdminMapError";
import MapSettings from "./components/maps/MapSettings";

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

type TabType = 'photosphere-upload' | 'photosphere-library' | 'maps';

export default function AdminPage() {
    const [photospheres, setPhotospheres] = useState<Photosphere[]>([]);
    const [selectedPhotosphere, setSelectedPhotosphere] = useState<Photosphere | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('photosphere-library');
    const [loading, setLoading] = useState(false);

    // Map related states
    const [showPolygonsEditor, setShowPolygonsEditor] = useState(false);
    const [dragMode, setDragMode] = useState(false);

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
    }, [activeTab]);

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

    const handleDeletePhotosphere = async (id: string) => {
        try {
            console.log('Attempting to delete photosphere with ID:', id);
            const url = `/api/photospheres/${id}`;
            console.log('DELETE URL:', url);

            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Photosphere deleted from S3:', result);

                // Remove from local state only after successful S3 deletion
                setPhotospheres(prev => prev.filter(p => p.id !== id));
                if (selectedPhotosphere?.id === id) {
                    setSelectedPhotosphere(null);
                }
            } else if (response.status === 403) {
                const error = await response.json().catch(() => ({ error: 'Permission denied' }));
                console.error('Permission error deleting photosphere:', error);
                alert('Erreur de permissions: L\'utilisateur AWS n\'a pas les droits pour supprimer les fichiers S3. Contactez l\'administrateur pour ajouter la permission s3:DeleteObject.');
            } else if (response.status === 207) {
                const error = await response.json().catch(() => ({ error: 'Partial deletion failure' }));
                console.error('Partial deletion failure:', error);
                alert(`Suppression partielle: ${error.message || 'Certains fichiers n\'ont pas pu être supprimés.'}`);
                // Refresh the list to see what remains
                fetchPhotospheres();
            } else {
                const error = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                console.error('Failed to delete photosphere:', error);
                const errorMsg = error.details ? `${error.error}: ${error.details}` : (error.error || 'Erreur inconnue');
                alert('Erreur lors de la suppression de la photosphère: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error deleting photosphere:', error);
            alert('Erreur lors de la suppression de la photosphère. Veuillez réessayer.');
        }
    };

    const tabs = [
        {
            id: 'photosphere-upload' as TabType,
            label: 'Upload Photosphères',
            icon: <FaUpload />,
            description: 'Télécharger des photosphères'
        },
        {
            id: 'photosphere-library' as TabType,
            label: 'Bibliothèque',
            icon: <FaList />,
            description: 'Gérer les photosphères existantes'
        },
        {
            id: 'maps' as TabType,
            label: 'Cartes',
            icon: <FaMap />,
            description: 'Gérer les cartes'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <FaCog className="text-2xl text-purple-600" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Administration Eorguessr
                            </h1>
                        </div>

                        <div className="text-sm text-gray-600">
                            {activeTab === 'photosphere-library' && `${photospheres.length} photosphère(s)`}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
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
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Photosphere Upload Tab */}
                {activeTab === 'photosphere-upload' && (
                    <div className="max-w-7xl m-auto">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Télécharger des Photosphères</h2>
                            <p className="text-gray-600">Téléchargez et traitez vos photosphères par lot.</p>
                        </div>
                        <PanoramaBatchUploader onComplete={handleBatchUploadComplete} />
                    </div>
                )}

                {/* Photosphere Library Tab */}
                {activeTab === 'photosphere-library' && (
                    <div className="max-w-7xl m-auto">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bibliothèque de Photosphères</h2>
                            <p className="text-gray-600">Gérez vos photosphères existantes et prévisualisez-les.</p>
                        </div>

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
                    </div>
                )}

                {/* Maps Tab */}
                {activeTab === 'maps' && (
                    <div className="mx-40">
                        <div className="bg-white shadow-sm border-t border-gray-200 overflow-hidden">
                            <div className="flex">
                                <div className="p-6 border-r border-gray-200 bg-gray-50 overflow-auto">
                                    <AdminMapError />
                                    <div className="flex gap-10">
                                        <div className="w-[300px] flex flex-col gap-4">
                                            <AdminLocaleSelector />
                                            <AdminExpansionSelector />
                                            <AdminMapTypeSelector />
                                        </div>
                                        <div className="w-[500px] flex flex-col gap-4 max-h-[1000px] overflow-auto">
                                            <MapList />
                                        </div>
                                        <div className="w-[500px] flex flex-col gap-4 max-h-[1000px] overflow-auto">
                                            <MapForm />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col items-center">
                                    <div className="w-full p-4 border-b border-gray-200 bg-white">
                                        <MapSettings
                                            showPolygonsEditor={showPolygonsEditor}
                                            setShowPolygonsEditor={setShowPolygonsEditor}
                                            dragMode={dragMode}
                                            setDragMode={setDragMode}
                                        />
                                    </div>
                                    <div className="flex-1 w-full flex items-center justify-center">
                                        <MapEor
                                            showPolygonsEditor={showPolygonsEditor}
                                            dragMode={dragMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}