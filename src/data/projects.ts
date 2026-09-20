
// # Filename: src/data/projects.ts

import type { Project } from "../types/project";

export const profileLinks = {
  github: "https://github.com/anthonynarine",
  linkedin: "https://www.linkedin.com/in/anthony-narine-9ab567245",
  resume: "/resume",
  portfolio: "https://anthonynarine.com",
  email: "fanarine@pm.me",
};

const LINKS = {
  tttRepo: "https://github.com/anthonynarine/tic_tac_toe",
  authIntegrationRepo: "https://github.com/anthonynarine/auth_integration",
  authFlowRepo: "https://github.com/anthonynarine/AuthFlow",
  djangoAuthRepo: "https://github.com/anthonynarine/django_auth",
  lumenLoggerRepo: "https://github.com/anthonynarine/Lumen_Logger",
  estateiqWebRepo: "https://github.com/anthonynarine/EstateIQ-Web",

  tttDemo: "https://onevone.net",
  gaitDemo: "https://gait.netlify.app",
  lumenDemo: "https://lumenfoundry.net",

  // production
  estateiqDemo: "https://estateiq.me",

  // docs
  gaitPostmanDocs: "https://documenter.getpostman.com/view/23868442/2sA3XY6xgj",
};

export const projects: Project[] = [
  {
    id: "gait-auth",
    title: "Gait Security Platform",
    description:
      "Gait is a self-repairing security platform governed by trusted evidence and human approval. It combines hardened security enforcement, continuous observability, constrained AI security agents, independent validation, and exact-artifact deployment into one security operating system. A large language model powers the reasoning behind Gait's Security Copilot and specialist agents — investigating findings, interpreting evidence, reproducing weaknesses, and preparing candidate repairs — but deterministic backend code decides what each agent may access, which tools it may use, and which actions are permitted.",
    highlights: [
      "Security Observatory continuously evaluates controls, evidence, findings, and audit events",
      "Incident Commander coordinates Blue Team, Red Team, Green Team, and Security Validator workflows",
      "Blue Team uses LLM-assisted reasoning to investigate failures; Red Team safely reproduces approved weaknesses in controlled environments",
      "Security Validator and a Human Approver gate every production change before Release Engineer deploys the exact approved artifact",
      "Security Copilot offers a natural-language interface for posture, active cases, and bounded workflow requests",
      "Still guards Lumen's identity layer: JWT access/refresh, 2FA, guest sign-in, and protected endpoints",
    ],
    tryThis: [
      "Click \"See How Gait Works\" to walk the self-repairing loop end-to-end: control failure, diagnosis, safe reproduction, scoped repair, independent validation, human approval, exact-artifact deploy.",
      "Open \"Architecture\" to see why the AI agents reason inside deterministic boundaries and never hold production authority directly.",
    ],
    links: {
      liveDemo: LINKS.gaitDemo,
      repo: LINKS.djangoAuthRepo,
      related: [
        { label: "React client (AuthFlow)", href: LINKS.authFlowRepo },
        { label: "Postman API docs", href: LINKS.gaitPostmanDocs },
      ],
    },
    badges: ["Security Automation", "LLM Agents", "Evidence-Driven", "Human-Governed"],
    featured: true,
    screenshot: {
      src: "/screenshots/gait-home.png",
      alt: "Gait authentication platform homepage with guest sign-in and two-factor auth overview",
      caption: "Gait homepage: recruiter-friendly auth demo with guest sign-in, 2FA, and session refresh.",
    },
    architecture: {
      architecture:
        "Django/DRF provides Gait's deterministic control plane, Security Truth layer, workflow engine, Gateway, authorization boundaries, and deployment governance. An LLM supplies intelligence and reasoning inside those boundaries — trusted evidence determines whether controls are actually healthy, and humans retain final authority over production.",
    },
  },

  {
    id: "estateiq",
    title: "EstateIQ",
    description:
      "A production SaaS financial operating system for small landlords. I designed the ledger model, billing flows, tenant isolation, and AI Copilot architecture so portfolio answers are grounded in computed records instead of invented text.",
    highlights: [
      "Ledger-first accounting: charges, payments, and allocations — balances are always derived, never stored",
      "Deterministic AI Copilot: structured data computed first, LLM used only to present it, never to invent figures",
      "Stripe-backed SaaS billing with plan tiers, feature gating, and webhook-driven subscription state",
      "Strict organization-scoped multi-tenancy enforced on every read and write",
    ],
    tryThis: [
      "Visit estateiq.me and read the homepage system narrative — ledger-first accounting, AI Copilot, and security model.",
      "Read a DANA architecture post on the blog (e.g. \"Why AI Wrappers Aren't Enough\") to see the design reasoning behind the AI layer.",
    ],
    links: {
      liveDemo: LINKS.estateiqDemo,
      repo: LINKS.estateiqWebRepo,
    },
    badges: ["Production", "SaaS", "Stripe", "AI Copilot"],
    featured: true,
    screenshot: {
      src: "/screenshots/estateiq-slide-dashboard.jpg",
      alt: "The EstateIQ portfolio dashboard, buildings list, a lease ledger, and the Dana AI Copilot answering a portfolio question",
      caption: "Every dollar accounted for — collected, outstanding, and net cash flow for the month, derived live from the ledger.",
      slides: [
        {
          src: "/screenshots/estateiq-slide-dashboard.jpg",
          alt: "EstateIQ portfolio dashboard showing collected, outstanding, and net cash flow for the month",
          caption: "Every dollar accounted for — collected, outstanding, and net cash flow for the month, derived live from the ledger.",
        },
        {
          src: "/screenshots/estateiq-slide-buildings.jpg",
          alt: "Portfolio buildings list showing occupancy and rent collected for each property",
          caption: "Occupancy, rent collected, and risk for every property in the portfolio, at a glance.",
        },
        {
          src: "/screenshots/estateiq-slide-ledger.jpg",
          alt: "A lease ledger showing charges, payments, and an overdue balance with a Pay action",
          caption: "A lease ledger that tracks charges, payments, and balances — nothing is ever hand-entered as a total.",
        },
        {
          src: "/screenshots/estateiq-slide-architecture.jpg",
          alt: "System diagram showing the flow from a landlord's business through properties, leases, and money, feeding both reports and the AI assistant",
          caption: "Every layer connects: properties, leases, and money feed both the reports and the AI assistant — nothing lives in a silo.",
        },
        {
          src: "/screenshots/estateiq-slide-copilot.jpg",
          alt: "The Dana AI Copilot answering questions about mortgages and vacancies with numbers pulled from the ledger",
          caption: "Ask Dana anything about the portfolio — answers are computed from records, not guessed by an LLM.",
        },
        {
          src: "/screenshots/estateiq-slide-ai-different.jpg",
          alt: "Comparison diagram: EstateIQ AI drawing on a connected ledger, documents, and reports for a grounded answer, versus a bolt-on AI assembling a plausible but unsourced answer from scattered files",
          caption: "Bolt-on AI assembles context from scattered files and guesses. EstateIQ's AI starts from a connected ledger, so every answer traces back to a record.",
        },
      ],
    },
    architecture: {
      architecture:
        "Ledger-style records sit at the center. The app computes balances from charges, payments, allocations, and expenses before AI explains the result.",
    },
  },

  {
    id: "tictactoe-ws",
    title: "OneVOne",
    description:
      "A real-time social gaming platform with poker tournaments, 2-9 player multiplayer poker tables, board games, AI opponents, friends, lobbies, direct messages, group chat, notifications, and server-authoritative gameplay.",
    highlights: [
      "Poker tournaments with registration, rosters, scheduled starts, table creation, and tournament-to-game handoff",
      "Multiplayer Texas Hold'em tables with configurable blinds, starting chips, turn timers, and up to 9 seats",
      "Friends, presence, lobbies, invites, notifications, DMs, and group chat",
      "Shared platform for Tic-Tac-Toe, Connect Four, Checkers, Poker, Sudoku, AI modes, and realtime multiplayer",
    ],
    tryThis: [
      "Create an account and play a live match against real people, or start a game against AI to try it solo.",
      "Explore the lobby: friends, presence, invites, chat, and notifications while a game is in progress.",
    ],
    links: {
      liveDemo: LINKS.tttDemo,
      repo: LINKS.tttRepo,
    },
    badges: ["Poker", "Tournaments", "WebSockets", "Django Channels", "Redis"],
    featured: true,
    screenshot: {
      src: "/screenshots/onevone-poker-table.jpg",
      clip: "/videos/onevone-preview.mp4",
      alt: "A complete multiplayer Texas Hold'em hand playing out at a OneVOne poker table, from the pre-flop decision through the full showdown",
      caption: "A full OneVOne poker hand playing out in real time: pre-flop, flop, turn, river, and showdown.",
    },
    architecture: {
      architecture:
        "Django/DRF owns game, tournament, registration, and table state; Channels and Redis handle realtime poker/table updates, lobby coordination, chat, presence, and notifications.",
    },
  },

  {
    id: "lumen",
    title: "Lumen Vascular Reporting",
    description:
      "A configurable clinical diagnostic platform for vascular ultrasound, shaped by real clinical protocols and 17 years at the probe. Structured reporting, DICOM imaging, AI-retrieved clinical knowledge, and billing preparation run as one workflow — from the order that arrives out of the EHR to the signed final report.",
    highlights: [
      "Seven-stage diagnostic pipeline: order → exam → measurements → interpretation → signed report, with data reused across exam types",
      "DICOM imaging: stills, cine clips, and study metadata attached directly to the exam",
      "AI clinical knowledge retrieves facility-approved protocols, procedures, and criteria — it surfaces policy, it never invents it",
      "Billing prep: CPT/ICD capture from signed reports, with completeness checks and documentation-gap flags",
      "Sits on the wires a hospital already runs: FHIR/ORM orders and DICOM studies in; ORU/FHIR reports, DICOM C-STORE, and charge tickets out",
      "Organization is the hard tenant boundary, facility a scope inside it — authentication never equals access, and every request is re-checked",
    ],
    tryThis: [
      "Visit lumenfoundry.net and walk the diagnostic pipeline — the seven stages an exam moves through from EHR order to signed report.",
      "Read the AI Clinical Knowledge section to see why retrieval is bounded to facility-approved documents instead of open-ended generation.",
    ],
    links: {
      liveDemo: LINKS.lumenDemo,
      related: [
        { label: "Auth platform used by Lumen (Gait)", href: LINKS.djangoAuthRepo },
        { label: "Reusable logger (lumen-logger)", href: LINKS.lumenLoggerRepo },
      ],
    },
    badges: ["Healthcare", "DICOM / HL7", "Multi-Tenant", "In Progress"],
    featured: true,
    screenshot: {
      src: "/screenshots/lumen-slide-factory.jpg",
      alt: "The Lumen exam reporting factory and the seven vascular domains that plug into it",
      caption: "The platform and the pipeline are built once. The vascular engine plugs in at the end — and a second specialty would replace it without touching anything to its left.",
      slides: [
        {
          src: "/screenshots/lumen-slide-factory.jpg",
          alt: "The Lumen exam reporting factory: a shared platform of users, exam lifecycle, imaging, and integrations feeding a three-stage protocol → measure → interpret pipeline, with the vascular engine plugged in at the end contributing anatomy, rules, language, and schema, and a finished carotid duplex report coming out.",
          caption: "The platform and the pipeline are built once. The vascular engine plugs in at the end — and a second specialty would replace it without touching anything to its left.",
        },
        {
          src: "/screenshots/lumen-slide-engine.jpg",
          alt: "Seven vascular domains ringing a single vascular engine defined by anatomy, rules, language, and schema: peripheral arterial, cerebrovascular (carotid marked live), and visceral vascular on the left; dialysis access, physiologic arterial, and peripheral venous on the right; postoperative surveillance below.",
          caption: "Seven vascular domains ring one engine. Carotid is live today; the rest are configuration on the same pipeline, not separate applications.",
        },
        {
          src: "/screenshots/lumen-slide-interop.jpg",
          alt: "Lumen's connection points, drawn in two directions: inbound orders from EMRs over FHIR ServiceRequest/ORM and modality stills and cine over DICOM; outbound structured reports over ORU/FHIR, studies stored to PACS by DICOM C-STORE, routing through interface engines over HL7/ORU, and charge tickets to billing systems.",
          caption: "Two directions, not six equal boxes: orders and images in; signed report, stored study, and charges out. Lumen never invents a second patient context.",
        },
        {
          src: "/screenshots/lumen-slide-security.jpg",
          alt: "The five sentences that describe Lumen's authorization model: identity and authorization are separate systems; organization is the hard tenant boundary with facility a scope inside it; authentication never equals access; the client is never trusted to declare its own authority; automation observes and recommends while humans approve anything consequential.",
          caption: "The whole authorization model in five sentences. A valid login proves nothing on its own, and a human approves anything consequential.",
        },
      ],
    },
    architecture: {
      architecture:
        "Microservices split the work: exams, templates, and structured measurements in Django/DRF; DICOM objects and study metadata in an imaging service; protocol and criteria answers from a retrieval service reading facility-approved documents. Gait provides centralized identity and lumen-logger carries correlation IDs across every hop.",
    },
  },

  {
    id: "infra-packages",
    title: "Backend Building Blocks",
    description:
      "Reusable backend components extracted while building Lumen: centralized auth integration and shared structured logging for traceability across services.",
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
