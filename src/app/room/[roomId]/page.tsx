"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import {
  chooseTier,
  continueToNextRound,
  endGame,
  finishAnswering,
  joinRoom,
  startGame,
  submitScore,
} from "@/lib/room";
import { JoinForm } from "@/components/JoinForm";
import { Lobby } from "@/components/Lobby";
import { Scoreboard } from "@/components/Scoreboard";
import { TierPicker } from "@/components/TierPicker";
import { QuestionCard } from "@/components/QuestionCard";
import { ScoreSlider } from "@/components/ScoreSlider";
import { RoundReveal } from "@/components/RoundReveal";
import { FinalResults } from "@/components/FinalResults";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId.toUpperCase();
  const { room, loading, error } = useRoom(roomId);
  const { session, saveSession, loaded: sessionLoaded } = usePlayerSession(roomId);

  if (loading || !sessionLoaded) {
    return <FullPageMessage>Loading…</FullPageMessage>;
  }

  if (error) {
    return <FullPageMessage>Something went wrong: {error}</FullPageMessage>;
  }

  if (!room) {
    return <FullPageMessage>We couldn&rsquo;t find a room with code {roomId}.</FullPageMessage>;
  }

  if (!session) {
    return (
      <JoinForm
        roomCode={roomId}
        onJoin={async (name) => {
          const { playerId } = await joinRoom(roomId, name);
          saveSession({ playerId, name });
        }}
      />
    );
  }

  const myPlayerId = session.playerId;
  const isMyTurn = room.currentTurnPlayerId === myPlayerId;

  if (room.status === "lobby") {
    return (
      <Lobby
        roomCode={roomId}
        players={room.players}
        myPlayerId={myPlayerId}
        onStart={() => startGame(roomId, room.players)}
      />
    );
  }

  if (room.status === "finished") {
    return <FinalResults players={room.players} myPlayerId={myPlayerId} />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-8">
      <Scoreboard players={room.players} myPlayerId={myPlayerId} roomCode={roomId} />

      {room.phase === "choosing" &&
        (isMyTurn ? (
          <TierPicker
            usedQuestionIds={room.usedQuestionIds}
            onChoose={(tier) => chooseTier(roomId, tier, room.usedQuestionIds)}
          />
        ) : (
          <InlineNotice>Waiting for your partner to pick a question level…</InlineNotice>
        ))}

      {room.phase === "answering" && room.currentQuestion && (
        <div className="flex flex-col gap-4">
          <QuestionCard question={room.currentQuestion} />
          {isMyTurn ? (
            <button
              type="button"
              onClick={() => finishAnswering(roomId)}
              className="rounded-xl bg-blush py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90"
            >
              I&rsquo;m done answering
            </button>
          ) : (
            <p className="text-center text-sm text-plum/60">
              Listen in, then score them once they&rsquo;re done.
            </p>
          )}
        </div>
      )}

      {room.phase === "scoring" && room.currentQuestion && (
        <div className="flex flex-col gap-4">
          <QuestionCard question={room.currentQuestion} />
          {isMyTurn ? (
            <InlineNotice>Your partner is scoring your answer…</InlineNotice>
          ) : (
            <ScoreSlider
              answererName={
                room.players.find((p) => p.id === room.currentTurnPlayerId)?.name ??
                "Your partner"
              }
              maxPoints={room.currentQuestion.maxPoints}
              onSubmit={(points) => submitScore(roomId, points, room)}
            />
          )}
        </div>
      )}

      {room.phase === "reveal" && room.lastRound && (
        <RoundReveal
          lastRound={room.lastRound}
          onNextRound={() => continueToNextRound(roomId)}
          onEndGame={() => endGame(roomId)}
        />
      )}
    </main>
  );
}

function FullPageMessage({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center text-plum/70">
      {children}
    </main>
  );
}

function InlineNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-white/60 px-5 py-6 text-center text-sm text-plum/70 shadow-sm">
      {children}
    </p>
  );
}
