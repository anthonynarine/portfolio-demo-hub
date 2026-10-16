// # Filename: src/components/story/StoryScroller.tsx

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowDownRight, ArrowRight } from "lucide-react";
import { Appear } from "../Appear";
import { LayoutSwitch } from "../LayoutSwitch";
import { ThemeToggle } from "../ThemeToggle";
import { profileLinks } from "../../data/projects";
import {
  PANEL_COUNT,
  ZIGZAG_SPAN,
  buildCompactTanglePath,
  buildJourneyPath,
  buildTanglePath,
  timelineY,
} from "./journeyPath";
import { EstateIqMark, FoundryMark, GaitMark, LumenMark, OneVOneMark } from "./ProjectMarks";

/*
 * Desktop: the section is tall (5 extra screen-widths of scroll), its inner
 * panel is sticky and full-screen, and vertical scroll progress is turned into
 * a horizontal translate of the track. Normal wheel, trackpad, keyboard and
 * scrollbar input all work because the page itself still scrolls vertically.
 *
 * Phones (< md): the same DOM renders as a plain vertical stack. The md:
 * classes are what switch every panel and label into absolute positions.
 */

/** Panel 3: what I taught myself after the bootcamp, by building it. */
const selfTaught = [
  "Authentication and identity",
  "Real-time systems",
  "HIPAA and clinical workflows",
  "Ledgers that reconcile",
  "Reusable backend packages",
];

/** Panel 3 labels: x across the panel, and whether the label sits above or below the line. */
const focusLayout = [
  { x: 0.12, y: 0.56, side: "below" },
  { x: 0.31, y: 0.34, side: "above" },
  { x: 0.5, y: 0.52, side: "below" },
  { x: 0.68, y: 0.36, side: "above" },
  { x: 0.86, y: 0.72, side: "below" },
] as const;

type TimelineEvent = {
  f: number;
  year: string;
  /** Organisation name; `logo` is an optional image path (e.g. "/logos/liu.svg") shown beside it. */
  org?: { name: string; logo?: string };
  detail?: string;
  /** Project marks beside their names, each linking down to its entry in the work section. */
  projects?: { name: string; id: string; Mark: (props: { className?: string }) => React.ReactElement }[];
};

const timeline: TimelineEvent[] = [
  { f: 0.08, year: "2007", org: { name: "Long Island University" }, detail: "Sonography in vascular technology" },
  { f: 0.22, year: "2008", org: { name: "Navix Diagnostix" }, detail: "Vascular technologist" },
  { f: ZIGZAG_SPAN[0], year: "2013", org: { name: "Mount Sinai Hospital" }, detail: "Vascular technologist" },
  { f: ZIGZAG_SPAN[1], year: "2022", org: { name: "devCodeCamp" }, detail: "Year-long full-stack bootcamp" },
  { f: 0.74, year: "2023", org: { name: "Self-taught" }, detail: "Building to understand" },
  {
    f: 0.9,
    year: "Now",
    detail: "Building with AI",
    projects: [
      { name: "Foundry", id: "foundry", Mark: FoundryMark },
      { name: "Gait", id: "gait-auth", Mark: GaitMark },
      { name: "EstateIQ", id: "estateiq", Mark: EstateIqMark },
      { name: "OneVOne", id: "tictactoe-ws", Mark: OneVOneMark },
      { name: "Lumen", id: "lumen", Mark: LumenMark },
    ],
  },
];

const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400";

