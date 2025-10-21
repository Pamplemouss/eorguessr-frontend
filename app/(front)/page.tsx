import React from "react";
import { GameProvider } from "../providers/GameContextProvider";
import { MainMapProvider } from "../providers/MainMapContextProvider";
import Game from "./components/Game";

const page = () => {
    return (
        <MainMapProvider>
            <GameProvider>
                <Game />
            </GameProvider>
        </MainMapProvider>
    );
};

export default page;
