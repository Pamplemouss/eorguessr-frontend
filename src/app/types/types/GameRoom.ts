import { Room, Client } from "colyseus";
import { State } from "./State";
import { Player } from "./Player";

export class GameRoom extends Room {
    state = new State();

    // When room is initialized
    onCreate(options: any) {
        console.log("GameRoom created with options:", options);
    }

    // When client successfully join the room
    onJoin(client: Client, options: any, auth: any) {
        console.log("Client joined:", client.sessionId);
        const newPlayer = new Player();
        newPlayer.name = client.sessionId;
        this.state.players.set(client.sessionId, newPlayer);
    }

    // When a client leaves the room
    onLeave(client: Client, consented: boolean) {}

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose() {}
}
