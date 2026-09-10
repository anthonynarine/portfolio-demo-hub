// # Filename: src/features/resume/components/ResumeSummary.tsx

import { resumeSummary } from "../data/resumeData";

export function ResumeSummary() {
  return (
    <section className="border-b border-neutral-200 py-8 dark:border-neutral-800 print:break-inside-avoid print:py-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">Profile</h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">{resumeSummary}</p>
    </section>
  );
}
