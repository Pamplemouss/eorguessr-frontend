import React from "react";
import { GameContextProvider } from "./GameContextProvider";
import Game from "./Game";

const page = () => {
    return (
        <GameContextProvider>
            <Game />
        </GameContextProvider>
    );
};

export default page;
