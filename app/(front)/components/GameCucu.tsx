import React, { useState } from "react";
import { GameStep } from "@/lib/types/common/GameStep";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { useGame } from "@/app/providers/GameContextProvider";
import { GameMapProvider, useGameMap } from "@/app/providers/NewGameMapContextProvider";
import { Expansion } from "@/lib/types/Expansion";
import { MapType } from "@/lib/types/MapType";
import GameMapEor from "@/app/components/MapEor/GameMapEor";
import { Marker, Circle } from "react-leaflet";
import L from "leaflet";
import getBoundsFromMap from "@/lib/utils/getBoundsFromMap";

// Result Phase Component
function ResultPhase() {
    const { room, gameState } = useGame();
    const isGameMaster = room?.sessionId === gameState?.gameMasterId;

    if (!gameState) return null;

    const currentRoundIndex = gameState.currentRound - 1;
    const roundResult = gameState.roundHistory[currentRoundIndex];

    const nextRound = () => {
        if (isGameMaster) {
            room?.send("nextRound");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-4">
                Résultats du Round {gameState.currentRound}
            </h3>
            
            {/* Correct Location */}
            <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded">
                <h4 className="font-semibold text-green-800">Localisation correcte:</h4>
                <p className="text-green-700">
                    {gameState.currentPhotosphere.mapName} ({gameState.currentPhotosphere.expansion})
                </p>
                <p className="text-sm text-green-600">
                    Position: ({gameState.currentPhotosphere.coord.x.toFixed(1)}, {gameState.currentPhotosphere.coord.y.toFixed(1)})
                </p>
                <p className="text-xs text-green-500 mt-1">
                    Zone de bonus: Rayon de 0.5 unité autour de cette position
                </p>
            </div>

            {/* Round Map Visualization */}
            {roundResult && (
                <div className="mb-6">
                    <h4 className="font-semibold mb-3">Visualisation des suppositions:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">
                            📍 <span className="text-blue-600 font-medium">Pin bleu</span>: Position correcte | 
                            📍 <span className="text-red-600 font-medium">Pins rouges</span>: Suppositions des joueurs |
                            🟢 <span className="text-green-600 font-medium">Cercle vert</span>: Zone de bonus (0.5 unité)
                        </div>
                        <div className="h-96 relative border rounded-lg overflow-hidden bg-white">
                            <RecapGameMap roundResult={roundResult} />
                        </div>
                    </div>
                </div>
            )}

            {/* Player Results */}
            <div className="mb-6">
                <h4 className="font-semibold mb-3">Résultats des joueurs:</h4>
                <div className="space-y-2">
                    {gameState.players
                        ? Array.from(gameState.players.entries()).map(([sessionId, player]) => {
                            const roundScore = player.scores[gameState.currentRound - 1] || 0;
                            const guess = player.guesses.get(gameState.currentRound.toString());
                            
                            return (
                                <div key={sessionId} className="p-3 bg-gray-50 rounded border">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{player.name}</span>
                                        <span className={`px-2 py-1 rounded text-sm font-bold ${
                                            roundScore > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                            +{roundScore} points
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Score total: {player.totalScore} points
                                    </div>
                                    {guess && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Supposition: Map {guess.mapId} ({guess.x.toFixed(1)}, {guess.y.toFixed(1)})
                                        </div>
                                    )}
                                </div>
                            );
                        })
                        : <div className="text-gray-500">Aucun joueur</div>}
                </div>
            </div>

            {/* Game Master Controls */}
            {isGameMaster && (
                <div className="flex justify-center">
                    <button
                        onClick={nextRound}
                        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                    >
                        {gameState.currentRound < gameState.maxRounds ? "Round suivant" : "Voir le récapitulatif"}
                    </button>
                </div>
            )}

            {!isGameMaster && (
                <div className="text-center text-gray-600">
                    En attente que le maître du jeu lance le round suivant...
                </div>
            )}
        </div>
    );
}

// Special recap map component
function RecapGameMap({ roundResult }: { roundResult: any }) {
    const { gameState } = useGame();
    
    if (!gameState || !roundResult) return null;

    // Component to force the correct map selection and handle markers
    const RecapMapWrapper = () => {
        const { setCurrentMapById, currentMap } = useGameMap();
        
        React.useEffect(() => {
            // Force set the map to the photosphere's map
            if (roundResult.photosphere.mapId) {
                setCurrentMapById(roundResult.photosphere.mapId);
            }
        }, [roundResult.photosphere.mapId, setCurrentMapById]);

        // Convert real FFXIV coordinates to leaflet coordinates
        const getLeafletCoords = (realX: number, realY: number) => {
            if (!currentMap || !currentMap.size) return null;
            
            const bounds = getBoundsFromMap(currentMap) as [[number, number], [number, number]];
            
            const leafletMapXSize = bounds[1][1] - bounds[0][1];
            const leafletMapYSize = bounds[1][0] - bounds[0][0];
            const eorMapXSize = currentMap.size.x - 1;
            const eorMapYSize = currentMap.size.y - 1;

            const scaleX = eorMapXSize / leafletMapXSize;
            const scaleY = eorMapYSize / leafletMapYSize;

            // Convert from FFXIV coordinates to leaflet coordinates
            const leafletLng = (realX - 1) / scaleX - leafletMapXSize / 2;
            const leafletLat = -((realY - 1) / scaleY - leafletMapYSize / 2);

            return [leafletLat, leafletLng] as [number, number];
        };

        // Create custom markers for the recap
        const createRecapMarkers = () => {
            if (!currentMap || !currentMap.size) return null;
            
            const markers = [];
            
            const correctLocationCoords = getLeafletCoords(
                roundResult.photosphere.coord.x, 
                roundResult.photosphere.coord.y
            );

            if (!correctLocationCoords) return null;

            // Add the scoring radius circle (0.5 units) - need to convert radius too
            const bounds = getBoundsFromMap(currentMap) as [[number, number], [number, number]];
            const leafletMapXSize = bounds[1][1] - bounds[0][1];
            const eorMapXSize = currentMap.size.x - 1;
            const scaleX = eorMapXSize / leafletMapXSize;
            const leafletRadius = 0.5 / scaleX; // Convert 0.5 FFXIV units to leaflet units

            const scoringCircle = (
                <Circle
                    key="scoring-circle"
                    center={correctLocationCoords}
                    radius={leafletRadius}
                    pathOptions={{
                        color: '#10b981',
                        fillColor: '#10b981',
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: '5, 5'
                    }}
                />
            );
            markers.push(scoringCircle);
            
            // Add the correct location marker (blue pin)
            const correctLocationMarker = (
                <Marker 
                    key="correct-location"
                    position={correctLocationCoords}
                    icon={L.divIcon({
                        html: `<div style="
                            width: 30px; 
                            height: 30px; 
                            background-color: #3b82f6; 
                            border: 3px solid white; 
                            border-radius: 50%; 
                            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                            position: relative;
                        "><div style="
                            position: absolute;
                            top: -10px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 0;
                            height: 0;
                            border-left: 10px solid transparent;
                            border-right: 10px solid transparent;
                            border-bottom: 15px solid #3b82f6;
                        "></div></div>`,
                        className: 'correct-location-marker',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30],
                    })}
                    zIndexOffset={2000}
                />
            );
            markers.push(correctLocationMarker);

            // Add player guess markers (if they're on the same map)
            roundResult.playerResults.forEach((playerResult: any, sessionId: string) => {
                const guess = playerResult.guesses.get(roundResult.roundNumber.toString());
                if (guess && guess.mapId === roundResult.photosphere.mapId) {
                    const playerCoords = getLeafletCoords(guess.x, guess.y);
                    if (playerCoords) {
                        const playerMarker = (
                            <Marker 
                                key={`player-${sessionId}`}
                                position={playerCoords}
                                icon={L.divIcon({
                                    html: `<div style="
                                        width: 24px; 
                                        height: 24px; 
                                        background-color: #ef4444; 
                                        border: 3px solid white; 
                                        border-radius: 50%; 
                                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                                        position: relative;
                                    "><div style="
                                        position: absolute;
                                        top: -8px;
                                        left: 50%;
                                        transform: translateX(-50%);
                                        width: 0;
                                        height: 0;
                                        border-left: 8px solid transparent;
                                        border-right: 8px solid transparent;
                                        border-bottom: 12px solid #ef4444;
                                    "></div></div>
                                    <div style="
                                        position: absolute;
                                        top: -35px;
                                        left: 50%;
                                        transform: translateX(-50%);
                                        background: rgba(0,0,0,0.7);
                                        color: white;
                                        padding: 2px 6px;
                                        border-radius: 4px;
                                        font-size: 10px;
                                        white-space: nowrap;
                                    ">${playerResult.name}</div>`,
                                    className: 'player-guess-marker',
                                    iconSize: [24, 24],
                                    iconAnchor: [12, 24],
                                })}
                                zIndexOffset={1000}
                            />
                        );
                        markers.push(playerMarker);
                    }
                }
            });

            return markers;
        };

        return (
            <GameMapEor 
                disabled={true}
                recapMarkers={createRecapMarkers()}
            />
        );
    };

    return (
        <GameMapProvider>
            <RecapMapWrapper />
        </GameMapProvider>
    );
}

