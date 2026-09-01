"use client";

import { useCallback, useSyncExternalStore } from "react";
import { loadPlayerSession, savePlayerSession, type PlayerSession } from "@/lib/session";

// A minimal external store over localStorage: writes don't notify React on
// their own, so we track listeners and notify them ourselves, and we cache
// each room's snapshot so getSnapshot returns a stable reference between
// renders (useSyncExternalStore re-renders whenever the returned value
// differs by identity, so returning a freshly-parsed object every call would
// loop forever). This is the pattern React's lint rules steer you toward
// instead of loading external state via a setState-in-effect cascade.
const listeners = new Set<() => void>();
const cache = new Map<string, PlayerSession | null>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

function getSnapshot(roomId: string): PlayerSession | null {
  if (!cache.has(roomId)) {
    cache.set(roomId, loadPlayerSession(roomId));
  }
  return cache.get(roomId) ?? null;
}

function getServerSnapshot(): null {
  return null;
}

interface UsePlayerSessionResult {
  session: PlayerSession | null;
  saveSession: (session: PlayerSession) => void;
  loaded: boolean;
}

export function usePlayerSession(roomId: string): UsePlayerSessionResult {
  const session = useSyncExternalStore(
    subscribe,
    () => getSnapshot(roomId),
    getServerSnapshot
  );

  const saveSession = useCallback(
    (next: PlayerSession) => {
      savePlayerSession(roomId, next);
      cache.set(roomId, next);
      notifyListeners();
    },
    [roomId]
  );

  // useSyncExternalStore resolves the real client-side value synchronously
  // right after hydration, so by the time consumers see a render there's
  // nothing left to "load" — this flag just keeps the calling API explicit.
  return { session, saveSession, loaded: true };
}
