// ✅ New Code
// # Filename: src/types/project.ts

export type ProjectRelatedLink = {
  label: string;
  href: string;
};

export type ProjectLinks = {
  liveDemo?: string;
  repo: string;
  video?: string;
  related?: ProjectRelatedLink[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  tryThis: string[];
  links: ProjectLinks;
  badges?: string[];
};
