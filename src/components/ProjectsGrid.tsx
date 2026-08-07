
// # Filename: src/components/ProjectsGrid.tsx


import type { Project } from "../types/project";
import { ProjectCard } from "./ProjectCard";

type ProjectsGridProps = {
  projects: Project[];
};

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const featured = projects.filter((project) => project.featured);
  const standard = projects.filter((project) => !project.featured);

  return (
    <section className="py-10">
      <div className="grid gap-7">
        {featured.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}

        {standard.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {standard.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={featured.length + index} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
