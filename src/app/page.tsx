import React from "react";
import Game from "./components/Game";
import { GameProvider } from "./components/contexts/GameContextProvider";

const page = () => {
    return (
        <GameProvider>
            <Game />
        </GameProvider>
    );
};

export default page;
