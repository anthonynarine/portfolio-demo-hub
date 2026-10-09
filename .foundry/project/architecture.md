# portfolio-demo-hub — architecture

Mapped by Moonlight · Portfolio Demo Hub (ORC) on 2026-10-09 from `origin/main` `2b8e0d4`, the code the live site
(anthonynarine.com) serves; the production CSS bundle hash matches a local build. Components are in `components.yaml`.

An earlier map (2026-10-08) was made from a local `main` 18 commits behind GitHub and is superseded by this one.
**Always `git fetch` before trusting local `main`:** this repo is also edited from other machines and on GitHub.

## What it is

Anthony Narine's portfolio site: a static React single-page app with three routes. No backend, no API calls, no
authentication, no environment variables, no secrets.

| Route | Page | What it shows |
|---|---|---|
| `/` | `src/App.tsx` | Header, About, focus areas, Selected projects, Writing (HIPAA handbook), Build With Me, Footer |
| `/resume` | `src/pages/ResumePage.tsx` | Résumé built from `src/features/resume/` |
| `/hipaa` | `src/pages/HandbookPage.tsx` | HIPAA handbook contents (`src/data/handbook.ts`) and the PDF download |

Routing is a small pathname lookup in `src/main.tsx` (no router library). `netlify.toml` rewrites every path to
`index.html` so the routes work on reload.

## Stack and commands

| Concern | Technology | Command |
|---|---|---|
| UI | React 19 + TypeScript 5.9, lucide-react icons | — |
| Build | Vite 7 (`@vitejs/plugin-react`, `@tailwindcss/vite`) | `npm run build` (runs `tsc -b`, then `vite build` → `dist/`) |
| Styling | Tailwind CSS 4, CSS-configured in `src/index.css`; display font Fraunces (Google Fonts, `index.html`) | — |
| Lint | ESLint 9 + typescript-eslint + react-hooks | `npm run lint` |
| Dev server | Vite (`npm run dev`); 5173 is often taken by Lumen's UI on this Mac, so use `--port 5174` | `npm run dev -- --port 5174` |
| Résumé PDFs | `scripts/generate-*.mjs` drive headless Chrome; need `chrome-remote-interface` installed ad hoc | see the script headers |
| Hosting | Netlify (`netlify.toml`: build `npm run build`, publish `dist`, Node 22, SPA rewrite) | deploys outside this repo |
| Tests | none | — |

Verified on 2026-10-09: `npm run build` and `npm run lint` exit 0.

## Themes

Five modes: light (default), dark, cloudy, rainy, thunderstorm. `ThemeToggle.tsx` sets a class on `<html>` and saves
the choice in `localStorage` (`theme`). `src/index.css` defines Tailwind custom variants for each; `dark:` also
applies under rainy and thunderstorm. New UI should use the `neutral-*` palette with `dark:` (and `cloudy:` where a
background changes), like the existing sections.

## Structure

```text
src/main.tsx               route lookup → App | ResumePage | HandbookPage
src/App.tsx                home page sections (see Routes)
src/components/
  Header.tsx               hero, profile links, EmailCopy, ThemeToggle
  ProjectsGrid.tsx         featured projects first, then a 2-column grid
  ProjectCard.tsx          roman-numeral cards; slideshow/clip/screenshot, lightbox, badges, architecture note, links
  Reveal.tsx               fade-up on scroll (IntersectionObserver)
  EmailCopy.tsx            copy-email button
  ThemeToggle.tsx          five-mode theme menu
  Footer.tsx
src/data/projects.ts       profileLinks, LINKS, projects[] (home page content)
src/data/handbook.ts       HIPAA handbook contents
src/types/project.ts       Project types (screenshot may carry clip or slides)
src/features/resume/       résumé components + resumeData.ts
src/pages/                 ResumePage, HandbookPage
public/                    résumé PDFs/HTML, HIPAA PDF, screenshots/slides, OneVOne preview video, favicon, QR code
scripts/                   résumé PDF generators (not part of the build)
```

## Data flow

`src/data/projects.ts` → `App` → `ProjectsGrid` (featured first) → `ProjectCard`. A project's position sets its roman
numeral and, for featured cards, which side the media sits on (alternating). Project order today: Gait, EstateIQ,
OneVOne, Lumen (all featured), then Foundry and Backend Building Blocks. Everything is static and bundled at build time.

## Findings (leads, not changes)

- OneVOne's repo link (`github.com/anthonynarine/tic_tac_toe`) returns 404 to the public.
- `src/assets/react.svg` and `public/vite.svg` are Vite starter assets with no references.
- `tsconfig.tsbuildinfo` is tracked in Git; it is a build artifact.
- No test suite, so evidence for this project is build + lint + a look at the running site.
