---
number: 22
title: Matching images to exams, and the hold queue
objective: Decide, for every arriving image, whether it belongs to exactly one exam, and design the queue where a person resolves every case the rules can't.
status: draft
---

## At the machine

Every technologist has done it: picked the wrong patient from the worklist, or started a study by typing the patient in by hand because the order wasn't on the machine yet. Sometimes you catch it before End Exam. Sometimes PACS catches it, and a coordinator or PACS administrator moves the images to the right study, or holds them until the order shows up.

That correction step is not an edge case. It happens every week in a busy lab: an add-on study ordered after the patient was already on the table, a downtime when the worklist was unavailable, a second exam on the same patient on the same day. Any system that receives images directly from machines inherits all of it. This chapter is the planned Lumen design for answering one question about every image, safely: *which exam is this?*

## On the wire

### What the image tells you, and how much to trust it

Chapter 3 followed one study from order to report, and Chapter 8 showed how the machine copies identifiers from the worklist entry into every image. The ones that matter for matching:

| Tag | Name | Role in matching |
|---|---|---|
| (0008,0050) | Accession Number | The match key: identifies the order this exam was performed for |
| (0010,0020) | Patient ID | The MRN: a cross-check, never the key on its own |
| (0010,0010) | Patient's Name | Shown to a person; never used to match automatically |
| (0020,000D) | Study Instance UID | Groups the images of one study together (Chapter 11) |
| (0008,0020) | Study Date | Context for a person resolving a held image |

All of these are claims written by the machine, usually copied from a worklist, sometimes typed by a person. Chapter 17 established that tags never decide *which organization* an image belongs to: that comes from the gateway's credential (Chapter 21). Matching happens strictly inside the organization and facility that credential resolved. An accession number is only looked up among that facility's exams. A collision with another customer's accession number is impossible by construction, because their exams are never searched.

### The rule: exactly one, or a person decides

The design has one principle: **attach automatically only when exactly one open exam is an unambiguous match; otherwise hold the image for a person.** Figure 22.1 is the whole decision.

<figure class="diagram">
<svg viewBox="0 0 720 480" role="img" aria-label="Decision flow: an image is attached automatically only if it has an accession number, exactly one exam in the organization has it, the patient ID matches, and the exam is open at the same facility. Every other outcome sends the image to the hold queue for a person.">
<defs><marker id="ch22-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="150" y="20" width="220" height="44" rx="4" class="box"/>
<text x="260" y="47" text-anchor="middle">Stored, tenant known</text>
<line x1="260" y1="64" x2="260" y2="100" marker-end="url(#ch22-arrow)"/>
<rect x="150" y="100" width="220" height="44" rx="4" class="box"/>
<text x="260" y="127" text-anchor="middle">Accession present?</text>
<line x1="260" y1="144" x2="260" y2="180" marker-end="url(#ch22-arrow)"/>
<text x="268" y="166" class="small">yes</text>
<rect x="150" y="180" width="220" height="44" rx="4" class="box"/>
<text x="260" y="207" text-anchor="middle">Exams with it here?</text>
<line x1="260" y1="224" x2="260" y2="260" marker-end="url(#ch22-arrow)"/>
<text x="268" y="246" class="small">exactly 1</text>
<rect x="150" y="260" width="220" height="44" rx="4" class="box"/>
<text x="260" y="287" text-anchor="middle">Patient ID matches?</text>
<line x1="260" y1="304" x2="260" y2="340" marker-end="url(#ch22-arrow)"/>
<text x="268" y="326" class="small">yes</text>
<rect x="150" y="340" width="220" height="44" rx="4" class="box"/>
<text x="260" y="367" text-anchor="middle">Open, same facility?</text>
<line x1="260" y1="384" x2="260" y2="420" marker-end="url(#ch22-arrow)"/>
<text x="268" y="406" class="small">yes</text>
<rect x="150" y="420" width="220" height="44" rx="4" class="box accent"/>
<text x="260" y="447" text-anchor="middle">Attach to exam</text>
<line x1="370" y1="122" x2="540" y2="122" marker-end="url(#ch22-arrow)"/>
<text x="455" y="114" text-anchor="middle" class="small">missing</text>
<line x1="370" y1="202" x2="540" y2="202" marker-end="url(#ch22-arrow)"/>
<text x="455" y="194" text-anchor="middle" class="small">0, or 2 or more</text>
<line x1="370" y1="282" x2="540" y2="282" marker-end="url(#ch22-arrow)"/>
<text x="455" y="274" text-anchor="middle" class="small">mismatch</text>
<line x1="370" y1="362" x2="540" y2="362" marker-end="url(#ch22-arrow)"/>
<text x="455" y="354" text-anchor="middle" class="small">signed or other site</text>
<rect x="540" y="100" width="160" height="284" rx="4" class="box accent"/>
<text x="620" y="236" text-anchor="middle">Hold queue</text>
<text x="620" y="256" text-anchor="middle" class="muted small">a person decides</text>
</svg>
<figcaption>Figure 22.1 — The matching decision. Four questions, each with one safe answer; everything that isn't a clean "yes" waits for a person, with the reason recorded.</figcaption>
</figure>

