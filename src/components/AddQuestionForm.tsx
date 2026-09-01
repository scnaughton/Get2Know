"use client";

import { useState, type FormEvent } from "react";
import { addCustomQuestion } from "@/lib/customQuestions";
import { CATEGORY_LABELS, TIER_LABELS } from "@/lib/questions";
import type { QuestionCategory, QuestionTier } from "@/lib/types";

const TIERS: QuestionTier[] = [1, 2, 3];
const CATEGORIES = Object.keys(CATEGORY_LABELS) as QuestionCategory[];

export function AddQuestionForm() {
  const [text, setText] = useState("");
  const [tier, setTier] = useState<QuestionTier>(1);
  const [category, setCategory] = useState<QuestionCategory>("icebreaker");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await addCustomQuestion(text, category, tier);
      setText("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add that question.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md"
    >
      <h2 className="text-lg font-semibold text-plum">Add a question</h2>

      <label className="flex flex-col gap-1 text-sm font-medium text-plum/80">
        Question
        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSuccess(false);
          }}
          placeholder="What's something you've never told anyone?"
          rows={2}
          maxLength={280}
          className="resize-none rounded-xl border border-plum/10 bg-white px-4 py-3 text-base text-plum shadow-sm outline-none focus:border-blush"
        />
      </label>

      <div className="flex flex-col gap-1 text-sm font-medium text-plum/80">
        Depth
        <div className="flex gap-2">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                tier === t
                  ? "bg-blush text-white shadow"
                  : "bg-blush/10 text-plum/60 hover:bg-blush/20"
              }`}
            >
              {TIER_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-plum/80">
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as QuestionCategory)}
          className="rounded-xl border border-plum/10 bg-white px-4 py-3 text-base text-plum shadow-sm outline-none focus:border-blush"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">Added! It can now be drawn in games.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add question"}
      </button>
    </form>
  );
}
