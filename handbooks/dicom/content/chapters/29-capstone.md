---
number: 29
title: Capstone: a study from order to signed report
objective: Walk one synthetic carotid study through the whole system, naming at each step the identifier that carries it, the protocol that moves it, how it fails, and the evidence that proves it worked.
status: draft
---

## At the machine

A bilateral carotid duplex, booked for the morning. From your side as the technologist it is an ordinary study: the patient is on the worklist, you select them, you scan both sides, you measure, you press End Exam. A physician reads it before lunch and signs it.

Chapter 1 asked what happens in the moment after you press that button. Twenty-eight chapters later, you can answer for the whole morning, not just the moment. This chapter follows one study, every step of the way, the way you would walk a new engineer, an auditor, or a hospital's integration team through it. All data is synthetic:

| | Synthetic value |
|---|---|
| Patient's Name | `TEST^CAROTID` |
| Patient ID (MRN) | `DEMO-2901` |
| Accession Number | `ACC-2901` |
| Exam | Carotid duplex, bilateral |
| Facility | one facility of one organization, its gateway `gateway.example.org` |

Some of this is running today and some is the planned design from Chapters 21 and 22. Each step says which.

## On the wire

### The whole system on one page

<figure class="diagram">
<svg viewBox="0 0 720 410" role="img" aria-label="End-to-end map: the EHR's order becomes a worklist entry and an exam in Lumen; the machine queries the worklist, reports MPPS, and sends C-STORE to the facility gateway, which sends STOW-RS over mutual TLS to Lumen's ingest; ingest stores and matches through Media; snips go into the report in Reports; the signed report goes back to the EHR, which is planned.">
<defs><marker id="ch29-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="8" y="24" width="704" height="150" rx="6" class="dashed"/>
<text x="20" y="44" class="muted small">Facility</text>
<rect x="24" y="70" width="130" height="56" rx="4" class="box"/>
<text x="89" y="103" text-anchor="middle">EHR</text>
<line x1="154" y1="98" x2="204" y2="98" marker-end="url(#ch29-arrow)"/>
<text x="179" y="90" text-anchor="middle" class="small">order</text>
<rect x="204" y="70" width="130" height="56" rx="4" class="box"/>
<text x="269" y="103" text-anchor="middle">RIS / worklist</text>
<line x1="384" y1="88" x2="334" y2="88" marker-end="url(#ch29-arrow)"/>
<text x="359" y="80" text-anchor="middle" class="small">C-FIND</text>
<line x1="384" y1="110" x2="334" y2="110" marker-end="url(#ch29-arrow)"/>
<text x="359" y="124" text-anchor="middle" class="small">MPPS</text>
<rect x="384" y="70" width="130" height="56" rx="4" class="box"/>
<text x="449" y="103" text-anchor="middle">Ultrasound</text>
<line x1="514" y1="98" x2="564" y2="98" marker-end="url(#ch29-arrow)"/>
<text x="539" y="90" text-anchor="middle" class="small">C-STORE</text>
<rect x="564" y="70" width="130" height="56" rx="4" class="box"/>
<text x="629" y="103" text-anchor="middle">Gateway</text>
<rect x="8" y="210" width="704" height="190" rx="6" class="dashed"/>
<text x="20" y="230" class="muted small">Lumen</text>
<line x1="629" y1="126" x2="629" y2="262" marker-end="url(#ch29-arrow)" class="accent"/>
<text x="621" y="196" text-anchor="end" class="small">STOW-RS, mTLS</text>
<rect x="544" y="262" width="150" height="56" rx="4" class="box accent"/>
<text x="619" y="295" text-anchor="middle">Ingest</text>
<text x="619" y="340" text-anchor="middle" class="muted small">org from certificate</text>
<line x1="544" y1="290" x2="436" y2="290" marker-end="url(#ch29-arrow)"/>
<text x="490" y="282" text-anchor="middle" class="small">store + match</text>
<rect x="286" y="262" width="150" height="56" rx="4" class="box"/>
<text x="361" y="295" text-anchor="middle">Media</text>
<text x="361" y="340" text-anchor="middle" class="muted small">files + rows</text>
<line x1="286" y1="290" x2="174" y2="290" marker-end="url(#ch29-arrow)"/>
<text x="230" y="282" text-anchor="middle" class="small">snips</text>
<rect x="24" y="262" width="150" height="56" rx="4" class="box"/>
<text x="99" y="295" text-anchor="middle">Reports</text>
<text x="99" y="340" text-anchor="middle" class="muted small">exam, signed report</text>
<line x1="74" y1="126" x2="74" y2="262" marker-end="url(#ch29-arrow)"/>
<text x="66" y="196" text-anchor="end" class="small">exam</text>
<line x1="124" y1="262" x2="124" y2="126" marker-end="url(#ch29-arrow)" class="dashed"/>
<text x="132" y="196" class="small">signed report (planned)</text>
</svg>
<figcaption>Figure 29.1 — The book on one page. DICOM stays inside the facility; one authenticated HTTPS hop crosses into Lumen; the dashed path back to the EHR is planned.</figcaption>
</figure>

