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
- [ ] **Access protection deferred.** Investigated 2026-09-02: Vercel's
      built-in Password Protection needs a paid "Advanced Deployment
      Protection" add-on not available on the Hobby plan; plain Vercel
      Authentication (SSO) is free but requires every player to have a
      Vercel account and be invited to the WISDOM TREE team — impractical
      for casually sharing a game link. Decided to leave the site fully
      public for now rather than build a custom app-level password gate;
      revisit later (either build the app-level gate, or upgrade to
      Vercel Pro for real Password Protection).
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

- [x] **Creator-selectable question categories, plus a new Intimacy &
      Sex category.** At game creation, alongside the question-count
      selector, the creator now picks which topics are in play for that
      game (chip toggles, `src/app/page.tsx`) — Icebreaker, Trivia
      (previously unselectable anywhere), Life Goals, Past Relationships,
      and Deep Reflection are on by default; the new **Intimacy & Sex**
      category is **opt-in** (unchecked by default, shown with a 🔒 until
      tapped on) since it's sensitive by nature. 8 new tasteful built-in
      questions added (`q31`–`q38` in `src/lib/questions.ts`, tier 2–3,
      focused on communication/comfort/desire rather than anything
      graphic). Stored as `enabledCategories` on the room;
      `QuestionPicker`'s available pool (and "🎲 Surprise me") filters to
      only enabled categories, on top of excluding already-used
      questions. Verified against live Firestore.
- [x] **Category filter tabs in `QuestionPicker`.** Reported as "intimacy
      questions don't appear" — root cause was that intimacy questions
      *were* in the pool (verified against live Firestore) but there was
      no way to browse by category, only by tier, so they were just
      mixed in unlabeled among ~30 others under tier 2/3. Added a second
      row of filter tabs (one per category enabled for the room, plus
      "All topics") below the existing tier tabs, only shown when the
      room has more than one category enabled. "🎲 Surprise me" now
      respects the active category filter too, not just tier.
- [x] **Rock-paper-scissors decides who asks first.** Games now open with
      an RPS round instead of always defaulting to the room creator: new
      `phase: "rps"` between `startGame()` and the first `"choosing"`,
      both players privately pick via the new `RockPaperScissors`
      component, `room.rpsChoices` (keyed by player id) holds the picks.
      Winner resolution and tie detection happen client-side from the two
      stored choices (no extra Firestore field needed) — a decisive
      result shows both picks + "Continue" (`advanceAfterRps()`, sets
      `currentTurnPlayerId` to the winner and moves to `"choosing"`).
      Verified against live Firestore (both a tie and a win path).
- [x] **Ties auto-replay instead of requiring a tap.** A tie briefly
      shows "It's a tie!" then automatically calls `playAgainRps()`
      (clears `rpsChoices`) after 1.4s via a `useEffect` timeout in
      `RockPaperScissors` — no button, it just keeps re-rolling until
      someone actually wins so the game can begin. Either client's
      timeout can fire the reset; a near-simultaneous duplicate call from
      both clients is a harmless idempotent clear.
- [x] **"+ Add your own question" is now a real button.** Was a small
      underlined text toggle in `QuestionPicker` — replaced with a
      properly sized, blush-bordered button
      (`border-2 border-blush`, `text-blush`) so it's clearly visible.
- [x] **"Leave game" is now a real button.** Was a small underlined text
      link in both `Lobby` (lobby screen) and the active-play header in
      `src/app/room/[roomId]/page.tsx` — replaced with a properly sized,
      red-bordered button (`border-2 border-red-200`, `text-red-500`) in
      both places so it's clearly visible rather than easy to miss.
