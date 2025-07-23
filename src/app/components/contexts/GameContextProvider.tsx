"use client";

import { Client, Room } from "colyseus.js";
import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";

interface GameContextType {
    client?: Client;
    room?: Room;
    setRoom: (room: Room) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameContextProviderProps {
    children: ReactNode;
}

export function GameContextProvider({ children }: GameContextProviderProps) {
    const [client, setClient] = useState<Client | undefined>(undefined);
    const [room, setRoom] = useState<Room | undefined>(undefined);

    useEffect(() => {
        const newClient = new Client("ws://localhost:3001");
        setClient(newClient);
    }, []);

    const value: GameContextType = {
        client,
        room,
        setRoom,
    };

    return (
        <GameContext.Provider value={value}>{children}</GameContext.Provider>
    );
}

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGameContext must be used within a GameContextProvider");
    }
    return context;
}