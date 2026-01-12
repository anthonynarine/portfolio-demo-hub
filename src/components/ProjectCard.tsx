// ✅ New Code
// # Filename: src/components/ProjectCard.tsx

import type { Project } from "../types/project";
import {
  Bot,
  Gamepad2,
  Shield,
  Boxes,
  ExternalLink,
  Play,
  Github,
  Video,
  Link as LinkIcon,
} from "lucide-react";

type ProjectCardProps = {
  project: Project;
};

function getIcon(id: string) {
  switch (id) {
    case "tictactoe-ws":
      return <Gamepad2 size={18} className="text-cyan-600 dark:text-cyan-200" />;
    case "gait-auth":
      return <Shield size={18} className="text-indigo-600 dark:text-indigo-200" />;
    case "lumen":
      return <Bot size={18} className="text-emerald-600 dark:text-emerald-200" />;
    case "infra-packages":
      return <Boxes size={18} className="text-amber-600 dark:text-amber-200" />;
    default:
      return <LinkIcon size={18} className="text-slate-600 dark:text-slate-200" />;
  }
}

function LinkButton({
  href,
  label,
  variant = "default",
  icon,
}: {
  href: string;
  label: string;
  variant?: "default" | "primary";
  icon?: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition " +
    "focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:focus:ring-white/20";

  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      : "border border-slate-200/70 bg-white/70 text-slate-800 hover:bg-white " +
        "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900/55";

  return (
    <a href={href} target="_blank" rel="noreferrer" className={`${base} ${styles}`}>
      {icon}
      {label}
      <ExternalLink size={14} className="opacity-75" />
    </a>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      className="
        rounded-full border border-slate-200/70 bg-white/60 px-2.5 py-1 text-xs font-semibold text-slate-700
        dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-200
      "
    >
      {text}
    </span>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { id, title, description, highlights, tryThis, links, badges } = project;

  return (
    <article
      className="
        group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur
        transition hover:-translate-y-1 hover:shadow-md hover:bg-white
        dark:border-white/10 dark:bg-slate-950/45 dark:hover:bg-slate-950/60
        dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
      "
    >
      {/* subtle top highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent opacity-0 transition group-hover:opacity-100 dark:via-white/15" />

      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="
              grid h-10 w-10 place-items-center rounded-2xl border border-slate-200/70 bg-white/60
              dark:border-white/10 dark:bg-slate-900/45
            "
            aria-hidden="true"
          >
            {getIcon(id)}
          </div>

          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>

        {badges?.length ? (
          <div className="flex flex-wrap justify-end gap-2">
            {badges.map((b) => (
              <Badge key={b} text={b} />
            ))}
          </div>
        ) : null}
      </div>

      {/* description */}
      <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200/90">
        {description}
      </p>

      {/* What it proves */}
      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300/80">
          What it proves
        </p>

        <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200/90">
          {highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400/70 dark:bg-white/35" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Try this */}
      <div
        className="
          mt-5 rounded-2xl border border-slate-200/70 bg-white/60 p-4
          dark:border-white/10 dark:bg-slate-900/35
        "
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300/80">
          Try this
        </p>

        <ol className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200/90">
          {tryThis.slice(0, 2).map((t, idx) => (
            <li key={t} className="flex gap-2">
              <span
                className="
                  grid h-6 w-6 place-items-center rounded-full border border-slate-200/70 bg-white text-xs font-semibold text-slate-700
                  dark:border-white/10 dark:bg-slate-900/45 dark:text-white
                "
              >
                {idx + 1}
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* buttons */}
      <div className="mt-6 flex flex-wrap gap-2">
        {links.liveDemo ? (
          <LinkButton
            href={links.liveDemo}
            label="Live Demo"
            variant="primary"
            icon={<Play size={16} />}
          />
        ) : null}

        <LinkButton href={links.repo} label="Repo" icon={<Github size={16} />} />

        {links.video ? (
          <LinkButton href={links.video} label="Video" icon={<Video size={16} />} />
        ) : null}
      </div>

      {/* related links */}
      {links.related?.length ? (
        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300/80">
            Related
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {links.related.map((r) => (
              <a
                key={r.href}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-700
                  transition hover:bg-white
                  dark:border-white/10 dark:bg-slate-900/35 dark:text-slate-200 dark:hover:bg-slate-900/55
                "
              >
                <LinkIcon size={14} className="opacity-80" />
                {r.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
