import { type, Schema } from '@colyseus/schema';

export class Location extends Schema {
    @type("int8") lat: number = 0;
    @type("int8") lng: number = 0;
}

export class Guess extends Schema {
    @type("string") mapId: string = "";
    @type("number") x: number = 0;
    @type("number") y: number = 0;
}