### Each branch, and why it holds instead of guessing

**No accession number.** The study was started by hand on the machine, or the worklist was down. The image might belong to an exam that exists, but nothing in the header says so reliably. Hold, reason `no_accession`.

**No exam with that accession.** Most often the order simply hasn't reached Lumen yet: an add-on, or an order entered after the scan. Hold, reason `no_order`, and re-run the match automatically when a new exam with that accession is created (the "wait for order" path in Figure 22.2). Less often the accession was mistyped; a person sees that it never resolves.

**More than one exam with that accession.** Within one facility an accession number should identify one order, so this means a data problem upstream (a reused number, a duplicated order). Picking one would be a guess. Hold, reason `ambiguous`.

**Patient ID doesn't match the exam's MRN.** This is the wrong-patient case, and the most important cross-check in the chapter. An accession number can be mistyped into the right format; it is much less likely that a mistyped accession also lands on an exam for the same MRN. A mismatch means one of the two identifiers is wrong, and attaching would put a patient's images in another patient's chart. Hold, reason `identity_conflict`. Compare after normalizing only what is safe to normalize (surrounding spaces); never "fuzzy match" an MRN.

**The exam is signed.** A finalized exam's report is a legal record. Adding images after signing silently changes what the physician signed against. Hold, reason `exam_signed`; the resolution is a person's call (attach with an addendum, or attach to a different exam).

**The exam belongs to a different facility in the same organization.** The gateway that sent the image belongs to one facility (Chapter 21). An accession that resolves to an exam at another facility is suspicious: a misrouted gateway, or a patient whose order was placed at one site and performed at another. Hold, reason `other_facility`.

### Never match on the patient's name

Names are not identifiers. Two patients can share a name, one patient's name can be spelled several ways, and Patient's Name (0010,0010) has its own encoding rules: `FAMILY^GIVEN^MIDDLE^PREFIX^SUFFIX` (PS3.5 §6.2, the PN value representation), with alphabetic, ideographic and phonetic groups separated by `=`. A name is useful to the *person* resolving a held image, side by side with the exam's details. It is never a reason for the software to attach anything, and never a reason to merge two patients.

### The hold queue

