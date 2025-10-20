import { MapType } from './MapType';
import { Marker } from '../types/Marker';
import { Expansion } from './Expansion';

export interface MapName {
    en: string;
    fr: string;
    de: string;
    ja: string;
}

export interface Map {
    id: string;
    name: MapName;
    expansion?: Expansion;
    type?: MapType;
    region?: string;
    markers: Marker[];
    parentMap: string | null;
    subAreas?: string[];
    subAreaCustomName?: string;
    imagePath?: string;
    specialBounds?: L.LatLngBoundsExpression;
    specialCenter?: L.LatLngExpression;
    specialZoom?: number;
    size: {
        x: number;
        y: number;
    }
}