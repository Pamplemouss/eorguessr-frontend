import { Client, Room } from "colyseus.js";
import React, { useState } from "react";
import { useGameContext } from "../GameContextProvider";

const CreateJoinRoom = () => {
    const { setGameState, setRoom } = useGameContext();
    const [roomId, setRoomId] = useState<string | null>(null);

    const joinRoom = async () => {
        const client = new Client("ws://localhost:3001");
        // joining a room by its id
        const room = (await client.joinById(roomId || "")) as Room;
        setRoom(room);
        listenToChanges(room);
    };

    const createRoom = async () => {
        const client = new Client("ws://localhost:3001");
        const room = (await client.create("game_room")) as Room;
        setRoom(room);
        listenToChanges(room);
    };

    const listenToChanges = (room: Room) => {
        room?.onStateChange(() => {
            setGameState({
                ...room.state,
            });
        });
    };

    return (
        <>
            <button onClick={createRoom}>Create a Room</button>
            <div>
                <input
                    type="text"
                    placeholder="Enter Room ID"
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button onClick={joinRoom}>Join Room</button>
            </div>
        </>
    );
};

export default CreateJoinRoom;