<figure class="diagram">
<svg viewBox="0 0 720 260" role="img" aria-label="A held image can be attached to an exam, rejected, or left waiting for its order; when the order arrives the match runs again. A held item past its time limit is escalated.">
<defs><marker id="ch22-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="40" y="100" width="130" height="56" rx="4" class="box accent"/>
<text x="105" y="133" text-anchor="middle">Held</text>
<rect x="330" y="20" width="150" height="44" rx="4" class="box"/>
<text x="405" y="47" text-anchor="middle">Attached</text>
<rect x="330" y="106" width="150" height="44" rx="4" class="box"/>
<text x="405" y="133" text-anchor="middle">Waiting for order</text>
<rect x="330" y="192" width="150" height="44" rx="4" class="box"/>
<text x="405" y="219" text-anchor="middle">Rejected</text>
<rect x="560" y="106" width="140" height="44" rx="4" class="box"/>
<text x="630" y="133" text-anchor="middle">Escalated</text>
<line x1="170" y1="112" x2="330" y2="44" marker-end="url(#ch22-arrow2)"/>
<text x="238" y="68" text-anchor="middle" class="small">attach</text>
<line x1="170" y1="128" x2="330" y2="128" marker-end="url(#ch22-arrow2)"/>
<text x="250" y="120" text-anchor="middle" class="small">wait for order</text>
<line x1="170" y1="144" x2="330" y2="212" marker-end="url(#ch22-arrow2)"/>
<text x="238" y="196" text-anchor="middle" class="small">reject</text>
<line x1="405" y1="106" x2="405" y2="64" marker-end="url(#ch22-arrow2)" class="dashed"/>
<text x="413" y="90" class="small">order arrives</text>
<line x1="480" y1="128" x2="560" y2="128" marker-end="url(#ch22-arrow2)"/>
<text x="520" y="120" text-anchor="middle" class="small">time limit</text>
</svg>
<figcaption>Figure 22.2 — A held item's lifecycle. Every arrow is a recorded action with who, when and why; only the dashed "order arrives" step happens without a person, and it re-runs the same rules as Figure 22.1.</figcaption>
</figure>

A held item is not an error message; it is a work item for someone with the right role, scoped to their organization and facility. What the person needs to see, side by side:

- **From the image:** a thumbnail, Patient's Name, Patient ID, Accession Number, Study Date, the sending gateway and facility, and the hold reason in plain words ("Patient ID on the image doesn't match the exam").
- **From the candidate exams:** for `identity_conflict` or `ambiguous`, the exams the rules found; for `no_order`, nothing yet; for every reason, a search limited to that facility's open exams.
- **What has happened so far:** when it arrived, previous actions on it, and how long it has waited.

The actions, each an explicit button with a confirmation that shows exactly what will change:

<div class="pairs">
<div><span>Attach</span><p>Choose the exam. The person is attesting that these images belong to that patient and order. The image's own tags are not rewritten; the decision is recorded as a link with the person and the reason.</p></div>
<div><span>Wait for order</span><p>Leave it held; it is re-matched automatically when an exam with its accession is created, and it attaches only if Figure 22.1 then passes.</p></div>
<div><span>Reject</span><p>The images do not belong in this organization's records (a test send, a misrouted gateway). They are removed from view, and kept or deleted under the organization's retention policy, not on impulse.</p></div>
</div>

Studies arrive as many instances. The queue groups held instances by Study Instance UID, so a person resolves a forty-image study once, not forty times; the decision applies to every instance in the group, including ones that arrive later.

### Time limits

A held image is an exam a physician can't read. The queue needs a clock: after a set time (hours, chosen with the lab, not a default), an unresolved item is escalated to a supervisor role and counted on the lab's dashboard. This mirrors the turnaround-time thinking a vascular lab already applies to signing reports. The queue should also show, per facility, how many items are held and how old the oldest one is, because a sudden rise usually means one cause: a worklist outage or a misconfigured machine.

### The audit trail

Every arrow in Figure 22.2 is an audit event: the item, the action, the person, the exam chosen if any, the reason, and the time. For an attach after an identity conflict, the record must also keep what the image said and what the exam said, because "who decided this image belonged to this patient, and what did they see?" is the question a review will ask. Like Chapter 21's audit events, these records are protected clinical audit data, not general-purpose application logs.

## Lab

**Work the decision table by hand.** No software for this one: the point is to find your own lab's real cases.

1. Copy this table and fill in the last column with Figure 22.1's outcome (attach, or hold with which reason). All data is synthetic.

| Image accession | Image Patient ID | Exams found in this facility | Outcome |
|---|---|---|---|
| ACC-1001 | DEMO-0001 | 1 open exam, MRN DEMO-0001 | |
| ACC-1002 | DEMO-0002 | none | |
| (empty) | DEMO-0003 | 1 open exam for DEMO-0003 today | |
| ACC-1004 | DEMO-0004 | 1 open exam, MRN DEMO-0040 | |
| ACC-1005 | DEMO-0005 | 2 exams with ACC-1005 | |
| ACC-1006 | DEMO-0006 | 1 signed exam, MRN DEMO-0006 | |

