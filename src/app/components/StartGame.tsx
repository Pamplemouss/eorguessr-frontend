import React from "react";
import { useGameContext } from "../GameContextProvider";

const StartGame = () => {
    const { gameState, room } = useGameContext();
    const start = () => {
        room?.send("start");
    };
    const isPlayerHost = gameState?.players.get(room?.sessionId ?? "")?.isHost;
    return (
        <>
            {isPlayerHost ? (
                <button onClick={start}>Start Game</button>
            ) : (
                <div>Waiting for host to start game...</div>
            )}
        </>
    );
};

export default StartGame;
