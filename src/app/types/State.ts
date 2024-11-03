import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";
import { RoundState } from "./RoundState";

export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("number") roundState: RoundState = RoundState.SETUP;
    @type(["number"]) answers: number[] = [];
    @type("number") currentRound = 0;
}