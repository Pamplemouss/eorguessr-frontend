import React, { useState } from "react";
import { useGameContext } from "../GameContextProvider";
import { GameState } from "../types/GameState";
import PlayerList from "./PlayerList";
import StartGame from "./StartGame";
import PlayGame from "./PlayGame";
import EndRound from "./EndRound";

const Room = () => {
    const { state, room } = useGameContext();
    
    if (!room || !state) {
        return;
    }
    return (
        <>
            <h1>Room ID: {room.id}</h1>
            {state.gameState === GameState.SETUP && <StartGame />}
            {state.gameState === GameState.PLAY && <PlayGame />}
            {state.gameState === GameState.ENDROUND && <EndRound />}
            <PlayerList />
        </>
    );
};

export default Room;
