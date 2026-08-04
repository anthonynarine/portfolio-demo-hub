// # Filename: src/components/ProjectCard.tsx

import type { Project } from "../types/project";
import {
  Bot,
  Boxes,
  ExternalLink,
  Gamepad2,
  Github,
  Landmark,
  Link as LinkIcon,
  Play,
  Shield,
  Video,
} from "lucide-react";

type ProjectCardProps = {
  project: Project;
};

const CARD_THEME = {
  text: "text-cyan-300",
  soft: "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
  border: "border-white/10",
  button: "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
  panel: "bg-white/[0.04]",
};

function getIcon(id: string, className: string) {
  switch (id) {
    case "estateiq":
      return <Landmark size={20} className={className} />;
    case "tictactoe-ws":
      return <Gamepad2 size={20} className={className} />;
    case "gait-auth":
      return <Shield size={20} className={className} />;
    case "lumen":
      return <Bot size={20} className={className} />;
    case "infra-packages":
      return <Boxes size={20} className={className} />;
    default:
      return <LinkIcon size={20} className={className} />;
  }
}

function LinkButton({
  href,
  label,
  variant = "default",
  icon,
  accentButtonClass,
}: {
  href: string;
  label: string;
  variant?: "default" | "primary";
  icon?: React.ReactNode;
  accentButtonClass?: string;
}) {
  const styles =
    variant === "primary"
      ? accentButtonClass
      : "border border-white/10 bg-white/[0.03] text-slate-100 hover:border-cyan-300/35 hover:bg-white/[0.07]";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${styles}`}
    >
      {icon}
      {label}
      <ExternalLink size={14} className="opacity-70" />
    </a>
  );
}

function Badge({ text, accentClass }: { text: string; accentClass: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${accentClass}`}>
      {text}
    </span>
  );
}

function ScreenshotPreview({
  screenshot,
  featured = false,
}: {
  screenshot: NonNullable<Project["screenshot"]>;
  featured?: boolean;
}) {
  return (
    <figure className={`overflow-hidden border border-white/10 bg-slate-950/60 ${featured ? "p-2" : "p-1.5"}`}>
      <img
        src={screenshot.src}
        alt={screenshot.alt}
        className={`w-full object-cover object-top ${featured ? "aspect-[16/10]" : "aspect-[16/9]"}`}
        loading="lazy"
      />
      {screenshot.caption ? (
        <figcaption className="border-t border-white/10 px-3 py-2 text-xs leading-relaxed text-slate-400">
          {screenshot.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ArchitectureNote({ architecture }: { architecture: NonNullable<Project["architecture"]> }) {
  return (
    <div className="mt-5 border border-cyan-300/20 bg-cyan-300/10 p-4">
      <div className="flex gap-3">
        <span className="mt-1 h-2 w-2 shrink-0 bg-cyan-300" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Architecture
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            {architecture.architecture}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectSignal({ id, accent }: { id: string; accent: typeof CARD_THEME }) {
  const signalsByProject: Record<string, string[]> = {
    "tictactoe-ws": ["Multi-game platform", "Group chat", "Realtime state"],
    "gait-auth": ["JWT lifecycle", "Protected APIs", "Reusable auth service"],
    lumen: ["Clinical templates", "Protocol workflows", "Report-ready output"],
    "infra-packages": ["Shared auth", "Correlation IDs", "Structured logging"],
  };
  const signals = signalsByProject[id] ?? ["Architecture", "Product flow", "Implementation"];

  return (
    <div className={`mt-5 border ${accent.border} ${accent.panel} p-4`}>
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${accent.text}`}>
        Skill signal
      </p>
      <div className="mt-3 grid gap-2">
        {signals.map((signal) => (
          <div key={signal} className="flex items-center gap-2 border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-medium text-slate-200">
            <span className="h-2 w-2 bg-cyan-300" />
            {signal}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { id, title, description, highlights, tryThis, links, badges, featured, screenshot, architecture } = project;
  const accent = CARD_THEME;

  if (featured) {
    return (
      <article className="grid gap-7 border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/30 sm:p-7 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={`grid h-12 w-12 place-items-center ${accent.soft}`}>
              {getIcon(id, accent.text)}
            </div>
            <div>
              <p className={`text-sm font-bold uppercase tracking-[0.2em] ${accent.text}`}>
                Featured production system
              </p>
              <h3 className="mt-1 text-4xl font-semibold tracking-tight text-white">
                {title}
              </h3>
            </div>
          </div>

          {badges?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge} text={badge} accentClass={accent.soft} />
              ))}
            </div>
          ) : null}

          <p className="mt-6 text-base leading-relaxed text-slate-300">{description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {highlights.slice(0, 4).map((highlight) => (
              <div key={highlight} className="border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm leading-relaxed text-slate-200">{highlight}</p>
              </div>
            ))}
          </div>

          {architecture ? <ArchitectureNote architecture={architecture} /> : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {links.liveDemo ? (
              <LinkButton
                href={links.liveDemo}
                label="Live Demo"
                variant="primary"
                icon={<Play size={16} />}
                accentButtonClass={accent.button}
              />
            ) : null}
            {links.repo ? (
              <LinkButton href={links.repo} label="Repo" icon={<Github size={16} />} />
            ) : null}
          </div>
        </div>

        <div>
          {screenshot ? <ScreenshotPreview screenshot={screenshot} featured /> : null}
          <div className="mt-4 border border-white/10 bg-slate-950/70 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Evaluate this
            </p>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
              {tryThis.slice(0, 2).map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-cyan-300 text-xs font-bold text-slate-950">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col border border-white/10 bg-white/[0.05] p-5 shadow-sm shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.07]">
      {screenshot ? (
        <div className="mb-5">
          <ScreenshotPreview screenshot={screenshot} />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center ${accent.soft}`}>
            {getIcon(id, accent.text)}
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
        </div>
      </div>

      {badges?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge} text={badge} accentClass={accent.soft} />
          ))}
        </div>
      ) : null}

      <p className="mt-5 text-sm leading-relaxed text-slate-300">{description}</p>

      <ProjectSignal id={id} accent={accent} />

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          What it proves
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
          {highlights.slice(0, 4).map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-cyan-300" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border border-white/10 bg-slate-950/45 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          Evaluate this
        </p>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
          {tryThis.slice(0, 2).map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center bg-cyan-300 text-xs font-bold text-slate-950">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {links.liveDemo ? (
          <LinkButton
            href={links.liveDemo}
            label="Live Demo"
            variant="primary"
            icon={<Play size={16} />}
            accentButtonClass={accent.button}
          />
        ) : null}

        {links.repo ? (
          <LinkButton href={links.repo} label="Repo" icon={<Github size={16} />} />
        ) : null}

        {links.video ? (
          <LinkButton href={links.video} label="Video" icon={<Video size={16} />} />
        ) : null}
      </div>

      {links.related?.length ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Related
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {links.related.map((related) => (
              <a
                key={related.href}
                href={related.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.07]"
              >
                <LinkIcon size={14} />
                {related.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
