"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Client, Room } from "colyseus.js";
import { State } from "@/app/types/types/State";

interface GameContextType {
    client: Client | null;
    room: Room<State> | null;
    state: State | null;
    setRoom: (room: Room<State> | null) => void;
}

const GameContext = createContext<GameContextType>({
    client: null,
    room: null,
    state: null,
    setRoom: () => { },
});

export function GameProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => new Client("ws://localhost:3001"));
    const [room, setRoom] = useState<Room<State> | null>(null);
    const [state, setState] = useState<State | null>(null);

    useEffect(() => {
        if (!room) return;

        // Dans GameProvider
        room.onStateChange((newState) => {
            console.log("📦 New state received:", newState);

            const cloned = Object.create(
                Object.getPrototypeOf(newState),
                Object.getOwnPropertyDescriptors(newState)
            );

            setState(cloned); // ✅ conserve toutes les méthodes de la classe
        });

        return () => {
            room.leave();
        };
    }, [room]);

    return (
        <GameContext.Provider value={{ client, room, state, setRoom }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame(): GameContextType {
    return useContext(GameContext);
}
``