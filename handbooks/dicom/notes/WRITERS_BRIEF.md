# Writers' brief (not part of the book)

Every chapter file: `handbooks/dicom/content/chapters/NN-slug.md` (two-digit number, short kebab slug).

## Frontmatter (flat `key: value` lines only, no quotes, no colons inside values except the first)

```
---
number: 7
title: <exactly the title from content/contents.md>
objective: <one sentence: what the reader can do after this chapter>
status: draft
---
```

## Sections, in this order (same as Chapter 1)

`## At the machine` · `## On the wire` (with `###` subsections) · `## Lab` · `## In Lumen` · `## How it fails` ·
`## Evidence` · `## Workbook` (3 to 5 numbered questions) · `## Answers` (numbered, one per question, 2 to 5
sentences each, explaining why and pointing back to the section or figure) · then one closing line:
`<p class="sources">Sources: ...</p>`

- Length: about 1,800 to 3,000 words. Teach for a reader who is a developer, or a technologist learning to develop,
  with no prior DICOM knowledge beyond the earlier chapters. Build on earlier chapters; do not re-teach them, point
  back ("Chapter 5 showed...").
- "At the machine" opens from the technologist's or department's side: what you see or do at the scanner, the
  reading room, or PACS. Write it in second person or as general practice. Do NOT invent first-person anecdotes or
  personal history for the author.
- Markdown: headings, lists, tables, fenced code blocks (```bash, ```python, ```text). For term/definition pairs you
  may use the HTML block from Chapter 1: `<div class="pairs"><div><span>TERM</span><p>Definition.</p></div></div>`
  (keep everything inside one block on consecutive lines, no blank lines inside).
- Labs must be runnable on a laptop with no scanner: Docker Orthanc, DCMTK (`brew install dcmtk` / apt `dcmtk`),
  Python with pydicom / pynetdicom. Pin versions in install commands (pydicom 3.0.1, pynetdicom 3.0.1 (2.x requires pydicom 2.4, so never pin pynetdicom 2.x with pydicom 3), Orthanc image
  `orthancteam/orthanc:24.10.1` unless you verify a different existing tag). Check command flags against the tools'
  own documentation; if you cannot verify a flag, do not use it. Labs use synthetic data only and say so.

## Accuracy

- Verify every technical claim (UIDs, tag numbers, VRs, status codes, PDU types, port numbers, template IDs, profile
  names, section numbers) against the current DICOM Standard at https://dicom.nema.org/medical/dicom/current/output/html/
  (PS3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.15, 3.16, 3.18 ...), or against the tool's official docs for tool behavior.
  Use WebFetch. If you cannot verify a detail, leave it out rather than guess.
- Cite the parts/sections you relied on in the Sources line.

## Public-safe content (the book is published on the author's website)

- Synthetic data only: patient names like `TEST^PATIENT`, MRNs like `DEMO-0001`, accession `ACC-0001`, example
  hosts `gateway.example.org`, IPs from 192.0.2.0/24 or 10.x. No real institutions, vendors' customers, or people.
  Naming product categories and well-known open-source tools (Orthanc, DCMTK, dcm4chee, pydicom) is fine; do not
  disparage or make claims about specific commercial vendors.
- "In Lumen": Lumen is the author's vascular ultrasound reporting platform (public portfolio project). What is true
  today and may be said: a Reports service (Django) holds exams, measurements and signed reports; a Media service
  (FastAPI) stores images in S3-compatible object storage with the database row as the source of truth; images
  currently arrive only by browser upload into an exam (stills, cine, DICOM files), and a technologist can cut a
  labelled snip from an image for the Final Report; every request is scoped to an organization and facility.
  Everything about receiving images from machines is PLANNED: say "planned" / "the design" clearly. The planned
  design: machine -C-STORE-> a gateway inside the facility (e.g. Orthanc) -> HTTPS STOW-RS with mutual TLS -> a Lumen
  ingest endpoint -> Media. The organization comes from the gateway's credential, never from tags. Images match an
  exam by Accession Number; anything unmatched goes to a hold queue for a person to resolve. A device/service
  identity is needed for the gateway. Do not mention internal security findings, credentials, hostnames, task IDs,
  Foundry, Gait, or team process.
- No HIPAA legal advice; point to the companion HIPAA handbook where relevant.

## Do not

Edit any file other than your own chapter files. Do not run git commands that change history, do not push.

## Diagrams (required: 1 to 3 per chapter)

Draw the mechanism the chapter teaches: who calls whom, the message sequence, the file layout, the data flow, a
state machine, a before/after. Not decoration. Label every arrow with what it carries (`C-STORE`, `A-ASSOCIATE-RQ`,
`STOW-RS over mTLS`).

Hand-written inline SVG, placed as one HTML block (NO blank lines anywhere inside it, or Markdown breaks it):

```html
<figure class="diagram">
<svg viewBox="0 0 720 260" role="img" aria-label="Same sentence as the caption">
<defs><marker id="ch07-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="40" width="160" height="56" rx="4" class="box"/>
<text x="100" y="73" text-anchor="middle">Ultrasound</text>
<line x1="180" y1="68" x2="320" y2="68" marker-end="url(#ch07-arrow)"/>
<text x="250" y="60" text-anchor="middle" class="small">C-STORE</text>
<rect x="320" y="40" width="160" height="56" rx="4" class="box accent"/>
</svg>
<figcaption>Figure 7.1 — What the picture shows, in one sentence.</figcaption>
</figure>
```

- The page's stylesheet colors the SVG (light/dark aware): text, lines and arrows use the text color; `class="box"`
  is a framed panel; add `accent` to at most one or two elements that carry the point; `class="small"` for arrow
  labels; `class="muted"` for secondary text; `class="dashed"` for optional/async/planned paths. Do not put
  `fill`/`stroke`/`style`/`font` attributes on shapes or text (only the marker path's `fill="currentColor"`), no
  `<style>`, `<script>`, `<foreignObject>`, images or external references.
- Marker ids must be unique across the whole book: prefix with the chapter number (`ch07-arrow`).
- viewBox width 720 (the page scales it); height as needed. Text size is set by CSS (about 13px at 720 wide), so keep
  labels to a few words, boxes at least 120 wide for two words. Align on a grid; even gaps.
- Sequence diagrams: two or three vertical lifelines (`line` with class="dashed"), horizontal labelled arrows going
  down the page in order.
- Number figures `Figure N.k` and refer to them in the text.
