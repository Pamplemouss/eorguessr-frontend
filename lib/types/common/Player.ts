import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import { Guess } from './Location';

export class Player extends Schema {
    @type("string") name: string = '';
    @type("boolean") hasGuessed: boolean = false;
    @type("boolean") isReady: boolean = false;
    @type({map: Guess}) guesses = new MapSchema<Guess>();
    @type(["number"]) scores = new ArraySchema<number>();
    @type("number") totalScore: number = 0;
}