- [x] **Fixed turn-order bug: picker and answerer were the same person.**
      The player who chose the question tier was also the one prompted to
      answer it and earn the points — the other player only ever scored,
      never played the "hot seat." Fixed in `submitScore()`
      (`src/lib/room.ts`): the picker (`currentTurnPlayerId`) now scores
      the *other* player, who is the actual answerer and earns the
      points; roles swap each round (this round's answerer becomes next
      round's picker). Room page UI updated to match: the picker sees
      "listen in, then score them" during answering and the `HeartRating`
      during scoring; the other player sees "I'm done answering" and gets
      scored. Verified across two full rounds against live Firestore.
- [x] **Leave game in progress.** `leaveGame()` in `src/lib/room.ts`; a
      "Leave" control now shows in the lobby and on every active-play
      screen. The other player's live listener resolves the room to
      "finished" and shows a "{name} left the game" results screen instead
      of hanging on "waiting for...". Scores earned so far are preserved.
- [x] **Hearts instead of a slider for scoring.** `HeartRating` replaces
      the old `ScoreSlider`: tap 0–5 hearts, each worth `maxPoints / 5`
      (1/2/4 pts per tier — divides evenly). Filled hearts also show on
      the round-reveal screen alongside the point total.
- [x] **Question management.** Two parts:
      - A standalone `/questions` page: browse the built-in 30 plus any
        custom ones, filterable by tier, with an add-question form
        (text/tier/category) — for browsing/curating outside a game.
      - **In-game picking**, added after initial feedback that browsing
        and adding needed to happen *during* the "choosing" phase, not
        only on a separate page: `QuestionPicker` (replacing the old
        `TierPicker`) lets the asker browse/filter the live question bank
        and tap a specific question to ask ("Ask this"), or hit "🎲
        Surprise me" per tier for a quick random pick, or add a new
        question inline without leaving the game. `chooseQuestion()` in
        `src/lib/room.ts` sets whatever specific question was picked (the
        old random-only `chooseTier()` path and its now-unused helpers
        were removed).
      - Custom questions live in a global Firestore `customQuestions`
        collection (no accounts yet, so no per-user library — schema
        leaves room for an `authorId` field later without a rework).
        `firestore.rules` covering it has been published to the live
        `get2know-d3dca` project and verified end-to-end (write/read/
        delete all succeed live; explicit question selection verified
        end-to-end too).
- [x] **Remove unwanted questions from the game.** A small × next to each
      question in `QuestionPicker` calls `dismissQuestion()`
      (`src/lib/room.ts`), which marks it unavailable for the rest of
      that room's game via the same `usedQuestionIds` mechanism as an
      already-asked question — removed from the pool for both players,
      global question bank untouched. Verified against live Firestore.
- [x] **Selectable question count (5/10/20).** A "Number of questions"
      selector on the create-game form sets `totalRounds` on the room;
      the lobby and active-play screen show it, and the last round's
      reveal screen shows "See final results" instead of "Next round"
      once `roundNumber > totalRounds` — the game concludes naturally
      instead of continuing indefinitely. Verified against live
      Firestore.

## Backlog / Ideas

- [ ] Support more than 2 players (would need group scoring rules and a
      redesigned turn order)
- [ ] Persist finished games (a simple match history / past scores)
- [ ] Sound/haptics for score reveals
- [ ] Automated tests (none yet — `npm run lint` + manual smoke tests are
      the current quality gate)

## Known follow-ups from setup

- [ ] **`firestore.rules` is wide open** (`allow read, write: if true` on
      both `/rooms/{roomId}` and `/customQuestions/{questionId}`) — fine
      for a casual game with no sensitive data, but revisit if the
      project grows (e.g. once accounts exist, restrict question writes
      to signed-in players).
- [ ] **Vercel Authentication is currently OFF** — the app is fully public
      at the URL below.

## Deployment

- **Live URL:** https://get2know-beige.vercel.app (also aliased at
  https://get2know-wisdom-tree1.vercel.app)
- **Vercel project:** `get2know` (team: WISDOM TREE) — **linked to
  GitHub** (`scnaughton/Get2Know`, `main` branch); pushing to `main`
  auto-deploys to production. Manual `deploy_to_vercel` file uploads are
  no longer the deploy path.
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
  Deployed to production and verified live: home + `/questions` pages
  render correctly, and the `customQuestions` collection now accepts
  writes after `firestore.rules` was republished — full add-a-question
  flow verified end-to-end against live Firestore.
- **2026-09-01** — Fixed a game-mechanic bug: the question picker and the
  answerer were the same player (so scoring never actually alternated who
  was "in the hot seat"). Now the picker scores the other player, who
  answers and earns points, and roles swap each round — see "Recently
  shipped" above. Added TODO item to make "Leave game" a real button
  instead of a small text link.
- **2026-09-01** — Moved question browsing/adding into the game itself:
  the "choosing" phase now uses `QuestionPicker` (replacing `TierPicker`)
  so the asker can browse and pick a specific question, or add one on the
  spot, without leaving the game. Standalone `/questions` page kept for
  browsing/curating outside a game. Removed the now-dead random-per-tier
  draw path (`chooseTier`, `getRandomQuestion`, `remainingCount`,
  `getAllCustomQuestions`). Verified end-to-end against live Firestore.
- **2026-09-01** — Fixed a UI bug reported as "the upper Create a game
  button doesn't work": the home page had two near-identical buttons
  (mode-switcher tab "Create a game" + submit button "Create game"), and
  clicking the tab while already on the default "create" mode produced
  no visible change at all — indistinguishable from broken. Relabeled the
  tabs to "New Game" / "Have a Code?" so they read as clearly different
  from the actual submit action.
- **2026-09-01** — Added a way to remove unwanted questions from a game:
  a × on each question in `QuestionPicker` dismisses it from that room's
  pool (same mechanism as an already-asked question) without affecting
  the global bank. Verified against live Firestore.
- **2026-09-01** — Added a selectable question count (5/10/20) at game
  creation (`totalRounds` on the room) so games conclude naturally
  instead of running indefinitely; last-round reveal now offers "See
  final results" instead of "Next round". Verified against live
  Firestore.
- **2026-09-02** — Added TODO item: open each game with a
  rock-paper-scissors round to decide who asks the first question,
  instead of always defaulting to the room creator. Noted that the
  question-count-limit and "how many questions are left" display appear
  to already be covered by the existing `totalRounds` selector and
  "Round X of N" indicator — flagged for the user to confirm.
- **2026-09-02** — Added TODO item: make "+ Add your own question" a real
  button with a proper size and standout color, instead of the small
  underlined text toggle it is today in `QuestionPicker`.
- **2026-09-02** — Added TODO item: let the game creator pick which
  question categories/subjects are in play, plus a new intimacy/sex
  category and surfacing the existing (but currently unselectable)
  Trivia category. Clarified the tier-vs-category terminology mismatch in
  the request for whoever builds it.
- **2026-09-02** — Made "Leave game" a real button (red-bordered, proper
  size) in both the lobby and active-play screens, replacing the small
  text link — closes out the item that had been sitting in Now/Next.
- **2026-09-02** — Made "+ Add your own question" a real button
  (blush-bordered) instead of a small text toggle.
- **2026-09-02** — Built the rock-paper-scissors opening mechanic: games
  now open with an RPS round (new `phase: "rps"`) and the winner asks the
  first question, instead of always defaulting to the room creator. Ties
  let both players replay; verified against live Firestore.
- **2026-09-02** — Built creator-selectable question categories, plus a
  new opt-in Intimacy & Sex category with 8 new tasteful questions
  (`q31`–`q38`). Creator picks topics at game creation; `QuestionPicker`
  now filters to only the enabled categories. Verified against live
  Firestore.
- **2026-09-02** — Deployed the full batch above (Leave-game button,
  Add-question button, RPS opening mechanic, selectable categories) to
  Vercel production. A prior attempt this session failed
  (`BUILD_UTILS_SPAWN_1`, from an incomplete file payload and a
  transcription typo in `layout.tsx`) — this redeploy re-read every file
  fresh before assembling the payload, built clean, and was verified live
  at https://get2know-beige.vercel.app (homepage shows "Number of
  questions", "Question topics", Trivia, and Intimacy chips as expected).
- **2026-09-02** — Confirmed with the user that the existing "Round X of
  N" indicator during play already satisfies "a limit on how many
  questions are left displayed" — no change needed. Closed out that
  Now/Next item.
- **2026-09-02** — Pushed this repo to GitHub (`scnaughton/Get2Know`) and
  linked the Vercel project to it (done via the dashboard — no API path
  exists to relink an already-created project). This commit is the
  verification push confirming auto-deploy-on-push now works; future
  changes ship on `git push` instead of manual file uploads.
- **2026-09-02** — Investigated re-enabling access protection: Vercel
  Password Protection needs a paid add-on not on the Hobby plan; Vercel
  Authentication (SSO) is free but would require every player to have a
  Vercel account on the team, which defeats casually sharing a game link.
  User decided to leave the site public for now rather than build a
  custom app-level password gate — see "Now / Next" above.
- **2026-09-02** — Fixed production Firestore connectivity: git-linked
  builds had no `NEXT_PUBLIC_FIREBASE_*` env vars (only ever included in
  the old manual `deploy_to_vercel` payloads, never committed since
  `.env.production` is gitignored), causing "client is offline" errors
  and games failing to start. User added the vars in Vercel project
  settings; verified live that the Firebase config now reaches the
  client bundle.
- **2026-09-02** — Rock-paper-scissors ties now auto-replay (no tap
  needed) instead of requiring a manual "Play again" — see "Recently
  shipped" above.
- **2026-09-02** — Fixed a bug from that same change: reported as "icons
  are not clickable after reset". `handleChoose`'s `submitting` flag was
  only reset to `false` on error, never on success; since the RPS
  component doesn't unmount between a tie and its auto-replay, that
  stale `true` permanently disabled the choice buttons the moment they
  reappeared. Now resets in a `finally` block.
- **2026-09-02** — Fixed "intimacy questions don't appear": added
  category filter tabs to `QuestionPicker` — see "Recently shipped"
  above. Verified the underlying category-selection/filtering logic was
  already correct via a live Firestore write/read before concluding the
  real gap was a missing way to browse by category in the UI.
