# Portfolio Demo Hub — checkpoint

Read this first after Moonrise. Moonset rewrites it.

## Current session — side-scroll home, layout switch, handbook link (2026-10-16, Windows machine)

- **Stale-branch sync:** the side-scroll UI was built uncommitted on `feat/side-scroll-home` from `2b8e0d4` while 23
  commits landed on `origin/main`. Fast-forwarded the branch to `origin/main` `151c8bf` and reapplied the work; the one
  conflict (`src/data/projects.ts`, Gait entry) kept main's copy plus the new `kinds` filter tags. Backup of the
  pre-sync work: `stash@{0}` and the session scratchpad.
- **New home page (default "story" layout):** `SiteNav`, horizontal `StoryScroller` (one continuous line: opening
  scribble → chapters I–IV → close), `WorksSection` with a `kinds` filter. Story copy rewritten with Anthony:
  vascular ultrasound → wanted something new → devCodeCamp year-long bootcamp (started March 16, 2022, ended 2023) →
  self-taught (Stack Overflow, Google, Udemy/YouTube teachers) → building with AI and Foundry. COVID deliberately
  removed at Anthony's request. Timeline titled "the whole journey, at a glance"; AI has no year (none given).
- **Foundry in the story:** "Now" stop lists Foundry first with an F mark traced from the Foundry site favicon.
- **Layout switch:** Story/Classic buttons beside the theme toggle in both layouts (`useHomeLayout`, saved in
  `localStorage` `home-layout`, `?ui=story|classic` links). Classic = the previous home page, unchanged
  (`ClassicHome.tsx`). Sections from Writing down are shared.
- **Opening line:** starts just after "Full-stack software engineer" (measured from the DOM) and draws in after the
  first painted frame; a manual reload starts at the top so it replays (back/forward unaffected).
- **Engineering handbook:** linked as "My engineering handbook" (Writing section entry, footer, Classic header) to
  https://anthony-narine-engineering-handbook.netlify.app (public repo `anthonynarine/engineering-handbook`).
  Anthony was advised to skim its Gait security chapters for confidential material; not reviewed here.
- **Checks:** `npm run build`, `npm run lint`, `git diff --check` pass. Viewed in Chrome (dev server 5174): story and
  classic in light and dark, the switch, reload behaviour, timeline/Now stop, handbook links; 390px checked for the
  switch and story (no horizontal overflow). Classic header's handbook link not visually confirmed.
- **Release authorized:** Anthony said in this session "ok lets make sure it live in production now" — authorizes
  committing, fast-forwarding `main`, pushing, and verifying on anthonynarine.com.
- **Records vs machine:** `AGENTS.md` tool paths are Mac-only; this session ran on Windows (`D:\react-django\...`).
- **Next:** delete `stash@{0}` once production is confirmed; update `.foundry/project/architecture.md` for the new
  home page structure; open decisions below still stand.

## Previous session — Foundry website link (2026-10-10)

- Anthony supplied Foundry's new public website: https://foundry-control-plane.netlify.app/.
- Added it to the Foundry card using the existing “Visit Site” button in `src/data/projects.ts`.
- Fetched origin; `main` and `origin/main` still match. Destination responds HTTP 200.
- `npm run build`, `npm run lint`, and `git diff --check` pass. Reviewed the running Foundry card in light/dark at 1100px; button points to the supplied URL and neither theme has horizontal overflow. Browser automation initially appeared stalled but completed successfully.
- Change committed locally on `agent/frontend/resume-foundry`; no merge, push, or deployment authorized in this session. Next: request release authorization.
- This supersedes next-action item 5 below: the website link has now been added locally.

- **Updated:** 2026-10-10 after release by Moonlight · Portfolio Demo Hub
- **Checked out:** `agent/frontend/resume-foundry`, release `fb979bf` plus this local deployment checkpoint.
- **Live:** anthonynarine.com = `main` / `origin/main` `fb979bf`; Gait card, Foundry résumé entry, and both résumé PDFs deployed and verified.
- **Unpushed:** only this deployment checkpoint on the work branch. Local `main` and `origin/main` match. Working tree clean after checkpoint commit.

