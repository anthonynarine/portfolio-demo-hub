
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
  gaitPostmanDocs: "https://documenter.getpostman.com/view/23868442/2sA3XY6xgj",
};

export const projects: Project[] = [
  {
    id: "tictactoe-ws",
    title: "Real-time Multiplayer Gaming Platform + Chat",
    description:
      "A server authoritative real time multiplayer platform using WebSockets and Redis, focused on correctness, invite lifecycles, and resilient client rehydration. The game UI serves as a constrained domain for system design ",
    highlights: [
      "Server-authoritative state and turn enforcement",
      "Real-time gameplay, chat, and notifications over WebSockets",
      "Invite lifecycle management with expiry and rehydration",
      "Friends, presence, and lobby-based social features",
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
    title: "Gait — Authentication Platform (Reusable Auth Service)",
    description:
      "A centralized authentication service issuing JWT access and refresh tokens, designed for real-world product flows such as login, logout, and password reset, with a clean integration path for downstream services.",
    highlights: [
      "JWT access + refresh lifecycle with clear failure states",
      "RBAC-ready foundation for multi-role applications",
      "Password reset and logout flows handled server-side",
      "Designed as a standalone auth service for reuse across apps"
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
      "A template-driven, multi-service clinical workflow system for vascular ultrasound reporting from patient context to reprt ready output ",
      highlights: [
        "Microservice-based architecture",
        "Template-driven exam workflows based on real clinical protoco",
        "RAG assistant for protocol + procedures + criteria Q&A",
        "PDF and HL7-ready reporting pipeline",
        "Centralized auth via Gait and shared observability across services"
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
    title: "Reusable Backend Building Blocks (Auth + Observability)",
    description:
      "Two reusable backend components extracted while building Lumen: a centralized auth integration layer and a shared logging system for traceabilityacross services.",
    highlights: [
      "auth_integration: verifies JWT via a central Auth API to avoid duplicating auth logic",
      "lumen-logger: structured logging + correlation IDs for debugging across modules/services",
      "Designed for reuse across Django and FastAPI projects",
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
