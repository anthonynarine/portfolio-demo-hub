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

      <section className="mt-6 rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45 sm:p-7">
        <h2 className="text-base font-semibold">About</h2>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
          I build full-stack products that feel smooth end-to-end — from clean APIs and data models to
          polished, responsive UI. My strongest work lives at the intersection of authentication, real-time
          systems, and AI-assisted workflows that make complex apps easier to use and maintain.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
          I spent 17 years as a vascular technologist, then transitioned into software—starting with Python,
          a web dev bootcamp, and three years of continued self-teaching while building and shipping real projects.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
          I’m open to full-stack, backend, or frontend roles, and I prefer remote-first teams.
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
