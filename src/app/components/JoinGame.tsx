"use client";

import React, { useState } from "react";
import { useGame } from "./contexts/GameContextProvider";
import { State } from "../types/types/State";
import { Room } from "colyseus.js";

const JoinGame = () => {
    const [roomId, setRoomId] = useState("");
    const { client, room, setRoom } = useGame();

    const handleStart = async () => {
        if (client && !room) {
            try {
                const newRoom = await client.create("game_room");
                console.log("🎮 Created or joined room:", newRoom.roomId);
                setRoom(newRoom as Room<State>);
            } catch (err) {
                console.error("❌ Failed to join/create room:", err);
            }
        }
    };

    const handleJoin = async () => {
        if (client && roomId.trim() !== "") {
            try {
                const joinedRoom = await client.joinById(roomId.trim());
                console.log("🔗 Joined room:", joinedRoom.roomId);
                setRoom(joinedRoom as Room<State>);
            } catch (err) {
                console.error("❌ Failed to join room by ID:", err);
            }
        }
    };

    return (
        <>
            <button onClick={handleStart}>Start Game</button>
            <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
            />
            <button onClick={handleJoin}>Join Room</button>
        </>
    );
};

export default JoinGame;