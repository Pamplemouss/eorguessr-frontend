import { type, view, Schema, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";
import { Location } from "./Location";
import { GameStep } from "./GameStep";

export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("int8") currentRound: number = 0;
    @type("int8") maxRounds: number = 5;
    @type("int8") gameStep: GameStep = GameStep.LOBBY;
    @type("string") gameMasterId: string = "";
    @view() @type({ map: Location }) locations = new MapSchema<Location>();
}
