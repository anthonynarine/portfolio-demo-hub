// # Filename: scripts/generate-designed-resume.mjs
//
// Generates public/Anthony-Narine-Resume-Designed.pdf: the styled /resume page
// captured as a real file, so visitors get a one-click download instead of
// having to route window.print() through "Save as PDF" themselves.
//
// Unlike the ATS script (a standalone HTML template), this renders the live
// React page: it boots the Vite dev server, points a headless Chrome at
// /resume and prints it with the page's own @media print rules (src/index.css),
// so the PDF always matches what "Print / Save PDF" produced. Driven over the
// DevTools Protocol for the same reason as the ATS script — to force
// displayHeaderFooter:false.
//
// Requires the `chrome-remote-interface` package. It is intentionally NOT a
// project dependency — install it ad hoc before running, e.g.:
// npm install --no-save chrome-remote-interface
//
// Re-run after editing src/features/resume/data/resumeData:
//
//   node scripts/generate-designed-resume.mjs

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
const outputPath = join(projectRoot, "public", "Anthony-Narine-Resume-Designed.pdf");
const vitePort = 5199;
const resumeUrl = `http://127.0.0.1:${vitePort}/resume`;
const debugPort = 9523;
const tmpDir = mkdtempSync(join(tmpdir(), "designed-resume-"));

// Run Vite's bin through node directly (no shell) so chrome.kill()-style
// cleanup actually stops the server on Windows.
const vite = spawn(
  process.execPath,
  [join(projectRoot, "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"],
  { cwd: projectRoot, stdio: "ignore" }
);

// A fresh --user-data-dir means no saved theme in localStorage, so the page
// renders in its default light mode before the print rules even apply.
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    `--user-data-dir=${join(tmpDir, "profile")}`,
    "--no-first-run",
    "--no-sandbox",
    `--remote-debugging-port=${debugPort}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

async function waitFor(check, label, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await check()) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

async function main() {
  await waitFor(async () => (await fetch(resumeUrl)).ok, "the Vite dev server");
  await waitFor(async () => {
    const probe = await CDP({ port: debugPort });
    await probe.close();
    return true;
  }, "Chrome DevTools Protocol");

  const client = await CDP({ port: debugPort });
  const { Page, Runtime } = client;
  await Page.enable();
  await Page.navigate({ url: resumeUrl });
  await Page.loadEventFired();

  // React renders after load, and Fraunces comes from Google Fonts — wait for
  // both so the PDF never captures an empty root or a fallback serif.
  await waitFor(async () => {
    const { result } = await Runtime.evaluate({
      expression: "document.querySelector('.resume-page') !== null",
      returnByValue: true,
    });
    return result.value === true;
  }, "the resume page to render");
  await Runtime.evaluate({ expression: "document.fonts.ready.then(() => true)", awaitPromise: true });

  const { data } = await Page.printToPDF({
    printBackground: true,
    displayHeaderFooter: false,
    // Honour the @page { size: letter; margin: 0.55in } rule in src/index.css.
    preferCSSPageSize: true,
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
  vite.kill();
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
