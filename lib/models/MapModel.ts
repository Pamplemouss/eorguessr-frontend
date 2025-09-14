import mongoose, { Schema, Document, model, Model } from 'mongoose';
import { MapType } from '../types/MapType';
import { Marker } from '../types/Marker';

export interface IMap extends Document {
	id: string;
	name: string;
	expansion?: string;
	type?: MapType;
	markers: Marker[];
	subAreas?: string[];
	imagePath?: string;
}

const MarkerSchema = new Schema<Marker>({
	target: { type: String, required: true },
	latLng: { type: [Number], required: true },
	geojson: {
		area: { type: [[Number]], default: [] },
		hitbox: { type: [[Number]], default: [] },
	},
});

const MapSchema: Schema<IMap> = new Schema({
	id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	expansion: String,
	type: {
		type: String,
		enum: Object.values(MapType),
		default: MapType.MAP,
	},
	markers: [MarkerSchema],
	subAreas: [String],
	imagePath: String,
});

export const MapModel: Model<IMap> =
	mongoose.models.Map || model<IMap>('Map', MapSchema);
