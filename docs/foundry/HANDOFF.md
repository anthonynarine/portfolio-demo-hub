# Portfolio Demo Hub — checkpoint

Read this first after Moonrise. Moonset rewrites it.

- **Updated:** 2026-10-08 by Moonlight · Portfolio Demo Hub
- **Branch:** `feature/estateiq-featured-project-and-color-accents` (not merged to `main`, not pushed)

## Status

Foundry adopted today: `foundry init` (`d90a827`), owner `human:anthony` with policy seq 1 (`53fdfaa`, state branch
`cb8048e`), project map (`4bf2772`), then `AGENTS.md`, `CLAUDE.md` and this file. `foundry validate`: 0 errors.

## In flight

- The branch's own work: EstateIQ as the featured project and per-project color accents (commits up to `bda37b7`).

## Open decisions (human)

- Merge this branch into `main` (which deploys to Netlify), and push it.
- Clean up the map's findings? Unused `ThemeToggle.tsx`, unused `react.svg` / `vite.svg`, `color-scheme: light`
  in `index.css`, tracked `tsconfig.tsbuildinfo`.

## Next actions

1. Finish and review the EstateIQ / color-accent work; check build, lint and the running site.
2. Tell Moonlight · Foundry about the ORC-019 recurrence (`foundry init` took the feature branch as `main_branch`)
   and the unquoted `verified.at` date in the FND-2 §3.1 example, which `foundry validate` rejects.
