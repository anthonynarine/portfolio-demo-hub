// # Filename: src/components/Header.tsx

import {
  ArrowDownRight,
  FileText,
  Github,
  Linkedin,
  Mail,
  Sparkles,
} from "lucide-react";
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
  primary = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      className={
        primary
          ? "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-cyan-100"
          : "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
      }
    >
      {icon}
      {label}
    </a>
  );
}

function SkillTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/12 bg-white/[0.07] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
        {label}
      </p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-white">{value}</p>
    </div>
  );
}

function WorkPreview() {
  return (
    <div className="relative overflow-hidden border border-white/15 bg-white/[0.05] p-4 text-white shadow-2xl shadow-black/35">
      <div className="absolute right-0 top-0 h-28 w-28 bg-cyan-300/20 blur-2xl" />
      <div className="absolute bottom-8 left-8 h-24 w-24 bg-sky-200/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              Portfolio proof
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight">Systems shipped</p>
          </div>
          <Sparkles size={22} className="text-cyan-600" />
        </div>

        <div className="mt-5 grid gap-3">
          {[
            ["EstateIQ", "Production SaaS", "Ledger-first financial workflows with Stripe + AI Copilot"],
            ["Gait", "Auth platform", "JWT lifecycle, protected APIs, reusable service boundary"],
            ["OneVOne", "Realtime platform", "Games, group chat, presence, lobbies, notifications"],
          ].map(([name, type, detail], index) => (
            <div
              key={name}
              className="grid gap-3 border border-white/10 bg-slate-950/45 p-4 shadow-sm sm:grid-cols-[2.5rem_1fr]"
            >
              <div className="grid h-10 w-10 place-items-center bg-cyan-300 text-sm font-semibold text-slate-950">
                0{index + 1}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{name}</p>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-100">
                    {type}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header({ name, headline, subhead }: HeaderProps) {
  const hasResume = Boolean(profileLinks.resume);

  return (
    <header className="relative overflow-hidden bg-[#111827] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.18),transparent_34%),linear-gradient(300deg,rgba(125,211,252,0.12),transparent_38%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="relative grid min-h-[680px] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-100">
              {headline}
            </span>
            <span className="rounded-full bg-cyan-200 px-3 py-1.5 text-xs font-bold text-slate-950">
              Open to full-stack product work, from foundation to production
            </span>
          </div>

          <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            {name}
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-200 sm:text-2xl">
            {subhead}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ActionLink
              href={`mailto:${profileLinks.email}`}
              label="Contact me"
              icon={<Mail size={16} />}
              primary
            />
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
            {hasResume ? (
              <ActionLink
                href={profileLinks.resume}
                label="Resume"
                icon={<FileText size={16} />}
              />
            ) : null}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SkillTile label="Frontend" value="React, Next.js, TypeScript, Netlify" />
            <SkillTile label="Backend" value="Django, FastAPI, DRF, Heroku" />
            <SkillTile label="Data" value="PostgreSQL, SQL, Redis" />
            <SkillTile label="Deployment + Infra" value="AWS S3/SES, Stripe, Heroku Scheduler, WebSockets" />
          </div>
        </div>

        <div>
          <WorkPreview />
          <a
            href="#projects"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-white"
          >
            View selected projects
            <ArrowDownRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
