---
number: 27
title: Go-live and acceptance testing with a facility
objective: Plan and run an imaging go-live with a facility: survey the site, agree a test plan, script the hard scenarios, run in parallel with the existing PACS, and sign off against criteria everyone agreed beforehand.
status: draft
---

## At the machine

From the department's side, a go-live usually arrives as an email: on Tuesday, the machines in rooms 2 and 3 will start sending to a new system. Technologists are asked to "send a few test studies." Somebody from IT stands in the room for an hour. If the test images show up, the project is declared live.

Then the first real problems arrive over the following weeks: a machine that only fails after a reboot, cine that doesn't send from one room, a study attached to the previous patient because two worklist entries looked alike. None of these were in "a few test studies," because nobody wrote down what had to be true before going live, or tried the hard cases on purpose.

A go-live is a test you run once, at the facility, with people who have other jobs. It has to be planned like one.

## On the wire

### Who owns what

An imaging go-live crosses several teams, and most delays come from not knowing who decides what. Write it down first:

| Area | Usually owned by | Decides |
|---|---|---|
| Machines' DICOM configuration | Biomedical engineering or the vendor's field service | AE titles, destinations, transfer syntaxes |
| PACS and worklist broker | Imaging informatics / PACS team | Worklist content, routing, existing destinations |
| Network path, firewall, VLANs | Hospital IT / network team | Ports, addresses, TLS, which segments can talk |
| Gateway | Shared: facility hosts it, integrator configures it | Forwarding rules, credentials, queue monitoring |
| Clinical workflow | Lab manager / lead technologist | Test scenarios, who sends what, acceptance from the user's side |
| Receiving system | The integrator (you) | Ingest rules, matching, hold queue, evidence |

### Step 1: the site survey

Before any test, collect facts. Most of them come from the machines' own setup screens (the Chapter 1 lab) and their conformance statements (Chapter 25):

- **Each machine:** make, model, software version, its AE title, the destinations already configured, which SOP classes and transfer syntaxes it sends, whether it uses MWL, MPPS and Storage Commitment.
- **The network path:** from each room to the gateway, and from the gateway out (Chapters 15 and 16). Who opens ports, how long change requests take.
- **The worklist:** where it comes from, how procedures are named, what Accession Numbers look like, whether the facility ever creates studies without an order (emergencies, add-ons).
- **The day:** study volume per room per day, busiest hours, after-hours coverage, downtime procedures.

Every unknown in the survey is a risk. List them and give each an owner and a date.

### Step 2: the test plan, agreed in writing

Turn Chapter 24's QA plan into a facility test plan. It names the scenarios, who runs each, what "pass" means, and what evidence is kept. The facility's PACS, biomed and IT owners review it before testing starts. Agreement in advance matters: acceptance criteria negotiated after a failure are not criteria.

### Test patients that are obviously not real

Testing on a live clinical system needs patients that cannot be mistaken for anyone. Facilities usually have a procedure for this: dedicated test patient records in the EHR or RIS, with names and MRNs that are unmistakably fake (for example a `TEST^` prefix and an MRN range reserved for testing), ordered and scheduled through the normal workflow so the worklist path is exercised too. Use those. Never use a real patient, a staff member, or "a real study we'll delete afterwards." Agree in the plan how test studies are cleaned up from every system they reach, including the existing PACS during a parallel run.

Images for test patients come from scanning a phantom or a volunteer protocol the facility approves, or from synthetic objects sent by a test SCU. Follow the facility's rules; if in doubt, phantom.

### Step 3: scripted scenarios

Each scenario has a script (what the technologist does), an expected result (what each system should show), and a pass condition. The hard ones are the point:

| # | Scenario | What it proves | Pass condition |
|---|---|---|---|
| 1 | Normal study: pick from worklist, scan stills and cine, End Exam | The basic path | All instances stored, matched to the exam, reconciled (Chapter 26) |
| 2 | Multi-series study (B-mode, color, spectral, clips) | Series handling | Series and instance counts equal on both sides |
| 3 | Large cine clips | Size limits, timeouts | Clips stored and playable; nothing truncated |
| 4 | Re-send the same study from the machine | Exactly once | No duplicate instances; resend visible in logs |
| 5 | Wrong worklist pick, then corrected at the machine | Matching safety | Images held or matched to the corrected exam only; nothing on the wrong patient |
| 6 | Study with no order (emergency workflow) | Unmatched path | Study lands in the hold queue and can be resolved |
| 7 | Network drop mid-send (unplug, or firewall block, by plan) | Recovery | Machine or gateway retries; final reconciliation complete |
| 8 | Gateway restart during a send | Store-and-forward durability | Nothing lost after restart |
| 9 | After-hours study with only on-call staff | Real operating conditions | Same results; alerts reach whoever is on call |
| 10 | Machine reboot, then send | Configuration survives restarts | Normal send works |
| 11 | Wrong credential at the gateway (test environment) | Tenant safety (Chapter 17) | Rejected; nothing stored anywhere |

