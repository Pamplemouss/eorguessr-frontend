import React from "react";
import Game from "./components/Game";
import { GameContextProvider } from "./components/contexts/GameContextProvider";

const page = () => {
    return (
        <GameContextProvider>
            <Game />
        </GameContextProvider>
    );
};

export default page;
