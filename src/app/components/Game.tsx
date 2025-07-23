"use client";

import React from "react";
import { useGameContext } from "./contexts/GameContextProvider";
import { Room } from "colyseus.js";
import JoinGame from "./JoinGame";

const Game = () => {
    const { client, room, setRoom } = useGameContext();

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            {room ? <p>Joined room: {room.roomId}</p> : <JoinGame />}
        </div>
    );
};

export default Game;
