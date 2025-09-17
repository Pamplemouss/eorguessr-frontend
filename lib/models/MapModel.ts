import mongoose, { Schema, Document, model, Model } from 'mongoose';
import { MapType } from '../types/MapTypeEnum';
import { Marker } from '../types/Marker';
import { Map } from '../types/Map';


const MarkerSchema = new Schema<Marker>({
	target: { type: String, required: true },
	latLng: { type: [Number], required: true },
	geojson: {
		area: { type: [[Number]], default: [] },
		hitbox: { type: [[Number]], default: [] },
	},
});

const MapSchema: Schema<Map> = new Schema({
	id: { type: String, required: true, unique: true },
	name: {
		en: { type: String, required: true },
		fr: { type: String, required: true },
		de: { type: String, required: true },
		ja: { type: String, required: true },
	},
	expansion: String,
	type: {
		type: String,
		enum: Object.values(MapType),
		default: MapType.MAP,
	},
	region: String,
	markers: [MarkerSchema],
	subAreas: [String],
	imagePath: String,
});

export const MapModel: Model<Map> =
	mongoose.models.Map || model<Map>('Map', MapSchema);