function Numeral({ children }: { children: ReactNode }) {
  return <span className="font-display text-2xl text-neutral-300 dark:text-neutral-700">{children}</span>;
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative px-5 py-16 sm:px-8 md:h-screen md:w-screen md:shrink-0 md:p-0 ${className}`}
    >
      {children}
    </div>
  );
}

export function StoryScroller() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstPanelRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);
  const journeyRef = useRef<SVGPathElement>(null);
  const lengthsRef = useRef<{ total: number; samples: [number, number][] }>({ total: 0, samples: [] });
  const [size, setSize] = useState<{ w: number; h: number; start: [number, number] | null }>({
    w: 0,
    h: 0,
    start: null,
  });
  const [drawing, setDrawing] = useState(false);

  // # Step 1: panel size drives the line geometry (pixels, so loops stay round), and the
  // line starts just after "Full-stack software engineer". Offsets, not bounding boxes,
  // so the blur-in's translate doesn't shift the start point.
  useLayoutEffect(() => {
    function lineStart(panel: HTMLElement): [number, number] | null {
      const role = roleRef.current;
      if (!role || !role.offsetWidth) return null;
      let x = role.offsetLeft + role.offsetWidth;
      let y = role.offsetTop + role.offsetHeight / 2;
      let node = role.offsetParent as HTMLElement | null;
      while (node && node !== panel && panel.contains(node)) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return [x + 14, y];
    }
    function measure() {
      const holder = firstPanelRef.current;
      const panel = holder?.firstElementChild as HTMLElement | null;
      if (!holder || !panel) return;
      setSize({ w: holder.offsetWidth, h: window.innerHeight, start: lineStart(panel) });
    }
    measure();
    // Fraunces and the body font change the text width once they arrive.
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const paths = useMemo(() => {
    if (!size.w || !size.h) return null;
    return {
      tangle: buildTanglePath(size.w, size.h, size.start),
      journey: buildJourneyPath(size.w, size.h),
    };
  }, [size]);

  // # Step 1b: start the scribble only once a frame has been painted and the tab is visible
  useEffect(() => {
    if (!paths) return;
    let frame = 0;
    function start() {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", start);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setDrawing(true));
      });
    }
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", start);
    };
  }, [paths]);

  // # Step 2: sample the journey path once so "how far right we are" maps to "how much line to draw"
  useLayoutEffect(() => {
    const path = journeyRef.current;
    if (!path || !paths) return;
    const total = path.getTotalLength();
    const samples: [number, number][] = [];
    for (let i = 0; i <= 240; i++) {
      const length = (i / 240) * total;
      samples.push([path.getPointAtLength(length).x, length]);
    }
    lengthsRef.current = { total, samples };
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total}`;
  }, [paths]);

  // # Step 3: scroll -> eased horizontal translate + line drawing
  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    if (!section || !sticky || !track) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let target = 0;
    let frame = 0;

    function lengthAtX(x: number) {
      const { samples, total } = lengthsRef.current;
      // The path doubles back inside the closing circle, so take the furthest length reached by x.
      let best = 0;
      for (const [sx, length] of samples) if (sx <= x) best = length;
      return Math.min(best, total);
    }

    function apply(x: number) {
      track!.style.transform = `translate3d(${-x}px, 0, 0)`;
      const path = journeyRef.current;
      const { total } = lengthsRef.current;
      if (path && total) {
        const reach = x + sticky!.clientWidth * 0.9;
        const done = x >= track!.scrollWidth - sticky!.clientWidth - 2;
        path.style.strokeDashoffset = `${done ? 0 : total - lengthAtX(reach)}`;
      }
    }

    function tick() {
      const ease = reducedMotion.matches ? 1 : 0.14;
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.4) current = target;
      apply(current);
      frame = current === target ? 0 : requestAnimationFrame(tick);
    }

    function update() {
      if (!desktop.matches) {
        track!.style.transform = "";
        return;
      }
      const travel = section!.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -section!.getBoundingClientRect().top / travel));
      target = progress * (track!.scrollWidth - sticky!.clientWidth);
      // Background tabs don't run animation frames; land on the target so
      // the story isn't left half-eased when the tab comes back.
      if (document.hidden) {
        current = target;
        apply(current);
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    }

    // overflow:hidden still lets the browser scroll this box itself (focusing an
    // off-screen link, scrollIntoView), which would shift the track out from
    // under the transform. Pin it; the transform is the only thing that moves.
    function pinSticky() {
      if (sticky!.scrollLeft || sticky!.scrollTop) {
        sticky!.scrollLeft = 0;
        sticky!.scrollTop = 0;
      }
    }

    update();
    sticky.addEventListener("scroll", pinSticky);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    desktop.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      sticky.removeEventListener("scroll", pinSticky);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      desktop.removeEventListener("change", update);
    };
  }, [paths]);

  return (
    <section
      ref={sectionRef}
      id="story"
      aria-label="About Anthony"
      className="relative md:h-[calc(500vw+100vh)]"
    >
      <div ref={stickyRef} className="md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <div ref={trackRef} className="relative md:flex md:h-screen md:w-max md:will-change-transform">
          {/* The one continuous line (desktop only) */}
          {paths ? (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 hidden text-neutral-900 md:block dark:text-neutral-200"
              width={size.w * PANEL_COUNT}
              height={size.h}
              viewBox={`0 0 ${size.w * PANEL_COUNT} ${size.h}`}
              fill="none"
            >
              <path
                d={paths.tangle}
                pathLength={1}
                className={`draw-in ${drawing ? "is-drawing" : ""}`}
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                ref={journeyRef}
                d={paths.journey}
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}

          {/* ── Opening ─────────────────────────────────────────── */}
          <div ref={firstPanelRef} className="contents md:block md:h-screen md:w-screen md:shrink-0">
            <Panel className="flex min-h-[100svh] flex-col justify-end pt-28 md:block md:min-h-0">
              <svg
                aria-hidden="true"
                viewBox="0 0 640 520"
                className="mx-auto mb-10 w-full max-w-md text-neutral-900 md:hidden dark:text-neutral-200"
                fill="none"
              >
                <path
                  d={buildCompactTanglePath()}
                  pathLength={1}
                  className={`draw-in ${drawing ? "is-drawing" : ""}`}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative z-10 mb-10 flex justify-end gap-4 md:absolute md:right-10 md:top-24 md:mb-0">
                <LayoutSwitch />
                <ThemeToggle />
              </div>

              <Appear className="hidden md:absolute md:left-[78%] md:top-[22%] md:block">
                <p className="flex max-w-44 items-start gap-2 text-sm leading-snug text-neutral-500 dark:text-neutral-400">
                  <ArrowDownRight size={18} className="mt-0.5 shrink-0 -scale-x-100" />
                  an honest diagram of my journey.
                </p>
              </Appear>

              <Appear className="md:absolute md:bottom-[7%] md:left-10">
                <p className={eyebrow}>
                  <span ref={roleRef}>Full-stack software engineer</span>
                </p>
                <h1 className="font-display mt-4 text-6xl font-medium leading-[0.98] tracking-tight text-neutral-950 dark:text-neutral-50 lg:text-7xl">
                  Anthony Narine
                </h1>
                <p className="font-display mt-2 text-3xl italic text-neutral-500 dark:text-neutral-400 lg:text-4xl">
                  from patient care to production.
                </p>
              </Appear>

              <Appear
                delay={150}
                className="mt-10 md:absolute md:bottom-[7%] md:right-10 md:mt-0 md:text-right"
              >
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  React · TypeScript · Django · PostgreSQL · AWS · Stripe
                </p>
                <div className="mt-4 flex gap-3 md:justify-end">
                  <a
                    href="#work"
                    className="inline-flex items-center justify-center border border-neutral-950 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white dark:border-neutral-50 dark:text-neutral-50 dark:hover:bg-neutral-50 dark:hover:text-neutral-950"
                  >
                    view work
                  </a>
                  <a
                    href={`mailto:${profileLinks.email}`}
                    className="inline-flex items-center justify-center bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    let's talk
                  </a>
                </div>
              </Appear>

              <p className="pointer-events-none absolute bottom-[3%] left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.28em] text-neutral-400 md:flex">
                scroll <ArrowRight size={13} />
              </p>
            </Panel>
          </div>

          {/* ── I. Before software ──────────────────────────────── */}
          <Panel>
            <Appear className="max-w-lg md:absolute md:left-[10%] md:top-[14%] md:w-[38%]">
              <Numeral>I.</Numeral>
              <h2 className="font-display mt-3 text-4xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 lg:text-5xl">
                Seventeen years in vascular ultrasound.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                I worked as a vascular technologist before moving into software engineering. I don't
                have a traditional engineering background. I moved into software by building the
                systems I wanted to understand.
              </p>
            </Appear>
            <Appear
              delay={120}
              className="mt-8 max-w-sm md:absolute md:left-[60%] md:top-[68%] md:mt-0 md:w-[30%]"
            >
              <p className="border-l-2 border-neutral-300 pl-4 text-sm leading-relaxed text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                That background still shapes how I think: systems and workflows need to be clear,
                state needs to be explicit, and users should not have to guess what the system is
                doing.
              </p>
            </Appear>
          </Panel>

          {/* ── II. The break ───────────────────────────────────── */}
          {/* The story reads left to right as the track slides in, so the reason sits left of the decision. */}
          <Panel>
            <Appear className="max-w-md md:absolute md:left-[8%] md:top-[12%] md:w-[34%]">
              <Numeral>II.</Numeral>
              <p className="mt-3 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                I wanted to learn something new, and building things kept pulling at me.
              </p>
            </Appear>
            <Appear delay={120} className="mt-8 md:absolute md:left-[40%] md:top-[54%] md:mt-0 md:w-[52%]">
              <h2 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-neutral-950 dark:text-neutral-50 lg:text-6xl">
                So in March 2022, I{" "}
                <span className="italic text-neutral-500 dark:text-neutral-400">started</span> a
                year-long full-stack bootcamp.
              </h2>
            </Appear>
          </Panel>

          {/* ── III. Self-taught ────────────────────────────────── */}
          <Panel>
            <Appear className="max-w-lg md:absolute md:left-[6%] md:top-[10%] md:w-[40%]">
              <Numeral>III.</Numeral>
              <h2 className="font-display mt-3 text-4xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 lg:text-5xl">
                Then I kept teaching myself.
              </h2>
            </Appear>
            <Appear
              delay={120}
              className="mt-5 max-w-md md:absolute md:left-[52%] md:top-[12%] md:mt-0 md:w-[34%]"
            >
              <p className="text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                After the bootcamp ended in 2023, I kept going on my own. Stack Overflow, Google and
                the teachers on Udemy and YouTube became my mentors, and I built the systems I wanted
                to learn.
              </p>
            </Appear>
            <ul className="mt-8 divide-y divide-neutral-200 border-t border-neutral-200 md:mt-0 md:divide-y-0 md:border-0 dark:divide-neutral-800 dark:border-neutral-800">
              {selfTaught.map((area, i) => {
                const spot = focusLayout[i];
                return (
                  <li
                    key={area}
                    className="py-4 md:absolute md:left-[var(--x)] md:top-[var(--y)] md:w-48 md:-translate-x-1/2 md:py-0"
                    style={{ "--x": `${spot.x * 100}%`, "--y": `${spot.y * 100}%` } as React.CSSProperties}
                  >
                    <Appear delay={i * 90} className="md:text-center">
                      <span className="font-display mr-3 text-neutral-400 md:mr-0 md:block md:text-sm">
                        0{i + 1}
                      </span>
                      <span className="text-base font-medium text-neutral-800 md:mt-1 md:block md:text-sm dark:text-neutral-200">
                        {area}
                      </span>
                    </Appear>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {/* ── IV. At a glance ─────────────────────────────────── */}
          <Panel>
            <Appear className="max-w-lg md:absolute md:left-[6%] md:top-[12%]">
              <Numeral>IV.</Numeral>
              <h2 className="font-display mt-3 text-4xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50 lg:text-5xl">
                <span className="italic text-neutral-500 dark:text-neutral-400">the</span> whole journey,
                at a glance.
              </h2>
            </Appear>
            <ol className="mt-8 border-l border-neutral-300 md:mt-0 md:border-0 dark:border-neutral-700">
              {timeline.map((event, i) => {
                const above = i % 2 === 1;
                return (
                  <li
                    key={event.year}
                    className="relative py-3 pl-5 md:absolute md:left-[var(--x)] md:top-[var(--y)] md:w-0 md:p-0"
                    style={
                      {
                        "--x": `${event.f * 100}%`,
                        "--y": `${timelineY(event.f) * 100}%`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="absolute -left-[3px] top-5 h-1.5 w-1.5 rounded-full bg-neutral-900 md:-left-[3px] md:-top-[3px] dark:bg-neutral-100" />
                    <Appear
                      delay={i * 90}
                      className={`md:absolute md:left-0 md:flex md:w-56 md:-translate-x-1/2 md:flex-col md:items-center md:text-center ${
                        above ? "md:bottom-0 md:flex-col-reverse md:pb-1" : "md:top-0 md:pt-1"
                      }`}
                    >
                      <span className="hidden h-16 w-px bg-neutral-400 md:block dark:bg-neutral-600" />
                      <span className={`block text-sm leading-snug text-neutral-700 dark:text-neutral-300 ${above ? "md:mb-2" : "md:mt-2"}`}>
                        <span className="font-display block text-base text-neutral-950 dark:text-neutral-50">
                          {event.year}
                        </span>
                        {event.org ? (
                          <span className="flex items-center gap-1.5 text-xs text-neutral-700 md:justify-center dark:text-neutral-300">
                            {event.org.logo ? (
                              <img
                                src={event.org.logo}
                                alt=""
                                className="h-4 w-auto opacity-80 grayscale dark:invert"
                              />
                            ) : null}
                            {event.org.name}
                          </span>
                        ) : null}
                        {event.detail ? (
                          <span className="block text-xs text-neutral-500 dark:text-neutral-400">{event.detail}</span>
                        ) : null}
                        {event.projects ? (
                          <span className="mt-1 grid w-fit grid-cols-2 gap-x-4 gap-y-1.5 md:mx-auto">
                            {event.projects.map(({ name, id, Mark }, index) => (
                              <a
                                key={id}
                                href={`#project-${id}`}
                                // With an odd count the lead project takes its own row, so the rest pair up.
                                className={`inline-flex items-center gap-1.5 text-xs text-neutral-700 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white ${
                                  index === 0 && event.projects!.length % 2 === 1 ? "col-span-2 md:justify-self-center" : ""
                                }`}
                              >
                                <Mark />
                                {name}
                              </a>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </Appear>
                  </li>
                );
              })}
            </ol>
            <Appear className="mt-8 max-w-sm md:absolute md:left-[56%] md:top-[80%] md:mt-0">
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Then AI arrived, and I was hooked. I had the foundations first, from years of
                learning and building by hand. Now I build with AI, and I built Foundry so agents
                work on my projects under rules I trust.
              </p>
            </Appear>
          </Panel>

          {/* ── Close ───────────────────────────────────────────── */}
          <Panel className="md:pb-0">
            <Appear className="text-center md:absolute md:left-1/2 md:top-[64%] md:w-[40%] md:-translate-x-1/2">
              <p className="font-display text-4xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50 lg:text-5xl">
                enough talk.
              </p>
              <p className="font-display mt-1 text-2xl italic text-neutral-500 dark:text-neutral-400">
                let's look at the work.
              </p>
              <a
                href="#work"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 transition hover:gap-3 dark:text-neutral-200"
              >
                keep scrolling <ArrowDown size={15} />
              </a>
            </Appear>
          </Panel>
        </div>
      </div>
    </section>
  );
}
