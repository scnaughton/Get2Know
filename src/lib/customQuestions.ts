import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { CustomQuestion, QuestionCategory, QuestionTier } from "./types";

const CUSTOM_QUESTIONS_COLLECTION = "customQuestions";

export async function addCustomQuestion(
  text: string,
  category: QuestionCategory,
  tier: QuestionTier
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Enter a question before adding it.");
  }
  await addDoc(collection(db, CUSTOM_QUESTIONS_COLLECTION), {
    text: trimmed,
    category,
    tier,
    createdAt: serverTimestamp(),
  });
}

/** One-off fetch (not live) — used when drawing a question for a round. */
export async function getAllCustomQuestions(): Promise<CustomQuestion[]> {
  const snap = await getDocs(collection(db, CUSTOM_QUESTIONS_COLLECTION));
  return snap.docs.map((docSnap) => {
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
  });
}
