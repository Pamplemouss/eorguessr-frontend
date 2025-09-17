import { MapType } from './MapTypeEnum';
import { Marker } from '../types/Marker';
import { Expansion } from './ExpansionEnum';

export interface Map {
	id: string;
	name: string;
	expansion?: Expansion;
	type?: MapType;
    region?: string;
	markers: Marker[];
	subAreas?: string[];
	imagePath?: string;
}