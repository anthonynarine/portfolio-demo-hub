// ✅ New Code
// # Filename: src/data/projects.ts

import type { Project } from "../types/project";

export const profileLinks = {
  github: "https://github.com/anthonynarine",
  linkedin: "https://www.linkedin.com/in/anthony-narine-9ab567245",
  resume: "https://your-resume-link.example.com",
  email: "fanarine@pm.me",
};

const LINKS = {
  tttRepo: "https://github.com/anthonynarine/tic_tac_toe",
  authIntegrationRepo: "https://github.com/anthonynarine/auth_integration",
  authFlowRepo: "https://github.com/anthonynarine/AuthFlow",
  djangoAuthRepo: "https://github.com/anthonynarine/django_auth",
  lumenLoggerRepo: "https://github.com/anthonynarine/Lumen_Logger",

  // placeholders you’ll swap later
  tttDemo: "https://onevone.net",
  gaitDemo: "https://gait.netlify.app",
  lumenRepo: "https://your-lumen-repo.example.com",
  lumenVideo: "https://your-lumen-video.example.com",

  // docs
  gaitPostmanDocs: "https://documenter.getpostman.com/view/23868442/2sA3QsAXmU",
};

export const projects: Project[] = [
  {
    id: "tictactoe-ws",
    title: "Real-time Multiplayer Gaming Platform + Chat",
    description:
      "A full-stack real-time game platform: multiplayer tic-tac-toe with chat, friend presence, game invites, and notifications—built to keep state correct across two clients.",
    highlights: [
      "Real-time correctness: turn enforcement + shared state across clients",
      "Social layer: friends list + online/offline presence + notification signals",
      "Includes single-player mode and an in-app assistant for quick “how does this work?” help",
    ],
    tryThis: [
      "Log in as Player1 + Player2 in two tabs → watch presence update.",
      "Start a match → chat mid-game → trigger a notification/unread badge.",
    ],
    links: {
      liveDemo: LINKS.tttDemo,
      repo: LINKS.tttRepo,
    },
    badges: ["WebSockets", "Presence", "Notifications", "RAG"],
  },

  {
    id: "gait-auth",
    title: "Gait — Auth Platform (built for Lumen, reusable by design)",
    description:
      "A centralized auth service that issues JWT access/refresh tokens and supports real product flows like logout and password reset—plus a clean integration path for downstream services.",
    highlights: [
      "JWT lifecycle: access + refresh + protected endpoints with clear failure states",
      "Role-aware foundation for clinical apps (admin / physician / technologist)",
      "Reusable integration: other services verify identity from one source of truth",
    ],
    tryThis: [
      "Register → login → hit a protected endpoint → refresh → logout.",
      "Open the Postman docs and compare endpoints with the repo implementation.",
    ],
    links: {
      liveDemo: LINKS.gaitDemo,
      repo: LINKS.djangoAuthRepo,
      related: [
        { label: "React client (AuthFlow)", href: LINKS.authFlowRepo },
        { label: "Postman API docs", href: LINKS.gaitPostmanDocs },
      ],
    },
    badges: ["JWT", "RBAC-ready", "Password Reset"],
  },

  {
    id: "lumen",
    title: "Lumen — Vascular Reporting System (Video Demo)",
    description:
      "A full-stack clinical workflow system for vascular ultrasound reporting: patient context → exam selection → segment entry → save/reload → report-ready output (video walkthrough).",
      highlights: [
        "Template-driven exams: structured workflows built from real clinical protocols",
        "RAG assistant for protocol + criteria Q&A (baseline + lab-specific knowledge layer)",
        "Developer CLI to standardize local setup and manage the multi-service workflow from one interface",
      ],
    tryThis: [
      "Watch the demo end-to-end: Patient → Exam → Segments → Save/Reload → Output.",
      "Review the repo structure to see how templates/types map to endpoints.",
    ],
    links: {
      repo: LINKS.lumenRepo,
      video: LINKS.lumenVideo,
      related: [
        { label: "Auth platform used by Lumen (Gait)", href: LINKS.djangoAuthRepo },
        { label: "Reusable logger (lumen-logger)", href: LINKS.lumenLoggerRepo },
      ],
    },
    badges: ["Healthcare", "Templates", "PDF/HL7-ready", "RAG",],
  },

  {
    id: "infra-packages",
    title: "Reusable Infrastructure Packages (Auth + Observability)",
    description:
      "Two reusable building blocks I extracted while building Lumen: one for centralized auth integration and one for consistent logging and traceability across services.",
    highlights: [
      "auth_integration: verifies JWT via a central Auth API to avoid duplicating auth logic",
      "lumen-logger: structured logging + correlation IDs for debugging across modules/services",
      "Built for reuse: consistent patterns you can drop into other Django/FastAPI projects",
    ],
    tryThis: [
      "Open auth_integration and follow the token → identity verification → role enforcement path.",
      "Open lumen-logger and review the logging config + correlation approach.",
    ],
    links: {
      repo: LINKS.authIntegrationRepo,
      related: [{ label: "lumen-logger repo", href: LINKS.lumenLoggerRepo }],
    },
    badges: ["Platform", "Reusable", "Tracing"],
  },
];
