# Portfolio Demo Hub — checkpoint

Read this first after Moonrise. Moonset rewrites it.

- **Updated:** 2026-10-09 by Moonlight · Portfolio Demo Hub
- **Branch:** `feature/foundry-currently-building`, from `origin/main` `2b8e0d4` (the live site). Not pushed.
- **Backup:** `backup/foundry-on-stale-base` holds the first attempt, built on a stale local `main`. Delete it once
  this branch is merged.

## Status

- **Stale-base incident (2026-10-08/09):** this Mac's `main` was 18 commits behind GitHub (the UI overhaul, themes,
  Gait/Lumen/HIPAA updates were made elsewhere). The first Foundry adoption and section were built on that old code.
  Fixed: local `main` fast-forwarded to `2b8e0d4`; the branch rebuilt on it; `AGENTS.md` now says fetch first.
- Foundry adopted (same content, re-applied): `foundry init` `e55f6f1`, owner `human:anthony` policy seq 1
  `4362adb` (state branch `cb8048e`), `AGENTS.md` / `CLAUDE.md` / this file `290bb27`.
- Foundry is the FIRST featured project card (I, ahead of Gait; the human's call on 2026-10-09, after Moonlight
  suggested II behind Gait because Foundry has nothing to click yet), presented as a custom,
  language- and provider-agnostic tool Anthony built so he can build anything. No links: Foundry is private and its
  frontend is planned; promote it to a featured card with a demo once that exists. Its image is a hand-written SVG git graph
  (`public/screenshots/foundry-flow.svg`): outcome → Orchestrator forks agent branches/worktrees → Security/QA gate →
  signature seal → main, with an audit-event strip. It replaced the short-lived
  "Currently building" section (`82a4a99`). Build and lint pass; checked in the running site (dark), no horizontal
  scroll. Phone width not checked.
- Project map redone against `2b8e0d4` (four components: web, content, resume, build-deploy).
- Two Foundry bugs reported to Moonlight · Foundry (session `foundry-b5`): ORC-019 recurrence in `foundry init`, and
  the unquoted `verified.at` date in the FND-2 §3.1 example.

- Foundry card slideshow (4 hand-written SVGs in `public/screenshots/`): `foundry-flow` (git graph: how a change
  ships), `foundry-today` (stats + projects it runs), `foundry-guarantees` (five guarantees), `foundry-endgame`
  (roadmap: now → product core → distribution → proof; target "any team, any stack, any agent, fifteen minutes").
  Stats and project statuses are a snapshot from Foundry's records on 2026-10-09 and go stale; "Nine days old" too.

## Open decisions (human)

- Merge this branch into `main` and push (Netlify deploys `main`).
- OneVOne's repo link (`github.com/anthonynarine/tic_tac_toe`) returns 404 publicly: fix, make public, or remove.
- Remove the unused `src/assets/react.svg` / `public/vite.svg` and untrack `tsconfig.tsbuildinfo`?

## Next actions

0. Refresh `foundry-today.svg` (numbers, statuses, "Nine days old") whenever this site is updated.
1. Check the Foundry card at phone width.
2. When Foundry's frontend exists, add its link (the top card has no click-through until then).
3. Old branch `feature/estateiq-featured-project-and-color-accents` was merged as PR #1; it can be deleted.

## Notes

- Lumen's UI dev server holds port 5173 on this Mac; this site runs on 5174.
