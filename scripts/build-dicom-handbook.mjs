// Build the DICOM handbook: handbooks/dicom (book.json + Markdown chapters) -> handbooks/dicom/dist/book.html
// -> public/<pdf> via headless Chrome. The /dicom page serves that PDF.
//
//   npm run build:dicom
//
// CHROME_PATH overrides the browser (default: Google Chrome on macOS). Fonts load from Google Fonts,
// so building needs a network connection.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { marked } from "marked";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(site, "handbooks", "dicom");
const read = (path) => readFileSync(join(root, path), "utf8");
const book = JSON.parse(read("book.json"));

const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** `---` frontmatter (flat key: value lines) and the Markdown body. */
function parseChapter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("A chapter must start with --- frontmatter ---");
  const meta = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const at = line.indexOf(":");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
    })
  );
  return { meta, body: match[2] };
}

/** "DICOM for Medical Application Developers" -> serif title with the middle words italic. */
function coverTitle(title) {
  const [first, ...rest] = title.split(" for ");
  const words = rest.join(" for ").split(" ");
  const last = words.pop();
  return `${escape(first)}<br>for <em>${escape(words.join(" "))}</em><br>${escape(last)}`;
}

const cover = `
<section class="cover">
  <div class="label">${escape(book.kicker)}</div>
  <h1>${coverTitle(book.title)}</h1>
  <p class="strap">${escape(book.strapline)}</p>
  <div class="mark" aria-hidden="true">DCM</div>
  <div class="themes label">${book.themes.map((t) => `<span>${escape(t)}</span>`).join("")}</div>
  <div class="author">${escape(book.author)}</div>
  <div class="edition label">${escape(book.edition)} · ${escape(book.date)}</div>
</section>`;

const front = `
<section class="front">
  <h2>${escape(book.title)}</h2>
  <p><strong>Copyright © 2026 ${escape(book.author)}. All rights reserved.</strong><br>${escape(book.edition)}.</p>
  <p>This book is an educational engineering handbook. It is not a substitute for the DICOM Standard, a vendor's
  DICOM Conformance Statement, or your organization's PACS, biomedical engineering, and security teams. The DICOM
  Standard (NEMA PS3) controls wherever this book conflicts with it. Every image in this book is synthetic; no
  patient data appears anywhere.</p>
  <div class="promise">
    <div class="label">The engineering promise of this book</div>
    <p>${escape(book.promise)}</p>
  </div>
</section>`;

const contents = `
<section class="contents">
  <div class="loop">
    <div class="label">Every chapter runs the same loop<br>${book.loop.map(escape).join(" → ")}</div>
  </div>
  ${marked.parse(read("content/contents.md"))}
</section>`;

const chapters = book.chapters
  .map((path) => {
    const { meta, body } = parseChapter(read(path));
    const numeral = String(meta.number).padStart(2, "0");
    const draft =
      meta.status === "draft"
        ? `<div class="draft">Draft: written from our lesson notes, to be rewritten in the author's own voice before publishing.</div>`
        : "";
    return `
<section class="chapter">
  <div class="chapter-head"><span class="label">Chapter</span><span class="numeral">${numeral}</span></div>
  <h1>${escape(meta.title)}</h1>
  <div class="objective"><span class="label">Learning<br>objective</span><p>${escape(meta.objective)}</p></div>
  ${draft}
  ${marked.parse(body)}
</section>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escape(book.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&display=block" rel="stylesheet">
<style>${read("styles/book.css")}</style>
</head>
<body>
${cover}
${front}
${contents}
${chapters}
</body>
</html>`;

mkdirSync(join(root, "dist"), { recursive: true });
const htmlPath = join(root, "dist", "book.html");
writeFileSync(htmlPath, html);

const chrome = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pdfPath = join(site, "public", book.pdf);
execFileSync(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--virtual-time-budget=15000",
  `--print-to-pdf=${pdfPath}`,
  pathToFileURL(htmlPath).href,
], { stdio: "ignore" });
console.log(`built ${pdfPath}`);
