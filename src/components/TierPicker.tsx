"use client";

import { useState } from "react";
import { TIER_LABELS, TIER_POINTS, remainingCount } from "@/lib/questions";
import type { QuestionTier } from "@/lib/types";

const TIERS: QuestionTier[] = [1, 2, 3];

interface TierPickerProps {
  usedQuestionIds: string[];
  onChoose: (tier: QuestionTier) => Promise<void>;
}

export function TierPicker({ usedQuestionIds, onChoose }: TierPickerProps) {
  const [pending, setPending] = useState<QuestionTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChoose(tier: QuestionTier) {
    setError(null);
    setPending(tier);
    try {
      await onChoose(tier);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't draw a question.");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm font-medium text-plum/70">
        Your turn — pick how deep you want to go.
      </p>
      <div className="flex flex-col gap-3">
        {TIERS.map((tier) => {
          const left = remainingCount(tier, usedQuestionIds);
          return (
            <button
              key={tier}
              type="button"
              onClick={() => handleChoose(tier)}
              disabled={left === 0 || pending !== null}
              className="flex items-center justify-between rounded-xl bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md disabled:opacity-40"
            >
              <span>
                <span className="block font-semibold text-plum">{TIER_LABELS[tier]}</span>
                <span className="text-xs text-plum/50">
                  {left} question{left === 1 ? "" : "s"} left
                </span>
              </span>
              <span className="rounded-full bg-blush/10 px-3 py-1 text-sm font-bold text-blush">
                {pending === tier ? "…" : `${TIER_POINTS[tier]} pts`}
              </span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
    </div>
  );
}
