"use client";

import React from "react";
import MapEor, { MapEorProps } from "./MapEor";
import { useAdmin } from "@/app/providers/AdminContextProvider";

interface AdminMapEorProps extends Omit<MapEorProps, 'currentMap' | 'showMapDetails' | 'changeMapEnabled' | 'onMapChange'> {
}

export default function AdminMapEor(props: AdminMapEorProps) {
    const { 
        currentMap, 
        filteredMaps,
        showMapDetails, 
        setShowMapDetails,
        changeMapEnabled, 
        setCurrentMapById 
    } = useAdmin();

    return (
        <MapEor
            {...props}
            currentMap={currentMap}
            allMaps={filteredMaps}
            showMapDetails={showMapDetails}
            onShowMapDetailsChange={setShowMapDetails}
            changeMapEnabled={changeMapEnabled}
            onMapChange={setCurrentMapById}
        />
    );
}