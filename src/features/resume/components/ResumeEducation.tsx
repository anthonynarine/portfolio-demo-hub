// # Filename: src/features/resume/components/ResumeEducation.tsx

import { resumeEducation } from "../data/resumeData";

export function ResumeEducation() {
  return (
    <section className="py-8 print:break-inside-avoid print:py-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Education</h2>
      <div className="mt-4 space-y-3">
        {resumeEducation.map((entry) => (
          <div
            key={entry.school}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
          >
            <p className="text-sm font-medium text-neutral-700">
              <span className="font-semibold text-neutral-950">{entry.school}</span> —{" "}
              {entry.credential}
            </p>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {entry.date}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
