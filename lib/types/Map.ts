import { MapType } from './MapTypeEnum';
import { Marker } from '../types/Marker';
import { Expansion } from './ExpansionEnum';

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
    subAreas?: string[];
    imagePath?: string;
}