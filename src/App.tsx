// # Filename: src/App.tsx

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProjectsGrid } from "./components/ProjectsGrid";
import { Mail } from "lucide-react";
import { profileLinks, projects } from "./data/projects";

const focusAreas = [
  "Secure multi-tenant systems",
  "Real-time collaboration and state",
  "Ledger-first financial workflows",
  "Clinical workflow tooling",
  "Reusable backend packages",
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <Header
        name="Anthony Narine"
        headline="Full-stack software engineer"
        subhead="I don't have a traditional engineering background. After 17 years in healthcare, I moved into software by building the systems I wanted to understand, then taking them from planning and design to production."
      />

      <main>
        <section className="border-t border-white/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
                About
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                I build the kind of systems I wish I could have studied when I was learning.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-relaxed text-slate-300">
              <p>
                I spent 17 years working as a vascular technologist before moving into software
                engineering. That background still shapes how I think: systems and workflows need to
                be clear, state needs to be explicit, and users should not have to guess what the
                system is doing.
              </p>
              <p>
                Most of my projects started with something I wanted to understand deeply:
                authentication, real-time communication, clinical boundaries like HIPAA, financial
                workflows where every transaction has to reconcile, and AI features that answer from
                verified data instead of hallucinating.
              </p>
              <p>
                This portfolio shows how I build systems: the design patterns I use, the architecture
                decisions I make, and the working projects behind them.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.03] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
                What I can help with
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                I am strongest where product UX and backend rules meet.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {focusAreas.map((area) => (
                <div key={area} className="border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-slate-100">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-300">
                Selected projects
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Proof through shipped systems.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              Each project is positioned around what it demonstrates: architecture, product thinking,
              workflow design, and production readiness.
            </p>
          </div>

          <ProjectsGrid projects={projects} />
        </section>

        <section className="border-y border-white/10 bg-cyan-300 text-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-700">
                Build With Me
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Need a product built from unclear idea to working system?
              </h2>
            </div>
            <a
              href={`mailto:${profileLinks.email}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Mail size={16} />
              Start a conversation
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
