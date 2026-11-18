---
number: 28
title: QA in production
objective: Keep an imaging integration correct after go-live: measure the right things per facility, reconcile daily against what machines sent, alert on what matters, re-test after every change, and respond well when an image goes missing or lands on the wrong patient.
status: draft
---

## At the machine

After go-live, the department stops thinking about the integration. That's the goal. The images are just there, the way PACS images always were. Which means that if the integration starts failing, the department is the last to know. A technologist will notice a clip missing from one study and assume it was a one-off. A physician will notice an image under the wrong patient and call the lab, the lab will fix that one chart, and nobody will ask whether it happened anywhere else.

Production QA is the integrator noticing first: before the physician, before the patient, and with enough evidence to say what happened, how often, and since when.

## On the wire

### What to measure

The five properties from Chapter 24 (complete, exactly once, unaltered, attached correctly, on time) become production metrics. Measure them **per facility and per machine**, because a problem with one room disappears in an organization-wide average.

| Metric | Per | Healthy looks like | Alert when |
|---|---|---|---|
| Instances received (gateway) | machine, day | Tracks the room's normal volume | A machine that usually sends drops to zero during working hours |
| Instances stored | facility, day | Equals instances received | Received minus stored is greater than 0 at end of day |
| Instances matched to an exam | facility, day | Most of stored | Match rate falls sharply below its normal level |
| Instances held | facility | Small and draining | Any item older than the agreed limit; queue growing for days |
| Rejected, by reason | facility, reason | Rare, explained | Any new rejection reason; any spike |
| Duplicates detected | machine | Rare (retries) | Sustained duplicates from one machine |
| End-to-end latency (C-STORE response to stored) | facility | 95th percentile within budget | Percentile or maximum over budget |
| Gateway queue depth and oldest item age | gateway | Near zero | Oldest item older than the budget |
| Integrity check failures (hash mismatch) | any | Zero | Any (Chapter 26: an incident, not a warning) |
| Reconciliation mismatches | facility, day | Zero | Any unexplained mismatch |

Two rules about these numbers. First, they must contain **no patient data**: counts, UIDs at most in restricted detail views, reasons, and times, never names or MRNs on a dashboard or in an alert. Second, "zero received" is a signal, not a quiet day. A machine that stopped sending looks exactly like a machine that had no patients. Compare against the room's schedule or worklist: scheduled studies with no images are the clearest sign of a broken path.

### Daily reconciliation

Metrics tell you something is off; reconciliation tells you exactly what. Once a day, per facility, compare the sources Chapter 26 described:

- **What machines say they sent:** Storage Commitment requests (the instances a machine asked you to commit) and MPPS completions (the instances a performed procedure step says it created).
- **What you stored,** per study.
- **What you committed.**
- **What was scheduled:** completed worklist items with no images at all.

The output is a short report a person reads: studies reconciled clean, studies with missing or unexpected instances, studies held, scheduled procedures with no images. Clean days should be boring and fast to read. Unclean days should name every affected study by its identifiers in the restricted view, so the lab can act.

### Alerts that people act on

An alert that fires every day is ignored by the second week. Alert on few things, each with an owner and a first step:

- **Page now:** integrity check failure; evidence of a cross-tenant write; gateway down or queue stuck during working hours.
- **Same day:** a machine silent during scheduled hours; reconciliation mismatches; hold-queue items past the limit; a new rejection reason.
- **Weekly review:** latency trends, duplicate rates, match-rate drift.

Every alert says what is wrong, where (facility, machine, gateway), since when, and the link to the runbook step. None of them contain patient details.

### Hold-queue health

The hold queue (Chapter 22) is where the system admits it isn't sure. That's a safety feature only if people work it. Track its size, the age of its oldest item, how items are resolved (attached, rejected, waiting for an order), and by whom. A growing queue usually means a process changed: a new procedure name, a new machine picking from a different worklist, an order interface that stopped sending. Fix the cause, not just the items.

### Audit without PHI in logs

Production QA needs a trail: who attached a held study to which exam, when an instance was rejected and why, when a hash check failed. Keep two things apart:

<div class="pairs">
<div><span>Audit events</span><p>Structured records of who did what to which object (by internal id and UID), in a protected store with restricted access and retention rules. This is where accountability lives.</p></div>
<div><span>Operational logs</span><p>Diagnostics for engineers: timings, error types, counts. They must not contain names, MRNs, dates of birth or free text from tags, because logs are copied, shipped and searched far more widely than audit stores.</p></div>
</div>

The companion HIPAA handbook covers audit controls in more depth.

### Change is the main risk: regression and re-validation

Most production failures follow a change. List the changes that must trigger a re-test, and treat each one as a small go-live (Chapter 27):

