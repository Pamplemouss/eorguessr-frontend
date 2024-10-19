import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";
import { GameState } from "./GameState";

export class State extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("number") gameState: GameState = GameState.SETUP;
    @type(["number"]) answers: number[] = [];
    @type("number") currentRound = 0;
}