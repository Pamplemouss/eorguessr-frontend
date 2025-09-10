import mongoose, { Schema, Document, model, Model } from 'mongoose';
import { MapType } from '../types/MapType';

export interface IMap extends Document {
	id: string;
	name: string;
	expansion?: string;
	type?: MapType;
	markers: {
		target: string;
		latLng: [number, number];
		geojson?: {
			polygons: [number, number][][];
			hitbox: [number, number][][];
		};
	}[];
	subAreas?: string[];
	imagePath?: string;
}

const MapSchema: Schema<IMap> = new Schema({
	id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	expansion: String,
	type: {
		type: String,
		enum: Object.values(MapType),
		default: MapType.MAP,
	},
	markers: [
		{
			target: { type: String, required: true },
			latLng: { type: [Number], required: true },
			geojson: {
				polygons: [[[Number]]],
				hitbox: [[[Number]]],
			},
		},
	],
	subAreas: [String],
	imagePath: String,
});

export const MapModel: Model<IMap> =
	mongoose.models.Map || model<IMap>('Map', MapSchema);