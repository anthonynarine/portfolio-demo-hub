// # Filename: src/features/resume/components/ResumeHeader.tsx

import { ArrowLeft, Download, Github, Linkedin, Mail, Printer } from "lucide-react";
import { resumeProfile } from "../data/resumeData";

const ATS_RESUME_HREF = "/Anthony-Narine-Resume.pdf";

function ContactLink({ href, label }: { href: string; label: string }) {
  const isMail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      className="text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950"
    >
      {label}
    </a>
  );
}

function ActionButton({
  href,
  label,
  icon,
  onClick,
  download,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  download?: boolean;
}) {
  const className =
    "inline-flex items-center gap-2 border border-neutral-300 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <span className="text-neutral-950">{icon}</span>
        {label}
      </button>
    );
  }

  if (download) {
    return (
      <a href={href} download className={className}>
        <span className="text-neutral-950">{icon}</span>
        {label}
      </a>
    );
  }

  const isMail = href?.startsWith("mailto:");

  return (
    <a
      href={href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noreferrer"}
      className={className}
    >
      <span className="text-neutral-950">{icon}</span>
      {label}
    </a>
  );
}

export function ResumeHeader() {
  return (
    <header className="print:pb-0">
      <div className="print:hidden">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 transition hover:text-neutral-950"
        >
          <ArrowLeft size={14} />
          Back to portfolio
        </a>
      </div>

      <div className="mt-6 flex flex-col gap-6 border-b border-neutral-200 pb-8 print:mt-0 print:pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
            {resumeProfile.name}
          </h1>
          <p className="mt-2 text-lg font-medium text-neutral-700">{resumeProfile.title}</p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {resumeProfile.positioning}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            {resumeProfile.capabilities}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm sm:flex-col sm:items-end sm:text-right">
          <span className="text-neutral-500">{resumeProfile.location}</span>
          <ContactLink href={`mailto:${resumeProfile.email}`} label={resumeProfile.email} />
          <ContactLink href={resumeProfile.github} label={resumeProfile.githubLabel} />
          <ContactLink href={resumeProfile.linkedin} label={resumeProfile.linkedinLabel} />
          <ContactLink href={resumeProfile.site} label={resumeProfile.siteLabel} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5 print:hidden">
        <ActionButton href={resumeProfile.github} label="GitHub" icon={<Github size={14} />} />
        <ActionButton
          href={resumeProfile.linkedin}
          label="LinkedIn"
          icon={<Linkedin size={14} />}
        />
        <ActionButton
          href={`mailto:${resumeProfile.email}`}
          label="Email"
          icon={<Mail size={14} />}
        />
        <ActionButton
          label="Print / Save PDF"
          icon={<Printer size={14} />}
          onClick={() => window.print()}
        />
        <ActionButton
          href={ATS_RESUME_HREF}
          label="Download ATS Resume"
          icon={<Download size={14} />}
          download
        />
      </div>
    </header>
  );
}
