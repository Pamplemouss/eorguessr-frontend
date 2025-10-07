import React from "react";
import { GameProvider } from "./providers/GameContextProvider";
import Game from "./components/home/Game";

const page = () => {
    return (
        <GameProvider>
            <Game />
        </GameProvider>
    );
};

export default page;
