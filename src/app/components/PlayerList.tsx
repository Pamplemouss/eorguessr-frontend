import React from "react";
import { useGameContext } from "../GameContextProvider";

const PlayerList = () => {
    const { state } = useGameContext();
    const players = Array.from(state?.players.keys() || []);
    return (
        <div className="absolute right-5 top-5">
            <h2>Players</h2>
            <ul>
                {players.map((player) => (
                    <li key={player}>{player}</li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerList;
