import type { Question, QuestionCategory, QuestionTier } from "./types";

export const TIER_POINTS: Record<QuestionTier, number> = {
  1: 5,
  2: 10,
  3: 20,
};

export const TIER_LABELS: Record<QuestionTier, string> = {
  1: "Light & Easy",
  2: "Getting Real",
  3: "Deep Dive",
};

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  icebreaker: "Icebreaker",
  trivia: "Trivia",
  goals: "Life Goals",
  "past-relationships": "Past Relationships",
  deep: "Deep Reflection",
};

export const QUESTIONS: Question[] = [
  // Tier 1 — light & easy
  { id: "q1", tier: 1, category: "icebreaker", text: "What's your go-to order at a coffee shop?" },
  { id: "q2", tier: 1, category: "trivia", text: "What's the last movie that made you laugh out loud?" },
  { id: "q3", tier: 1, category: "icebreaker", text: "Window seat or aisle seat, and why?" },
  { id: "q4", tier: 1, category: "trivia", text: "What song do you always sing along to, even off-key?" },
  { id: "q5", tier: 1, category: "icebreaker", text: "What's a hobby you picked up and immediately loved?" },
  { id: "q6", tier: 1, category: "trivia", text: "What's the most-used app on your phone this week?" },
  { id: "q7", tier: 1, category: "icebreaker", text: "Morning person or night owl, and how does it show?" },
  { id: "q8", tier: 1, category: "trivia", text: "What's your comfort food when you've had a long day?" },
  { id: "q9", tier: 1, category: "icebreaker", text: "If you could teleport anywhere right now, where would you go?" },
  { id: "q10", tier: 1, category: "trivia", text: "What's a small thing that instantly puts you in a good mood?" },

  // Tier 2 — getting real
  { id: "q11", tier: 2, category: "goals", text: "What does an ideal Sunday look like for you five years from now?" },
  { id: "q12", tier: 2, category: "goals", text: "What's something you want to get better at this year?" },
  { id: "q13", tier: 2, category: "goals", text: "Would you rather have more time or more money right now, and why?" },
  { id: "q14", tier: 2, category: "past-relationships", text: "What quality have past partners complimented you on the most?" },
  { id: "q15", tier: 2, category: "goals", text: "What does \"home\" mean to you — a place, a feeling, or a person?" },
  { id: "q16", tier: 2, category: "past-relationships", text: "What's something you've learned about yourself from past relationships?" },
  { id: "q17", tier: 2, category: "goals", text: "What's a risk you took that ended up paying off?" },
  { id: "q18", tier: 2, category: "past-relationships", text: "How do you usually know when you're starting to really like someone?" },
  { id: "q19", tier: 2, category: "goals", text: "What does success look like to you outside of work?" },
  { id: "q20", tier: 2, category: "past-relationships", text: "What's a small gesture that makes you feel appreciated?" },

  // Tier 3 — deep dive
  { id: "q21", tier: 3, category: "deep", text: "What's something you're still healing from?" },
  { id: "q22", tier: 3, category: "past-relationships", text: "What's the biggest lesson a past relationship taught you about what you need?" },
  { id: "q23", tier: 3, category: "deep", text: "When do you feel most like yourself, and when do you feel like you're performing?" },
  { id: "q24", tier: 3, category: "deep", text: "What's a fear you have about letting someone get close to you?" },
  { id: "q25", tier: 3, category: "past-relationships", text: "Looking back, is there something you wish you'd done differently in a past relationship?" },
  { id: "q26", tier: 3, category: "deep", text: "What does being truly loved feel like to you?" },
  { id: "q27", tier: 3, category: "goals", text: "What's a dream you've quietly given up on, and do you ever think about reviving it?" },
  { id: "q28", tier: 3, category: "deep", text: "What's something about you that takes time to understand, but is worth understanding?" },
  { id: "q29", tier: 3, category: "past-relationships", text: "What led your last relationship to end, and how do you feel about it now?" },
  { id: "q30", tier: 3, category: "deep", text: "What do you need from a partner when you're struggling, versus when you're doing well?" },
];
