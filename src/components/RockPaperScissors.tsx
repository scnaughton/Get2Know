"use client";

import { useState } from "react";
import type { RPSChoice } from "@/lib/types";

const CHOICES: { value: RPSChoice; emoji: string; label: string }[] = [
  { value: "rock", emoji: "🪨", label: "Rock" },
  { value: "paper", emoji: "📄", label: "Paper" },
  { value: "scissors", emoji: "✂️", label: "Scissors" },
];

// What each choice beats.
const BEATS: Record<RPSChoice, RPSChoice> = {
  rock: "scissors",
  scissors: "paper",
  paper: "rock",
};

function emojiFor(choice: RPSChoice): string {
  return CHOICES.find((c) => c.value === choice)?.emoji ?? "";
}

interface RockPaperScissorsProps {
  myPlayerId: string;
  opponentId: string;
  opponentName: string;
  rpsChoices: Record<string, RPSChoice>;
  onChoose: (choice: RPSChoice) => Promise<void>;
  onContinue: (winnerId: string) => Promise<void>;
  onPlayAgain: () => Promise<void>;
}

export function RockPaperScissors({
  myPlayerId,
  opponentId,
  opponentName,
  rpsChoices,
  onChoose,
  onContinue,
  onPlayAgain,
}: RockPaperScissorsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myChoice = rpsChoices[myPlayerId];
  const opponentChoice = rpsChoices[opponentId];
  const bothChosen = myChoice !== undefined && opponentChoice !== undefined;
  const isTie = bothChosen && myChoice === opponentChoice;
  const winnerId =
    bothChosen && !isTie && myChoice
      ? BEATS[myChoice] === opponentChoice
        ? myPlayerId
        : opponentId
      : null;

  async function handleChoose(choice: RPSChoice) {
    setError(null);
    setSubmitting(true);
    try {
      await onChoose(choice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your choice.");
      setSubmitting(false);
    }
  }

  async function handleAdvance() {
    setError(null);
    setSubmitting(true);
    try {
      if (isTie) {
        await onPlayAgain();
      } else if (winnerId) {
        await onContinue(winnerId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (!myChoice) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm font-medium text-plum/70">
          Rock, paper, scissors — the winner asks the first question!
        </p>
        <div className="flex gap-3">
          {CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => handleChoose(choice.value)}
              disabled={submitting}
              className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-white py-6 shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              <span className="text-4xl">{choice.emoji}</span>
              <span className="text-sm font-semibold text-plum">{choice.label}</span>
            </button>
          ))}
        </div>
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  if (!bothChosen) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-md">
        <span className="text-5xl">{emojiFor(myChoice)}</span>
        <p className="text-sm text-plum/60">Waiting for {opponentName} to choose…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-md">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl">{emojiFor(myChoice)}</span>
          <span className="text-xs font-medium text-plum/50">You</span>
        </div>
        <span className="text-2xl text-plum/30">vs</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl">{emojiFor(opponentChoice)}</span>
          <span className="text-xs font-medium text-plum/50">{opponentName}</span>
        </div>
      </div>
      <p className="text-lg font-semibold text-plum">
        {isTie
          ? "It's a tie!"
          : winnerId === myPlayerId
            ? "You win — you ask first!"
            : `${opponentName} wins — they ask first!`}
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={handleAdvance}
        disabled={submitting}
        className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "…" : isTie ? "Play again" : "Continue"}
      </button>
    </div>
  );
}
