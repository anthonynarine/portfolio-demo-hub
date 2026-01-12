
// # Filename: src/components/ProjectsGrid.tsx


import type { Project } from "../types/project";
import { ProjectCard } from "./ProjectCard";

type ProjectsGridProps = {
  projects: Project[];
};

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    <section className="py-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}
