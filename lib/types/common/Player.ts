import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import { Location } from './Location';

export class Player extends Schema {
    @type("string") name: string = '';
    @type("boolean") hasPlayed: boolean = false;
    @type({map: Location}) guesses = new MapSchema<Location>();
    @type("int8") scores = new ArraySchema<number>();
}