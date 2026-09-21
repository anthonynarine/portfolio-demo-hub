// # Filename: src/components/EmailCopy.tsx

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { profileLinks } from "../data/projects";

/**
 * `mailto:` silently does nothing when the visitor has no mail client registered,
 * which leaves a dead "Contact me" button. Showing the address as copyable text
 * means the contact path never depends on the browser having a handler.
 */
type Tone = "onPage" | "onInverted";

const TONES: Record<Tone, string> = {
  // Sits on the page/cream surfaces.
  onPage:
    "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50",
  // Sits on the black band (which flips to near-white in dark mode).
  onInverted:
    "text-neutral-400 hover:text-white dark:text-neutral-600 dark:hover:text-neutral-950",
};

export function EmailCopy({
  tone = "onPage",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileLinks.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied or unavailable (insecure context, permission blocked).
      // The address is rendered as text either way, so it can still be selected by hand.
    }
  }

  return (
    <span className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <button
        type="button"
        onClick={handleCopy}
        title="Copy email address"
        className={`inline-flex items-center gap-2 font-medium transition ${TONES[tone]}`}
      >
        <span className="select-all">{profileLinks.email}</span>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
      {copied ? (
        <span aria-hidden="true" className={TONES[tone]}>
          Copied
        </span>
      ) : null}
    </span>
  );
}