### The identifier chain

One study is held together by a chain of identifiers. Every step below hands one link to the next. If you can follow the chain, you can find anything; if a link breaks, that is where the study goes missing.

<figure class="diagram">
<svg viewBox="0 0 720 200" role="img" aria-label="The identifier chain: the accession number of the order is copied into the study; the study's UID groups the images' SOP Instance UIDs; each image is stored as a media row; snips are cut from those rows; snips are placed in the signed report.">
<defs><marker id="ch29-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="160" height="60" rx="4" class="box accent"/>
<text x="100" y="44" text-anchor="middle">Order</text>
<text x="100" y="64" text-anchor="middle" class="muted small">ACC-2901</text>
<line x1="180" y1="50" x2="260" y2="50" marker-end="url(#ch29-arrow2)"/>
<text x="220" y="42" text-anchor="middle" class="small">copied to</text>
<rect x="260" y="20" width="160" height="60" rx="4" class="box"/>
<text x="340" y="44" text-anchor="middle">Study</text>
<text x="340" y="64" text-anchor="middle" class="muted small">Study Instance UID</text>
<line x1="420" y1="50" x2="500" y2="50" marker-end="url(#ch29-arrow2)"/>
<text x="460" y="42" text-anchor="middle" class="small">contains</text>
<rect x="500" y="20" width="160" height="60" rx="4" class="box"/>
<text x="580" y="44" text-anchor="middle">Images</text>
<text x="580" y="64" text-anchor="middle" class="muted small">SOP Instance UIDs</text>
<line x1="580" y1="80" x2="580" y2="120" marker-end="url(#ch29-arrow2)"/>
<text x="588" y="104" class="small">stored as</text>
<rect x="500" y="120" width="160" height="60" rx="4" class="box"/>
<text x="580" y="144" text-anchor="middle">Media rows</text>
<text x="580" y="164" text-anchor="middle" class="muted small">row id, no PHI in key</text>
<line x1="500" y1="150" x2="420" y2="150" marker-end="url(#ch29-arrow2)"/>
<text x="460" y="142" text-anchor="middle" class="small">cut into</text>
<rect x="260" y="120" width="160" height="60" rx="4" class="box"/>
<text x="340" y="144" text-anchor="middle">Snips</text>
<text x="340" y="164" text-anchor="middle" class="muted small">label, source image</text>
<line x1="260" y1="150" x2="180" y2="150" marker-end="url(#ch29-arrow2)"/>
<text x="220" y="142" text-anchor="middle" class="small">placed in</text>
<rect x="20" y="120" width="160" height="60" rx="4" class="box accent"/>
<text x="100" y="144" text-anchor="middle">Signed report</text>
<text x="100" y="164" text-anchor="middle" class="muted small">version, signer, time</text>
</svg>
<figcaption>Figure 29.2 — The identifier chain from order to signed report. Each box is something you can look up; each arrow is a link you can prove.</figcaption>
</figure>

### Step 1 — The order

<div class="pairs">
<div><span>What happens</span><p>A provider orders the carotid duplex in the EHR. The order gets Accession Number <code>ACC-2901</code> for MRN <code>DEMO-2901</code>, reaches the department's scheduling system, and becomes an exam in Lumen.</p></div>
<div><span>Identifier</span><p>Accession Number, the key every later step matches on (Chapter 3).</p></div>
<div><span>Protocol</span><p>Orders travel as HL7 messages, not DICOM, and how an order reaches Lumen is outside this book. The companion HIPAA handbook covers securing HL7 interfaces; this book picks up at the worklist.</p></div>
<div><span>Can fail</span><p>The order never arrives, arrives late (an add-on), or arrives twice with the same accession.</p></div>
<div><span>Evidence</span><p>The order record and the exam in Lumen carrying <code>ACC-2901</code>, in the right organization and facility.</p></div>
</div>

### Step 2 — The worklist

