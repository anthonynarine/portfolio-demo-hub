// # Filename: src/components/Footer.tsx

import { profileLinks } from "../data/projects";
import { EmailCopy } from "./EmailCopy";

export function Footer() {
  const year = new Date().getFullYear();
  const hasResume = Boolean(profileLinks.resume);
  const hasHandbook = Boolean(profileLinks.handbook);

  return (
    <footer className="bg-neutral-950 px-5 py-12 text-sm text-neutral-400 dark:bg-neutral-50 dark:text-neutral-600 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 border-t border-neutral-800 pt-8 dark:border-neutral-300 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white dark:text-neutral-950">Anthony Narine</p>
          <p className="mt-1">© {year} • Full-stack portfolio</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <a className="hover:text-white dark:hover:text-neutral-950" href={profileLinks.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="hover:text-white dark:hover:text-neutral-950" href={profileLinks.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          {hasResume ? (
            <a className="hover:text-white dark:hover:text-neutral-950" href={profileLinks.resume} target="_blank" rel="noreferrer">
              Resume
            </a>
          ) : null}
          {hasHandbook ? (
            <a className="hover:text-white dark:hover:text-neutral-950" href={profileLinks.handbook}>
              HIPAA handbook
            </a>
          ) : null}
          <EmailCopy tone="onInverted" />
        </div>
      </div>
    </footer>
  );
}
