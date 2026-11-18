---
number: 24
title: What "correct" means for an imaging integration
objective: Turn "the images come through" into a short list of testable requirements, rank them by the harm a failure would do, and trace each one to a test and to the evidence that it passed.
status: draft
---

## At the machine

Ask a department whether its imaging link "works" and you will usually hear yes. The images show up in PACS, the physicians read them, nobody complains. Then ask a sharper question: *how do you know every image from yesterday arrived?* The honest answer is usually that nobody has looked, because nothing visibly broke.

Technologists know the failures that hide behind "it works." A clip that never made it across, noticed only when the physician asks for the distal ICA cine and it isn't there. A study filed under the patient before, because the wrong worklist line was picked. A machine that quietly kept a study in its local queue for three days after a network change. None of these show up as an error on anyone's screen. They show up later, as a missing image in a report, or worse, as an image in the wrong patient's chart.

Quality assurance for an imaging integration starts by refusing "it works" as an answer and replacing it with statements you can check.

## On the wire

### Five properties, not one

Everything Parts II through VI built can be summarized as a promise about each image the machine sends. Write it down as properties, because each one can fail on its own, and each one needs its own test:

<div class="pairs">
<div><span>Complete</span><p>Every image the machine sent is stored. Nothing is silently dropped, at the machine, the gateway, or the ingest service.</p></div>
<div><span>Exactly once</span><p>A retried send does not create a second copy. The SOP Instance UID (Chapter 11) is the identity that makes this checkable.</p></div>
<div><span>Unaltered</span><p>The stored object carries the same pixels, calibration and identifiers the machine sent, or the change is deliberate, recorded and visible (Chapter 26).</p></div>
<div><span>Attached correctly</span><p>The image is on the right exam, for the right patient, in the right organization and facility (Chapters 17 and 22).</p></div>
<div><span>On time, or loudly late</span><p>It arrives within an agreed time budget, and any image that doesn't is visible to a person: in a hold queue, an alert, or a reconciliation report.</p></div>
</div>

The last property matters more than it looks. A system that occasionally loses an image *and says so* is a manageable system. A system that loses an image silently cannot be trusted with any of them, because you can never tell which day was the bad one.

### Rank by harm, not by how often it happens

Not all failures are equal, and QA time is finite. Rank them the way a clinical department would, by what happens to a patient:

| Failure | What it can do to a patient | Detectability without testing |
|---|---|---|
| Image attached to the wrong patient | Wrong diagnosis or treatment for two people; a privacy incident | Low: it looks like a normal image |
| Image attached to the wrong organization | Exposure of another tenant's patient data | Very low: nobody in the wrong tenant knows to look |
| Image missing | Incomplete read; a stenosis graded without the key view; repeat exam | Medium: noticed only if someone expects it |
| Pixels or calibration altered | Wrong measurements from a distorted or mis-scaled image | Very low: the image still looks plausible |
| Duplicate image | Confusion, double measurements, storage cost | High: usually visible in the viewer |
| Late image | Delayed read; report signed before the image arrived | Medium |

Two things stand out. The most harmful failures are the least visible, and the most visible failure (duplicates) is the least harmful. A QA plan that only reacts to what users report will spend its effort in exactly the wrong place. That is why this chapter starts from harm.

### From property to requirement to acceptance criterion

A property becomes testable when it has a number and a condition attached. "Complete" is a property; this is a requirement:

> **REQ-COMPLETE-1.** For every study a machine sends, the set of SOP Instance UIDs stored in Lumen equals the set the machine reported sending.

And this is an acceptance criterion, the thing a test can pass or fail:

> Across the scripted go-live scenarios (Chapter 27), the sent and stored UID sets match for 100% of studies, and any mismatch appears in the daily reconciliation report within one day.

Write criteria that a tired person can check without arguing. "Images arrive quickly" invites argument; "95% of instances are stored within 60 seconds of the C-STORE response, and none take more than 15 minutes without appearing in the hold queue or an alert" does not. Pick the numbers with the facility: they know when a physician starts reading.

### Traceability: requirement, risk, test, evidence

Each requirement should point to the risk it controls, the test that checks it, and the evidence that the test passed. When one link is missing, you have a gap you can name.

