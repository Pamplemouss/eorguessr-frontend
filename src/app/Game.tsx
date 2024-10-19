"use client";

import { useGameContext } from "./GameContextProvider";
import CreateJoinRoom from "./components/CreateJoinRoom";
import Room from "./components/Room";

export default function Home() {
    const { state, room } = useGameContext();

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="">
                {room && state ? (
                    <Room />
                ) : (
                    <CreateJoinRoom />
                )}
            </div>
        </div>
    );
}
