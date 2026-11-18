// # Filename: src/pages/WritingPage.tsx

import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { ThemeToggle } from "../components/ThemeToggle";
import { writing, type WritingLink } from "../data/writing";

const PAGE_TITLE = "Writing | Anthony Narine";
const PAGE_DESCRIPTION =
  "Free engineering handbooks by Anthony Narine: DICOM and HIPAA for medical application developers, and a working reference for production Django and React systems.";

function useDocumentMeta() {
  useEffect(() => {
    document.title = PAGE_TITLE;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", PAGE_DESCRIPTION);
  }, []);
}

function EntryLink({ link, primary }: { link: WritingLink; primary: boolean }) {
  const Icon = link.download ? Download : ArrowUpRight;
  return (
    <a
      href={link.href}
      download={link.download || undefined}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className={
        primary
          ? "inline-flex items-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
          : "inline-flex items-center gap-2 border border-neutral-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900 dark:border-neutral-600 dark:text-neutral-100 dark:hover:border-neutral-50"
      }
    >
      <Icon size={15} />
      {link.label}
    </a>
  );
}

export default function WritingPage() {
  useDocumentMeta();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-neutral-950 cloudy:bg-[#D7DDE1] dark:bg-neutral-950 rainy:bg-[#0F1113] thunderstorm:bg-[#2D333B] dark:text-neutral-50">
      <div
        aria-hidden="true"
        className="bg-grain pointer-events-none fixed inset-0 z-30 opacity-[0.035] mix-blend-multiply cloudy:opacity-[0.06] dark:mix-blend-screen"
      />
      <div aria-hidden="true" className="rain-layer pointer-events-none fixed inset-0 z-30" />
      <div aria-hidden="true" className="lightning-layer pointer-events-none fixed inset-0 z-30" />

      <header className="mx-auto max-w-3xl px-5 pt-10 sm:px-8">
        <div className="animate-fade-up relative z-40 flex flex-wrap items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-neutral-600 transition hover:gap-3 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            <ArrowLeft size={15} />
            Anthony Narine
          </a>
          <ThemeToggle />
        </div>

        <div className="pb-12 pt-20 sm:pt-24">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
            Writing
          </p>
          <h1 className="font-display animate-fade-up mt-6 max-w-2xl text-5xl font-medium leading-[1.04] tracking-tight text-neutral-950 [animation-delay:90ms] dark:text-neutral-50 sm:text-6xl">
            What I write down while I build.
          </h1>
          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-neutral-600 [animation-delay:180ms] dark:text-neutral-400">
            Long-form handbooks on the parts of medical software that are hardest to learn from
            documentation alone. Free, no sign-up.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {writing.map((entry) => (
            <li key={entry.title}>
              <Reveal className="py-10">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">
                  {entry.kicker}
                </p>
                <h2 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
                  {entry.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {entry.summary}
                </p>
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{entry.detail}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {entry.links.map((link, index) => (
                    <EntryLink key={link.label} link={link} primary={index === 0} />
                  ))}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
