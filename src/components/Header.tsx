// # Filename: src/components/Header.tsx

import { ArrowDownRight, Github, Linkedin, Mail } from "lucide-react";
import { profileLinks } from "../data/projects";

type HeaderProps = {
  name: string;
  headline: string;
  subhead: string;
};

function TextLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const isMail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      className="inline-flex items-center gap-2 border-b border-neutral-300 pb-0.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-950"
    >
      {icon ? <span className="text-neutral-950">{icon}</span> : null}
      {label}
    </a>
  );
}

export function Header({ name, headline, subhead }: HeaderProps) {
  const hasResume = Boolean(profileLinks.resume);

  return (
    <header className="bg-[#FAFAF8] text-neutral-950">
      <div className="mx-auto flex min-h-[640px] max-w-3xl flex-col justify-center px-5 py-24 sm:px-8">
        <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
          {headline}
        </p>

        <h1 className="font-display animate-fade-up mt-6 text-6xl font-medium leading-[1.02] tracking-tight text-neutral-950 [animation-delay:90ms] sm:text-7xl">
          {name}
        </h1>

        <p className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-neutral-600 [animation-delay:180ms]">
          {subhead}
        </p>

        <p className="animate-fade-up mt-5 text-sm text-neutral-500 [animation-delay:180ms]">
          React · TypeScript · Django · PostgreSQL · AWS · Stripe
        </p>

        <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 [animation-delay:270ms]">
          <a
            href={`mailto:${profileLinks.email}`}
            className="inline-flex items-center gap-2 bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <Mail size={15} />
            Contact me
          </a>
          <TextLink href={profileLinks.github} label="GitHub" icon={<Github size={15} />} />
          <TextLink href={profileLinks.linkedin} label="LinkedIn" icon={<Linkedin size={15} />} />
          {hasResume ? (
            <TextLink href={profileLinks.resume} label="Resume" icon={null} />
          ) : null}
        </div>

        <a
          href="#projects"
          className="animate-fade-up mt-16 inline-flex w-fit items-center gap-2 text-sm font-semibold text-neutral-800 transition hover:gap-3 hover:text-neutral-950 [animation-delay:360ms]"
        >
          View selected projects
          <ArrowDownRight size={16} />
        </a>
      </div>
    </header>
  );
}
