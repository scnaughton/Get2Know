"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";

interface LobbyProps {
  roomCode: string;
  players: Player[];
  myPlayerId: string;
  onStart: () => Promise<void>;
}

export function Lobby({ roomCode, players, myPlayerId, onStart }: LobbyProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canStart = players.length >= 2;

  async function handleStart() {
    setError(null);
    setStarting(true);
    try {
      await onStart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the game.");
      setStarting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12 text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-plum/50">Room code</p>
        <p className="font-mono text-5xl font-bold tracking-widest text-blush">{roomCode}</p>
        <p className="mt-2 text-sm text-plum/70">Share this code with your partner to join.</p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-5 shadow-sm">
        {players.map((player) => (
          <div key={player.id} className="flex items-center justify-between">
            <span className="font-medium text-plum">
              {player.name}
              {player.id === myPlayerId ? " (you)" : ""}
            </span>
            <span className="text-xs text-green-600">Joined ✓</span>
          </div>
        ))}
        {players.length < 2 && (
          <p className="text-sm italic text-plum/50">Waiting for a second player…</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleStart}
        disabled={!canStart || starting}
        className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
      >
        {starting ? "Starting…" : canStart ? "Start game" : "Waiting for players…"}
      </button>
    </main>
  );
}
