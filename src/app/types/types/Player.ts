import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import { Location } from './Location';

export class Player extends Schema {
    @type("string") name: string;
    @type("boolean") isGameMaster: boolean;
    @type("boolean") hasPlayed: boolean;
    @type({map: Location}) guesses = new MapSchema<Location>();

    constructor() {
        super();
        this.name = '';
        this.isGameMaster = false;
        this.hasPlayed = false;
        this.guesses = new MapSchema<Location>();
    }
}