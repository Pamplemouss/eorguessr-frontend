import { useMap } from '@/app/providers/MapContextProvider';
import { Map } from '@/lib/types/Map';
import React from 'react'
import MapFormMarkers from './Markers/MapFormMarkers';
import MapFormName from './MapFormName';
import MapFormExpansion from './MapFormExpansion';
import MapFormType from './MapFormType';
import MapFormParent from './MapFormParent';
import MapFormRegion from './MapFormRegion';
import MapFormSubareas from './MapFormSubareas';
import MapFormImagePath from './MapFormImagePath';
import MapFormActions from './MapFormActions';
import MapFormId from './MapFormId';
import MapFormSize from './MapFormSize';

const MapForm = () => {
    const { maps, currentMap } = useMap();

    return (
        <div className="border p-4 rounded max-w-md flex flex-col gap-2">
            <h2 className="text-xl">
                {maps.some((map: Map) => map.id === currentMap.id) ? "Éditer la map" : "Créer une map"}
            </h2>
            <MapFormId />
            <MapFormName />
            <MapFormExpansion />
            <MapFormType />
            <MapFormSize />
            <MapFormParent />
            <MapFormRegion />
            <MapFormSubareas />
            <MapFormImagePath />
            <MapFormMarkers />
            <MapFormActions />
        </div>
    )
}

export default MapForm