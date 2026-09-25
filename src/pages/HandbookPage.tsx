// # Filename: src/pages/HandbookPage.tsx

import { useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { EmailCopy } from "../components/EmailCopy";
import { Footer } from "../components/Footer";
import { Reveal } from "../components/Reveal";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  engineeringLoop,
  handbook,
  numberedContents,
  outcomes,
  promiseQuestions,
} from "../data/handbook";

const PAGE_TITLE = "HIPAA for Medical Application Developers | Anthony Narine";
const PAGE_DESCRIPTION =
  "A free 52-page engineering handbook and workbook on building HIPAA-regulated medical applications: trust boundaries, minimum-necessary APIs, audit controls, HL7 and DICOM interfaces, and the evidence that proves a control works.";

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

export default function HandbookPage() {
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

        <div className="pb-16 pt-20 sm:pt-24">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
            Free handbook
          </p>

          <h1 className="font-display animate-fade-up mt-6 max-w-2xl text-5xl font-medium leading-[1.04] tracking-tight text-neutral-950 [animation-delay:90ms] dark:text-neutral-50 sm:text-6xl">
            {handbook.title}
          </h1>

          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-neutral-600 [animation-delay:180ms] dark:text-neutral-400">
            I spent 17 years in vascular ultrasound, then built the reporting platform this book uses
            as its case study. This is what I had to learn to build it safely — written down while I
            learned it.
          </p>

          <p className="animate-fade-up mt-5 text-sm text-neutral-500 [animation-delay:180ms] dark:text-neutral-400">
            {handbook.strapline}
          </p>

          <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 [animation-delay:270ms]">
            <a
              href={handbook.pdf}
              download
              className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              <Download size={15} />
              Download the PDF
            </a>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {handbook.pages} pages · {handbook.edition} · {handbook.date}
            </p>
          </div>
        </div>
      </header>

      <main>
        <section className="border-t border-neutral-200 dark:border-neutral-800">
          <Reveal className="mx-auto grid max-w-3xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                The promise
              </p>
              <h2 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
                Five questions you should be able to answer about any medical application.
              </h2>
            </div>

            <ol className="divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {promiseQuestions.map((question, index) => (
                <li
                  key={question}
                  className="flex gap-4 py-4 text-base font-medium text-neutral-800 dark:text-neutral-200"
                >
                  <span className="font-display shrink-0 text-neutral-300 dark:text-neutral-700">
                    {index + 1}.
                  </span>
                  {question}
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section className="border-y border-neutral-200 bg-[#F3F1EC] cloudy:border-neutral-300 cloudy:bg-[#C9D2D8] dark:border-neutral-800 dark:bg-neutral-900 rainy:bg-[#181B1F] thunderstorm:bg-[#3A424B]">
          <Reveal className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
              The method
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-3xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
              Every chapter runs the same loop.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
              HIPAA tells regulated organizations what outcomes must be achieved. Translating those
              outcomes into software is the engineering work — and it is the same seven steps every
              time.
            </p>

            <ol className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-3">
              {engineeringLoop.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="border border-neutral-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800 dark:border-neutral-700 dark:text-neutral-200">
                    {step}
                  </span>
                  {index < engineeringLoop.length - 1 ? (
                    <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-600">
                      &rarr;
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-24">
          <Reveal className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
              Contents
            </p>
            <h2 className="font-display mt-3 text-4xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-5xl">
              Six parts, thirty-one chapters.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Lumen — a vascular ultrasound reporting platform — is the running case study, because
              it is rich enough to make the hard parts real: patient identity, signed reports, DICOM
              images, HL7 interfaces, multi-tenant organizations, and AI-assisted workflows. Every Lumen
              example is labeled implemented, partial, planned, or illustrative.
            </p>
          </Reveal>

          <div className="mt-12 space-y-12">
            {numberedContents.map((part) => (
              <Reveal key={part.numeral}>
                <div className="grid gap-y-5 sm:grid-cols-[3rem_1fr] sm:gap-x-8">
                  <div aria-hidden="true" className="hidden sm:block">
                    <span className="font-display text-2xl text-neutral-300 dark:text-neutral-700">
                      {part.numeral}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
                      <span className="mr-2 text-neutral-300 dark:text-neutral-700 sm:hidden">
                        {part.numeral}
                      </span>
                      {part.title}
                    </h3>

                    <ol className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                      {part.chapters.map((chapter, chapterIndex) => (
                        <li
                          key={chapter}
                          className="flex gap-4 py-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
                        >
                          <span className="font-display w-6 shrink-0 text-neutral-400 dark:text-neutral-600">
                            {part.firstChapter + chapterIndex}
                          </span>
                          {chapter}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-[#F3F1EC] cloudy:border-neutral-300 cloudy:bg-[#C9D2D8] dark:border-neutral-800 dark:bg-neutral-900 rainy:bg-[#181B1F] thunderstorm:bg-[#3A424B]">
          <Reveal className="mx-auto grid max-w-3xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                By the end
              </p>
              <h2 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-50 sm:text-4xl">
                It is a workbook, not a glossary.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Each chapter ends with questions you answer about your own system. The last page is a
                self-assessment you score honestly.
              </p>
            </div>

            <ul className="divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
              {outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="py-3.5 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200"
                >
                  {outcome}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
              Before you rely on it
            </p>
            <div className="mt-6 space-y-5 border-l-2 border-neutral-300 pl-5 text-sm leading-relaxed text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
              <p>
                This is an educational engineering handbook. It is not legal advice, a compliance
                certification, or a substitute for counsel, a privacy officer, a security officer, or
                organization-specific policy. HIPAA obligations depend on role, data flow, contracts,
                purpose, and facts. The regulations and official HHS guidance control wherever this
                book conflicts with them.
              </p>
              <p>
                Regulatory status used in this edition: HHS states that the existing HIPAA Security
                Rule remains the rule currently in effect. HHS issued a proposed rule in late 2024 to
                strengthen cybersecurity requirements; a proposed rule is not a final rule. Re-check
                HHS and eCFR before making production or contractual decisions.
              </p>
              <p>
                Primary sources for this edition include 45 CFR Parts 160 and 164, HHS/OCR HIPAA
                guidance, and the official OWASP Top 10:2025 and ASVS 5.0 materials.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950">
          <Reveal className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-20 sm:px-8 sm:py-24 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-600">
                Free · No sign-up
              </p>
              <h2 className="font-display mt-4 max-w-md text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
                Take it. Use it on your own system.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-400 dark:text-neutral-600">
                If it is useful — or if you think a chapter gets something wrong — I would genuinely
                like to hear about it.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-4">
              <a
                href={handbook.pdf}
                download
                className="inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-neutral-50 dark:hover:bg-neutral-800"
              >
                <Download size={16} />
                Download the PDF
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
