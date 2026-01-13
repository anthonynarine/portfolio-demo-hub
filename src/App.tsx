// ✅ New Code
// # Filename: src/App.tsx

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProjectsGrid } from "./components/ProjectsGrid";
import { projects } from "./data/projects";

export default function App() {
  return (
    <div className="bg-noise min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Glow */}
      <div
        className="pointer-events-none fixed inset-0
        bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.14),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.10),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.08),transparent_45%)]
        dark:bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.12),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.10),transparent_45%)]
      "
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Header
          name="Anthony Narine"
          headline="Full-Stack Engineer • React + TypeScript • Django/FastAPI"
          subhead="Live demos, repos, and a short Lumen walkthrough. Each project includes two quick steps to show what it does."
        />

        {/* About (employers + clients) */}
        <section className="mt-6 rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 sm:p-7">
          <h2 className="text-base font-semibold">About</h2>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
            I build full-stack systems that are secure, fast to evaluate, and easy to maintain — from
            APIs and data models to polished UI. When it helps, I build in-app documentation assistants
            (RAG) so teams can self-serve answers instead of hunting through scattered docs.
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
            Before software, I spent 17 years as a vascular technologist — which gave me deep exposure
            to real clinical workflows, edge cases, and the cost of slow or confusing tools. That
            perspective directly shaped how I design systems like Lumen.
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
            I’m open to full-stack, backend, or frontend roles (remote-first preferred). I also take on
            selective project work where I can own a feature or system end-to-end — from scoping to
            launch.
          </p>
        </section>

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300/80">
            Shipped projects
          </h3>
          <ProjectsGrid projects={projects} />
        </div>

        <Footer />
      </div>
    </div>
  );
}
