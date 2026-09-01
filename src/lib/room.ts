import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { TIER_POINTS } from "./questions";
import type { LastRound, Player, Question, Room, RoundQuestion } from "./types";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easy to read aloud
const ROOM_CODE_LENGTH = 5;
const MAX_PLAYERS = 2;

function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

function generatePlayerId(): string {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const snap = await getDoc(doc(db, "rooms", code));
    if (!snap.exists()) return code;
  }
  throw new Error("Could not generate a unique room code. Please try again.");
}

export async function createRoom(
  hostName: string,
  totalRounds: number
): Promise<{ roomId: string; playerId: string }> {
  const code = await generateUniqueRoomCode();
  const playerId = generatePlayerId();
  const host: Player = { id: playerId, name: hostName.trim(), score: 0, joinedAt: Date.now() };

  const room: Omit<Room, "code"> = {
    status: "lobby",
    phase: "lobby",
    players: [host],
    currentTurnPlayerId: null,
    currentQuestion: null,
    usedQuestionIds: [],
    lastRound: null,
    roundNumber: 0,
    totalRounds,
  };

  await setDoc(doc(db, "rooms", code), {
    ...room,
    code,
    createdAt: serverTimestamp(),
  });

  return { roomId: code, playerId };
}

export async function joinRoom(
  code: string,
  name: string
): Promise<{ roomId: string; playerId: string }> {
  const roomRef = doc(db, "rooms", code);
  const playerId = generatePlayerId();

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists()) {
      throw new Error("Room not found. Double-check the code and try again.");
    }
    const room = snap.data() as Room;
    if (room.players.length >= MAX_PLAYERS) {
      throw new Error("This room already has two players.");
    }
    if (room.status !== "lobby") {
      throw new Error("This game has already started.");
    }
    const player: Player = { id: playerId, name: name.trim(), score: 0, joinedAt: Date.now() };
    tx.update(roomRef, { players: [...room.players, player] });
  });

  return { roomId: code, playerId };
}

export async function startGame(roomId: string, players: Player[]): Promise<void> {
  if (players.length < MAX_PLAYERS) {
    throw new Error("Need two players to start.");
  }
  await updateDoc(doc(db, "rooms", roomId), {
    status: "playing",
    phase: "choosing",
    currentTurnPlayerId: players[0].id,
    roundNumber: 1,
  });
}

/** Picker chose a specific question (browsed and picked, or a client-side "surprise me" pick). */
export async function chooseQuestion(
  roomId: string,
  question: Question,
  usedQuestionIds: string[]
): Promise<void> {
  const currentQuestion: RoundQuestion = { ...question, maxPoints: TIER_POINTS[question.tier] };
  await updateDoc(doc(db, "rooms", roomId), {
    currentQuestion,
    usedQuestionIds: [...usedQuestionIds, question.id],
    phase: "answering",
  });
}

/**
 * Marks a question as unavailable for the rest of this game without asking
 * it — same mechanism as "already asked" (adds to usedQuestionIds), so it
 * drops out of the pool for both players, not just the one who dismissed it.
 */
export async function dismissQuestion(
  roomId: string,
  questionId: string,
  usedQuestionIds: string[]
): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), {
    usedQuestionIds: [...usedQuestionIds, questionId],
  });
}

export async function finishAnswering(roomId: string): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), { phase: "scoring" });
}

export async function submitScore(roomId: string, points: number, room: Room): Promise<void> {
  const { currentTurnPlayerId, currentQuestion } = room;
  if (!currentTurnPlayerId || !currentQuestion) {
    throw new Error("There's no active question to score right now.");
  }
  // currentTurnPlayerId is the picker/asker for this round — the *other*
  // player is the one who answered and is being scored.
  const answerer = room.players.find((p) => p.id !== currentTurnPlayerId);
  if (!answerer) {
    throw new Error("Couldn't find the player who answered.");
  }
  const clampedPoints = Math.max(0, Math.min(points, currentQuestion.maxPoints));

  const updatedPlayers = room.players.map((p) =>
    p.id === answerer.id ? { ...p, score: p.score + clampedPoints } : p
  );

  const lastRound: LastRound = {
    questionText: currentQuestion.text,
    category: currentQuestion.category,
    tier: currentQuestion.tier,
    answererId: answerer.id,
    answererName: answerer.name,
    points: clampedPoints,
  };

  await updateDoc(doc(db, "rooms", roomId), {
    players: updatedPlayers,
    lastRound,
    phase: "reveal",
    currentQuestion: null,
    // Roles swap next round: the player who just answered becomes the
    // next picker/asker.
    currentTurnPlayerId: answerer.id,
    roundNumber: room.roundNumber + 1,
  });
}

export async function continueToNextRound(roomId: string): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), { phase: "choosing" });
}

export async function endGame(roomId: string): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), { status: "finished", phase: "finished" });
}

export async function leaveGame(roomId: string, playerName: string): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), {
    status: "finished",
    phase: "finished",
    leftByName: playerName,
  });
}
