// # Filename: src/components/SiteNav.tsx

import { profileLinks } from "../data/projects";

/**
 * Fixed top bar. `mix-blend-difference` with white text inverts against
 * whatever is underneath, so it reads on the light story and the dark work band
 * without swapping classes on scroll.
 */
export function SiteNav() {
  const linkClass = "transition-opacity hover:opacity-60";

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 text-white mix-blend-difference sm:px-8 md:px-10"
    >
      <a href="#story" className="font-display pointer-events-auto text-2xl font-medium tracking-tight">
        Anthony
      </a>
      <div className="pointer-events-auto flex items-center gap-5 text-sm font-medium sm:gap-7">
        <a className={linkClass} href="#story">
          story
        </a>
        <a className={linkClass} href="#work">
          work
        </a>
        <a className={linkClass} href={profileLinks.resume}>
          resume
        </a>
        <a className={`${linkClass} hidden sm:inline`} href={profileLinks.linkedin} target="_blank" rel="noreferrer">
          linkedin
        </a>
      </div>
    </nav>
  );
}
