import Link from "next/link";
import type { Player } from "@/lib/types";

interface FinalResultsProps {
  players: Player[];
  myPlayerId: string;
  leftByName?: string | null;
}

export function FinalResults({ players, myPlayerId, leftByName }: FinalResultsProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const [leader, runnerUp] = sorted;
  const isTie = leader && runnerUp && leader.score === runnerUp.score;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12 text-center">
      <div>
        <h1 className="text-3xl font-bold text-blush">
          {leftByName ? `${leftByName} left the game` : "Game over!"}
        </h1>
        <p className="mt-2 text-sm text-plum/70">
          {leftByName
            ? "The game ended early. Here's how it stood."
            : isTie
              ? "It's a tie — looks like you're evenly matched."
              : `${leader.name} wins this round of getting to know each other!`}
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-5 shadow-sm">
        {sorted.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between">
            <span className="font-medium text-plum">
              {index === 0 && !isTie ? "🏆 " : ""}
              {player.name}
              {player.id === myPlayerId ? " (you)" : ""}
            </span>
            <span className="text-xl font-bold text-blush">{player.score}</span>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
      >
        Play again
      </Link>
    </main>
  );
}
