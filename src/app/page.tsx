"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRoom, joinRoom } from "@/lib/room";
import { savePlayerSession } from "@/lib/session";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  DEFAULT_ENABLED_CATEGORIES,
  OPT_IN_CATEGORIES,
} from "@/lib/questions";
import type { QuestionCategory } from "@/lib/types";

type Mode = "create" | "join";

const ROUND_OPTIONS = [5, 10, 20] as const;

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [totalRounds, setTotalRounds] = useState<number>(10);
  const [enabledCategories, setEnabledCategories] = useState<QuestionCategory[]>(
    DEFAULT_ENABLED_CATEGORIES
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(category: QuestionCategory) {
    setEnabledCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter your name to continue.");
      return;
    }

    if (mode === "create" && enabledCategories.length === 0) {
      setError("Pick at least one question category.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "create") {
        const { roomId, playerId } = await createRoom(
          trimmedName,
          totalRounds,
          enabledCategories
        );
        savePlayerSession(roomId, { playerId, name: trimmedName });
        router.push(`/room/${roomId}`);
        return;
      }

      const trimmedCode = code.trim().toUpperCase();
      if (!trimmedCode) {
        setError("Enter the room code your partner shared.");
        setSubmitting(false);
        return;
      }
      const { roomId, playerId } = await joinRoom(trimmedCode, trimmedName);
      savePlayerSession(roomId, { playerId, name: trimmedName });
      router.push(`/room/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blush">Get2Know</h1>
        <p className="mt-2 text-sm text-plum/70">
          A question-and-answer game for getting to know a potential partner
          — over Zoom, on a call, or passing one phone back and forth.
        </p>
      </div>

      <div className="flex rounded-full bg-white/60 p-1 shadow-inner">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            mode === "create" ? "bg-blush text-white shadow" : "text-plum/60"
          }`}
        >
          New Game
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            mode === "join" ? "bg-blush text-white shadow" : "text-plum/60"
          }`}
        >
          Have a Code?
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-plum/80">
          Your name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Sean"
            maxLength={24}
            className="rounded-xl border border-plum/10 bg-white px-4 py-3 text-base text-plum shadow-sm outline-none focus:border-blush"
          />
        </label>

        {mode === "join" && (
          <label className="flex flex-col gap-1 text-sm font-medium text-plum/80">
            Room code
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="e.g. K7QPX"
              maxLength={6}
              className="rounded-xl border border-plum/10 bg-white px-4 py-3 text-base uppercase tracking-widest text-plum shadow-sm outline-none focus:border-blush"
            />
          </label>
        )}

        {mode === "create" && (
          <div className="flex flex-col gap-1 text-sm font-medium text-plum/80">
            Number of questions
            <div className="flex gap-2">
              {ROUND_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTotalRounds(count)}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                    totalRounds === count
                      ? "bg-blush text-white shadow"
                      : "bg-white text-plum/60 shadow-sm hover:bg-blush/10"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="flex flex-col gap-1 text-sm font-medium text-plum/80">
            Question topics
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((category) => {
                const active = enabledCategories.includes(category);
                const isOptIn = OPT_IN_CATEGORIES.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? isOptIn
                          ? "bg-plum text-white shadow"
                          : "bg-blush text-white shadow"
                        : "bg-white text-plum/60 shadow-sm hover:bg-blush/10"
                    }`}
                  >
                    {CATEGORY_LABELS[category]}
                    {isOptIn && !active ? " 🔒" : ""}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs font-normal text-plum/50">
              Intimacy &amp; Sex is off by default — tap to include it.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Just a sec…" : mode === "create" ? "Create game" : "Join game"}
        </button>
      </form>

      <Link
        href="/questions"
        className="text-center text-sm font-medium text-plum/50 underline-offset-2 hover:text-plum/70 hover:underline"
      >
        Browse & add questions
      </Link>
    </main>
  );
}
