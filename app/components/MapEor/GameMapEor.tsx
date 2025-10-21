"use client";

import React, { useState } from "react";
import MapEor, { MapEorProps } from "./MapEor";
import { useGameMap } from "@/app/providers/NewGameMapContextProvider";

interface GameMapEorProps extends Omit<MapEorProps, 'currentMap' | 'showMapDetails' | 'changeMapEnabled' | 'onMapChange'> {
}

export default function GameMapEor(props: GameMapEorProps) {
    const { currentMap, availableMaps, setCurrentMapById } = useGameMap();
    const [showMapDetails, setShowMapDetails] = useState(true);

    return (
        <MapEor
            {...props}
            currentMap={currentMap}
            allMaps={availableMaps}
            showMapDetails={showMapDetails}
            onShowMapDetailsChange={setShowMapDetails}
            changeMapEnabled={true}
            onMapChange={setCurrentMapById}
        />
    );
}