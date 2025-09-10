import React from "react";
import { GameStep } from "../types/common/GameStep";
import { useGame } from "./contexts/GameContextProvider";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

export default function GameCucu() {
    const { room, gameState } = useGame();

    if (!gameState) return <div>Connexion au serveur...</div>;

    return (
        <div>
            <h2>État du jeu</h2>
            <p>ID: {room?.roomId}</p>
            <p>Round : {gameState.currentRound} / {gameState.maxRounds}</p>
            <p>État : {GameStep[gameState.gameStep]}</p>

            <h3>Joueurs</h3>
            <ul>
                {gameState.players
                    ? Array.from(gameState.players.entries()).map(([sessionId, player], index) => (
                        <li
                            key={sessionId}
                            className={sessionId === room?.sessionId ? "font-bold" : ""}
                        >
                            {player.name}
                        </li>
                    ))
                    : <li>Aucun joueur</li>}
            </ul>

            {gameState.gameStep === GameStep.LOBBY && gameState.gameMasterId === room?.sessionId && (
                <button onClick={() => { room?.send("startGame") }}>Démarrer le jeu</button>
            )}
            {gameState.gameStep === GameStep.PLAYING && (
                <ReactPhotoSphereViewer
                    src="photospheres/476.webp"
                    height={"50vh"}
                    width={"50vw"}
                ></ReactPhotoSphereViewer>
            )}
        </div>
    );
}