2. Row 3 is tempting: there is an obvious exam. Write down why the rule still holds it, and what the person resolving it should check before attaching.

3. Think of the last three times images needed correcting in your department (wrong patient selected, manual entry during downtime, add-on order). For each, which hold reason would have caught it, and what would the person have seen?

## In Lumen

Today, matching is done by the person: images are uploaded inside a specific exam in the browser, so the exam is chosen before the image arrives, and the upload is scoped to the user's organization and facility.

Planned: the matching rules of Figure 22.1, run on every stored instance inside the organization and facility resolved from the gateway's credential; the hold queue as a facility-scoped work list for authorized roles; automatic re-matching when a new exam's accession matches a waiting item; per-study grouping; time limits and escalation; and audit events for every decision. A signed exam is never changed by an automatic attach.

## How it fails

- **Matching on name or date.** "Same name, scanned today" attaches a patient's images to another patient's exam. The design never matches automatically on anything but accession plus a Patient ID cross-check.
- **Searching across tenants.** An accession lookup without the organization filter finds another customer's exam. Prevented by resolving the organization before matching and filtering every lookup by it.
- **Silent auto-attach to a signed exam.** The report a physician signed now shows images they never saw.
- **A queue nobody watches.** Items sit for days; physicians read without images or call the lab. Time limits, escalation and a visible count are part of the design, not polish.
- **Rewriting the image to "fix" it.** Editing Patient ID in the stored file destroys the evidence of what the machine sent. Record the decision; keep the original.

## Evidence

You understand this chapter when you can take any held item and show: which rule held it and why, who resolved it, what they saw, which exam it went to, and that the original image is unchanged. And when you can show, for one facility, the number of items held this week and the age of the oldest one.

## Workbook

1. Why is Accession Number the match key and Patient ID only a cross-check, and not the other way round?
2. An image's accession matches an exam at a different facility in the same organization. Give two innocent explanations and one dangerous one.
3. Forty images of one study arrive with no accession. How many decisions should a person have to make, and what makes that possible?
4. A person attaches a held image after an identity conflict. List what the audit record must contain.
5. Your lab's held items doubled overnight at one facility. What is the first thing you would check?

## Answers

1. The Accession Number identifies the order, and an exam is performed for one order, so it is the key that points at exactly one exam. Patient ID identifies the patient, who can have several exams, sometimes on the same day, so it can't choose between them on its own. As a cross-check, though, it catches the dangerous case: an accession that resolves to a different patient's exam. See "Each branch, and why it holds instead of guessing".
2. Innocent: the order was placed at one site and the patient was scanned at another, or a machine was moved between sites without its gateway configuration being updated. Dangerous: a misrouted or misconfigured gateway is sending one facility's images under another facility's identity, so the facility boundary itself is being bypassed. Either way it is held for a person, reason `other_facility`. See Figure 22.1.
3. One. The queue groups held instances by Study Instance UID, so a person resolves the study once and the decision applies to every instance in it, including ones that arrive later. See "The hold queue".
4. The held item, the action (attach), the person, the time, the exam chosen, the reason they gave, and what each side said: the image's Patient ID, name and accession, and the exam's MRN and patient. The review question is who decided these images belonged to this patient, and what they saw when they decided. See "The audit trail".
5. Whether the worklist was down or that facility's machine stopped receiving it, because studies started by hand arrive without an accession. Then look at the hold reasons: a jump in `no_accession` points at the worklist, a jump in `identity_conflict` or `other_facility` points at a machine or gateway configuration. See "Time limits" and the per-facility counts.

<p class="sources">Sources: DICOM PS3.6 (data dictionary: Accession Number, Patient ID, Patient's Name, Study Instance UID, Study Date); PS3.5 §6.2 (PN value representation: component and group delimiters); PS3.4 Annex K (Basic Worklist Management Service Class, the Modality Worklist: where Accession Number and Patient ID on the image come from); PS3.3 (Patient, General Study modules).</p>
