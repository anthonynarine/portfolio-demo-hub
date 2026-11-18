# DICOM for Medical Application Developers

A practical engineering handbook and workbook, the companion to *HIPAA for Medical Application Developers*
(`/hipaa`). Written while learning DICOM networking for Lumen's imaging integration. The site's `/dicom` page
(`src/pages/DicomHandbookPage.tsx`, data in `src/data/dicomHandbook.ts`) presents it and serves the PDF.

## Build

Requires Node 20+ and Google Chrome (set `CHROME_PATH` for another Chromium). Fonts load from Google Fonts, so
the build needs a network connection.

```bash
npm ci
npm run build:dicom   # handbooks/dicom/dist/book.html and public/DICOM-for-Medical-Application-Developers.pdf
```

## Layout

- `book.json`: title, edition, the promise, the per-chapter loop, and the chapter order.
- `content/contents.md`: the planned table of contents. Mark drafted chapters `*(drafted)*`.
- `content/chapters/NN-slug.md`: one chapter each, with frontmatter (`number`, `title`, `objective`, `status`).
  `status: draft` prints a draft notice on the chapter.
- `styles/book.css`: the print design (matches the HIPAA handbook).
- `scripts/build-dicom-handbook.mjs` (at the site root): Markdown to HTML to PDF.

When a chapter is added, also update `src/data/dicomHandbook.ts` (its status in the contents) and rebuild the PDF.

Every chapter follows the same loop: **At the machine, On the wire, Lab, In Lumen, How it fails, Evidence**, then a
short **Workbook** of questions and a **Sources** line.

## Ground rules

1. **The author's voice, the author's understanding.** A chapter is written after its lesson and lab are done,
   drafted from the lesson, and rewritten by the author until it reads in his voice. Nothing goes in that he
   can't explain himself. Drafts stay marked `status: draft` until then.
2. **Checked against the standard.** Technical claims are verified in the DICOM Standard (NEMA PS3, current
   edition at dicom.nema.org) and cited in the chapter's Sources line, not written from memory.
3. **Synthetic only.** No patient data, real or realistic, in any figure, example, or lab file.
4. **Public-safe.** The book is published. No confidential Lumen or Foundry material (security triage,
   credentials, internal plans).
5. **Publishing**: a push to `main` deploys the live site, so nothing is pushed without the author's OK.