- A **machine software upgrade** by the vendor: new SOP classes, new private tags, a different transfer syntax default, a changed AE title after a reset.
- A **new machine model** or a replacement machine in a room.
- **Gateway** upgrades or forwarding-rule changes.
- **Network changes:** firewall rules, address changes, certificate renewals (Chapter 15).
- **Your own releases** that touch ingest, matching, storage or renditions.
- **Worklist or order changes** at the facility: new procedure codes, a new ordering system.

For each, keep a regression pack: a set of synthetic objects that match each machine's conformance statement (Chapter 25), plus the scripted scenarios from Chapter 27 that the change could affect. Run the pack before the change reaches production where you can (for example against a vendor's sample files from the new software version) and right after the change where you can't. Keep the results with the change record.

Beyond change, **re-validate on a schedule**: for example, run the core scenarios against each facility periodically, re-read each machine's current conformance statement, and confirm alerts still reach the people on call. Schedules drift; systems drift with them.

### Change control

Write down, for every production change: what changes, which facilities and machines it affects, the regression tests run and their results, the rollback, and who approved it. That record is what lets you answer, months later, "when did this start, and what changed then?"

### When an image goes missing or lands on the wrong patient

Treat both as incidents with a written procedure, agreed with the facility in advance:

1. **Contain.** For a wrong-patient image: make sure it is no longer shown under the wrong patient, through a recorded action, not a silent delete. For missing images: stop anything that might delete the machine's or gateway's remaining copy.
2. **Scope.** Use reconciliation and audit records to find every affected study, not just the one reported. Ask "since when?" and check that period.
3. **Correct.** Attach images to the right exam, or have the machine re-send. Record every correction in the audit trail. If a report was signed with a wrong or missing image, the clinical team decides what happens to the report; the system makes the facts available.
4. **Find the cause, and add a test.** Every incident ends with a regression test or an alert that would have caught it earlier.
5. **Notify per policy.** A wrong-patient image may also be a privacy incident. Whether it is reportable, and to whom, is a question for the facility's privacy and compliance officers; this book gives no legal advice. The companion HIPAA handbook explains how breach determinations work.

<figure class="diagram">
<svg viewBox="0 0 720 260" role="img" aria-label="The production QA loop: measure, reconcile, alert, investigate, change under control, re-validate, and back to measure.">
<defs><marker id="ch28-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="40" y="30" width="170" height="56" rx="4" class="box accent"/>
<text x="125" y="54" text-anchor="middle" class="bold">Measure</text>
<text x="125" y="72" text-anchor="middle" class="small muted">per facility, per machine</text>
<rect x="275" y="30" width="170" height="56" rx="4" class="box"/>
<text x="360" y="54" text-anchor="middle" class="bold">Reconcile</text>
<text x="360" y="72" text-anchor="middle" class="small muted">daily, by UID</text>
<rect x="510" y="30" width="170" height="56" rx="4" class="box"/>
<text x="595" y="54" text-anchor="middle" class="bold">Alert</text>
<text x="595" y="72" text-anchor="middle" class="small muted">few, owned, no PHI</text>
<rect x="510" y="170" width="170" height="56" rx="4" class="box"/>
<text x="595" y="194" text-anchor="middle" class="bold">Investigate</text>
<text x="595" y="212" text-anchor="middle" class="small muted">scope, contain, correct</text>
<rect x="275" y="170" width="170" height="56" rx="4" class="box"/>
<text x="360" y="194" text-anchor="middle" class="bold">Change control</text>
<text x="360" y="212" text-anchor="middle" class="small muted">fix + regression test</text>
<rect x="40" y="170" width="170" height="56" rx="4" class="box"/>
<text x="125" y="194" text-anchor="middle" class="bold">Re-validate</text>
<text x="125" y="212" text-anchor="middle" class="small muted">after changes, on schedule</text>
<line x1="210" y1="58" x2="273" y2="58" marker-end="url(#ch28-arrow)"/>
<line x1="445" y1="58" x2="508" y2="58" marker-end="url(#ch28-arrow)"/>
<line x1="595" y1="86" x2="595" y2="168" marker-end="url(#ch28-arrow)"/>
<line x1="510" y1="198" x2="447" y2="198" marker-end="url(#ch28-arrow)"/>
<line x1="275" y1="198" x2="212" y2="198" marker-end="url(#ch28-arrow)"/>
<line x1="125" y1="170" x2="125" y2="88" marker-end="url(#ch28-arrow)"/>
<text x="360" y="130" text-anchor="middle" class="small muted">every incident leaves a new test or alert behind</text>
</svg>
<figcaption>Figure 28.1 — Production QA is a loop: measurements and reconciliation feed alerts, alerts feed investigation, and every fix comes back as a test.</figcaption>
</figure>

## Lab

**Build a one-facility daily QA report from synthetic data.** Python 3 only, no DICOM libraries needed.

