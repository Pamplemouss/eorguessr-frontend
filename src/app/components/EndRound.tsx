import React from "react";
import { useGameContext } from "../GameContextProvider";

const EndRound = () => {
    const { gameState, room } = useGameContext();
    const currentPlayer = gameState?.players.get(room?.sessionId ?? "");
    const isPlayerHost = currentPlayer?.isHost;
    const guess = currentPlayer?.guesses[currentPlayer?.guesses.length - 1];
    const answer = gameState?.answers[gameState?.currentRound - 1];
    
    return (
        <>
            <div>
                You guessed {guess}! The answer was {answer}.
            </div>
            {isPlayerHost && (
                <button onClick={() => room?.send("nextRound")}>
                    Next Round
                </button>
            )}
        </>
    );
};

export default EndRound;
