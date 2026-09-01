import type { Player } from "@/lib/types";

interface ScoreboardProps {
  players: Player[];
  myPlayerId: string;
  roomCode: string;
}

export function Scoreboard({ players, myPlayerId, roomCode }: ScoreboardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/70 px-5 py-4 shadow-sm">
      <div className="flex gap-6">
        {players.map((player) => (
          <div key={player.id} className="text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-plum/50">
              {player.id === myPlayerId ? "You" : player.name}
            </p>
            <p className="text-2xl font-bold text-blush">{player.score}</p>
          </div>
        ))}
      </div>
      <div className="text-right">
        <p className="text-xs font-medium uppercase tracking-wide text-plum/50">Room</p>
        <p className="font-mono text-lg font-semibold tracking-widest text-plum">{roomCode}</p>
      </div>
    </div>
  );
}
