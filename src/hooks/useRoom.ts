"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Room } from "@/lib/types";

interface UseRoomResult {
  room: Room | null;
  loading: boolean;
  error: string | null;
}

export function useRoom(roomId: string): UseRoomResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "rooms", roomId),
      (snap) => {
        setRoom(snap.exists() ? (snap.data() as Room) : null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [roomId]);

  return { room, loading, error };
}
