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
- [ ] **Hearts instead of a slider for scoring:** replace `ScoreSlider`'s
      generic numeric range input with a heart-based rating. The point
      system is fixed per tier (5/10/20), so this is a visual/interaction
      change, not a scoring-logic change — and it reinforces the
      intimacy/romance theme better than a raw number. Open questions:
      - Hearts map 1:1 to points (up to 20 hearts for a Deep Dive
        question) vs. a small fixed scale (e.g. 5 hearts) that scales up
        to the tier's max points
      - Tap-to-fill vs. drag, and whether partial/half-hearts are needed
      - Extend the theme elsewhere too (e.g. heart-shaped tier icons,
        "earned 3 hearts" copy instead of "8 points") so scoring language
        stays consistent across the app
- [ ] **Question management:** a way to see the full question bank and add
      your own questions, rather than only the 30 built-in ones. Open
      design questions to settle when this gets built:
      - Browse view: a page/panel listing all questions, filterable by
        tier/category
      - Add flow: a form to submit a new question (text, tier, category)
      - Where custom questions live: bundled in code (like today, but
        editable) vs. stored in Firestore (either global — shared by every
        game — or per-room, so a pair can add their own before playing)
      - Whether custom questions mix into the random draw alongside the
        built-in 30, or are a separate pool
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
      `/rooms/{roomId}`) — fine for a casual 2-player game with no
      sensitive data, but revisit if the project grows.
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
