"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Client, Room } from "colyseus.js";
import { GameState } from "@/lib/types/common/GameState";
import type { GameContext } from "@/lib/types/GameContext";

const GameContext = createContext<GameContext>({
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

export function useGame(): GameContext {
    return useContext(GameContext);
}
``