## Résumé update (2026-10-10)

- Anthony authorized adding Foundry, emphasizing that it enables him to build independently of language or framework. Added Foundry after EstateIQ, with agent orchestration, evidence gates, and durable Git records; updated summary and skills.
- Aligned résumé Gait wording with its internal-security role and corrected the ATS template’s old Gait URL. Regenerated both public PDFs. Added Mac/Linux Chrome candidates to the generators.
- Verified: `npm run build`, `npm run lint`, `git diff --check`; viewed the running résumé in light and dark themes, with no horizontal overflow at 1100px.
- Release authorized on 2026-10-10; included in the combined portfolio release.
- Installed `chrome-remote-interface` temporarily with `--no-save --package-lock=false`; no dependency manifest or lockfile changes.

## Release authorized (2026-10-10)

- Anthony instructed in this session: “lets release them and update the site”. This authorizes integrating and pushing the combined Gait card and résumé update.
- Release checks: build + lint pass; résumé viewed in light/dark at 1100px; Gait card viewed in light/dark at 390px with no horizontal overflow. Both PDFs regenerated.
- GAIT-13 completion remains unverified; proceeding with the portfolio release under the latest instruction. No changes to Gait/AuthFlow repositories.

## Previous release dependency (superseded for this portfolio release)

1. **GAIT-13** (Gait's Orchestrator, session `django-auth-53`): AuthFlow repositioned from "product for companies"
   to "my internal security system", words only, two passes (public surface, then docs). It needs the human's OK
   typed **in that session** (a relayed OK does not count) and the human's answer on EarlyAccessPage (Moonlight
   suggested removing it). It starts after GAIT-8 merges.
2. **Then ship the Gait card together with GAIT-13:** fetch, integrate the latest `agent/frontend/resume-foundry` branch into `main` with the human’s OK, build +
   lint, push with the human's OK, confirm on anthonynarine.com. The two AuthFlow docs pages the card links to keep
   their titles and addresses (confirmed by Gait's Orchestrator).

## Previous session (2026-10-08/09)

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

1. Foundry card phone review remains optional; Gait card checked at 390px in light/dark during release, with no horizontal overflow.
2. Cleanup: remove unused `src/assets/react.svg` / `public/vite.svg`; untrack `tsconfig.tsbuildinfo`.
3. Delete merged local branches: `feature/foundry-currently-building`, `feature/estateiq-featured-project-and-color-accents`
   (merged as PR #1; also on GitHub — deleting that one needs the human's OK), and `backup/foundry-on-stale-base`.
4. Refresh `foundry-today.svg` (numbers, statuses, "Nine days old") whenever the site is updated.
5. When Foundry's frontend exists, add its link to the card.

## Release verification / next Moonrise

- Release `fb979bf` pushed with Anthony’s explicit instruction in this session. Netlify deployed successfully.
- Confirmed the deployed JavaScript includes the new internal-security Gait copy and Foundry’s language-agnostic résumé wording. Both public PDF downloads match local SHA-256 hashes exactly.
- Local preview server on 5174 stopped; no worker agents launched.
- Next Moonrise: fetch first and verify state. The combined portfolio release is complete; GAIT-13 remains owned by Gait’s session and was not verified here. Remaining optional cleanup and open decisions are above.

## Notes

- Lumen's UI dev server holds port 5173 on this Mac; this site runs on 5174 (`npm run dev -- --port 5174`).
- Foundry is not on PATH: `~/Library/Python/3.11/bin/uv run --project ~/Desktop/django-react/foundry foundry <cmd>`.
- Other sessions: Moonlight · Foundry `foundry-b5`; Gait's Orchestrator `django-auth-53`; Lumen `lumen-reports-14`.
