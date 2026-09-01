export interface PlayerSession {
  playerId: string;
  name: string;
}

function storageKey(roomId: string): string {
  return `get2know:player:${roomId}`;
}

export function savePlayerSession(roomId: string, session: PlayerSession): void {
  try {
    window.localStorage.setItem(storageKey(roomId), JSON.stringify(session));
  } catch {
    // localStorage may be unavailable (private browsing, storage disabled).
    // The game still works for the current tab via in-memory React state.
  }
}

export function loadPlayerSession(roomId: string): PlayerSession | null {
  try {
    const raw = window.localStorage.getItem(storageKey(roomId));
    return raw ? (JSON.parse(raw) as PlayerSession) : null;
  } catch {
    return null;
  }
}
