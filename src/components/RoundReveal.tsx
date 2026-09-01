"use client";

import { useState } from "react";
import { CATEGORY_LABELS, TIER_LABELS, TIER_POINTS } from "@/lib/questions";
import { HeartIcon } from "@/components/HeartIcon";
import type { LastRound } from "@/lib/types";

const HEART_COUNT = 5;

interface RoundRevealProps {
  lastRound: LastRound;
  isLastRound: boolean;
  onNextRound: () => Promise<void>;
  onEndGame: () => Promise<void>;
}

export function RoundReveal({ lastRound, isLastRound, onNextRound, onEndGame }: RoundRevealProps) {
  const [pending, setPending] = useState<"next" | "end" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pointsPerHeart = TIER_POINTS[lastRound.tier] / HEART_COUNT;
  const heartsEarned = Math.round(lastRound.points / pointsPerHeart);

  async function handle(action: "next" | "end") {
    setError(null);
    setPending(action);
    try {
      await (action === "next" ? onNextRound() : onEndGame());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 text-center shadow-md">
      <div className="flex justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-blush/80">
        <span className="rounded-full bg-blush/10 px-3 py-1">
          {CATEGORY_LABELS[lastRound.category]}
        </span>
        <span className="rounded-full bg-blush/10 px-3 py-1">{TIER_LABELS[lastRound.tier]}</span>
      </div>
      <p className="italic text-plum/70">&ldquo;{lastRound.questionText}&rdquo;</p>
      <div className="flex justify-center gap-1">
        {Array.from({ length: HEART_COUNT }, (_, index) => (
          <HeartIcon key={index} filled={index < heartsEarned} size={28} />
        ))}
      </div>
      <p className="text-lg text-plum">
        <span className="font-semibold">{lastRound.answererName}</span> earned{" "}
        <span className="text-2xl font-bold text-blush">{lastRound.points}</span> points
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex flex-col gap-2">
        {isLastRound ? (
          <button
            type="button"
            onClick={() => handle("end")}
            disabled={pending !== null}
            className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
          >
            {pending === "end" ? "Finishing…" : "See final results"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handle("next")}
              disabled={pending !== null}
              className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              {pending === "next" ? "Loading…" : "Next round"}
            </button>
            <button
              type="button"
              onClick={() => handle("end")}
              disabled={pending !== null}
              className="rounded-xl border border-plum/10 bg-transparent py-3 text-sm font-medium text-plum/60 transition hover:bg-plum/5 disabled:opacity-50"
            >
              {pending === "end" ? "Ending…" : "End game"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