// Recap Phase Component
function RecapPhase() {
    const { room, gameState } = useGame();
    const isGameMaster = room?.sessionId === gameState?.gameMasterId;

    if (!gameState) return null;

    const restartGame = () => {
        if (isGameMaster) {
            room?.send("restartGame");
        }
    };

    // Calculate final rankings
    const playerRankings = Array.from(gameState.players.entries())
        .map(([sessionId, player]) => ({
            sessionId,
            name: player.name,
            totalScore: player.totalScore,
            scores: Array.from(player.scores)
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-2xl font-bold mb-6 text-center">Récapitulatif de la partie</h3>
            
            {/* Final Rankings */}
            <div className="mb-6">
                <h4 className="text-xl font-semibold mb-4">Classement final</h4>
                <div className="space-y-3">
                    {playerRankings.map((player, index) => (
                        <div key={player.sessionId} className={`p-4 rounded border-2 ${
                            index === 0 ? 'bg-yellow-100 border-yellow-400' :
                            index === 1 ? 'bg-gray-100 border-gray-400' :
                            index === 2 ? 'bg-orange-100 border-orange-400' :
                            'bg-white border-gray-300'
                        }`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">#{index + 1}</span>
                                    <span className="font-semibold text-lg">{player.name}</span>
                                    {index === 0 && <span className="text-2xl">🏆</span>}
                                    {index === 1 && <span className="text-2xl">🥈</span>}
                                    {index === 2 && <span className="text-2xl">🥉</span>}
                                </div>
                                <span className="text-xl font-bold">{player.totalScore} points</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                                Scores par round: {player.scores.join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Round History */}
            <div className="mb-6">
                <h4 className="text-xl font-semibold mb-4">Historique des rounds</h4>
                <div className="space-y-6">
                    {gameState.roundHistory.map((round, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-semibold">Round {round.roundNumber}</h5>
                                    <span className="text-sm text-gray-600">
                                        {round.photosphere.mapName} ({round.photosphere.expansion})
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Position correcte: ({round.photosphere.coord.x.toFixed(1)}, {round.photosphere.coord.y.toFixed(1)})
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Météo: {round.photosphere.weather} | Heure: {round.photosphere.time}
                                </div>
                            </div>
                            
                            {/* Map visualization for this round */}
                            <div className="p-4">
                                <h6 className="font-medium mb-3 text-sm">Visualisation des suppositions</h6>
                                <div className="h-96 relative">
                                    <RecapGameMap roundResult={round} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Game Master Controls */}
            {isGameMaster && (
                <div className="flex justify-center">
                    <button
                        onClick={restartGame}
                        className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                    >
                        Nouvelle partie
                    </button>
                </div>
            )}

            {!isGameMaster && (
                <div className="text-center text-gray-600">
                    En attente que le maître du jeu démarre une nouvelle partie...
                </div>
            )}
        </div>
    );
}

// Guessing Phase Component
function GuessingPhase() {
    const { room, gameState } = useGame();
    const [hasSubmittedGuess, setHasSubmittedGuess] = useState(false);

    if (!gameState) return null;

    const currentPlayer = gameState.players.get(room?.sessionId || "");
    const playerHasGuessed = currentPlayer?.hasGuessed || false;

    // Count players who have guessed
    const playersGuessedCount = Array.from(gameState.players.values()).filter(p => p.hasGuessed).length;
    const totalPlayers = gameState.players.size;

    return (
        <GameMapProvider>
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                        Round {gameState.currentRound}/{gameState.maxRounds} - Phase de supposition
                    </h3>
                    <div className="text-sm text-gray-600">
                        {playersGuessedCount}/{totalPlayers} joueurs ont deviné
                    </div>
                </div>
                
                {/* Player Status */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    {playerHasGuessed ? (
                        <p className="text-blue-800 font-medium">
                            ✅ Vous avez soumis votre supposition. En attente des autres joueurs...
                        </p>
                    ) : (
                        <div className="text-blue-800">
                            <p className="font-medium mb-2">
                                📍 Trouvez la carte correspondante et placez votre épingle !
                            </p>
                            <p className="text-sm">
                                • Explorez les cartes disponibles avec les contrôles de navigation<br/>
                                • Cliquez sur la carte pour placer votre épingle<br/>
                                • Confirmez votre supposition quand vous êtes prêt
                            </p>
                        </div>
                    )}
                </div>

                {/* Players Status List */}
                <div className="mb-4">
                    <h4 className="font-medium mb-2">État des joueurs:</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {Array.from(gameState.players.entries()).map(([sessionId, player]) => (
                            <div key={sessionId} className="flex items-center gap-2 text-sm">
                                <span className={`w-3 h-3 rounded-full ${
                                    player.hasGuessed ? 'bg-green-500' : 'bg-gray-300'
                                }`}></span>
                                <span className={sessionId === room?.sessionId ? 'font-bold' : ''}>
                                    {player.name} {sessionId === room?.sessionId && '(Vous)'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                
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
                <GameMapEor 
                    fixed={true} 
                    onGuessSubmit={(mapId, x, y) => {
                        if (!playerHasGuessed) {
                            room?.send("submitGuess", { mapId, x, y });
                            setHasSubmittedGuess(true);
                        }
                    }}
                    disabled={playerHasGuessed}
                />
            </div>
        </GameMapProvider>
    );
}

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
                                <div className="flex justify-between items-center">
                                    <div>
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
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {player.totalScore} points
                                    </div>
                                </div>
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
                            {Object.values(MapType).map((mapType) => (
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
                                    {mapType === MapType.MAP ? "Cartes normales" : 
                                     mapType === MapType.DUNGEON ? "Donjons" :
                                     mapType === MapType.REGION ? "Régions" : 
                                     "Carte du monde"}
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

            {/* Game Phase Rendering */}
            {gameState.gameStep === GameStep.GUESSING && <GuessingPhase />}
            {gameState.gameStep === GameStep.RESULT && <ResultPhase />}
            {gameState.gameStep === GameStep.RECAP && <RecapPhase />}
        </div>
    );
}