// # Filename: src/components/ProjectCard.tsx

import type { Project } from "../types/project";
import { ExternalLink, Github, Link as LinkIcon, Play, Video } from "lucide-react";
import { Reveal } from "./Reveal";

type ProjectCardProps = {
  project: Project;
  index: number;
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function toRoman(index: number) {
  return ROMAN_NUMERALS[index] ?? String(index + 1);
}

function PrimaryLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
    >
      {icon}
      {label}
    </a>
  );
}

function SecondaryLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 border-b border-neutral-300 pb-0.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950"
    >
      <span className="text-neutral-950">{icon}</span>
      {label}
      <ExternalLink size={12} className="opacity-60" />
    </a>
  );
}

function ScreenshotPreview({
  screenshot,
}: {
  screenshot: NonNullable<Project["screenshot"]>;
}) {
  return (
    <figure>
      <div className="overflow-hidden bg-neutral-950 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]">
        {screenshot.clip ? (
          <video
            className="aspect-[16/10] w-full object-cover object-top"
            src={screenshot.clip}
            poster={screenshot.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={screenshot.alt}
          />
        ) : (
          <img
            src={screenshot.src}
            alt={screenshot.alt}
            className="aspect-[16/10] w-full object-cover object-top"
            loading="lazy"
          />
        )}
      </div>
      {screenshot.caption ? (
        <figcaption className="mt-3 text-xs italic leading-relaxed text-neutral-500">
          {screenshot.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ArchitectureNote({ architecture }: { architecture: NonNullable<Project["architecture"]> }) {
  return (
    <div className="mt-5 border-l-2 border-neutral-300 pl-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Architecture
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700">{architecture.architecture}</p>
    </div>
  );
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const { title, description, highlights, tryThis, links, badges, featured, screenshot, architecture } = project;
  const numeral = toRoman(index);

  if (featured) {
    return (
      <Reveal>
        <article
          className={`grid gap-8 lg:grid-cols-[3rem_0.95fr_1.05fr] ${
            index === 0 ? "border-t-0 pt-0" : "border-t border-neutral-200 pt-8"
          }`}
        >
          <div className="hidden lg:block" aria-hidden="true">
            <span className="font-display text-2xl text-neutral-300">{numeral}</span>
          </div>

          <div>
            <h3 className="font-display text-3xl font-medium tracking-tight text-neutral-950">
              <span className="mr-2 text-neutral-300 lg:hidden">{numeral}</span>
              {title}
            </h3>

            {badges?.length ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                {badges.join(" · ")}
              </p>
            ) : null}

            <p className="mt-5 text-base leading-relaxed text-neutral-600">{description}</p>

            <ul className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200">
              {highlights.slice(0, 4).map((highlight) => (
                <li key={highlight} className="py-3 text-sm leading-relaxed text-neutral-700">
                  {highlight}
                </li>
              ))}
            </ul>

            {architecture ? <ArchitectureNote architecture={architecture} /> : null}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {links.liveDemo ? (
                <PrimaryLink href={links.liveDemo} label="Live Demo" icon={<Play size={15} />} />
              ) : null}
              {links.repo ? (
                <SecondaryLink href={links.repo} label="Repo" icon={<Github size={14} />} />
              ) : null}
            </div>
          </div>

          <div>
            {screenshot ? <ScreenshotPreview screenshot={screenshot} /> : null}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Evaluate this
              </p>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-700">
                {tryThis.slice(0, 2).map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 font-display text-neutral-400">
                      {index + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <article className="flex flex-col border-t border-neutral-200 pt-7">
        {screenshot ? (
          <div className="mb-5">
            <ScreenshotPreview screenshot={screenshot} />
          </div>
        ) : null}

        <h3 className="font-display text-xl font-medium tracking-tight text-neutral-950">
          <span className="mr-2 text-neutral-300">{numeral}</span>
          {title}
        </h3>

        {badges?.length ? (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {badges.join(" · ")}
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-relaxed text-neutral-600">{description}</p>

        <ul className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200">
          {highlights.slice(0, 4).map((highlight) => (
            <li key={highlight} className="py-2.5 text-sm leading-relaxed text-neutral-700">
              {highlight}
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Evaluate this
          </p>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
            {tryThis.slice(0, 2).map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="shrink-0 font-display text-neutral-400">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {links.liveDemo ? (
            <PrimaryLink href={links.liveDemo} label="Live Demo" icon={<Play size={15} />} />
          ) : null}
          {links.repo ? <SecondaryLink href={links.repo} label="Repo" icon={<Github size={14} />} /> : null}
          {links.video ? <SecondaryLink href={links.video} label="Video" icon={<Video size={14} />} /> : null}
        </div>

        {links.related?.length ? (
          <div className="mt-5 border-t border-neutral-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Related
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {links.related.map((related) => (
                <a
                  key={related.href}
                  href={related.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950"
                >
                  <LinkIcon size={12} />
                  {related.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </Reveal>
  );
}