<div class="pairs">
<div><span>What happens</span><p>The machine queries the worklist (Modality Worklist, a C-FIND, Chapter 8). You select <code>TEST^CAROTID</code>. The machine copies the patient and order details into the study.</p></div>
<div><span>Identifier</span><p>Patient ID, Patient's Name and Accession Number copied from the worklist entry; the Study Instance UID, either from the worklist or generated by the machine (Chapter 11).</p></div>
<div><span>Protocol</span><p>DICOM C-FIND against the Basic Worklist Management service (PS3.4 Annex K), from the machine to the worklist provider (Chapters 4, 5, 7).</p></div>
<div><span>Can fail</span><p>The worklist is down and the study is entered by hand (no accession); the wrong patient is selected from a long list.</p></div>
<div><span>Evidence</span><p>The worklist provider's query log, and the selected entry's values in the first image's header.</p></div>
</div>

### Step 3 — The scan and MPPS

<div class="pairs">
<div><span>What happens</span><p>When you start, the machine sends MPPS N-CREATE with Performed Procedure Step Status (0040,0252) <code>IN PROGRESS</code>; when you finish, an N-SET to <code>COMPLETED</code> (or <code>DISCONTINUED</code> if the study is abandoned).</p></div>
<div><span>Identifier</span><p>The performed procedure step, which references the scheduled step and the study.</p></div>
<div><span>Protocol</span><p>DICOM N-CREATE and N-SET, Modality Performed Procedure Step (PS3.4 Annex F, Chapter 8).</p></div>
<div><span>Can fail</span><p>MPPS isn't configured, so the department can't see the study is done; a discontinued study looks like a missing one.</p></div>
<div><span>Evidence</span><p>The MPPS record with both status changes and their times.</p></div>
</div>

### Step 4 — End Exam: C-STORE to the gateway

<div class="pairs">
<div><span>What happens</span><p>The machine opens an association with the facility gateway, negotiates presentation contexts for ultrasound stills and cine (Chapters 5, 6), and sends one C-STORE per object (Chapter 7). Optionally it asks for storage commitment before deleting its local copy (Chapter 9).</p></div>
<div><span>Identifier</span><p>Each image's SOP Instance UID (0008,0018), all sharing one Study Instance UID (0020,000D).</p></div>
<div><span>Protocol</span><p>DICOM upper layer over TCP, on the facility network only (Chapters 15, 16).</p></div>
<div><span>Can fail</span><p>Association rejected (unknown calling AE title), a presentation context refused (cine compression not accepted), the gateway out of disk space (an <code>A7xx</code> status).</p></div>
<div><span>Evidence</span><p>The machine's send log and the gateway's receive log showing the same instance count.</p></div>
</div>

### Step 5 — STOW-RS to Lumen (planned)

