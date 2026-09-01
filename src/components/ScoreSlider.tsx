"use client";

import { useState } from "react";

interface ScoreSliderProps {
  answererName: string;
  maxPoints: number;
  onSubmit: (points: number) => Promise<void>;
}

export function ScoreSlider({ answererName, maxPoints, onSubmit }: ScoreSliderProps) {
  const [points, setPoints] = useState(Math.round(maxPoints / 2));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(points);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit score.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md">
      <p className="text-center text-sm font-medium text-plum/70">
        Score {answererName}&rsquo;s answer for depth, humor, and authenticity.
      </p>
      <p className="text-center text-4xl font-bold text-blush">{points}</p>
      <input
        type="range"
        min={0}
        max={maxPoints}
        value={points}
        onChange={(event) => setPoints(Number(event.target.value))}
        className="accent-blush"
      />
      <div className="flex justify-between text-xs text-plum/50">
        <span>0</span>
        <span>{maxPoints} pts</span>
      </div>
      {error && <p className="text-center text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit score"}
      </button>
    </div>
  );
}
