"use client";

import { useState } from "react";
import { HeartIcon } from "@/components/HeartIcon";

const HEART_COUNT = 5;

interface HeartRatingProps {
  answererName: string;
  maxPoints: number;
  onSubmit: (points: number) => Promise<void>;
}

export function HeartRating({ answererName, maxPoints, onSubmit }: HeartRatingProps) {
  const [hearts, setHearts] = useState(0);
  const [hoveredHearts, setHoveredHearts] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pointsPerHeart = maxPoints / HEART_COUNT;
  const displayedHearts = hoveredHearts ?? hearts;
  const points = hearts * pointsPerHeart;

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

      <div
        className="flex justify-center gap-2"
        onMouseLeave={() => setHoveredHearts(null)}
      >
        {Array.from({ length: HEART_COUNT }, (_, index) => {
          const heartValue = index + 1;
          const filled = heartValue <= displayedHearts;
          return (
            <button
              key={heartValue}
              type="button"
              onClick={() => setHearts(heartValue === hearts ? heartValue - 1 : heartValue)}
              onMouseEnter={() => setHoveredHearts(heartValue)}
              aria-label={`${heartValue} heart${heartValue === 1 ? "" : "s"} (${
                heartValue * pointsPerHeart
              } points)`}
              aria-pressed={heartValue <= hearts}
              className="transition-transform hover:scale-110"
            >
              <HeartIcon filled={filled} />
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-plum/50">
        {hearts} heart{hearts === 1 ? "" : "s"} · {points} pts
      </p>

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
