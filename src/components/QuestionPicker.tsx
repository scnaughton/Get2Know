"use client";

import { useMemo, useState } from "react";
import { CATEGORY_LABELS, QUESTIONS, TIER_LABELS, TIER_POINTS } from "@/lib/questions";
import { useCustomQuestions } from "@/hooks/useCustomQuestions";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { FilterButton } from "@/components/FilterButton";
import type { Question, QuestionTier } from "@/lib/types";

type TierFilter = QuestionTier | "all";
const TIERS: QuestionTier[] = [1, 2, 3];

// A plain module-level helper (not defined inside the component) so the
// impure Math.random() call isn't reachable from render analysis — only
// from the onClick handler that calls it.
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

interface QuestionPickerProps {
  usedQuestionIds: string[];
  onChoose: (question: Question) => Promise<void>;
  onDismiss: (questionId: string) => Promise<void>;
}

export function QuestionPicker({ usedQuestionIds, onChoose, onDismiss }: QuestionPickerProps) {
  const [filter, setFilter] = useState<TierFilter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const { questions: customQuestions } = useCustomQuestions();

  const available = useMemo(
    () => [...QUESTIONS, ...customQuestions].filter((q) => !usedQuestionIds.includes(q.id)),
    [customQuestions, usedQuestionIds]
  );
  const visible = useMemo(
    () => (filter === "all" ? available : available.filter((q) => q.tier === filter)),
    [available, filter]
  );

  async function handleChoose(question: Question) {
    setError(null);
    setPendingId(question.id);
    try {
      await onChoose(question);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't select that question.");
      setPendingId(null);
    }
  }

  function handleSurprise(tier: QuestionTier) {
    const pool = available.filter((q) => q.tier === tier);
    if (pool.length === 0) {
      setError("No questions left at that level — try another one.");
      return;
    }
    void handleChoose(pickRandom(pool));
  }

  async function handleDismiss(questionId: string) {
    setError(null);
    setDismissingIds((prev) => new Set(prev).add(questionId));
    try {
      await onDismiss(questionId);
      // On success the question drops out of `available` once the room's
      // usedQuestionIds prop updates via the live listener — no need to
      // clear it from dismissingIds, the row just unmounts.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove that question.");
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm font-medium text-plum/70">
        Your turn to ask — browse questions below, or add your own.
      </p>

      <div className="flex gap-2 overflow-x-auto">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          All ({available.length})
        </FilterButton>
        {TIERS.map((tier) => (
          <FilterButton key={tier} active={filter === tier} onClick={() => setFilter(tier)}>
            {TIER_LABELS[tier]} ({available.filter((q) => q.tier === tier).length})
          </FilterButton>
        ))}
      </div>

      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
        {visible.length === 0 && (
          <p className="text-center text-sm text-plum/50">
            No questions left here — try another level, or add one below.
          </p>
        )}
        {visible.map((question) => (
          <div
            key={question.id}
            className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => handleChoose(question)}
              disabled={pendingId !== null || dismissingIds.has(question.id)}
              className="flex flex-1 items-start justify-between gap-3 text-left disabled:opacity-50"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-1 text-[10px] font-semibold uppercase tracking-wide text-blush/80">
                  <span className="rounded-full bg-blush/10 px-2 py-0.5">
                    {TIER_LABELS[question.tier]}
                  </span>
                  <span className="rounded-full bg-blush/10 px-2 py-0.5">
                    {CATEGORY_LABELS[question.category]}
                  </span>
                  <span className="rounded-full bg-blush/10 px-2 py-0.5">
                    {TIER_POINTS[question.tier]} pts
                  </span>
                </div>
                <p className="text-sm text-plum">{question.text}</p>
              </div>
              <span className="shrink-0 rounded-full bg-blush px-3 py-1 text-xs font-bold text-white">
                {pendingId === question.id ? "…" : "Ask this"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleDismiss(question.id)}
              disabled={dismissingIds.has(question.id)}
              aria-label={`Remove "${question.text}" from this game`}
              title="Not this one — remove it from this game"
              className="shrink-0 rounded-full px-2 py-1 text-lg leading-none text-plum/30 transition hover:bg-plum/10 hover:text-plum/60 disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {TIERS.map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => handleSurprise(tier)}
            disabled={pendingId !== null}
            className="flex-1 rounded-xl bg-blush/10 px-3 py-2 text-xs font-semibold text-plum/70 transition hover:bg-blush/20 disabled:opacity-40"
          >
            🎲 Surprise me ({TIER_LABELS[tier]})
          </button>
        ))}
      </div>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={() => setShowAddForm((v) => !v)}
        className="rounded-xl border-2 border-blush bg-white py-3 text-base font-semibold text-blush shadow-sm transition hover:bg-blush/10"
      >
        {showAddForm ? "Hide the form" : "+ Add your own question"}
      </button>
      {showAddForm && <AddQuestionForm />}
    </div>
  );
}
