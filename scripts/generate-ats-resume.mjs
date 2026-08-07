// # Filename: scripts/generate-ats-resume.mjs
//
// Generates public/Anthony-Narine-Resume.pdf: a plain, single-column,
// ATS-parser-safe resume (no icons, no color, no multi-column layout).
// Drives the machine's local Chrome over the DevTools Protocol (Page.printToPDF)
// so we can force displayHeaderFooter:false — Chrome's CLI --print-to-pdf has no
// flag for that and defaults to on, stamping a date/URL/page-number header.
//
// Requires the `chrome-remote-interface` package. It is intentionally NOT a
// project dependency (not imported by the app) — install it ad hoc before
// running, e.g.: npm install --no-save chrome-remote-interface
//
// Re-run after editing the content below (kept as a standalone template,
// matching this project's existing convention of a hand-maintained static
// resume asset):
//
//   node scripts/generate-ats-resume.mjs

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import CDP from "chrome-remote-interface";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
];

const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error("Could not find a local Chrome install. Aborting.");
  process.exit(1);
}

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const outputPath = join(projectRoot, "public", "Anthony-Narine-Resume.pdf");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Anthony Narine Resume</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 20px 34px;
        background: #ffffff;
        color: #111827;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 13.5px;
        line-height: 1.5;
      }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 26px; letter-spacing: -0.02em; }
      .contact { margin-top: 6px; color: #374151; font-size: 12.5px; }
      .summary { margin-top: 14px; color: #1f2937; }
      h2 {
        margin-top: 20px;
        padding-bottom: 4px;
        border-bottom: 1px solid #9ca3af;
        font-size: 12.5px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #111827;
      }
      .item { margin-top: 13px; page-break-inside: avoid; }
      .item h3 { font-size: 14px; }
      .meta { margin-top: 2px; color: #4b5563; font-size: 12px; }
      ul { margin: 6px 0 0; padding-left: 18px; }
      li { margin-top: 4px; }
      .skills p { margin-top: 6px; }
      .skills .label { font-weight: 700; }
    </style>
  </head>
  <body>
    <header>
      <h1>Anthony Narine</h1>
      <p class="contact">
        Full-Stack Software Engineer &nbsp;|&nbsp;
        Brooklyn, NY &nbsp;|&nbsp;
        fanarine@pm.me &nbsp;|&nbsp;
        github.com/anthonynarine &nbsp;|&nbsp;
        linkedin.com/in/anthony-narine-9ab567245 &nbsp;|&nbsp;
        anthonynarine.com
      </p>
      <p class="summary">
        Full-stack software engineer designing and building production-oriented SaaS, real-time, security,
        healthcare, and AI-assisted systems with React, TypeScript, Python, Django, FastAPI, PostgreSQL, and
        Redis. Experienced in application architecture, multi-tenant authorization, REST APIs, authentication
        systems, transaction-safe financial workflows, WebSockets, and AI features grounded in verified
        application data. Brings 17 years of vascular ultrasound experience to healthcare software and
        clinical workflow design.
      </p>
    </header>

    <section class="skills">
      <h2>Technical Skills</h2>
      <p><span class="label">Languages:</span> Python, TypeScript, JavaScript, SQL, HTML, CSS</p>
      <p><span class="label">Frontend:</span> React, Next.js, Vite, TanStack Query, Axios, Tailwind CSS</p>
      <p><span class="label">Backend:</span> Django, Django REST Framework, FastAPI, REST APIs, Django Channels, WebSockets, Celery</p>
      <p><span class="label">Data / Infrastructure:</span> PostgreSQL, Redis, AWS S3, AWS SES, Docker, Heroku, Netlify, Stripe</p>
      <p><span class="label">Security:</span> JWT, access/refresh token flows, RBAC, 2FA, multi-tenant authorization</p>
      <p><span class="label">AI:</span> OpenAI APIs, RAG, LangChain, LangGraph, deterministic / grounded assistant workflows</p>
    </section>

    <section>
      <h2>Selected Systems</h2>

      <div class="item">
        <h3>EstateIQ &mdash; AI-Native Financial Operating System (Production)</h3>
        <p class="meta">React, TypeScript, Django, DRF, PostgreSQL, TanStack Query, Stripe, AWS S3/SES, OpenAI &nbsp;|&nbsp; estateiq.me</p>
        <ul>
          <li>Designed and built a multi-tenant SaaS platform for small real estate portfolio owners, combining property, lease, tenant, expense, document, revenue, tax-readiness, and subscription workflows.</li>
          <li>Architected ledger-first financial workflows where charges, payments, and allocations remain source records and balances are derived rather than stored as mutable truth.</li>
          <li>Implemented organization-scoped authorization, Stripe subscription billing, plan enforcement, private document storage, and webhook-driven subscription state.</li>
          <li>Built an AI Copilot layer that analyzes deterministic portfolio and financial data so LLM output explains verified system records rather than inventing financial answers.</li>
        </ul>
      </div>

      <div class="item">
        <h3>OneVOne &mdash; Real-Time Social Gaming &amp; Poker Platform (Live)</h3>
        <p class="meta">React, Django, DRF, Django Channels, Redis, WebSockets, JWT &nbsp;|&nbsp; onevone.net &nbsp;|&nbsp; github.com/anthonynarine/tic_tac_toe</p>
        <ul>
          <li>Built a server-driven real-time platform supporting multiplayer games, poker tables and tournaments, chat, friends, presence, invitations, direct messaging, and notifications.</li>
          <li>Implemented tournament registration, scheduled starts, roster management, automatic table creation, and tournament-to-game handoff workflows.</li>
          <li>Built multiplayer Texas Hold'em with configurable blinds, starting chip stacks, turn timers, and tables supporting up to nine players.</li>
          <li>Coordinated REST and WebSocket state so clients remain synchronized across gameplay, presence, social interactions, and reconnects.</li>
        </ul>
      </div>

      <div class="item">
        <h3>Gait &mdash; Authentication &amp; Identity Platform (Live)</h3>
        <p class="meta">Django, DRF, JWT, 2FA, RBAC &nbsp;|&nbsp; gait.netlify.app &nbsp;|&nbsp; github.com/anthonynarine/django_auth</p>
        <ul>
          <li>Designed and built a reusable authentication service supporting JWT access/refresh lifecycles, protected APIs, logout, password recovery, optional two-factor authentication, and role-based authorization.</li>
          <li>Created reusable integration patterns so downstream applications can consume centralized identity without duplicating authentication logic.</li>
        </ul>
      </div>

      <div class="item">
        <h3>Lumen &mdash; Vascular Ultrasound Reporting Platform (In Development)</h3>
        <p class="meta">React, TypeScript, Django, DRF, FastAPI, PostgreSQL, Redis, RAG</p>
        <ul>
          <li>Designing and building a modular vascular ultrasound reporting platform based on real clinical workflows and structured examination protocols.</li>
          <li>Building template-driven exam workflows, structured measurements, clinical calculations, and report-generation infrastructure.</li>
          <li>Architecting centralized authentication, shared observability, media storage, AI-assisted reference workflows, and HL7-oriented integration across services.</li>
          <li>Applying 17 years of vascular ultrasound experience to model clinical workflows, terminology, reporting requirements, and user needs.</li>
        </ul>
      </div>
    </section>

    <section>
      <h2>Professional Experience</h2>

      <div class="item">
        <h3>Mount Sinai Hospital &mdash; Vascular Technologist</h3>
        <p class="meta">September 2013 &ndash; Present</p>
        <ul>
          <li>Perform advanced noninvasive vascular ultrasound examinations in complex clinical environments, including evaluation of conditions such as fibromuscular dysplasia and thoracic outlet syndrome.</li>
          <li>Train junior vascular technologists and support consistent examination technique, documentation, and protocol standardization.</li>
          <li>Work within accuracy-sensitive clinical workflows where reliable data collection, communication, and standardized reporting directly affect patient care.</li>
        </ul>
      </div>

      <div class="item">
        <h3>Navix Diagnostix &mdash; Vascular Technologist</h3>
        <p class="meta">January 2008 &ndash; August 2013</p>
      </div>
    </section>

    <section>
      <h2>Education</h2>
      <div class="item">
        <h3>devCodeCamp</h3>
        <p class="meta">Full Stack Web Development Certificate &nbsp;|&nbsp; March 2023</p>
      </div>
      <div class="item">
        <h3>Long Island University</h3>
        <p class="meta">Sonography in Vascular Technology &nbsp;|&nbsp; September 2007</p>
      </div>
    </section>
  </body>
</html>
`;

const tmpDir = mkdtempSync(join(tmpdir(), "ats-resume-"));
const htmlPath = join(tmpDir, "resume.html");
const profileDir = join(tmpDir, "profile");
const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
const debugPort = 9522;
writeFileSync(htmlPath, html, "utf8");

// A fresh --user-data-dir + explicit debugging port forces a genuinely separate
// headless process instead of attaching to any already-running Chrome window.
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-sandbox",
    `--remote-debugging-port=${debugPort}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

async function waitForDebugger(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await CDP({ port: debugPort });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw new Error("Timed out waiting for Chrome DevTools Protocol.");
}

async function main() {
  await waitForDebugger();
  const client = await CDP({ port: debugPort });
  const { Page } = client;
  await Page.enable();
  await Page.navigate({ url: fileUrl });
  await Page.loadEventFired();

  const { data } = await Page.printToPDF({
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: false,
    paperWidth: 8.5,
    paperHeight: 11,
    marginTop: 0.4,
    marginBottom: 0.4,
    marginLeft: 0.4,
    marginRight: 0.4,
  });

  writeFileSync(outputPath, Buffer.from(data, "base64"));
  await client.close();
}

try {
  await main();
  console.log(`Wrote ${outputPath}`);
} catch (err) {
  console.error("PDF generation failed.", err);
  process.exitCode = 1;
} finally {
  chrome.kill();
  // Give the Windows Chrome process a moment to release its profile-directory
  // file locks before we try to delete them.
  await new Promise((r) => setTimeout(r, 500));
  try {
    rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    // Best-effort cleanup only; a leftover OS temp dir is harmless.
  }
}

if (!existsSync(outputPath)) {
  console.error("Output file was not created.");
  process.exit(1);
}
