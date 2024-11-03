"use client";

import { createContext, useContext, useState } from "react";
import { GameState } from "./types/GameState";
import { Room } from "colyseus.js";

export interface IGameContextProvider {
    gameState: GameState | null;
    setGameState: (state: GameState) => void;
    room: Room | null;
    setRoom: (room: Room) => void;
}

const GameContext = createContext<IGameContextProvider | null>(null);

export const useGameContext = () => {
    return useContext(GameContext as React.Context<IGameContextProvider>);
}

export const GameContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [room, setRoom] = useState<Room | null>(null);

    const gameContext = {
        gameState,
        setGameState,
        room,
        setRoom,
    };

    return (
        <GameContext.Provider value={gameContext}>
            {children}
        </GameContext.Provider>
    );
}