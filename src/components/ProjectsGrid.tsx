
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
          <div className="grid gap-y-8 gap-x-8 lg:grid-cols-2 lg:gap-x-10 lg:pl-[5.5rem] xl:gap-x-16 xl:pl-[7rem]">
            {standard.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={featured.length + index} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
