import { type, view, Schema, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player } from "./Player";
import { Location } from "./Location";
import { GameStep } from "./GameStep";

export class Coordinate extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") z: number = 0;
}

export class Photosphere extends Schema {
    @type("string") id: string = "";
    @type("string") weather: string = "";
    @type("string") time: string = "";
    @type("string") mapId: string = "";
    @type("string") mapName: string = "";
    @type("string") expansion: string = "";
    @type(Coordinate) coord = new Coordinate();
}

export class RoundResult extends Schema {
    @type("int8") roundNumber: number = 0;
    @type(Photosphere) photosphere = new Photosphere();
    @type({map: Player}) playerResults = new MapSchema<Player>();
}

export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("int8") currentRound: number = 0;
    @type("int8") maxRounds: number = 5;
    @type("int8") gameStep: GameStep = GameStep.LOBBY;
    @type("string") gameMasterId: string = "";
    @view() @type({ map: Location }) locations = new MapSchema<Location>();
    @type(["string"]) selectedExpansions = new ArraySchema<string>();
    @type(["string"]) selectedMapTypes = new ArraySchema<string>();
    @type([Photosphere]) gamePhotospheres = new ArraySchema<Photosphere>();
    @type(Photosphere) currentPhotosphere = new Photosphere();
    @type([RoundResult]) roundHistory = new ArraySchema<RoundResult>();
    @type("number") resultDisplayStartTime: number = 0;
}
