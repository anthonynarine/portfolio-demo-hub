// # Filename: src/features/resume/components/ResumeSkills.tsx

import { resumeSkillGroups } from "../data/resumeData";

export function ResumeSkills() {
  return (
    <section className="border-b border-neutral-200 py-8 print:break-inside-avoid print:py-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
        Technical Skills
      </h2>
      <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {resumeSkillGroups.map((group) => (
          <p key={group.label} className="text-sm leading-relaxed text-neutral-700">
            <span className="font-semibold text-neutral-950">{group.label}: </span>
            {group.items.join(", ")}
          </p>
        ))}
      </div>
    </section>
  );
}
