import { MapType } from '../types/MapType';
import { Marker } from '../types/Marker';

export interface Map extends Document {
	id: string;
	name: string;
	expansion?: string;
	type?: MapType;
    region?: string;
	markers: Marker[];
	subAreas?: string[];
	imagePath?: string;
}