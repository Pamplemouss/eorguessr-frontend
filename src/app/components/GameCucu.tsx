import React from "react";
import { GameState } from "../types/types/GameState";
import { useGame } from "./contexts/GameContextProvider";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

export default function GameCucu() {
    const { room, state } = useGame();

    if (!state) return <div>Connexion au serveur...</div>;

    return (
        <div>
            <h2>État du jeu</h2>
            <p>ID: {room?.roomId}</p>
            <p>Round : {state.currentRound} / {state.maxRounds}</p>
            <p>État : {GameState[state.gameState]}</p>

            <h3>Joueurs</h3>
            <ul>
                {state.players
                    ? Array.from(state.players.values()).map((player, index) => (
                        <li key={player.name || index}>
                            {player.name}
                        </li>
                    ))
                    : <li>Aucun joueur</li>}
            </ul>
            <ReactPhotoSphereViewer
                src="photospheres/476.webp"
                height={"50vh"}
                width={"50vw"}
            ></ReactPhotoSphereViewer>
        </div>
    );
}