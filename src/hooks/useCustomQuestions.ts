"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CustomQuestion, QuestionCategory, QuestionTier } from "@/lib/types";

interface UseCustomQuestionsResult {
  questions: CustomQuestion[];
  loading: boolean;
  error: string | null;
}

export function useCustomQuestions(): UseCustomQuestionsResult {
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "customQuestions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setQuestions(
          snap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              text: data.text as string,
              category: data.category as QuestionCategory,
              tier: data.tier as QuestionTier,
              createdAt:
                data.createdAt && typeof data.createdAt.toMillis === "function"
                  ? data.createdAt.toMillis()
                  : Date.now(),
            };
          })
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { questions, loading, error };
}
