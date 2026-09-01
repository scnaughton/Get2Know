export type QuestionTier = 1 | 2 | 3;

export type QuestionCategory =
  | "icebreaker"
  | "trivia"
  | "goals"
  | "past-relationships"
  | "deep";

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  tier: QuestionTier;
}

/** A player-submitted question, stored in Firestore alongside the built-in bank. */
export interface CustomQuestion extends Question {
  createdAt: number;
}

export interface RoundQuestion extends Question {
  maxPoints: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  joinedAt: number;
}

export type GamePhase =
  | "lobby"
  | "choosing"
  | "answering"
  | "scoring"
  | "reveal"
  | "finished";

export type RoomStatus = "lobby" | "playing" | "finished";

export interface LastRound {
  questionText: string;
  category: QuestionCategory;
  tier: QuestionTier;
  answererId: string;
  answererName: string;
  points: number;
}

export interface Room {
  code: string;
  status: RoomStatus;
  phase: GamePhase;
  players: Player[];
  currentTurnPlayerId: string | null;
  currentQuestion: RoundQuestion | null;
  usedQuestionIds: string[];
  lastRound: LastRound | null;
  roundNumber: number;
  /** How many questions this game runs for, chosen at creation (5, 10, or 20). */
  totalRounds: number;
  /** Name of the player who left early, if the game ended that way rather than via "End game". */
  leftByName?: string | null;
}
