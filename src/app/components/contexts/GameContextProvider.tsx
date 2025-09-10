"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Client, Room } from "colyseus.js";
import { GameState } from "@/app/types/common/GameState";

interface GameContextType {
    client: Client | null;
    room: Room<GameState> | null;
    gameState: GameState | null;
    setRoom: (room: Room<GameState> | null) => void;
}

const GameContext = createContext<GameContextType>({
    client: null,
    room: null,
    gameState: null,
    setRoom: () => { },
});

export function GameProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => new Client("ws://localhost:3001"));
    const [room, setRoom] = useState<Room<GameState> | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        if (!room) return;

        room.onStateChange((newState) => {
            console.log("📦 New state received:", newState);

            const cloned = Object.create(
                Object.getPrototypeOf(newState),
                Object.getOwnPropertyDescriptors(newState)
            );

            setGameState(cloned);
        });

        return () => {
            room.leave();
        };
    }, [room]);

    return (
        <GameContext.Provider value={{ client, room, gameState: gameState, setRoom }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame(): GameContextType {
    return useContext(GameContext);
}
``