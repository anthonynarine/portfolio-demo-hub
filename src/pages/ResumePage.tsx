// # Filename: src/pages/ResumePage.tsx

import { useEffect } from "react";
import {
  ResumeHeader,
  ResumeSummary,
  ResumeProjects,
  ResumeSkills,
  ResumeExperience,
  ResumeEducation,
  ResumeFooter,
} from "../features/resume";

const PAGE_TITLE = "Anthony Narine | Full-Stack Software Engineer";
const PAGE_DESCRIPTION =
  "Full-stack software engineer building deterministic AI-native SaaS, real-time, security, and healthcare systems.";

export default function ResumePage() {
  useEffect(() => {
    document.title = PAGE_TITLE;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", PAGE_DESCRIPTION);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-neutral-950 print:min-h-0 print:bg-white">
      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 print:max-w-none print:px-0 print:py-0">
        <ResumeHeader />
        <ResumeSummary />
        <ResumeProjects />
        <ResumeSkills />
        <ResumeExperience />
        <ResumeEducation />
        <ResumeFooter />
      </main>
    </div>
  );
}
