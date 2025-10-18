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
import { FaCog } from 'react-icons/fa';
import MapFormCategory from './MapFormCategory';

const MapForm = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <FaCog />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                    Détails de la Carte
                </h3>
            </div>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
                <MapFormCategory title="Chemin de l'image">
                    <MapFormImagePath />
                </MapFormCategory>
                <MapFormCategory title="Noms">
                    <MapFormId />
                    <MapFormName />
                </MapFormCategory>
                <MapFormCategory title="Paramètres">
                    <div className="grid grid-cols-1 gap-3">
                        <MapFormExpansion />
                        <MapFormType />
                        <MapFormParent />
                        <MapFormRegion />
                    </div>
                </MapFormCategory>
                <MapFormCategory title="Marqueurs">
                    <MapFormMarkers />
                </MapFormCategory>
                <MapFormCategory title="Sous-zones">
                    <MapFormSubareas />
                </MapFormCategory>
                <MapFormCategory title="Paramètres Leaflet">
                    <MapFormSize />
                    <MapFormSpecialBounds />
                    <MapFormSpecialCenter />
                    <MapFormSpecialZoom />
                </MapFormCategory>
                <MapFormActions />
            </div>
        </div>
    )
}

export default MapForm