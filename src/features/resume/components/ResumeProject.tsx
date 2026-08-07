// # Filename: src/features/resume/components/ResumeProject.tsx

import type { ResumeProject as ResumeProjectData } from "../data/resumeData";

const HEADING_SIZE: Record<ResumeProjectData["weight"], string> = {
  primary: "text-2xl sm:text-[1.75rem]",
  standard: "text-xl",
  compact: "text-lg",
};

export function ResumeProject({ project }: { project: ResumeProjectData }) {
  const { name, tagline, status, stack, bullets, liveUrl, liveLabel, repoUrl, repoLabel, weight } =
    project;
  const isInDevelopment = status === "In Development";

  return (
    <article className="border-t border-neutral-200 py-7 first:border-t-0 first:pt-0 print:break-inside-avoid print:py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3
          className={`font-display font-medium tracking-tight text-neutral-950 ${HEADING_SIZE[weight]}`}
        >
          {name}
          <span className="ml-2 font-sans text-base font-normal text-neutral-500">
            — {tagline}
          </span>
        </h3>
        <span
          className={`text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 ${isInDevelopment ? "italic" : ""}`}
        >
          {status}
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-neutral-500">{stack.join(" · ")}</p>

      <ul className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-neutral-700 marker:text-neutral-400 [&>li]:list-disc">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>

      {liveUrl || repoUrl ? (
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-600"
            >
              {liveLabel}
            </a>
          ) : null}
          {repoUrl ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-800"
            >
              {repoLabel}
            </a>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
