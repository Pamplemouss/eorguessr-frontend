import { type, Schema } from '@colyseus/schema';

export class Location extends Schema {
    @type("int8") lat: number = 0;
    @type("int8") lng: number = 0;
}