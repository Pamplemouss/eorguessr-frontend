import React, { useState } from "react";
import { useGameContext } from "../GameContextProvider";
import { RoundState } from "../types/RoundState";
import PlayerList from "./PlayerList";
import StartGame from "./StartGame";
import PlayGame from "./PlayGame";
import EndRound from "./EndRound";

const Room = () => {
    const { gameState, room } = useGameContext();
    
    if (!room || !gameState) {
        return;
    }
    return (
        <>
            <h1>Room ID: {room.id}</h1>
            {gameState.roundState === RoundState.SETUP && <StartGame />}
            {gameState.roundState === RoundState.PLAY && <PlayGame />}
            {gameState.roundState === RoundState.ENDROUND && <EndRound />}
            <PlayerList />
        </>
    );
};

export default Room;
