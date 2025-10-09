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
import MapFormSpecialBounds from './MapFormSpecialBounds';
import MapFormSpecialCenter from './MapFormSpecialCenter';
import MapFormSpecialZoom from './MapFormSpecialZoom';
import AdminCard from '../AdminCard';
import { FaMap } from 'react-icons/fa';
import MapFormCategory from './MapFormCategory';

const MapForm = () => {
    return (
        <AdminCard
            title="Map Details"
            icon={<FaMap />}
        >
            <div className="flex flex-col gap-4">
                <MapFormCategory title="Image path">
                    <MapFormImagePath />
                </MapFormCategory>
                <MapFormCategory title="Names">
                    <MapFormId />
                    <MapFormName />
                </MapFormCategory>
                <MapFormCategory title="Settings">
                    <div className="grid grid-cols-2 gap-2">
                        <MapFormExpansion />
                        <MapFormType />
                        <MapFormParent />
                        <MapFormRegion />
                    </div>
                </MapFormCategory>
                <MapFormCategory title="Markers">
                    <MapFormMarkers />
                </MapFormCategory>
                <MapFormCategory title="Subareas">
                    <MapFormSubareas />
                </MapFormCategory>
                <MapFormCategory title="Leaflet settings">
                    <MapFormSize />
                    <MapFormSpecialBounds />
                    <MapFormSpecialCenter />
                    <MapFormSpecialZoom />
                </MapFormCategory>
                <MapFormActions />
            </div>
        </AdminCard>
    )
}

export default MapForm