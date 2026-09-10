// # Filename: src/components/ProjectCard.tsx

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../types/project";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Link as LinkIcon,
  Maximize2,
  Play,
  Video,
  X,
} from "lucide-react";
import { Reveal } from "./Reveal";

type Slide = { src: string; alt: string; caption: string };

/** Cycles 0..length-1 on an interval; pass `paused` to hold (e.g. on hover). */
function useSlideshowIndex(length: number, { intervalMs = 4000, paused = false } = {}) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (paused || length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [length, intervalMs, paused]);
  return [index, setIndex] as const;
}

function CardSlides({ slides, index }: { slides: Slide[]; index: number }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
      {slides.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full rounded-xl object-cover object-top transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, i) => (
          <span
            key={slide.src}
            className={`h-1.5 w-1.5 rounded-full transition ${i === index ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </span>
    </div>
  );
}

function LightboxSlides({ slides, initialIndex }: { slides: Slide[]; initialIndex: number }) {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % slides.length);
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + slides.length) % slides.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden rounded-t-xl">
        <img src={slide.src} alt={slide.alt} className="aspect-[16/10] w-full object-contain" />
        <button
          type="button"
          onClick={() => setIndex((current) => (current - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-neutral-950/60 p-1.5 text-white/80 transition hover:bg-neutral-950/80 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => setIndex((current) => (current + 1) % slides.length)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-neutral-950/60 p-1.5 text-white/80 transition hover:bg-neutral-950/80 hover:text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-neutral-800 px-5 py-4">
        <p className="text-sm italic leading-relaxed text-neutral-300">{slide.caption}</p>
        <div className="flex shrink-0 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 w-5 rounded-full transition ${
                i === index ? "bg-white" : "bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

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
      className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
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
      className="inline-flex items-center gap-1.5 border-b border-neutral-300 pb-0.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-50 dark:hover:text-neutral-50"
    >
      <span className="text-neutral-950 dark:text-neutral-50">{icon}</span>
      {label}
      <ExternalLink size={12} className="opacity-60" />
    </a>
  );
}

function Lightbox({
  screenshot,
  initialIndex = 0,
  onClose,
}: {
  screenshot: NonNullable<Project["screenshot"]>;
  initialIndex?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-5 top-5 text-white/70 transition hover:text-white"
      >
        <X size={26} />
      </button>
      <div
        className="w-full max-w-5xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
        onClick={(event) => event.stopPropagation()}
      >
        {screenshot.slides ? (
          <LightboxSlides slides={screenshot.slides} initialIndex={initialIndex} />
        ) : screenshot.clip ? (
          <video
            className="aspect-[16/10] w-full object-contain"
            src={screenshot.clip}
            poster={screenshot.src}
            autoPlay
            muted
            loop
            playsInline
            aria-label={screenshot.alt}
          />
        ) : (
          <img
            src={screenshot.src}
            alt={screenshot.alt}
            className="aspect-[16/10] w-full object-contain"
          />
        )}
      </div>
    </div>,
    document.body
  );
}

function ScreenshotPreview({
  screenshot,
}: {
  screenshot: NonNullable<Project["screenshot"]>;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const slides = screenshot.slides;
  const [slideIndex] = useSlideshowIndex(slides?.length ?? 0, { paused: hovered || !slides });
  const activeCaption = slides ? slides[slideIndex]?.caption : screenshot.caption;

  return (
    <figure>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`View a larger preview of ${screenshot.alt}`}
        className="group relative block w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 dark:border-neutral-800"
      >
        {slides ? (
          <CardSlides slides={slides} index={slideIndex} />
        ) : screenshot.clip ? (
          <video
            className="aspect-[16/10] w-full object-cover object-top"
            src={screenshot.clip}
            poster={screenshot.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        ) : (
          <img
            src={screenshot.src}
            alt={screenshot.alt}
            className="aspect-[16/10] w-full object-cover object-top"
            loading="lazy"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/0 opacity-0 transition group-hover:bg-neutral-950/40 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-950">
            <Maximize2 size={13} />
            View larger
          </span>
        </span>
      </button>
      {activeCaption ? (
        <figcaption className="mt-3 text-xs italic leading-relaxed text-neutral-500 dark:text-neutral-400">
          {activeCaption}
        </figcaption>
      ) : null}
      {open ? (
        <Lightbox screenshot={screenshot} initialIndex={slideIndex} onClose={() => setOpen(false)} />
      ) : null}
    </figure>
  );
}

function BadgeList({ badges }: { badges: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-950 dark:bg-neutral-800 dark:text-neutral-100"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

function ArchitectureNote({ architecture }: { architecture: NonNullable<Project["architecture"]> }) {
  return (
    <div className="mt-5 border-l-2 border-neutral-300 pl-4 dark:border-neutral-700">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
        Architecture
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{architecture.architecture}</p>
    </div>
  );
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const { title, description, highlights, tryThis, links, badges, featured, screenshot, architecture } = project;
  const numeral = toRoman(index);

  if (featured) {
    const isReversed = index % 2 === 1;

    return (
      <Reveal>
        <article
          className={`grid gap-y-8 gap-x-8 lg:grid-cols-[3rem_1fr_1fr] lg:gap-x-10 xl:gap-x-16 ${
            index === 0 ? "border-t-0 pt-0" : "border-t border-neutral-200 pt-8 dark:border-neutral-800"
          }`}
        >
          <div className="hidden lg:block" aria-hidden="true">
            <span className="font-display text-2xl text-neutral-300 dark:text-neutral-700">{numeral}</span>
          </div>

          <div className={isReversed ? "lg:order-2" : "lg:order-1"}>
            <h3 className="font-display text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
              <span className="mr-2 text-neutral-300 dark:text-neutral-700 lg:hidden">{numeral}</span>
              {title}
            </h3>

            {badges?.length ? <BadgeList badges={badges} /> : null}

            <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>

            <ul className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {highlights.slice(0, 4).map((highlight) => (
                <li key={highlight} className="py-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {highlight}
                </li>
              ))}
            </ul>

            {architecture ? <ArchitectureNote architecture={architecture} /> : null}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {links.liveDemo ? (
                <PrimaryLink href={links.liveDemo} label="Visit Site" icon={<Play size={15} />} />
              ) : null}
              {links.repo ? (
                <SecondaryLink href={links.repo} label="Repo" icon={<Github size={14} />} />
              ) : null}
            </div>
          </div>

          <div className={isReversed ? "lg:order-1" : "lg:order-2"}>
            {screenshot ? (
              <div className={isReversed ? "xl:-ml-12 2xl:-ml-20" : "xl:-mr-12 2xl:-mr-20"}>
                <ScreenshotPreview screenshot={screenshot} />
              </div>
            ) : null}
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                Evaluate this
              </p>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {tryThis.slice(0, 2).map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 font-display text-neutral-400 dark:text-neutral-500">
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
      <article className="flex flex-col border-t border-neutral-200 pt-7 dark:border-neutral-800">
        {screenshot ? (
          <div className="mb-5">
            <ScreenshotPreview screenshot={screenshot} />
          </div>
        ) : null}

        <h3 className="font-display text-xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
          <span className="mr-2 text-neutral-300 dark:text-neutral-700">{numeral}</span>
          {title}
        </h3>

        {badges?.length ? <BadgeList badges={badges} /> : null}

        <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{description}</p>

        <ul className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {highlights.slice(0, 4).map((highlight) => (
            <li key={highlight} className="py-2.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {highlight}
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            Evaluate this
          </p>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {tryThis.slice(0, 2).map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="shrink-0 font-display text-neutral-400 dark:text-neutral-500">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {links.liveDemo ? (
            <PrimaryLink href={links.liveDemo} label="Visit Site" icon={<Play size={15} />} />
          ) : null}
          {links.repo ? <SecondaryLink href={links.repo} label="Repo" icon={<Github size={14} />} /> : null}
          {links.video ? <SecondaryLink href={links.video} label="Video" icon={<Video size={14} />} /> : null}
        </div>

        {links.related?.length ? (
          <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Related
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {links.related.map((related) => (
                <a
                  key={related.href}
                  href={related.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 dark:text-neutral-400 dark:decoration-neutral-700 dark:hover:text-neutral-50"
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
