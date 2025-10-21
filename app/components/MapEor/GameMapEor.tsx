"use client";

import React from "react";
import MapEor, { MapEorProps } from "./MapEor";
import { useGameMap } from "@/app/providers/NewGameMapContextProvider";

interface GameMapEorProps extends Omit<MapEorProps, 'currentMap' | 'showMapDetails' | 'changeMapEnabled' | 'onMapChange'> {
}

export default function GameMapEor(props: GameMapEorProps) {
    const { currentMap, availableMaps, setCurrentMapById } = useGameMap();

    return (
        <MapEor
            {...props}
            currentMap={currentMap}
            allMaps={availableMaps}
            showMapDetails={true}
            changeMapEnabled={true}
            onMapChange={setCurrentMapById}
        />
    );
}