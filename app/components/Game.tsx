"use client";

import React from "react";
import JoinGame from "./JoinGame";
import GameCucu from "./GameCucu";
import { useGame } from "./contexts/GameContextProvider";

const Game = () => {
    const { room } = useGame();

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center">
            {room ? <GameCucu />
                : <JoinGame />}
        </div>
    );
};

export default Game;
