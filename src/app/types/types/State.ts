import { type, view, Schema, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";
import { Location } from "./Location";
import { GameState } from "./GameState";

export class State extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("int8") currentRound: number;
    @type("int8") maxRounds: number;
    @type("int8") gameState: GameState;
    @view() @type({ map: Location }) locations = new MapSchema<Location>();
}
