import mongoose, { Schema, Document, model, Model } from 'mongoose';

export interface Photosphere extends Document {
	id: string;
	coord: {
		x: number;
		y: number;
		z: number;
	};
	weather: string;
	time: string;
	map: string; // Reference to Map ID
	uploadedAt: Date;
}

const PhotosphereSchema: Schema<Photosphere> = new Schema({
	id: { type: String, required: true, unique: true },
	coord: {
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true }
	},
	weather: { type: String, required: true },
	time: { type: String, required: true },
	map: { type: String, required: true }, // Map ID reference
	uploadedAt: { type: Date, default: Date.now }
});

export const PhotosphereModel: Model<Photosphere> =
	mongoose.models.Photosphere || model<Photosphere>('Photosphere', PhotosphereSchema);