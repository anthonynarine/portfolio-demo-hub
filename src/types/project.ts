// ✅ New Code
// # Filename: src/types/project.ts

export type ProjectRelatedLink = {
  label: string;
  href: string;
};

export type ProjectLinks = {
  liveDemo?: string;
  repo?: string;
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
  featured?: boolean;
  screenshot?: {
    src: string;
    alt: string;
    caption?: string;
    /** Optional short muted looping clip (mp4/webm) shown instead of the still image; `src` is used as the poster frame and as the fallback when the video can't load. */
    clip?: string;
  };
  architecture?: {
    architecture: string;
  };
};
