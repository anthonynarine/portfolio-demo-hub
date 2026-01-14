// ✅ New Code
// # Filename: src/components/Header.tsx

import { Github, Linkedin, FileText, Mail, Hand } from "lucide-react";
import { profileLinks } from "../data/projects";

type HeaderProps = {
  name: string;
  headline: string;
  subhead: string;
};

function ActionLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition
        border border-white/10 bg-slate-900/45 text-slate-100 backdrop-blur
        hover:bg-slate-900/65
      "
    >
      {icon}
      {label}
    </a>
  );
}

function WelcomeBadge() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 border border-white/10 bg-slate-900/40 text-slate-200 backdrop-blur"
      aria-label="Welcome"
      title="Thanks for stopping by 👋"
    >
      <Hand
        size={16}
        className="text-slate-200 transition-transform duration-300 origin-bottom-left group-hover:rotate-12"
      />
      <span className="text-xs font-semibold">Hi</span>
    </div>
  );
}

export function Header({ name, headline, subhead }: HeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45 p-8 shadow-sm backdrop-blur sm:p-10">
      {/* subtle glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* top highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-80" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 group">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/40 px-3 py-1 text-xs font-semibold tracking-wide text-slate-200">
            {headline}
          </span>

          {/* ✅ Welcoming icon (replaces non-functional toggle) */}
          <WelcomeBadge />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-white via-white to-slate-300 bg-clip-text text-transparent">
              {name}
            </span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-slate-200/90">
            {subhead}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionLink
            href={profileLinks.github}
            label="GitHub"
            icon={<Github size={16} />}
          />
          <ActionLink
            href={profileLinks.linkedin}
            label="LinkedIn"
            icon={<Linkedin size={16} />}
          />
          <ActionLink
            href={profileLinks.resume}
            label="Resume"
            icon={<FileText size={16} />}
          />
          <ActionLink
            href={`mailto:${profileLinks.email}`}
            label="Email"
            icon={<Mail size={16} />}
          />
        </div>

        <div className="mt-1 rounded-2xl border border-white/10 bg-slate-900/35 p-4 text-sm text-slate-200/90 backdrop-blur">
          <span className="font-semibold text-white">Quick path</span> → scroll to
          a project card → click{" "}
          <span className="font-semibold text-white">Live Demo</span> → follow the
          two <span className="font-semibold text-white">Try this</span> steps.
        </div>
      </div>
    </header>
  );
}

