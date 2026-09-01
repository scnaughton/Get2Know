"use client";

import { useState, type FormEvent } from "react";

interface JoinFormProps {
  roomCode: string;
  onJoin: (name: string) => Promise<void>;
}

export function JoinForm({ roomCode, onJoin }: JoinFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter your name to join.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onJoin(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blush">Join room {roomCode}</h1>
        <p className="mt-2 text-sm text-plum/70">Enter your name to hop into the game.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          maxLength={24}
          autoFocus
          className="rounded-xl border border-plum/10 bg-white px-4 py-3 text-base text-plum shadow-sm outline-none focus:border-blush"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Joining…" : "Join game"}
        </button>
      </form>
    </main>
  );
}
