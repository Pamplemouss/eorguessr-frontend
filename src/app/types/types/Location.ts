import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';

export class Location extends Schema {
    @type("int8") lat: number;
    @type("int8") lng: number;
}