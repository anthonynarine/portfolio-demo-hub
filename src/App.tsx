// # Filename: src/App.tsx

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProjectsGrid } from "./components/ProjectsGrid";
import { Reveal } from "./components/Reveal";
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
    <div className="min-h-screen bg-[#FAFAF8] text-neutral-950">
      <Header
        name="Anthony Narine"
        headline="Full-stack software engineer"
        subhead="I don't have a traditional engineering background. After 17 years in healthcare, I moved into software by building the systems I wanted to understand, then taking them from planning and design to production."
      />

      <main>
        <section className="border-t border-neutral-200">
          <Reveal className="mx-auto grid max-w-3xl gap-10 px-5 py-16 sm:px-8 lg:max-w-5xl lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
                About
              </p>
              <h2 className="font-display mt-4 max-w-3xl text-4xl font-medium leading-tight tracking-tight text-neutral-950 sm:text-5xl">
                I build the kind of systems I wish I could have studied when I was learning.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-relaxed text-neutral-600">
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
          </Reveal>
        </section>

        <section className="border-y border-neutral-200 bg-[#F3F1EC]">
          <Reveal className="mx-auto grid max-w-3xl gap-10 px-5 py-16 sm:px-8 lg:max-w-5xl lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
                What I can help with
              </p>
              <h2 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight text-neutral-950 sm:text-4xl">
                I am strongest where product UX and backend rules meet.
              </h2>
            </div>

            <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
              {focusAreas.map((area) => (
                <li key={area} className="py-4 text-base font-medium text-neutral-800">
                  {area}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section id="projects" className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <Reveal className="flex flex-col gap-3 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
                Selected projects
              </p>
              <h2 className="font-display mt-3 text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
                Proof through shipped systems.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600">
              Each project is positioned around what it demonstrates: architecture, product thinking,
              workflow design, and production readiness.
            </p>
          </Reveal>

          <ProjectsGrid projects={projects} />
        </section>

        <section className="bg-neutral-950 text-white">
          <Reveal className="mx-auto flex max-w-5xl flex-col gap-5 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Build With Me
              </p>
              <h2 className="font-display mt-3 text-3xl font-medium tracking-tight">
                Need a product built from unclear idea to working system?
              </h2>
            </div>
            <a
              href={`mailto:${profileLinks.email}`}
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              <Mail size={16} />
              Start a conversation
            </a>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
