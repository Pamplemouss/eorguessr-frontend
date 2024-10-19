"use client";

import { createContext, useContext, useState } from "react";
import { State } from "./types/State";
import { Room } from "colyseus.js";

export interface IGameContextProvider {
    state: State | null;
    setState: (state: State) => void;
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
    const [state, setState] = useState<State | null>(null);
    const [room, setRoom] = useState<Room | null>(null);

    const gameContext = {
        state,
        setState,
        room,
        setRoom,
    };

    return (
        <GameContext.Provider value={gameContext}>
            {children}
        </GameContext.Provider>
    );
}