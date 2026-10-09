# Portfolio Demo Hub — checkpoint

Read this first after Moonrise. Moonset rewrites it.

- **Updated:** 2026-10-09 (Moonset) by Moonlight · Portfolio Demo Hub
- **Checked out:** `content/gait-internal` (`0bb0a2c`), the newest work. It contains local `main` (`8fea709`).
- **Live:** anthonynarine.com = `origin/main` `5262672` (deployed 2026-10-09 with the human's OK, Netlify ~30 s).
- **Unpushed:** `main` is 1 ahead of `origin/main` (`8fea709`, records only); `content/gait-internal` (4 commits:
  Gait card + records). Nothing uncommitted.

## Waiting on

1. **GAIT-13** (Gait's Orchestrator, session `django-auth-53`): AuthFlow repositioned from "product for companies"
   to "my internal security system", words only, two passes (public surface, then docs). It needs the human's OK
   typed **in that session** (a relayed OK does not count) and the human's answer on EarlyAccessPage (Moonlight
   suggested removing it). It starts after GAIT-8 merges.
2. **Then ship the Gait card together with GAIT-13:** fetch, fast-forward `main` to `content/gait-internal`, build +
   lint, push with the human's OK, confirm on anthonynarine.com. The two AuthFlow docs pages the card links to keep
   their titles and addresses (confirmed by Gait's Orchestrator).

## What changed in this session (2026-10-08/09)

- **Foundry adopted** (prefix PDH, owner `human:anthony`, policy seq 1 on local state branch `cb8048e`). Map in
  `.foundry/project/`. `AGENTS.md` defines Moonrise/Moonset and the rules (fetch first; build + lint + look in light
  and dark; the human's OK before any push). `foundry validate`: 0 errors.
- **Stale-base incident:** this Mac's `main` was 18 commits behind GitHub; first attempt redone on the real `main`.
  Lesson recorded in `AGENTS.md` (fetch first). Old attempt kept as `backup/foundry-on-stale-base`.
- **Foundry is the first featured project (live):** presented as Anthony's custom, language- and provider-agnostic
  tool; no links (private; frontend planned). Four animated, hand-written SVG slides in `public/screenshots/`:
  `foundry-flow` (git graph: how a change ships), `foundry-today` (stats + projects, snapshot of 2026-10-09),
  `foundry-guarantees`, `foundry-endgame` (roadmap). Motion stops under prefers-reduced-motion. In-card animation
  could not be confirmed from the automation tab (Chrome freezes images in hidden tabs); the files animate standalone.
- **Gait card rewritten (unpushed):** "the internal security system I built to protect my own applications". Claims,
  verified: in production Gait protects only itself; Lumen (in development) signs in through Gait with gait-sdk
  (Lumen main: `gait_sdk.authentication.ExternalJWTAuthentication`); its security-check reporting
  (`send_gait_self_check`) is built but not running yet. The Lumen card's identity claims are true and stay.
- **Reported to Moonlight · Foundry** (`foundry-b5`): ORC-019 recurrence in `foundry init` (took the feature branch as
  `main_branch`) and the unquoted `verified.at` date in the FND-2 §3.1 example that `foundry validate` rejects.

## Open decisions (human)

- EarlyAccessPage in AuthFlow: keep or remove (asked in Gait's session).
- OneVOne's repo link (`github.com/anthonynarine/tic_tac_toe`) returns 404 publicly: make public, or remove the link.
- Is the Foundry roadmap (end-game slide) fine to keep public? It is live now.

## Next actions (Moonlight can do these on request)

1. Check the Foundry and Gait cards at phone width (never checked).
2. Cleanup: remove unused `src/assets/react.svg` / `public/vite.svg`; untrack `tsconfig.tsbuildinfo`.
3. Delete merged local branches: `feature/foundry-currently-building`, `feature/estateiq-featured-project-and-color-accents`
   (merged as PR #1; also on GitHub — deleting that one needs the human's OK), and `backup/foundry-on-stale-base`.
4. Refresh `foundry-today.svg` (numbers, statuses, "Nine days old") whenever the site is updated.
5. When Foundry's frontend exists, add its link to the card.

## Notes

- Lumen's UI dev server holds port 5173 on this Mac; this site runs on 5174 (`npm run dev -- --port 5174`).
- Foundry is not on PATH: `~/Library/Python/3.11/bin/uv run --project ~/Desktop/django-react/foundry foundry <cmd>`.
- Other sessions: Moonlight · Foundry `foundry-b5`; Gait's Orchestrator `django-auth-53`; Lumen `lumen-reports-14`.