<figure class="diagram">
<svg viewBox="0 0 720 230" role="img" aria-label="A traceability chain: a requirement controls a risk, a test checks the requirement, and evidence records that the test passed.">
<defs><marker id="ch24-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="40" width="160" height="70" rx="4" class="box"/>
<text x="90" y="70" text-anchor="middle" class="bold">Risk</text>
<text x="90" y="92" text-anchor="middle" class="small">image on wrong patient</text>
<rect x="190" y="40" width="160" height="70" rx="4" class="box"/>
<text x="270" y="70" text-anchor="middle" class="bold">Requirement</text>
<text x="270" y="92" text-anchor="middle" class="small">REQ-ATTACH-1</text>
<rect x="370" y="40" width="160" height="70" rx="4" class="box"/>
<text x="450" y="70" text-anchor="middle" class="bold">Test</text>
<text x="450" y="92" text-anchor="middle" class="small">TEST-MISMATCH-MRN</text>
<rect x="550" y="40" width="160" height="70" rx="4" class="box accent"/>
<text x="630" y="70" text-anchor="middle" class="bold">Evidence</text>
<text x="630" y="92" text-anchor="middle" class="small">run log + hold-queue row</text>
<line x1="170" y1="75" x2="188" y2="75" marker-end="url(#ch24-arrow)"/>
<line x1="350" y1="75" x2="368" y2="75" marker-end="url(#ch24-arrow)"/>
<line x1="530" y1="75" x2="548" y2="75" marker-end="url(#ch24-arrow)"/>
<text x="90" y="150" text-anchor="middle" class="small muted">why it matters</text>
<text x="270" y="150" text-anchor="middle" class="small muted">what must be true</text>
<text x="450" y="150" text-anchor="middle" class="small muted">how we check it</text>
<text x="630" y="150" text-anchor="middle" class="small muted">proof it passed</text>
<line x1="10" y1="190" x2="710" y2="190" class="dashed"/>
<text x="360" y="215" text-anchor="middle" class="small">a missing link in any row is a named gap, not a surprise</text>
</svg>
<figcaption>Figure 24.1 — Traceability: every risk is controlled by a requirement, every requirement is checked by a test, and every test leaves evidence.</figcaption>
</figure>

The evidence column is the one teams skip. A test that passed on someone's laptop and left nothing behind is, a month later, indistinguishable from a test that was never run. Evidence can be modest: the test runner's output saved with the commit it ran against, a reconciliation report, a screenshot of the hold queue with a synthetic study in it, a signed checklist from go-live. It must be findable by someone who wasn't there.

### A QA plan on one page

A QA plan for an imaging integration does not need to be long. It needs to be complete. One table covers most of it:

| ID | Requirement | Risk it controls | How it is tested | Where (Chapter) | Evidence |
|---|---|---|---|---|---|
| REQ-COMPLETE-1 | Stored UID set equals sent UID set, per study | Missing images | Reconciliation of sent vs stored UIDs | 23, 26, 28 | Daily reconciliation report |
| REQ-ONCE-1 | A re-sent instance is stored once | Duplicates, double measurements | Send the same file twice; count rows | 23 | Test run log |
| REQ-UNALTERED-1 | Pixel data hash at retrieval equals hash at ingest | Altered pixels | Hash at both points; compare | 26 | Integrity check output |
| REQ-CALIB-1 | Ultrasound region calibration is preserved | Wrong measurements | Compare Sequence of Ultrasound Regions sent vs stored | 12, 26 | Diff output |
| REQ-ATTACH-1 | No image attaches when Accession matches but MRN does not | Wrong patient | Scripted mismatch scenario | 22, 27 | Hold-queue entry, audit row |
| REQ-TENANT-1 | Organization comes only from the gateway credential | Cross-tenant exposure | Spoofed Institution Name with another tenant's credential | 17, 23 | Negative test log |
| REQ-TIME-1 | 95% stored within 60 s; none silent beyond 15 min | Late reads | Latency measurement in go-live and production | 27, 28 | Latency dashboard export |
| REQ-VISIBLE-1 | Every rejected or held instance is visible to a person | Silent loss | Inject each failure type; check it surfaces | 23, 28 | Alert and hold-queue screenshots |

Chapter 23 gave you the tools to run the developer-side rows on a laptop. The rest of this part covers the rows that need more than a laptop: conformance with real devices (Chapter 25), integrity (Chapter 26), testing with a real facility (Chapter 27), and keeping all of it true in production (Chapter 28).

### A note on regulated software lifecycles

Medical device software is often developed under formal lifecycle standards; IEC 62304 is a widely known example, and it sits alongside risk management and quality management standards. Whether any of these applies to a given product depends on what the product is, what it claims, and where it is sold, and that is a question for regulatory specialists, not for this book. What this chapter describes, requirements traced to risks, tests and evidence, is good engineering practice either way, and it is the habit those standards expect you to have.

## Lab

**Write the QA plan for one machine.** No scanner or code needed; a text file or spreadsheet is enough.

