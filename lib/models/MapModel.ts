import mongoose, { Schema, Document, model, Model } from 'mongoose';
import { MapType } from '../types/MapType';
import { Marker } from '../types/Marker';
import { Map } from '../types/Map';


const MarkerSchema = new Schema<Marker>({
	target: { type: String, required: true },
	latLng: { type: [Number], required: true },
	geojson: { type: Schema.Types.Mixed, default: {} },
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
	parentMap: { type: String, default: null },
	subAreas: [String],
	subAreaCustomName: {
		en: { type: String, default: null },
		fr: { type: String, default: null },
		de: { type: String, default: null },
		ja: { type: String, default: null },
	},
	imagePath: String,
	specialBounds: { type: [[Number]], default: null },
	specialCenter: { type: [Number], default: null },
	specialZoom: { type: Number, default: null },
	size: { type: { x: Number, y: Number }, required: true },
});

export const MapModel: Model<Map> =
	mongoose.models.Map || model<Map>('Map', MapSchema);
