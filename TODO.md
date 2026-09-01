# Get2Know — TODO

Tracks planned work, open follow-ups, and a running changelog for the
project. Add to this file as part of any change worth remembering — new
features, decisions, or things deliberately left undone.

## Product direction

**Decided 2026-09-01:** Get2Know is a **standalone icebreaker tool**, not
the core of a dating platform. Two people who are already connected some
other way (matched elsewhere, met in person, on a call) use it together —
no profiles, discovery/matching, or in-app messaging planned. However,
it's architected with room to plug into a bigger dating platform later
*if* that direction is chosen — meaning real, extensible identity (not
throwaway `localStorage` ids) and clean data boundaries, without building
out platform-scale features (matching, discovery, moderation) now. This
mainly shapes the "User accounts" decision below.

## Now / Next

- [ ] Decide on GitHub + Vercel auto-deploy vs. manual redeploys (see
      "Deployment" below)
- [ ] Re-enable Vercel Authentication (or replace with something lighter,
      like a password) once you're done sharing the public link for testing
- [ ] **User accounts:** given the standalone-but-extensible direction
      above, lean toward real (if lightweight) identity over throwaway
      `localStorage` ids — e.g. Firebase Auth, starting anonymous and
      upgradeable to email/Google later, rather than raw per-room ids.
      **Decided 2026-09-01: rooms stay ephemeral even for signed-in
      users** — a fresh 5-character room/code per game session, same as
      today. The account is a separate, persistent identity (name, saved
      question library, match history) that a player brings *into* a
      room; it doesn't mean one fixed permanent room. Reasoning: a room
      holds one playthrough's live state (turn order, running scores,
      used questions) that needs to reset between games, and a player may
      want to play with different partners or run simultaneous games —
      neither works with one fixed room per account. Later, a signed-in
      user's history view could let them re-launch a fresh room with a
      past partner with one tap, instead of re-sharing a code by hand.
      Still open:
      - Anonymous-by-default (frictionless, upgrade later) vs. requiring
        sign-up up front
      - What an account actually unlocks day one: a saved custom-question
        library? cross-device match history? recognizing a returning
        partner? or just the identity plumbing, with those features built
        later
      - Firestore rules/data model keyed by uid instead of ad-hoc player
        objects, so this doesn't need a rework if a platform is built
        around it later

## Recently shipped

- [x] **Leave game in progress.** `leaveGame()` in `src/lib/room.ts`; a
      "Leave" control now shows in the lobby and on every active-play
      screen. The other player's live listener resolves the room to
      "finished" and shows a "{name} left the game" results screen instead
      of hanging on "waiting for...". Scores earned so far are preserved.
- [x] **Hearts instead of a slider for scoring.** `HeartRating` replaces
      the old `ScoreSlider`: tap 0–5 hearts, each worth `maxPoints / 5`
      (1/2/4 pts per tier — divides evenly). Filled hearts also show on
      the round-reveal screen alongside the point total.
- [x] **Question management.** New `/questions` page: browse the built-in
      30 plus any custom ones, filterable by tier, with an add-question
      form (text/tier/category). Custom questions live in a global
      Firestore `customQuestions` collection (no accounts yet, so no
      per-user library — schema leaves room for an `authorId` field
      later without a rework) and mix into the random draw alongside the
      built-in 30.
      - ⚠️ **Needs one manual step to actually work on the live site:**
        `firestore.rules` was updated locally to cover the new
        `customQuestions` collection, but that hasn't been published to
        the `get2know-d3dca` Firebase console yet — same manual paste as
        before (Firestore → Rules → paste `firestore.rules` → Publish).
        Verified locally that writes are rejected until this is done.

## Backlog / Ideas

- [ ] Support more than 2 players (would need group scoring rules and a
      redesigned turn order)
- [ ] Let the answerer pick a category, not just a tier
- [ ] Add a "skip this question" option
- [ ] Persist finished games (a simple match history / past scores)
- [ ] Sound/haptics for score reveals
- [ ] Automated tests (none yet — `npm run lint` + manual smoke tests are
      the current quality gate)

## Known follow-ups from setup

- [ ] **Deployment isn't git-linked.** The live site was published via a
      one-off file upload to Vercel, not connected to this repo — pushing
      commits does nothing until it's linked. To get auto-deploy-on-push
      (like your other Vercel projects), push this repo to GitHub and link
      it with Vercel's `create_git_project`.
- [ ] **`firestore.rules` is wide open** (`allow read, write: if true` on
      both `/rooms/{roomId}` and `/customQuestions/{questionId}`) — fine
      for a casual game with no sensitive data, but revisit if the
      project grows (e.g. once accounts exist, restrict question writes
      to signed-in players).
- [ ] **No `package-lock.json` was included in the Vercel file deploy** —
      the live build resolved fresh dependency versions rather than the
      exact ones pinned locally. Once git-linked, this goes away (Vercel
      would use the committed lockfile).
- [ ] **Vercel Authentication is currently OFF** (see "Now / Next" above)
      — the app is fully public at the URL below.

## Deployment

- **Live URL:** https://get2know-wisdom-tree1.vercel.app
- **Vercel project:** `get2know` (team: WISDOM TREE)
- **Firebase project:** `get2know-d3dca` (Firestore enabled, rules
  published)
- Local dev: `npm run dev` (needs `.env.local`, see `.env.local.example`)

## Changelog

- **2026-08-31** — Scaffolded the app: Next.js 16 (App Router) + TypeScript
  + Tailwind CSS v4, Firebase Firestore for real-time 2-player sync. Game
  flow: create/join room by code → lobby → tiered questions (5/10/20 pts)
  → peer scoring → reveal → final results. 30-question bank across 5
  categories.
- **2026-08-31** — Wired up the live Firebase project (`get2know-d3dca`),
  enabled Firestore, published `firestore.rules`. Added Firebase Analytics
  (lazy, browser-only). Dropped the vendored Node toolchain in favor of a
  real global Node install (via nvm). Verified full game lifecycle
  end-to-end against live Firestore.
- **2026-08-31** — Deployed to Vercel production via direct file upload
  (no GitHub link yet). Disabled Vercel Authentication so the link is
  publicly playable.
- **2026-09-01** — Decided product direction: standalone icebreaker tool,
  architected to be extensible toward a future dating platform without
  committing to build one now (see "Product direction" above).
- **2026-09-01** — Added TODO item to replace the numeric score slider
  with a heart-based rating, to better reinforce the intimacy/romance
  theme.
- **2026-09-01** — Decided rooms stay ephemeral (fresh code per game) even
  for signed-in users; accounts hold identity/history, not a permanent
  room (see "User accounts" above).
- **2026-09-01** — Added TODO item: no way to leave a game in progress
  today (only "End game" on the reveal screen); needs a real exit
  affordance and a decision on what happens to the other player.
- **2026-09-01** — Built leave-game, hearts-based scoring, and question
  management (browse + add, `/questions`) — see "Recently shipped" above.
  Verified leave-game and the game lifecycle end-to-end against live
  Firestore; question-add is verified locally but blocked live until
  `firestore.rules` is republished (manual step, flagged above).