1. Pick one synthetic scenario: a vascular lab with two ultrasound machines sending carotid studies through a gateway to a reporting system.
2. Copy the QA plan table above. For each row, replace the acceptance numbers with ones you would defend to a lab manager. Write one sentence on why for each number.
3. Add at least two rows of your own. Good candidates: a machine sends a cine clip the receiver cannot render; a study is re-sent after its exam was finalized.
4. For each row, ask: *if this test passed today, what file or record could I show someone next month?* Write that in the Evidence column. If the answer is "nothing," change the test so it leaves something.
5. Rank the rows by harm using the table from On the wire, and mark the top three. Those are the tests that must run before any go-live, without exception.

Keep the file; Chapter 27 turns it into a go-live test plan.

## In Lumen

Lumen's planned image ingest (Chapters 21 and 22) is designed around these five properties, and the design chose its mechanisms to make each one checkable rather than merely likely:

- **Complete and exactly once:** each instance is keyed by its SOP Instance UID, so a retried send is recognized as the same instance and reconciliation can compare UID sets.
- **Unaltered:** the original object is stored as received, and browser renditions are derived from it and never replace it (Chapter 26).
- **Attached correctly:** the organization and facility come from the gateway's credential, never from tags, and an exam is matched by Accession Number within that organization. Anything ambiguous goes to a hold queue for a person, rather than being guessed.
- **Visible:** held and rejected instances are visible to people, and audit events record what happened without copying patient details into logs.

All of that is planned design; today Lumen receives images only by browser upload into an exam. The QA plan table in this chapter is the checklist that design has to pass before any facility sends it a real study.

## How it fails

- **QA by complaint.** Testing only what users report. Users report duplicates and slow screens; they cannot report the wrong-tenant image they never see.
- **Untestable requirements.** "Reliable," "fast," "secure" with no number or condition. Every review becomes an argument and every test a matter of opinion.
- **Tests without evidence.** The suite passed once, nobody kept the output, and the question "was this ever checked?" has no answer.
- **Happy-path acceptance.** Go-live criteria that only cover the normal study. The harmful failures live in the unusual ones: wrong worklist pick, re-send, network drop.
- **Averages that hide the tail.** "Average latency 4 seconds" while one machine's studies sit for an hour every night. Measure percentiles and maximums, per machine.

## Evidence

You understand this chapter when you can hand someone a one-page QA plan for an imaging link in which every row has a requirement with a number in it, the patient harm it prevents, the test that checks it, and the record that proves the test ran, and you can point to the rows that would block a go-live.

## Workbook

1. Why is "silent loss" worse than "frequent but visible loss"? Give a concrete example from a vascular study.
2. Rewrite "images should arrive quickly" as a requirement and an acceptance criterion with numbers.
3. Which failure in the harm table is hardest to detect without deliberate testing, and which test from the QA plan catches it?
4. A colleague says the integration passed QA because the test suite is green. What two questions would you ask before agreeing?
5. Why does the SOP Instance UID make both "complete" and "exactly once" checkable?

## Answers

1. Visible loss can be managed: someone sees the alert or the hold-queue entry and re-sends the clip. Silent loss means no day's data can be trusted, because you cannot tell which day lost something. In a vascular study, a missing distal ICA cine that nobody knew was sent means the physician grades the stenosis without the key view, and nobody knows to ask for it. See "Five properties, not one", the last property.
2. Requirement: "Every instance is stored within an agreed time of the machine's C-STORE response." Acceptance criterion: "95% of instances are stored within 60 seconds, and no instance goes more than 15 minutes without being either stored or shown in the hold queue or an alert." The numbers make the test pass or fail without argument, and they should be agreed with the facility. See "From property to requirement to acceptance criterion".
3. An image attached to the wrong organization is the hardest to detect: nobody in the wrong tenant knows to look for it, and nobody in the right tenant knows it is missing. REQ-TENANT-1 catches it with a negative test: send a study whose Institution Name claims another tenant, using a gateway credential for this one, and check that the organization comes from the credential. See the harm table and the QA plan table.
4. Ask what the suite actually covers: does it include the harmful, unusual scenarios (wrong worklist pick, re-send, tenant spoofing), or only the happy path? And ask where the evidence is: which run, against which commit, with what saved output. A green suite only means the tests that exist passed. See Figure 24.1 and "How it fails".
5. Each instance has one unique SOP Instance UID that does not change when it is re-sent. Comparing the set of UIDs sent with the set stored shows any missing instance (completeness), and counting stored rows per UID shows any duplicate (exactly once). Without a stable identity, neither comparison is possible. See "Five properties, not one" and Chapter 11.

<p class="sources">Sources: DICOM PS3.3 (SOP Common Module: SOP Instance UID); PS3.3 C.8.5.5 (US Region Calibration Module). IEC 62304 is named only as an example of a medical device software lifecycle standard; consult the standard and regulatory specialists for applicability. Earlier chapters: 11 (UIDs), 17 (tenancy), 21–23 (Lumen ingest design and testing).</p>
