import React, { useState } from "react";
import { useGameContext } from "../GameContextProvider";
import { RoundState } from "../types/RoundState";
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
            {state.gameState === RoundState.SETUP && <StartGame />}
            {state.gameState === RoundState.PLAY && <PlayGame />}
            {state.gameState === RoundState.ENDROUND && <EndRound />}
            <PlayerList />
        </>
    );
};

export default Room;