Scenarios 5 through 8 are the ones that tend to get skipped, because they take effort or make people nervous. They are also the ones that find the failures that hurt patients (Chapter 24's harm table).

### Step 4: the parallel run

For a period agreed in the plan, machines send to both the existing PACS and the new path. The existing PACS stays the system of record; the new path is compared against it. Every day, reconcile study by study: same studies, same instance counts, same UIDs, nothing extra, nothing held that should have matched. A parallel run catches what scripted scenarios can't: real volume, real naming habits, the Friday-evening rush.

Agree beforehand how long it runs, what must be true at the end (for example, a number of consecutive clean days), and what restarts the clock.

### Step 5: acceptance and sign-off

Sign-off is a checklist with names on it, not a meeting:

| Check | Owner | Evidence |
|---|---|---|
| Every scripted scenario passed or has an agreed, documented exception | Integrator + lab lead | Scenario log with results |
| Parallel run met its exit criteria | Integrator + PACS team | Daily reconciliation reports |
| Latency within the agreed budget (percentile and maximum) | Integrator | Latency export |
| Hold queue empty or every item explained | Lab lead | Hold-queue snapshot |
| Monitoring and alerts live; on-call knows what an alert means | Integrator + IT | Test alert received |
| Rollback plan written and rehearsed | Integrator + biomed | Rehearsal notes |
| Test patients and studies cleaned up everywhere | PACS team | Cleanup confirmation |
| Conformance gaps from Chapter 25 resolved or accepted | Integrator + PACS team | Decision log |

### The rollback plan

Before go-live, write down how to undo it: which machine destinations are removed or disabled, in what order, by whom, and how studies sent during the problem are recovered or re-sent. The simplest rollbacks keep the existing PACS path untouched throughout, so rollback is removing a destination, not rebuilding one. Rehearse it once.

<figure class="diagram">
<svg viewBox="0 0 720 200" role="img" aria-label="Go-live timeline: survey, test plan, connectivity, scripted scenarios, parallel run, sign-off, then a week of hypercare, with rollback available until sign-off.">
<defs><marker id="ch27-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<line x1="30" y1="90" x2="700" y2="90" marker-end="url(#ch27-arrow)"/>
<circle cx="50" cy="90" r="6" class="box"/>
<circle cx="150" cy="90" r="6" class="box"/>
<circle cx="250" cy="90" r="6" class="box"/>
<circle cx="350" cy="90" r="6" class="box"/>
<circle cx="470" cy="90" r="6" class="box"/>
<circle cx="570" cy="90" r="8" class="box accent"/>
<text x="50" y="66" text-anchor="middle" class="small">Survey</text>
<text x="150" y="66" text-anchor="middle" class="small">Test plan</text>
<text x="250" y="66" text-anchor="middle" class="small">C-ECHO</text>
<text x="350" y="66" text-anchor="middle" class="small">Scenarios</text>
<text x="470" y="66" text-anchor="middle" class="small">Parallel run</text>
<text x="570" y="66" text-anchor="middle" class="small bold">Sign-off</text>
<text x="150" y="114" text-anchor="middle" class="small muted">agreed in writing</text>
<text x="350" y="114" text-anchor="middle" class="small muted">hard cases on purpose</text>
<text x="470" y="114" text-anchor="middle" class="small muted">daily reconciliation</text>
<line x1="575" y1="150" x2="700" y2="150" class="dashed"/>
<text x="640" y="140" text-anchor="middle" class="small">hypercare</text>
<line x1="250" y1="170" x2="565" y2="170" class="dashed"/>
<text x="410" y="190" text-anchor="middle" class="small muted">rollback rehearsed and ready until sign-off</text>
</svg>
<figcaption>Figure 27.1 — A go-live: facts first, the plan agreed before testing, the hard cases scripted, a parallel run, and sign-off against criteria set in advance.</figcaption>
</figure>

### Hypercare: the first week

Sign-off isn't the end. For the first week or so, watch more closely than you will in steady state: review the reconciliation and the hold queue every day with the lab lead, check alerts in real time, and keep a short log of every issue with its cause. Most go-live problems that slip past testing show up in this window, when real volume meets real habits. Hypercare ends when the issue log has gone quiet for an agreed period, and the production monitoring of Chapter 28 takes over.

## Lab

**Write a go-live plan for a synthetic facility.** No equipment needed.

1. Invent a facility: two vascular rooms, each with one ultrasound machine (give them AE titles like `US_ROOM2`, `US_ROOM3`), an existing PACS, a worklist broker, and a gateway. Write the ownership table for it.
2. Fill in a site survey for both machines from their (imagined) conformance statements: SOP classes, transfer syntaxes, MWL/MPPS/Storage Commitment support. Note one gap, for example one machine sends cine only in a transfer syntax the receiver doesn't accept.
3. Take the scenario table above. For each scenario, write the exact technologist steps and the pass condition with numbers. Add one scenario of your own that comes from the gap you noted.
4. Write the parallel-run exit criteria (how many days, what counts as clean, what restarts the clock) and a one-paragraph rollback plan.
5. Extra, if you have the Chapter 16 and 23 labs running: perform scenario 7 for real. Start a send from `storescu` to the gateway Orthanc, stop the forwarding target mid-way, start it again, and resubmit the failed forwarding job (Orthanc does not retry it by itself; Chapter 16 shows the call). Then check that reconciliation (Chapter 26) is complete at the end.

## In Lumen

Every Lumen facility go-live for machine-sent images (planned; today images arrive by browser upload) would follow this chapter, with a few Lumen-specific checks added to the plan:

- The gateway's device credential is issued for that facility, and scenario 11 proves a wrong credential stores nothing.
- Scenario 5 (wrong worklist pick) must end with the images held or matched to the corrected exam, never attached by name alone (Chapter 22).
- The hold queue is shown to the lab lead before go-live, so the people who will resolve held studies have seen one.
- Exams already finalized are a scenario: images arriving after sign-off go to the hold queue rather than changing a signed report.

## How it fails

- **"Send a few test studies."** No script, no pass conditions, no hard cases. Go-live happens; testing happens afterwards, on patients.
- **Criteria after the fact.** A failure during testing is waved through because nobody had written down what pass meant.
- **Real patients as test data.** A "quick test" on a real study, and now a real patient's images exist in a system they shouldn't, possibly with the wrong exam.
- **No parallel run.** Volume and naming habits are only discovered after the old path is turned off.
- **Rollback that was never rehearsed.** The first time anyone tries to remove the destination is during an incident, at night.
- **Test data left behind.** Test studies linger in the existing PACS and the new system and are later mistaken for real ones.

## Evidence

You understand this chapter when you can hand a facility a go-live plan in which every scripted scenario has steps and a numeric pass condition, the parallel run has written exit criteria, the rollback is written and rehearsed, and the sign-off checklist names who signs each line and what evidence they look at.

## Workbook

1. Why must acceptance criteria be agreed before testing starts?
2. Which scenarios in the table are most likely to be skipped, and why are they the important ones?
3. What makes a test patient acceptable for a go-live on a live clinical system?
4. During a parallel run, the new path stored 312 instances for a day and the PACS shows 312. Is the day clean? What else do you check?
5. Why is the simplest rollback one where the existing PACS path is never touched?

## Answers

1. Criteria written after a failure tend to bend around the failure, and then they no longer protect anyone. Agreeing them in advance, in writing, with the facility's owners turns go-live into a pass/fail check rather than a negotiation. See "Step 2: the test plan, agreed in writing" and Chapter 24.
2. Scenarios 5 through 8: wrong worklist pick (5), the study with no order (6), network drop mid-send (7) and gateway restart during a send (8). They are skipped because they take effort, disrupt the room, or make people nervous. They are the ones that exercise matching safety and recovery, where wrong-patient and missing-image failures, the most harmful ones, actually happen. See "Step 3: scripted scenarios" and Chapter 24's harm table.
3. It is created through the facility's own test-patient procedure. Its name and MRN can't be mistaken for a real person (a `TEST^` prefix, a reserved MRN range), and it is scheduled through the normal order and worklist path. Cleanup from every system it reaches is agreed in advance. Real patients, staff, and "real studies we'll delete" are never acceptable. See "Test patients that are obviously not real".
4. Not necessarily. Equal counts can hide one missing instance and one extra instance (Chapter 26's Lab). Reconcile study by study and UID by UID, check that every study matched the right exam, and confirm that nothing sits unexplained in the hold queue. See "Step 4: the parallel run".
5. If the old path keeps working throughout, rollback is just removing or disabling the new destination, which is fast, low-risk and easy to rehearse. Nothing has to be rebuilt in a hurry, and studies keep reaching the system of record while the problem is investigated. See "The rollback plan".

<p class="sources">Sources: DICOM PS3.4 Annex K (Basic Worklist Management, Modality Worklist), Annex F (Procedure Step SOP Classes, F.7 Modality Performed Procedure Step), Annex J (Storage Commitment); IHE Radiology Technical Framework Vol. 1, §34 Scheduled Workflow.b. Scenario design follows the requirements in Chapter 24 and the integrity checks in Chapter 26.</p>
