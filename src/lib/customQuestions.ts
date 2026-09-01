import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { QuestionCategory, QuestionTier } from "./types";

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
