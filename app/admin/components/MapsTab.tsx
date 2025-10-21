import { useState } from "react";
import MapEor from "../../components/MapEor/MapEor";
import MapList from "./maps/MapList";
import AdminLocaleSelector from "./maps/AdminLocaleSelector";
import AdminExpansionSelector from "./maps/AdminExpansionSelector";
import AdminMapTypeSelector from "./maps/AdminMapTypeSelector";
import MapForm from "./maps/MapForm/MapForm";
import AdminMapError from "./maps/AdminMapError";
import MapSettings from "./maps/MapSettings";
import { S3FilenameMigrator } from "./S3FilenameMigrator";

export default function MapsTab() {
    const [showPolygonsEditor, setShowPolygonsEditor] = useState(false);
    const [dragMode, setDragMode] = useState(false);

    return (
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
                        
                        {/* S3 Filename Migration Tool */}
                        <div className="mt-6 w-full max-w-6xl">
                            <S3FilenameMigrator />
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
    );
}