// # Filename: src/features/resume/components/ResumeFooter.tsx

import { resumeProfile } from "../data/resumeData";

export function ResumeFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-neutral-200 pt-6 print:pt-4">
      <p className="text-xs text-neutral-500">
        {resumeProfile.name} · {resumeProfile.siteLabel}
      </p>

      <div className="border border-neutral-200 bg-white p-1">
        <img
          src="/qr-anthonynarine.svg"
          alt={`QR code linking to ${resumeProfile.site}`}
          width={40}
          height={40}
          className="block h-10 w-10"
        />
      </div>
    </footer>
  );
}
