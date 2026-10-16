// # Filename: src/components/works/WorksSection.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Github, Play, Plus } from "lucide-react";
import type { Project } from "../../types/project";
import { Appear } from "../Appear";
import { ScreenshotPreview } from "../ProjectCard";

/*
 * Always-dark band. Text colours stay at neutral-300/400 and borders at
 * neutral-700/800 on purpose: index.css remaps the lighter-mode greys
 * (neutral-200/500/600) for the cloudy theme, which would muddy them here.
 */

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const WORD = ["W", "O", "R", "K"];

function WordTiles() {
  const ref = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFlipped(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto mt-14 grid max-w-3xl grid-cols-4 gap-2 sm:gap-3" aria-label="Work">
      {WORD.map((letter, i) => (
        <div
          key={letter}
          aria-hidden="true"
          className={`tile aspect-square ${flipped ? "is-flipped" : ""}`}
          style={{ transitionDelay: `${i * 220}ms` }}
        >
          <span className="tile-face tile-front">{letter}</span>
          <span className="tile-face tile-back">{letter}</span>
        </div>
      ))}
    </div>
  );
}

function WorkEntry({ project, index }: { project: Project; index: number }) {
  const { title, description, highlights, tryThis, links, badges, screenshot, architecture } = project;

  return (
    <Appear>
      <article id={`project-${project.id}`} className="scroll-mt-24 border-t border-neutral-800 pt-6">
        {screenshot ? (
          <div className="[&_button]:!border-neutral-800 [&_figcaption]:!text-neutral-400">
            <ScreenshotPreview screenshot={screenshot} />
          </div>
        ) : null}

        <div className="mt-6 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-3xl font-medium tracking-tight text-white">
            <span className="mr-3 text-neutral-400">{ROMAN_NUMERALS[index] ?? index + 1}</span>
            {title}
          </h3>
        </div>

        {badges?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="border border-neutral-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-300"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300">{description}</p>

        <details className="group mt-5 max-w-2xl">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-neutral-300 transition hover:text-white [&::-webkit-details-marker]:hidden">
            <Plus size={14} className="transition group-open:rotate-45" />
            How it's built and what to try
          </summary>
          <ul className="mt-4 divide-y divide-neutral-800 border-t border-neutral-800">
            {highlights.slice(0, 4).map((highlight) => (
              <li key={highlight} className="py-3 text-sm leading-relaxed text-neutral-300">
                {highlight}
              </li>
            ))}
          </ul>
          {architecture ? (
            <p className="mt-4 border-l-2 border-neutral-700 pl-4 text-sm leading-relaxed text-neutral-300">
              {architecture.architecture}
            </p>
          ) : null}
          <ol className="mt-5 space-y-2 text-sm leading-relaxed text-neutral-300">
            {tryThis.slice(0, 2).map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-display shrink-0 text-neutral-400">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </details>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {links.liveDemo ? (
            <a
              href={links.liveDemo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-300"
            >
              <Play size={15} />
              Visit site
            </a>
          ) : null}
          {links.repo ? (
            <a
              href={links.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border-b border-neutral-700 pb-0.5 text-sm font-medium text-neutral-300 transition hover:border-white hover:text-white"
            >
              <Github size={14} />
              Repo
              <ExternalLink size={12} className="opacity-60" />
            </a>
          ) : null}
          {links.related?.map((related) => (
            <a
              key={related.href}
              href={related.href}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition hover:text-white"
            >
              {related.label}
            </a>
          ))}
        </div>
      </article>
    </Appear>
  );
}

export function WorksSection({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<string | null>(null);

  const kinds = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.kinds ?? []))),
    [projects]
  );
  const visible = filter ? projects.filter((project) => project.kinds?.includes(filter)) : projects;

  return (
    <section id="work" className="bg-[#141414] text-white dark:bg-neutral-900">
      <div className="px-5 pb-20 pt-28 text-center sm:px-8 lg:pb-28 lg:pt-36">
        <Appear>
          <p className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            you must be waiting for this
            <br />
            part already.
          </p>
        </Appear>
        <WordTiles />
      </div>

      <div className="border-t border-neutral-800">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16 lg:px-10 lg:py-24">
          <aside className="h-fit lg:sticky lg:top-24">
            <h2 className="font-display text-4xl font-medium leading-tight tracking-tight">
              Proof through shipped systems.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
              Each project is positioned around what it demonstrates: architecture, product thinking,
              workflow design, and production readiness.
            </p>

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
              Want a specific kind of work?
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[null, ...kinds].map((kind) => {
                const active = filter === kind;
                return (
                  <button
                    key={kind ?? "all"}
                    type="button"
                    onClick={() => setFilter(kind)}
                    aria-pressed={active}
                    className={`border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-white bg-white text-neutral-950"
                        : "border-neutral-700 text-neutral-300 hover:border-white hover:text-white"
                    }`}
                  >
                    {kind ?? "All work"}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-neutral-400">
              Showing {visible.length} of {projects.length}
            </p>
          </aside>

          <div className="grid gap-16">
            {visible.map((project) => (
              <WorkEntry key={project.id} project={project} index={projects.indexOf(project)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
