// # Filename: src/App.tsx

import { useLayoutEffect } from "react";
import { ClassicHeader, ClassicSections } from "./components/ClassicHome";
import { Footer } from "./components/Footer";
import { useHomeLayout } from "./hooks/useHomeLayout";
import { SiteNav } from "./components/SiteNav";
import { StoryScroller } from "./components/story/StoryScroller";
import { WorksSection } from "./components/works/WorksSection";
import { Reveal } from "./components/Reveal";
import { EmailCopy } from "./components/EmailCopy";
import { ArrowUpRight, Mail } from "lucide-react";
import { profileLinks, projects } from "./data/projects";

// # Step 0: a manual reload starts at the top so the opening scribble draws again.
// Only reloads: back/forward still return to where the visitor was.
const isReload =
  (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type === "reload";
if (isReload) history.scrollRestoration = "manual";

export default function App() {
  const layout = useHomeLayout();

  useLayoutEffect(() => {
    if (isReload) window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-neutral-950 cloudy:bg-[#D7DDE1] dark:bg-neutral-950 rainy:bg-[#0F1113] thunderstorm:bg-[#2D333B] dark:text-neutral-50">
      <div
        aria-hidden="true"
        className="bg-grain pointer-events-none fixed inset-0 z-30 opacity-[0.035] mix-blend-multiply cloudy:opacity-[0.06] dark:mix-blend-screen"
      />
      <div
        aria-hidden="true"
        className="rain-layer pointer-events-none fixed inset-0 z-30"
      />
      <div
        aria-hidden="true"
        className="lightning-layer pointer-events-none fixed inset-0 z-30"
      />
      {layout === "classic" ? <ClassicHeader /> : <SiteNav />}

      <main>
        {/* # Step 1: the two layouts differ only up to the projects; everything below is shared */}
        {layout === "classic" ? (
          <ClassicSections projects={projects} />
        ) : (
          <>
            <StoryScroller />
            <WorksSection projects={projects} />
          </>
        )}

        <section className="border-y border-neutral-200 bg-[#F3F1EC] cloudy:border-neutral-300 cloudy:bg-[#C9D2D8] dark:border-neutral-800 dark:bg-neutral-900 rainy:bg-[#181B1F] thunderstorm:bg-[#3A424B]">
          <Reveal className="mx-auto grid max-w-3xl gap-10 px-5 py-16 sm:px-8 lg:max-w-3xl lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                Writing
              </p>
              <h2 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
                HIPAA for Medical Application Developers
              </h2>
            </div>

            <div className="space-y-5 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
              <p>
                A 52-page engineering handbook and workbook on building regulated medical software —
                trust boundaries, minimum-necessary APIs, audit controls, HL7 and DICOM interfaces,
                and the evidence that proves a control actually works. Lumen is the running case
                study.
              </p>
              <p className="text-sm">
                Free, no sign-up. Written while building the system it uses as an example.
              </p>
              <a
                href={profileLinks.handbook}
                className="inline-flex items-center gap-2 border-b border-neutral-400 pb-0.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 dark:border-neutral-600 dark:text-neutral-100 dark:hover:border-neutral-50"
              >
                Read the contents and download
                <ArrowUpRight size={15} />
              </a>
            </div>
          </Reveal>

          <Reveal className="mx-auto grid max-w-3xl gap-10 border-t border-neutral-300 px-5 py-16 cloudy:border-neutral-400 sm:px-8 lg:max-w-3xl lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:py-20 dark:border-neutral-800">
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
              Engineering Handbook
            </h2>

            <div className="space-y-5 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
              <p>
                My working reference for building production Django and React systems: layered
                architecture, authentication, tenant isolation, deployment, operations, and how I
                build with Foundry. Each of my projects has its own design chapters.
              </p>
              <a
                href={profileLinks.engineeringHandbook}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border-b border-neutral-400 pb-0.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 dark:border-neutral-600 dark:text-neutral-100 dark:hover:border-neutral-50"
              >
                Read my engineering handbook
                <ArrowUpRight size={15} />
              </a>
            </div>
          </Reveal>
        </section>

        <section className="bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950">
          <Reveal className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-20 sm:px-8 sm:py-24 md:flex-row md:items-end md:justify-between lg:px-10 lg:py-28">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-600">
                Build With Me
              </p>
              <h2 className="font-display mt-4 max-w-xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                Need a product built from unclear idea to working system?
              </h2>
            </div>
            <div className="flex shrink-0 flex-col gap-4">
              <a
                href={`mailto:${profileLinks.email}`}
                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800"
              >
                <Mail size={16} />
                Start a conversation
              </a>
              <EmailCopy tone="onInverted" className="justify-center" />
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