1. Create three synthetic CSV files for one day at one facility. Use made-up UIDs and the facility code `FAC-DEMO`; no patient fields at all:
   - `scheduled.csv`: `accession,room` (completed worklist items), for example 8 rows.
   - `sent.csv`: `accession,sop_instance_uid,machine` (what machines asked you to commit).
   - `stored.csv`: `accession,sop_instance_uid,status` where status is `matched`, `held` or `rejected:<reason>`.
2. Plant problems on purpose: one accession scheduled but never sent; one instance sent but not stored; one instance stored twice; one held instance; one rejection with a new reason.
3. Write a script that prints, with counts and identifiers only:
   - scheduled accessions with no images;
   - per accession: sent vs stored UID differences (reuse the set logic from Chapter 26's `reconcile.py`);
   - duplicates (a UID that appears more than once in `stored.csv`);
   - held and rejected instances, grouped by reason;
   - a one-line verdict: `CLEAN` or `NEEDS REVIEW (n issues)`.
4. Check that your script found every planted problem, and that none of its output would reveal who a patient is.
5. Decide which of the planted problems should page someone now, which are same-day, and which are weekly, using the alert tiers above. Write the alert text for the page-now one.

## In Lumen

For Lumen's planned machine ingest (today images arrive by browser upload), production QA is part of the design rather than something added later:

- Every ingest outcome (stored, matched, held, rejected with a reason, duplicate) is a countable event per organization and facility, so the metrics table above can be built without reading patient data.
- Reconciliation runs per facility against Storage Commitment requests and completed worklist items, keyed by SOP Instance UID and Accession Number.
- People resolve held instances in the hold queue, and every resolution is an audit event. Operational logs carry ids, counts and reasons, never names or MRNs.
- Each facility has a regression pack built from its machines' conformance statements, re-run before Lumen releases that touch ingest or matching and after any machine software upgrade the facility reports.

## How it fails

- **Organization-wide averages.** One room has been silent for three days; the organization total looks normal.
- **Silence read as calm.** A machine sending nothing is treated as a quiet day, until someone asks for a study.
- **Alert fatigue.** Everything alerts, so nothing does. The one integrity failure is buried under latency warnings.
- **PHI in dashboards and logs.** Patient names in alert emails and log lines that travel to tools and people who should never see them.
- **Untested upgrades.** A vendor update changes a default transfer syntax overnight, and cine stops arriving from one model.
- **Fixing the chart, not the cause.** The wrong-patient image is moved, the ticket closed, and nobody checks the other studies from that day.

## Evidence

You understand this chapter when you can show, for one facility, a daily report that reconciles sent, stored and scheduled by identifier with no patient details, an alert list where every alert has a tier, an owner and a runbook step, a regression pack tied to each machine's conformance statement, and an incident procedure whose last step is "add the test that would have caught it."

## Workbook

1. Why measure per machine and not only per organization?
2. A room's machine sent zero images today. What do you compare it with to decide whether that's a problem?
3. Which conditions should page someone immediately, and why those?
4. Name four kinds of change that should trigger a regression run, and say what each could break.
5. An image is found under the wrong patient. Why is moving it to the right patient only the third step?

## Answers

1. A failure in one room disappears in an average across many rooms and facilities. Per-machine numbers show the room that went silent or started rejecting cine, which is where the fix is. See "What to measure".
2. Compare it with the schedule: completed worklist items or scheduled procedures for that room. Scheduled studies with no images point to a broken path. No scheduled studies means it really was a quiet day. See "What to measure" and "Daily reconciliation".
3. Integrity check failures, any evidence of a cross-tenant write, and a stuck or down gateway during working hours. The first two mean the system has broken a core guarantee (unaltered, attached to the right organization). The third means images are not arriving at all while patients are being scanned. Each needs action before more studies are affected. See "Alerts that people act on" and Chapter 24's harm table.
4. A machine software upgrade can change SOP classes, transfer syntaxes or private tags. A new or replaced machine brings a new conformance statement and AE title. A network or certificate change can block or downgrade the connection. Your own ingest or matching release can change what is accepted or how images attach. A gateway change and a worklist or order change at the facility also count. See "Change is the main risk".
5. First contain it, so it is no longer shown under the wrong patient through a recorded action. Then scope it, using reconciliation and audit records to find every affected study since the problem began. Correcting only the one reported chart leaves the others wrong and the cause in place. The procedure then finds the cause, adds a test, and leaves notification to the facility's privacy and compliance officers. See "When an image goes missing or lands on the wrong patient".

<p class="sources">Sources: DICOM PS3.4 Annex J (Storage Commitment Service Class), Annex F, F.7 (Modality Performed Procedure Step SOP Class), Annex K (Basic Worklist Management Service Class). Audit and breach topics: see the companion handbook, HIPAA for Medical Application Developers. Earlier chapters: 22 (hold queue), 24 (requirements), 25 (conformance), 26 (integrity and reconciliation), 27 (go-live).</p>