<div class="pairs">
<div><span>What happens</span><p>The gateway forwards the study to Lumen's ingest endpoint with STOW-RS over mutual TLS (Chapters 19, 20, 21). Ingest authenticates the gateway's certificate, resolves the organization and facility from it, validates each object, and Media stores the original and its row.</p></div>
<div><span>Identifier</span><p>The gateway identity (who sent it); the SOP Instance UID (idempotency key); the media row id (Lumen's own handle).</p></div>
<div><span>Protocol</span><p>HTTPS, <code>multipart/related; type="application/dicom"</code>, PS3.18 §10.5.</p></div>
<div><span>Can fail</span><p>An expired gateway certificate (nothing arrives); a partial batch (<code>202</code>, some instances failed); retries after a timeout (duplicates must be harmless).</p></div>
<div><span>Evidence</span><p>The STOW response listing every SOP Instance UID; one media row per instance in the right organization; audit events without PHI.</p></div>
</div>

### Step 6 — Matching (planned)

<div class="pairs">
<div><span>What happens</span><p>Each stored instance is matched to the exam with <code>ACC-2901</code> in that facility, after checking Patient ID <code>DEMO-2901</code> against the exam's MRN (Chapter 22).</p></div>
<div><span>Identifier</span><p>Accession Number as the key, Patient ID as the cross-check.</p></div>
<div><span>Protocol</span><p>None on the wire: a rule inside Lumen, within the organization the credential resolved (Chapter 17).</p></div>
<div><span>Can fail</span><p>No accession (Step 2 was manual), no exam yet (Step 1 was late), an identity conflict (wrong patient selected in Step 2). All three end in the hold queue, never a guess.</p></div>
<div><span>Evidence</span><p>Every instance in state "matched" to the one exam, or a hold-queue item resolved by a named person with the reason recorded.</p></div>
</div>

### Step 7 — Review and snips (running today)

<div class="pairs">
<div><span>What happens</span><p>The images appear in the exam's image pane, as browser renditions made from the stored originals (Chapter 12). The technologist cuts labelled snips (a proximal ICA still, for example) and places them in the Final Report.</p></div>
<div><span>Identifier</span><p>Each snip is its own stored image, linked to the image it was cut from, with its label and crop.</p></div>
<div><span>Protocol</span><p>Lumen's own authenticated web application, scoped to the organization and facility.</p></div>
<div><span>Can fail</span><p>The wrong frame or side snipped; a label that doesn't match the image.</p></div>
<div><span>Evidence</span><p>The snip's link to its source image, its label, and the report showing it.</p></div>
</div>

Today, images reach this step by browser upload into the exam; with the planned design, Steps 4 to 6 deliver them instead and nothing changes from here on.

### Step 8 — The physician signs (running today)

<div class="pairs">
<div><span>What happens</span><p>The reading physician reviews the measurements, images and snips, and signs. The signed report is a fixed version: what was signed is what stays.</p></div>
<div><span>Identifier</span><p>The signed report version, the signer and the time.</p></div>
<div><span>Can fail</span><p>An image arrives after signing. The design holds it (reason <code>exam_signed</code>) rather than silently changing what the physician signed against (Chapter 22).</p></div>
<div><span>Evidence</span><p>The signed version, which matches what the physician saw.</p></div>
</div>

### Step 9 — The report goes back (planned)

<div class="pairs">
<div><span>What happens</span><p>The signed report returns to the EHR, against the same accession, so the ordering provider sees the result.</p></div>
<div><span>Protocol</span><p>An HL7 result message or a document, an interface outside this book's scope (see the HIPAA handbook).</p></div>
<div><span>Can fail</span><p>Sent but never acknowledged; sent to the wrong order.</p></div>
<div><span>Evidence</span><p>The receiving system's acknowledgement, tied to <code>ACC-2901</code>.</p></div>
</div>

### The five questions, answered for this study

The book promised that by the end you could answer five questions about any imaging integration. For `ACC-2901`:

1. **Who is calling whom?** The machine calls the worklist provider (C-FIND, MPPS) and the gateway (C-STORE), all inside the facility. The gateway calls Lumen (STOW-RS over mutual TLS). Nothing outside calls into the facility.
2. **What is being sent, and in what form?** Ultrasound stills and multi-frame cine as DICOM objects, in transfer syntaxes negotiated per association; then the same objects as Part 10 files in a multipart HTTPS body.
3. **How does each image find its patient and exam?** Accession Number, copied from the worklist into every image, matched within the organization and facility, cross-checked against Patient ID; anything else goes to a person.
4. **Who is allowed to send, and how do we know?** Only a gateway holding a registered certificate, proven in the TLS handshake. The organization comes from that registration, never from the tags.
5. **What evidence proves an image landed where it belongs?** The STOW response listing its SOP Instance UID, its media row in the right organization, its match to the exam (or a resolved hold item), and the audit trail connecting them, with no PHI in the logs.

### Self-assessment

Score yourself honestly: **2** if you could explain it to a colleague and show the evidence, **1** if you could explain it but not show it, **0** if not yet. Anything below 2 points to the chapter to reread.

| # | I can... | Chapters | Score |
|---|---|---|---|
| 1 | Name every AE, its title, IP and port, for one study at my lab | 1, 4 | |
| 2 | Read an association log and say why it was accepted or rejected | 5, 6 | |
| 3 | Explain C-ECHO, C-STORE, C-FIND and C-MOVE, and which side calls which | 7 | |
| 4 | Follow a worklist entry and an MPPS through to the images | 8 | |
| 5 | Say when a machine may delete its copy, and why | 9 | |
| 6 | Read a header and find the identifiers that matter | 10, 11 | |
| 7 | Explain what an ultrasound cine is made of and how a browser shows it | 12 | |
| 8 | Say what a Structured Report would add to a vascular exam | 13 | |
| 9 | Explain why an AE title is not an identity, and what is | 14, 15 | |
| 10 | Draw why DICOM stays inside the facility | 16, 20 | |
| 11 | Prove the organization never comes from the tags | 17 | |
| 12 | Make test data that is synthetic, not de-identified | 18, 23 | |
| 13 | Send and read a STOW-RS request and response | 19, 21 | |
| 14 | Decide attach-or-hold for any arriving image | 22 | |
| 15 | Define "correct" for an integration and test it with real equipment | 24, 25 | |
| 16 | Prove an image's pixels and data arrived unchanged | 26 | |
| 17 | Run an acceptance test with a facility, and keep QA running after go-live | 27, 28 | |
| 18 | Walk this capstone for one of my own lab's studies | 29 | |

A score of 36 is not a certificate; it means you can hold the conversation. Part VII is where a team proves it, with real equipment and a real facility.

## Lab

**Walk the capstone for a real study, on paper.** Choose one study from your own lab (do not copy any patient data; you only need the shape of it). For each of the nine steps above, write down:

1. Which system performed the step at your lab, and the AE title or system name.
2. The identifier that carried the study through that step.
3. Where you would look to find the evidence, and who in your department could show it to you.
4. The step you have seen fail most often, and how it was fixed.

Then redraw Figure 29.1 for your lab. The boxes will differ: there may be two PACS, a broker, a cloud archive. The questions don't.

## In Lumen

Running today: exams in the Reports service; images uploaded into an exam in the browser and stored by the Media service, with the database row as the source of truth; the image pane; labelled snips placed in the Final Report; physician signing; and every request scoped to an organization and facility (Steps 7 and 8).

Planned: the gateway path that replaces the browser upload (Steps 4 to 6: gateway identity, STOW-RS ingest, matching and the hold queue), and the signed report's return to the EHR (Step 9). The capstone is the test plan for that work: when each planned step is built, this walk-through, run with synthetic data, is how it is shown to work.

## How it fails

The capstone's failures are every earlier chapter's failures, arriving together. Three deserve repeating because they cross steps:

- **A manual entry in Step 2 becomes a hold in Step 6.** Fixing it at the matching step is correct; also find out why the worklist was down.
- **A late order in Step 1 becomes a waiting item in Step 6.** It resolves itself when the order arrives, as long as the queue re-matches automatically.
- **An image after signing in Step 8.** Held, not attached, because a signed report is a record of what was seen.

## Evidence

You understand this book when you can take one synthetic study, run it through every step, and hand someone a single page that shows, for each step, the identifier, the record and its location. That page is what an integration team, an auditor or a facility's PACS administrator will ask for.

## Workbook

1. Which identifier links Step 1 to Step 6, and which links Step 4 to Step 5?
2. The study in Step 4 was sent, but nothing appears in Lumen. List the first three places you would look, in order.
3. The technologist picked the wrong patient in Step 2. At which step does the design catch it, and what does a person see?
4. Why is the dashed path in Figure 29.1 drawn back to the EHR rather than to the machine or PACS?
5. Pick the one step where you think a real deployment is most likely to fail, and explain why.

## Answers

1. The Accession Number links the order (Step 1) to matching (Step 6): it is created with the order, copied into every image from the worklist, and used as the match key. The SOP Instance UID links the gateway (Step 4) to ingest (Step 5): it identifies each image on both sides, and it is the idempotency key that makes retries harmless. See Figure 29.2.
2. First the gateway's receive log (did Step 4 arrive?), then the gateway's send queue and STOW responses (did Step 5 leave, and what did Lumen answer?), then Lumen's audit events for that gateway identity (was it refused, or stored and held?). Working along the chain in order tells you which link broke. See Steps 4 and 5.
3. Step 6: the image's Patient ID doesn't match the exam that its accession resolves to, so it is held as `identity_conflict`. The person sees the image's identifiers side by side with the exam's, and decides. If the accession happened to belong to that same wrong patient, the cross-check can't catch it, which is why worklist selection at the machine still matters. See Chapter 22.
4. The signed report is a result for the order, and the order came from the EHR, so that is where the ordering provider looks for it, against the same accession. The machine never needs it back, and PACS holds images, not this report. See Step 9.
5. Any well-argued answer counts. A strong one is Step 2: manual entry and wrong-patient selection happen at the machine, under time pressure, and every later step can only detect the result, not prevent it. Another is Step 5: certificates expire, networks change, and a gateway that silently stops forwarding looks exactly like a quiet day. See "How it fails" in Chapters 21 and 22.

<p class="sources">Sources: DICOM PS3.4 Annex K (Basic Worklist Management), Annex F §F.7 (Modality Performed Procedure Step: N-CREATE with Performed Procedure Step Status IN PROGRESS, N-SET to COMPLETED or DISCONTINUED), Annex B (Storage) and Annex J (Storage Commitment); PS3.7 (DIMSE services); PS3.8 (upper layer and associations); PS3.18 §10.5 and Annex I (STOW-RS Store transaction and response); PS3.6 (tag names). Earlier chapters of this book for each step.</p>
