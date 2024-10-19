import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
    @type(["number"]) guesses: number[] = [];
    @type("boolean") isHost = false;
    @type("boolean") hasPlayed = false;
}