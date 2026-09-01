# Get2Know — TODO

Tracks planned work, open follow-ups, and a running changelog for the
project. Add to this file as part of any change worth remembering — new
features, decisions, or things deliberately left undone.

## Now / Next

- [ ] Decide on GitHub + Vercel auto-deploy vs. manual redeploys (see
      "Deployment" below)
- [ ] Re-enable Vercel Authentication (or replace with something lighter,
      like a password) once you're done sharing the public link for testing
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
