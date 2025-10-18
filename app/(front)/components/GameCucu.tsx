import React, { useState } from "react";
import { GameStep } from "@/lib/types/common/GameStep";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { useGame } from "@/app/providers/GameContextProvider";
import { GameMapProvider } from "@/app/providers/GameMapContextProvider";
import { Expansion } from "@/lib/types/Expansion";
import { MapType } from "@/lib/types/MapType";
import MapEor from "@/app/components/MapEor/MapEor";

export default function GameCucu() {
    const { room, gameState } = useGame();
    const [errorMessage, setErrorMessage] = useState<string>("");

    React.useEffect(() => {
        if (!room) return;

        const handleGameStartError = (message: string) => {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(""), 5000); // Clear after 5 seconds
        };

        room.onMessage("gameStartError", handleGameStartError);

        return () => {
            room.onMessage("gameStartError", () => {});
        };
    }, [room]);

    if (!gameState) return <div>Connexion au serveur...</div>;

    const isGameMaster = room?.sessionId === gameState.gameMasterId;
    const isLobby = gameState.gameStep === GameStep.LOBBY;
    const canStartGame = gameState.selectedExpansions.length > 0 && gameState.selectedMapTypes.length > 0;

    const toggleExpansion = (expansion: Expansion) => {
        if (isGameMaster && isLobby) {
            room?.send("toggleExpansion", { expansion });
        }
    };

    const toggleMapType = (mapType: MapType) => {
        if (isGameMaster && isLobby && (mapType === MapType.MAP || mapType === MapType.DUNGEON)) {
            room?.send("toggleMapType", { mapType });
        }
    };

    const startGame = () => {
        if (isGameMaster && canStartGame) {
            room?.send("startGame");
        }
    };

    return (
        <div className="p-6 mx-auto w-full max-w-4xl">
            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-2xl font-bold mb-2">Salon de jeu</h2>
                <p className="text-gray-600">ID: {room?.roomId}</p>
                <p className="text-gray-600">Round : {gameState.currentRound} / {gameState.maxRounds}</p>
                <p className="text-gray-600">État : {GameStep[gameState.gameStep]}</p>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h3 className="text-xl font-semibold mb-3">Joueurs</h3>
                <ul className="space-y-2">
                    {gameState.players
                        ? Array.from(gameState.players.entries()).map(([sessionId, player]) => (
                            <li
                                key={sessionId}
                                className={`p-2 rounded ${
                                    sessionId === room?.sessionId ? "bg-blue-100 font-bold" : "bg-gray-50"
                                }`}
                            >
                                <span>{player.name}</span>
                                {sessionId === gameState.gameMasterId && (
                                    <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                                        Maître du jeu
                                    </span>
                                )}
                                {sessionId === room?.sessionId && (
                                    <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                                        Vous
                                    </span>
                                )}
                            </li>
                        ))
                        : <li className="text-gray-500">Aucun joueur</li>}
                </ul>
            </div>

            {/* Game Configuration (Lobby only) */}
            {isLobby && (
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <h3 className="text-xl font-semibold mb-3">Configuration du jeu</h3>
                    
                    {!isGameMaster && (
                        <p className="text-gray-600 mb-4">Seul le maître du jeu peut modifier ces paramètres.</p>
                    )}

                    {/* Expansions Selection */}
                    <div className="mb-6">
                        <h4 className="text-lg font-medium mb-3">Extensions</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(Expansion).map((expansion) => (
                                <button
                                    key={expansion}
                                    onClick={() => toggleExpansion(expansion)}
                                    disabled={!isGameMaster}
                                    className={`p-2 rounded border transition-colors ${
                                        gameState.selectedExpansions.includes(expansion)
                                            ? "bg-purple-500 text-white border-purple-500"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    } ${!isGameMaster ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    {expansion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Map Types Selection */}
                    <div className="mb-6">
                        <h4 className="text-lg font-medium mb-3">Types de cartes</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[MapType.MAP, MapType.DUNGEON].map((mapType) => (
                                <button
                                    key={mapType}
                                    onClick={() => toggleMapType(mapType)}
                                    disabled={!isGameMaster}
                                    className={`p-2 rounded border transition-colors ${
                                        gameState.selectedMapTypes.includes(mapType)
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    } ${!isGameMaster ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    {mapType === MapType.MAP ? "Cartes normales" : "Donjons"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {errorMessage}
                        </div>
                    )}

                    {/* Start Game Button */}
                    {isGameMaster && (
                        <button
                            onClick={startGame}
                            disabled={!canStartGame}
                            className={`w-full p-3 rounded font-semibold transition-colors ${
                                canStartGame
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {canStartGame ? "Démarrer le jeu" : "Sélectionnez au moins une extension et un type de carte"}
                        </button>
                    )}
                </div>
            )}

            {/* Game Playing */}
            {gameState.gameStep === GameStep.PLAYING && (
                <GameMapProvider>
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-semibold mb-4">
                            Jeu en cours - Round {gameState.currentRound}/{gameState.maxRounds}
                        </h3>
                        
                        {/* Photosphere Section */}
                        {gameState.currentPhotosphere && gameState.currentPhotosphere.id && (
                            <div className="mb-4">
                                <div className="mb-2">
                                    <span className="text-sm text-gray-600">
                                        Photosphère: {gameState.currentPhotosphere.mapName} ({gameState.currentPhotosphere.expansion})
                                    </span>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Météo: {gameState.currentPhotosphere.weather} | Heure: {gameState.currentPhotosphere.time}
                                    </span>
                                </div>
                                <ReactPhotoSphereViewer
                                    src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/photospheres/${gameState.currentPhotosphere.id}/panorama_medium.webp`}
                                    height={"70vh"}
                                    width={"100%"}
                                />
                            </div>
                        )}
                        
                        {(!gameState.currentPhotosphere || !gameState.currentPhotosphere.id) && (
                            <div className="text-center py-8 text-gray-500">
                                Chargement de la photosphère...
                            </div>
                        )}

                        {/* Map is now positioned absolutely at bottom right */}
                        <MapEor fixed={true} useGameContext={true} />
                    </div>
                </GameMapProvider>
            )}
        </div>
    );
}