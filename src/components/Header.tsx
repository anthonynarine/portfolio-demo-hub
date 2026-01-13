
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
        border border-slate-200/70 bg-white/70 text-slate-800 shadow-sm backdrop-blur hover:bg-white
        dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-100 dark:shadow-none dark:hover:bg-slate-900/60
      "
    >
      {icon}
      {label}
    </a>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span
      className="
        inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
        border border-slate-200/70 bg-white/60 text-slate-700
        dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200
      "
    >
      {text}
    </span>
  );
}

function WelcomeBadge() {
  return (
    <div
      className="
        inline-flex items-center gap-2 rounded-full px-3 py-2
        border border-slate-200/70 bg-white/60 text-slate-700 shadow-sm backdrop-blur
        dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:shadow-none
      "
      aria-label="Welcome"
      title="Thanks for stopping by 👋"
    >
      <Hand
        size={16}
        className="
          text-slate-700 dark:text-slate-200
          transition-transform duration-300 origin-bottom-left
          group-hover:rotate-12
        "
      />
      <span className="text-xs font-semibold">Hi</span>
    </div>
  );
}

export function Header({ name, headline, subhead }: HeaderProps) {
  return (
    <header
      className="
        relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-sm backdrop-blur
        dark:border-white/10 dark:bg-slate-950/45
        sm:p-10
      "
    >
      {/* subtle glow (dark only) */}
      <div className="pointer-events-none absolute -top-24 left-1/2 hidden h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl dark:block" />
      <div className="pointer-events-none absolute -bottom-24 right-10 hidden h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl dark:block" />

      {/* top highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent opacity-80 dark:via-white/15" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 group">
          <span
            className="
              inline-flex items-center rounded-full border border-slate-200/70 bg-white/60 px-3 py-1
              text-xs font-semibold tracking-wide text-slate-700
              dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200
            "
          >
            {headline}
          </span>

          {/* ✅ Welcoming icon (replaces non-functional toggle) */}
          <WelcomeBadge />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            <span className="text-slate-950 dark:bg-gradient-to-r dark:from-white dark:via-white dark:to-slate-300 dark:bg-clip-text dark:text-transparent">
              {name}
            </span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-200/90">
            {subhead}
          </p>

          {/* capability chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Chip text="Auth: JWT + RBAC" />
            <Chip text="Real-time: WebSockets + Redis" />
            <Chip text="AI: LangChain + LangGraph" />
            <Chip text="Deploy: Heroku + Netlify" />
          </div>
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

        <div
          className="
            mt-1 rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-sm text-slate-700 backdrop-blur
            dark:border-white/10 dark:bg-slate-900/35 dark:text-slate-200/90
          "
        >
          <span className="font-semibold text-slate-900 dark:text-white">
            Quick path
          </span>{" "}
          → scroll to a project card → click{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            Live Demo
          </span>{" "}
          → follow the two{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            Try this
          </span>{" "}
          steps.
        </div>
      </div>
    </header>
  );
}

