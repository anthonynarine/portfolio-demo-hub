// # Filename: src/pages/DicomChapterPage.tsx

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Footer } from "../components/Footer";
import { ThemeToggle } from "../components/ThemeToggle";
import { chapterPath, isChapterWritten, loadChapter, type LoadedChapter } from "../data/dicomChapters";
import { dicomChapterTitle, dicomHandbook } from "../data/dicomHandbook";

type Props = { number: number };

type State = { status: "loading" } | { status: "missing" } | { status: "ready"; chapter: LoadedChapter };

function useChapter(number: number): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadChapter(number).then((chapter) => {
      if (!cancelled) setState(chapter ? { status: "ready", chapter } : { status: "missing" });
    });
    return () => {
      cancelled = true;
    };
  }, [number]);

  return state;
}

/** The nearest written chapter before or after this one, for the footer navigation. */
function neighbour(number: number, step: -1 | 1) {
  for (let candidate = number + step; candidate >= 1 && candidate <= 99; candidate += step) {
    if (isChapterWritten(candidate)) return candidate;
  }
  return null;
}

const render = (markdown: string) => marked.parse(markdown, { async: false }) as string;

/** Chapters are the book's own Markdown, written and reviewed in this repository, so the HTML is trusted. On the
 * web the workbook answers start collapsed, so a reader can try the questions first; the PDF prints them open. */
function renderChapter(markdown: string) {
  const match = markdown.match(/\n## Answers\n([\s\S]*?)(?=\n## |\n<p class="sources">|$)/);
  if (!match || match.index === undefined) return render(markdown);
  const before = markdown.slice(0, match.index);
  const after = markdown.slice(match.index + match[0].length);
  return `${render(before)}<details class="answers"><summary>Answers</summary>${render(match[1])}</details>${render(after)}`;
}

export default function DicomChapterPage({ number }: Props) {
  const state = useChapter(number);
  const title = state.status === "ready" ? state.chapter.title : dicomChapterTitle(number);

  useEffect(() => {
    document.title = title
      ? `${number}. ${title} | ${dicomHandbook.title}`
      : `${dicomHandbook.title} | Anthony Narine`;
  }, [number, title]);

  const html = useMemo(() => (state.status === "ready" ? renderChapter(state.chapter.markdown) : ""), [state]);

  const previous = neighbour(number, -1);
  const next = neighbour(number, 1);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-neutral-950 cloudy:bg-[#D7DDE1] dark:bg-neutral-950 rainy:bg-[#0F1113] thunderstorm:bg-[#2D333B] dark:text-neutral-50">
      <header className="mx-auto max-w-3xl px-5 pt-10 sm:px-8">
        <div className="relative z-40 flex flex-wrap items-center justify-between gap-4">
          <a
            href="/dicom"
            className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-neutral-600 transition hover:gap-3 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            <ArrowLeft size={15} className="shrink-0" />
            <span className="truncate">{dicomHandbook.title}</span>
          </a>
          <ThemeToggle />
        </div>

        <div className="border-b border-neutral-900 pb-3 pt-16 dark:border-neutral-200">
          <div className="flex items-end justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
              Chapter
            </span>
            <span className="font-display text-6xl font-light leading-none">{String(number).padStart(2, "0")}</span>
          </div>
        </div>

        {title ? (
          <h1 className="font-display mt-8 text-4xl font-medium leading-tight tracking-tight sm:text-5xl">{title}</h1>
        ) : null}

        {state.status === "ready" && state.chapter.objective ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
              You will be able to
            </span>
            <p className="text-base italic leading-relaxed text-neutral-700 dark:text-neutral-300">
              {state.chapter.objective}
            </p>
          </div>
        ) : null}

        {state.status === "ready" && state.chapter.draft ? (
          <p className="mt-8 border border-dashed border-[#1f5f7a] px-4 py-3 text-sm text-[#1f5f7a] dark:border-[#7fb8cf] dark:text-[#7fb8cf]">
            Draft: this chapter is still being reviewed. The DICOM Standard controls wherever it disagrees.
          </p>
        ) : null}
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-6 sm:px-8">
        {state.status === "loading" ? (
          <p className="py-16 text-sm text-neutral-500 dark:text-neutral-400">Loading the chapter…</p>
        ) : null}

        {state.status === "missing" ? (
          <div className="py-16 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            <p>This chapter has not been written yet.</p>
            <a href="/dicom" className="mt-4 inline-block border-b border-neutral-400 font-semibold text-neutral-900 dark:text-neutral-100">
              Back to the contents
            </a>
          </div>
        ) : null}

        {state.status === "ready" ? <article className="dicom-prose" dangerouslySetInnerHTML={{ __html: html }} /> : null}

        {state.status !== "loading" ? (
          <nav className="mt-16 grid gap-4 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:grid-cols-2">
            {previous ? (
              <a href={chapterPath(previous)} className="group block">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
                  <ArrowLeft size={13} /> Chapter {previous}
                </span>
                <span className="mt-1 block text-sm font-medium text-neutral-800 group-hover:underline dark:text-neutral-200">
                  {dicomChapterTitle(previous)}
                </span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a href={chapterPath(next)} className="group block sm:text-right">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
                  Chapter {next} <ArrowRight size={13} />
                </span>
                <span className="mt-1 block text-sm font-medium text-neutral-800 group-hover:underline dark:text-neutral-200">
                  {dicomChapterTitle(next)}
                </span>
              </a>
            ) : null}
          </nav>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
