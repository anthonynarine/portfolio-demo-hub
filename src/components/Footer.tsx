// ✅ New Code
// # Filename: src/components/Footer.tsx

import { profileLinks } from "../data/projects";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-white/10 py-8 text-sm text-slate-300/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} • Portfolio Demo Hub</p>

        <div className="flex flex-wrap gap-4">
          <a className="hover:text-white" href={profileLinks.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-white" href={profileLinks.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="hover:text-white" href={profileLinks.resume} target="_blank" rel="noreferrer">
            Resume
          </a>
        </div>
      </div>
    </footer>
  );
}
