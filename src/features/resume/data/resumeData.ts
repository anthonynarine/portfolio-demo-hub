// # Filename: src/features/resume/data/resumeData.ts

import { profileLinks } from "../../../data/projects";

export type ResumeProjectStatus = "Production" | "Live" | "In Development";
export type ResumeProjectWeight = "primary" | "standard" | "compact";

export type ResumeProject = {
  id: string;
  name: string;
  tagline: string;
  status: ResumeProjectStatus;
  stack: string[];
  bullets: string[];
  liveUrl?: string;
  liveLabel?: string;
  repoUrl?: string;
  repoLabel?: string;
  weight: ResumeProjectWeight;
};

export const resumeProfile = {
  name: "Anthony Narine",
  title: "Full-Stack Software Engineer",
  positioning: "Deterministic AI-Native Systems",
  capabilities:
    "SaaS Systems · Real-Time Applications · Authentication & Security · Healthcare Software",
  location: "Brooklyn, NY",
  email: profileLinks.email,
  github: profileLinks.github,
  githubLabel: "github.com/anthonynarine",
  linkedin: profileLinks.linkedin,
  linkedinLabel: "linkedin.com/in/anthony-narine-9ab567245",
  site: profileLinks.portfolio,
  siteLabel: "anthonynarine.com",
};

export const resumeSummary =
  "Full-stack software engineer designing and building production-oriented SaaS, real-time, security, healthcare, and AI-assisted systems with React, TypeScript, Python, Django, FastAPI, PostgreSQL, and Redis. Experienced in application architecture, multi-tenant authorization, REST APIs, authentication systems, transaction-safe financial workflows, WebSockets, and AI features grounded in verified application data. Brings 17 years of vascular ultrasound experience to healthcare software and clinical workflow design.";

export const resumeProjects: ResumeProject[] = [
  {
    id: "estateiq",
    name: "EstateIQ",
    tagline: "AI-Native Financial Operating System",
    status: "Production",
    stack: [
      "React",
      "TypeScript",
      "Django",
      "DRF",
      "PostgreSQL",
      "TanStack Query",
      "Stripe",
      "AWS S3/SES",
      "OpenAI",
    ],
    bullets: [
      "Designed and built a multi-tenant SaaS platform for small real estate portfolio owners, combining property, lease, tenant, expense, document, revenue, tax-readiness, and subscription workflows.",
      "Architected ledger-first financial workflows where charges, payments, and allocations remain source records and balances are derived rather than stored as mutable truth.",
      "Implemented organization-scoped authorization, Stripe subscription billing, plan enforcement, private document storage, and webhook-driven subscription state.",
      "Built an AI Copilot layer that analyzes deterministic portfolio and financial data so LLM output explains verified system records rather than inventing financial answers.",
    ],
    liveUrl: "https://estateiq.me",
    liveLabel: "estateiq.me",
    weight: "primary",
  },
  {
    id: "onevone",
    name: "OneVOne",
    tagline: "Real-Time Social Gaming & Poker Platform",
    status: "Live",
    stack: ["React", "Django", "DRF", "Django Channels", "Redis", "WebSockets", "JWT"],
    bullets: [
      "Built a server-driven real-time platform supporting multiplayer games, poker tables and tournaments, chat, friends, presence, invitations, direct messaging, and notifications.",
      "Implemented tournament registration, scheduled starts, roster management, automatic table creation, and tournament-to-game handoff workflows.",
      "Built multiplayer Texas Hold'em with configurable blinds, starting chip stacks, turn timers, and tables supporting up to nine players.",
      "Coordinated REST and WebSocket state so clients remain synchronized across gameplay, presence, social interactions, and reconnects.",
    ],
    liveUrl: "https://onevone.net",
    liveLabel: "onevone.net",
    repoUrl: "https://github.com/anthonynarine/tic_tac_toe",
    repoLabel: "github.com/anthonynarine/tic_tac_toe",
    weight: "primary",
  },
  {
    id: "gait",
    name: "Gait",
    tagline: "Authentication & Identity Platform",
    status: "Live",
    stack: ["Django", "DRF", "JWT", "2FA", "RBAC"],
    bullets: [
      "Designed and built a reusable authentication service supporting JWT access/refresh lifecycles, protected APIs, logout, password recovery, optional two-factor authentication, and role-based authorization.",
      "Created reusable integration patterns so downstream applications can consume centralized identity without duplicating authentication logic.",
    ],
    liveUrl: "https://gait.netlify.app",
    liveLabel: "gait.netlify.app",
    repoUrl: "https://github.com/anthonynarine/django_auth",
    repoLabel: "github.com/anthonynarine/django_auth",
    weight: "compact",
  },
  {
    id: "lumen",
    name: "Lumen",
    tagline: "Vascular Ultrasound Reporting Platform",
    status: "In Development",
    stack: [
      "React",
      "TypeScript",
      "Django",
      "DRF",
      "FastAPI",
      "PostgreSQL",
      "Redis",
      "RAG",
    ],
    bullets: [
      "Designing and building a modular vascular ultrasound reporting platform based on real clinical workflows and structured examination protocols.",
      "Building template-driven exam workflows, structured measurements, clinical calculations, and report-generation infrastructure.",
      "Architecting centralized authentication, shared observability, media storage, AI-assisted reference workflows, and HL7-oriented integration across services.",
      "Applying 17 years of vascular ultrasound experience to model clinical workflows, terminology, reporting requirements, and user needs.",
    ],
    weight: "standard",
  },
];

export const resumeSkillGroups = [
  { label: "Languages", items: ["Python", "TypeScript", "JavaScript", "SQL", "HTML", "CSS"] },
  {
    label: "Frontend",
    items: ["React", "Next.js", "Vite", "TanStack Query", "Axios", "Tailwind CSS"],
  },
  {
    label: "Backend",
    items: [
      "Django",
      "Django REST Framework",
      "FastAPI",
      "REST APIs",
      "Django Channels",
      "WebSockets",
      "Celery",
    ],
  },
  {
    label: "Data / Infrastructure",
    items: ["PostgreSQL", "Redis", "AWS S3", "AWS SES", "Docker", "Heroku", "Netlify", "Stripe"],
  },
  {
    label: "Security",
    items: ["JWT", "Access/Refresh Token Flows", "RBAC", "2FA", "Multi-Tenant Authorization"],
  },
  {
    label: "AI",
    items: [
      "OpenAI APIs",
      "RAG",
      "LangChain",
      "LangGraph",
      "Deterministic / Grounded Assistant Workflows",
    ],
  },
];

export const resumeExperience = [
  {
    company: "Mount Sinai Hospital",
    role: "Vascular Technologist",
    dates: "September 2013 – Present",
    bullets: [
      "Perform advanced noninvasive vascular ultrasound examinations in complex clinical environments, including evaluation of conditions such as fibromuscular dysplasia and thoracic outlet syndrome.",
      "Train junior vascular technologists and support consistent examination technique, documentation, and protocol standardization.",
      "Work within accuracy-sensitive clinical workflows where reliable data collection, communication, and standardized reporting directly affect patient care.",
    ],
  },
  {
    company: "Navix Diagnostix",
    role: "Vascular Technologist",
    dates: "January 2008 – August 2013",
    bullets: [] as string[],
  },
];

export const resumeEducation = [
  { school: "devCodeCamp", credential: "Full Stack Web Development Certificate", date: "March 2023" },
  {
    school: "Long Island University",
    credential: "Sonography in Vascular Technology",
    date: "September 2007",
  },
];
