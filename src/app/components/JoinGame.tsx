import { Room } from "colyseus.js";
import React from "react";
import { useGameContext } from "./contexts/GameContextProvider";

const JoinGame = () => {
    const { client, room, setRoom } = useGameContext();
    const handleClick = async () => {
        if (client && !room) {
            const newRoom = (await client.joinOrCreate(
                "game_room"
            )) as unknown as Room;
            setRoom(newRoom);
        }
    };
    return <button onClick={handleClick}>Start Game</button>;
};

export default JoinGame;
