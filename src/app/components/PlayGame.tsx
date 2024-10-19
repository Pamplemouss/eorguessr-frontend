import React, { useState } from "react";
import { useGameContext } from "../GameContextProvider";

const PlayGame = () => {
    const { state, room } = useGameContext();
    const [guessNumber, setGuessNumber] = useState<number | null>(null);

    const guess = () => {
        room?.send("guess", { guess: guessNumber });
    };

    return (
        <>
            <div>Round: {state?.currentRound}</div>
            {state?.players.get(room?.sessionId ?? "")?.hasPlayed ? (
                <div>
                    You guessed {guessNumber}. <br />
                    Waiting for other players to guess...
                </div>
            ) : (
                <div>
                    <input
                        type="number"
                        placeholder="Enter your guess"
                        onChange={(e) =>
                            setGuessNumber(parseInt(e.target.value))
                        }
                    />
                    <button onClick={guess}>Guess</button>
                </div>
            )}
        </>
    );
};

export default PlayGame;
