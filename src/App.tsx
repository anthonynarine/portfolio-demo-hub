// ✅ New Code
// # Filename: src/App.tsx

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProjectsGrid } from "./components/ProjectsGrid";
import { projects } from "./data/projects";

export default function App() {
  return (
    <div className="bg-noise min-h-screen w-full bg-slate-950 text-slate-50">
      {/* Glow */}
      <div
        className="pointer-events-none fixed inset-0
        bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,0.12),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.10),transparent_45%)]
      "
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Header
          name="Anthony Narine"
          headline="Full-Stack Engineer • React + TypeScript • Django/FastAPI"
          subhead="Live demos, repos, and a short Lumen walkthrough. Each project includes two quick steps to show what it does."
        />

        {/* About (employers + clients) */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-slate-950/45 p-6 shadow-sm backdrop-blur sm:p-7">
          <h2 className="text-base font-semibold">About</h2>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200/90">
            I build full-stack systems that are secure, maintainable, and designed to handle real-world
            complexity — from APIs and data models to polished user interfaces. Lately, I’ve been
            exploring in-app documentation assistants powered by RAG agents, so teams can self-serve
            answers instead of hunting through scattered docs.
          </p>

          {/* Capability chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/30 px-3 py-1 text-[11px] font-medium text-slate-200/90 transition hover:bg-slate-900/45">
              Security: JWT + RBAC
            </span>

            <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/30 px-3 py-1 text-[11px] font-medium text-slate-200/90 transition hover:bg-slate-900/45">
              Real-time: WebSockets + Redis
            </span>

            <span
              title="LangChain + LangGraph"
              className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/30 px-3 py-1 text-[11px] font-medium text-slate-200/90 transition hover:bg-slate-900/45"
            >
              AI Docs: RAG
            </span>

            <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/30 px-3 py-1 text-[11px] font-medium text-slate-200/90 transition hover:bg-slate-900/45">
              Deploy: Heroku + Netlify
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-200/90">
            I spent 17 years working as a vascular technologist before transitioning into software
            engineering. That path began with Harvard’s CS50, continued through a web development
            bootcamp, and evolved into several years of self-directed learning while building and
            shipping real systems.
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200/90">
            The applications I build are systems I wanted a deeper understanding of — authentication,
            real-time coordination, clinical workflows, and developer tooling. AI has significantly
            accelerated how I learn and build, allowing me to move faster while staying intentional
            about architecture, correctness, and long-term maintainability.
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-200/90">
            I’m open to full-stack, backend, or frontend roles (remote-first preferred). I also take on
            selective project work where I can own a feature or system end-to-end, from scoping to
            launch.
          </p>
        </section>

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300/80">
            Shipped projects
          </h3>

          <ProjectsGrid projects={projects} />
        </div>

        <Footer />
      </div>
    </div>
  );
}
