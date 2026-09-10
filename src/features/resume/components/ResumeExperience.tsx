// # Filename: src/features/resume/components/ResumeExperience.tsx

import { resumeExperience } from "../data/resumeData";

export function ResumeExperience() {
  return (
    <section className="border-b border-neutral-200 py-8 dark:border-neutral-800 print:py-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
        Professional Experience
      </h2>

      <div className="mt-2">
        {resumeExperience.map((entry) => (
          <div
            key={entry.company}
            className="border-t border-neutral-200 py-6 first:border-t-0 first:pt-2 dark:border-neutral-800 print:break-inside-avoid print:py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-display text-lg font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
                {entry.company}
              </h3>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                {entry.dates}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{entry.role}</p>

            {entry.bullets.length ? (
              <ul className="mt-3 space-y-2 pl-5 text-sm leading-relaxed text-neutral-700 marker:text-neutral-400 dark:text-neutral-300 dark:marker:text-neutral-500 [&>li]:list-disc">
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
