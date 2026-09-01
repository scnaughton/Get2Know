import { CATEGORY_LABELS, TIER_LABELS } from "@/lib/questions";
import type { RoundQuestion } from "@/lib/types";

interface QuestionCardProps {
  question: RoundQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 text-center shadow-md">
      <div className="flex justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-blush/80">
        <span className="rounded-full bg-blush/10 px-3 py-1">
          {CATEGORY_LABELS[question.category]}
        </span>
        <span className="rounded-full bg-blush/10 px-3 py-1">{TIER_LABELS[question.tier]}</span>
        <span className="rounded-full bg-blush/10 px-3 py-1">{question.maxPoints} pts</span>
      </div>
      <p className="text-xl font-semibold text-plum">{question.text}</p>
    </div>
  );
}
