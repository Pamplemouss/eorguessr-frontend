"use client";

import { useGame } from "@/app/providers/GameContextProvider";
import React from "react";
import GameCucu from "./GameCucu";
import JoinGame from "./JoinGame";

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
