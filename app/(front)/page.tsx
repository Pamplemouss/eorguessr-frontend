import React from "react";
import { GameProvider } from "../providers/GameContextProvider";
import Game from "./components/Game";

const page = () => {
    return (
        <GameProvider>
            <Game />
        </GameProvider>
    );
};

export default page;
