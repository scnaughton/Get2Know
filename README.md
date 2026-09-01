# Get2Know

An interactive, question-and-answer dating game that turns getting to know a
potential partner into a lighthearted, gamified experience. Play remotely
over Zoom/a phone call, or in person by passing one device back and forth.

- **Diverse question library** across icebreakers, trivia, life goals, and
  past relationships.
- **Value-based scoring** — deeper, more personal questions are worth more
  points.
- **Peer-awarded points** — your partner scores your answer for depth,
  humor, and authenticity.
- **Real-time sync** — two players on two different devices see the same
  game state live (question, whose turn it is, scores) via Firebase.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS, with Firebase
Firestore for real-time state sync between the two players in a room.

## Setup

### 1. Install dependencies

This machine doesn't have Node.js installed globally. A local copy is
already vendored at `.toolchain/node` for this project — put it on your
`PATH` for any commands below, or install Node 18+ yourself and skip this:

```bash
export PATH="$(pwd)/.toolchain/node/bin:$PATH"
npm install
```

### 2. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and
   create a new project (or reuse an existing one).
2. Add a **Web app** to the project (Project settings → General → Your
   apps → </> Add app). Copy the `firebaseConfig` values it gives you.
3. Enable **Firestore Database** (Build → Firestore Database → Create
   database). Start in test mode, then apply the rules below.
4. In the Firestore console, go to the **Rules** tab and paste the contents
   of [`firestore.rules`](./firestore.rules) in this repo, then Publish.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with the values from your Firebase web app config.

### 4. Run it

```bash
npm run dev     # starts the dev server at http://localhost:3000
npm run lint    # runs ESLint
npm run build   # production build
```

## How a game works

1. One player creates a room from the home screen and gets a 5-character
   room code; the other player joins with that code.
2. Once both players have joined, either can start the game.
3. On your turn, pick a question tier — **Light & Easy** (5 pts),
   **Getting Real** (10 pts), or **Deep Dive** (20 pts) — and a random
   unused question from that tier is drawn.
4. Answer out loud (in person or on the call). When you're done, tap "I'm
   done answering."
5. Your partner scores your answer with a slider, based on how deep,
   funny, or authentic it was. Points are added to your total and the turn
   passes to them.
6. Play as many rounds as you like, then either player can end the game to
   see the final scoreboard.

## Project structure

```
src/
  app/                 Next.js App Router pages
    page.tsx           Home screen (create/join a room)
    room/[roomId]/     The live game screen
  components/          UI building blocks (lobby, question card, scoring, etc.)
  hooks/               useRoom (Firestore live subscription), usePlayerSession
  lib/
    firebase.ts        Firebase app/Firestore init
    room.ts            Room lifecycle: create/join/start/score/etc.
    questions.ts        Question bank + tier metadata
    session.ts         Per-room player identity stored in localStorage
    types.ts           Shared TypeScript types
```

## Notes / next steps

- Rooms are capped at 2 players, matching the game's design as a
  one-on-one dating icebreaker. Group play would need larger score-sharing
  logic and Firestore rules changes.
- `firestore.rules` is intentionally open (anyone with the room code can
  read/write it) since there's no auth layer — fine for a casual game, but
  don't reuse that pattern for sensitive data.
- No automated tests yet; `npm run lint` is the current quality gate.
