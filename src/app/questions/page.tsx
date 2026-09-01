"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, QUESTIONS, TIER_LABELS } from "@/lib/questions";
import { useCustomQuestions } from "@/hooks/useCustomQuestions";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { FilterButton } from "@/components/FilterButton";
import type { Question, QuestionTier } from "@/lib/types";

type TierFilter = QuestionTier | "all";

export default function QuestionsPage() {
  const [filter, setFilter] = useState<TierFilter>("all");
  const { questions: customQuestions, loading, error } = useCustomQuestions();

  const allQuestions = useMemo(
    () => [...QUESTIONS, ...customQuestions],
    [customQuestions]
  );
  const visible = useMemo(
    () => (filter === "all" ? allQuestions : allQuestions.filter((q) => q.tier === filter)),
    [allQuestions, filter]
  );
  const customIds = useMemo(() => new Set(customQuestions.map((q) => q.id)), [customQuestions]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blush">Question Bank</h1>
        <Link href="/" className="text-sm font-medium text-plum/60 hover:text-plum">
          ← Home
        </Link>
      </div>

      <AddQuestionForm />

      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
            All ({allQuestions.length})
          </FilterButton>
          {([1, 2, 3] as QuestionTier[]).map((tier) => (
            <FilterButton key={tier} active={filter === tier} onClick={() => setFilter(tier)}>
              {TIER_LABELS[tier]} ({allQuestions.filter((q) => q.tier === tier).length})
            </FilterButton>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">Couldn&rsquo;t load added questions: {error}</p>}
        {loading && <p className="text-sm text-plum/50">Loading added questions…</p>}

        <ul className="flex flex-col gap-2">
          {visible.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              isCustom={customIds.has(question.id)}
            />
          ))}
        </ul>
      </div>
    </main>
  );
}

function QuestionRow({ question, isCustom }: { question: Question; isCustom: boolean }) {
  return (
    <li className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap gap-1 text-[10px] font-semibold uppercase tracking-wide text-blush/80">
        <span className="rounded-full bg-blush/10 px-2 py-0.5">{TIER_LABELS[question.tier]}</span>
        <span className="rounded-full bg-blush/10 px-2 py-0.5">
          {CATEGORY_LABELS[question.category]}
        </span>
        {isCustom && (
          <span className="rounded-full bg-plum/10 px-2 py-0.5 text-plum/60">Added by you</span>
        )}
      </div>
      <p className="text-sm text-plum">{question.text}</p>
    </li>
  );
}
