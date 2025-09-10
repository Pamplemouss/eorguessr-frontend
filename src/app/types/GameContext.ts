import { Client, Room } from "colyseus.js";
import { GameState } from "./common/GameState";

export interface GameContext {
    client: Client | null;
    room: Room<GameState> | null;
    gameState: GameState | null;
    setRoom: (room: Room<GameState> | null) => void;
}