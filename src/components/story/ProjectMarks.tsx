// # Filename: src/components/story/ProjectMarks.tsx

/*
 * Single-colour versions of each project's own mark, drawn in currentColor so
 * they sit in the story's line-drawing style. Geometry comes from each
 * project's source:
 *   Foundry  – foundry-control-plane.netlify.app inline favicon (the F)
 *   Gait     – gaitobservatory.com/favicon.svg (the gate)
 *   EstateIQ – EstateIQ/frontend/public/favicon.svg (E with the dot)
 *   OneVOne  – onevone.net/game-hub-icon.svg (the H)
 *   Lumen    – Lumen lumen_ui/src/theme/RbcEmblem.tsx (red blood cell)
 */

type MarkProps = { className?: string };

const base = "h-3.5 w-3.5 shrink-0";

export function FoundryMark({ className = base }: MarkProps) {
  return (
    <svg viewBox="7.5 7 18 18" className={className} aria-hidden="true">
      <path d="M10 8h13v4h-8.5v3.5H21v4h-6.5V24H10z" fill="currentColor" />
    </svg>
  );
}

export function GaitMark({ className = base }: MarkProps) {
  return (
    <svg viewBox="6 7 20 20" className={className} aria-hidden="true" fill="none">
      <path d="M9 24.5V10M23 24.5V10M9 10h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
    </svg>
  );
}

export function EstateIqMark({ className = base }: MarkProps) {
  return (
    <svg viewBox="14 8 42 44" className={className} aria-hidden="true" fill="none">
      <path
        d="M21 18h17M21 32h20M21 46h25M21 18v28"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="46" cy="18" r="8" fill="currentColor" />
    </svg>
  );
}

export function OneVOneMark({ className = base }: MarkProps) {
  return (
    <svg viewBox="114 96 284 320" className={className} aria-hidden="true">
      <path d="M134 116h78v107h88V116h78v280h-78V287h-88v109h-78z" fill="currentColor" />
    </svg>
  );
}

export function LumenMark({ className = base }: MarkProps) {
  return (
    <svg viewBox="14 40 132 80" className={`${className} !w-[1.1rem]`} aria-hidden="true" fill="none">
      <ellipse cx="80" cy="80" rx="60" ry="35" stroke="currentColor" strokeWidth="10" />
      <ellipse cx="80" cy="80" rx="22" ry="12" fill="currentColor" />
    </svg>
  );
}
