// # Filename: src/components/Footer.tsx

import { Mail } from "lucide-react";
import { profileLinks } from "../data/projects";

export function Footer() {
  const year = new Date().getFullYear();
  const hasResume = Boolean(profileLinks.resume);

  return (
    <footer className="bg-slate-950 px-5 py-10 text-sm text-slate-300 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">Anthony Narine</p>
          <p className="mt-1">© {year} • Full-stack portfolio</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a className="hover:text-white" href={profileLinks.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-white" href={profileLinks.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          {hasResume ? (
            <a className="hover:text-white" href={profileLinks.resume} target="_blank" rel="noreferrer">
              Resume
            </a>
          ) : null}
          <a className="inline-flex items-center gap-1.5 hover:text-white" href={`mailto:${profileLinks.email}`}>
            <Mail size={14} />
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
