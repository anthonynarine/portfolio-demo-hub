// # Filename: src/features/resume/components/ResumeProjects.tsx

import { resumeProjects } from "../data/resumeData";
import { ResumeProject } from "./ResumeProject";

export function ResumeProjects() {
  return (
    <section className="border-b border-neutral-200 py-8 print:py-6">
      <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">
        Selected Systems
      </h2>
      <div className="mt-2">
        {resumeProjects.map((project) => (
          <ResumeProject key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
