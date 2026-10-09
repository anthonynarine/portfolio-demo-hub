# portfolio-demo-hub — architecture

Mapped by Moonlight · Portfolio Demo Hub (ORC) on 2026-10-08 at commit `d90a827`. Every file tracked in Git
(31, excluding `.foundry/`) was listed and the source was read. Components are in `components.yaml`.

## What it is

A static, single-page portfolio for Anthony Narine. It presents shipped projects (EstateIQ, OneVOne tic-tac-toe,
Gait authentication, Lumen, shared infrastructure packages) with links to live demos, repos and a résumé.
There is no backend, no API calls, no authentication, no environment variables and no secrets.

## Stack and commands

| Concern | Technology | Command |
|---|---|---|
| UI | React 19 + TypeScript 5.9, lucide-react icons | — |
| Build | Vite 7 (`@vitejs/plugin-react`, `@tailwindcss/vite`) | `npm run build` (runs `tsc -b`, then `vite build` → `dist/`) |
| Styling | Tailwind CSS 4 (`@import "tailwindcss"` in `src/index.css`) | — |
| Lint | ESLint 9 + typescript-eslint + react-hooks | `npm run lint` |
| Dev server | Vite, port 5173 (`.claude/launch.json`) | `npm run dev` |
| Hosting | Netlify (`netlify.toml`: build `npm run build`, publish `dist`, Node 22) | deploys outside this repo |
| Tests | none | — |

Verified at `d90a827`: `npm run build` and `npm run lint` both exit 0.

## Structure

```text
index.html                 shell; <html class="dark">, mounts /src/main.tsx
src/main.tsx               adds the "dark" class, renders <App/> in StrictMode
src/App.tsx                page layout: Header, About, focus areas, #projects, contact band, Footer
src/components/
  Header.tsx               hero, profile action links, skill tiles, work preview
  ProjectsGrid.tsx         featured projects full-width, the rest in a 2-column grid
  ProjectCard.tsx          one project: per-id icon and accent theme, badges, screenshot, architecture note, links
  Footer.tsx               profile links
  ThemeToggle.tsx          light/dark toggle (unused: see Findings)
src/data/projects.ts       content: profileLinks, LINKS, projects[] (the single source of page content)
src/types/project.ts       Project, ProjectLinks, ProjectRelatedLink types
public/                    résumé (HTML), favicon, project screenshots
```

## Data flow

`src/data/projects.ts` → `App` → `ProjectsGrid` (splits on `featured`) → `ProjectCard`. Header and Footer read
`profileLinks` from the same module. Everything is static and bundled at build time.

**Contract:** a project's `id` in `projects.ts` must match a `case` in `ProjectCard.tsx`'s `getIcon` (and its accent
theme); an unknown id falls back to a generic link icon. Current ids: `estateiq`, `tictactoe-ws`, `gait-auth`,
`lumen`, `infra-packages`.

## Findings (leads, not changes)

- `src/components/ThemeToggle.tsx` is not imported anywhere; dark mode is forced in `main.tsx` and `index.html`.
- `src/assets/react.svg` and `public/vite.svg` are Vite starter assets with no references.
- `src/index.css` sets `color-scheme: light` under a comment that says "force dark UI controls".
- `tsconfig.tsbuildinfo` is tracked in Git; it is a build artifact.
- No test suite, so `tests` evidence for this project can only be build + lint until one exists.
