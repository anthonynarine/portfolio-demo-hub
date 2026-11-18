---
number: 8
title: Modality Worklist and MPPS: the schedule and the status
objective: Explain how a machine fills in its patient list with a Modality Worklist query and reports progress with MPPS, build and query a worklist yourself, and say what each one does and does not guarantee.
status: draft
---

## At the machine

You open the patient list on the ultrasound system and today's schedule for your room is already there: name, MRN, date of birth, the ordered exam, the accession number. You pick the patient and the fields fill themselves in. You never type a name, so there is never a misspelled one. Every image you capture carries what the worklist said.

When there is no worklist, you notice at once. Maybe the order was placed late, or entered for the wrong room, or the interface is down. You type the patient in by hand, the accession number is usually blank, and afterwards someone in PACS spends time reconciling a study that arrived with no order to attach to.

Less visibly, when you start the exam the machine tells the department's systems that it has begun. When you press End Exam it says it finished, and how many images it made. That second message is **MPPS**. Many technologists never see it, but the front desk's status board, the reading list and sometimes billing depend on it.

This chapter covers both sides of the schedule: the machine asking "who am I scanning?" and the machine reporting "here is what I did."

## On the wire

### The worklist is a C-FIND

There is no special worklist protocol. A worklist is a **C-FIND** (Chapter 7) against a different information model, the **Modality Worklist Information Model**, SOP Class UID `1.2.840.10008.5.1.4.31`. The machine is the SCU; the worklist provider is the SCP.

The provider is usually the radiology information system (RIS), or a worklist broker sitting between the hospital's HL7 order feed and the machines (Chapters 2 and 3). The order arrives as an HL7 message, the broker turns it into a worklist entry, and the machine finds that entry by querying for it. Figure 8.1 shows the whole exchange for one study, including the MPPS messages explained below.

<figure class="diagram">
<svg viewBox="0 0 720 420" role="img" aria-label="Sequence for one study: an HL7 order reaches the worklist provider; the machine queries the worklist with C-FIND and gets the entry; it reports IN PROGRESS with MPPS N-CREATE, stores images with C-STORE to the archive, then reports COMPLETED with MPPS N-SET.">
<defs><marker id="ch08-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="160" height="50" rx="4" class="box"/>
<text x="100" y="50" text-anchor="middle">Ultrasound</text>
<rect x="280" y="20" width="160" height="50" rx="4" class="box accent"/>
<text x="360" y="42" text-anchor="middle">RIS / broker</text>
<text x="360" y="60" text-anchor="middle" class="small muted">worklist + MPPS SCP</text>
<rect x="540" y="20" width="160" height="50" rx="4" class="box"/>
<text x="620" y="50" text-anchor="middle">Archive</text>
<line x1="100" y1="70" x2="100" y2="410" class="dashed"/>
<line x1="360" y1="70" x2="360" y2="410" class="dashed"/>
<line x1="620" y1="70" x2="620" y2="410" class="dashed"/>
<text x="470" y="100" text-anchor="middle" class="small muted">HL7 order arrives</text>
<line x1="540" y1="108" x2="365" y2="108" marker-end="url(#ch08-arrow)" class="dashed"/>
<line x1="100" y1="145" x2="355" y2="145" marker-end="url(#ch08-arrow)"/>
<text x="228" y="137" text-anchor="middle" class="small">C-FIND (Modality Worklist)</text>
<line x1="355" y1="180" x2="105" y2="180" marker-end="url(#ch08-arrow)"/>
<text x="228" y="172" text-anchor="middle" class="small">Pending: the scheduled entry</text>
<line x1="100" y1="230" x2="355" y2="230" marker-end="url(#ch08-arrow)" class="accent"/>
<text x="228" y="222" text-anchor="middle" class="small">MPPS N-CREATE: IN PROGRESS</text>
<line x1="100" y1="290" x2="615" y2="290" marker-end="url(#ch08-arrow)"/>
<text x="360" y="282" text-anchor="middle" class="small">C-STORE, one per image</text>
<line x1="100" y1="350" x2="355" y2="350" marker-end="url(#ch08-arrow)" class="accent"/>
<text x="228" y="342" text-anchor="middle" class="small">MPPS N-SET: COMPLETED</text>
<text x="490" y="385" text-anchor="middle" class="small muted">RIS updates status; may tell PACS</text>
</svg>
<figcaption>Figure 8.1 — One study's schedule and status. The worklist query and the MPPS messages go to the RIS or broker; the images go to the archive.</figcaption>
</figure>

### What a worklist entry contains

A worklist entry describes a **Requested Procedure** (what was ordered) and one or more **Scheduled Procedure Steps** (when, where and on which kind of machine it should be done). The steps are items inside the Scheduled Procedure Step Sequence:

| Tag | Name | Level |
|---|---|---|
| (0010,0010) | Patient's Name | patient |
| (0010,0020) | Patient ID | patient |
| (0010,0030) | Patient's Birth Date | patient |
| (0010,0040) | Patient's Sex | patient |
| (0008,0050) | Accession Number | the order |
| (0008,0090) | Referring Physician's Name | the order |
| (0040,1001) | Requested Procedure ID | requested procedure |
| (0032,1060) | Requested Procedure Description | requested procedure |
| (0020,000D) | Study Instance UID | requested procedure |
| (0040,0100) | Scheduled Procedure Step Sequence | contains the items below |
| &gt;(0040,0001) | Scheduled Station AE Title | step |
| &gt;(0040,0002) | Scheduled Procedure Step Start Date | step |
| &gt;(0040,0003) | Scheduled Procedure Step Start Time | step |
| &gt;(0008,0060) | Modality | step |
| &gt;(0040,0006) | Scheduled Performing Physician's Name | step |
| &gt;(0040,0007) | Scheduled Procedure Step Description | step |
| &gt;(0040,0009) | Scheduled Procedure Step ID | step |

The `>` marks an element nested inside a sequence item, the same notation PS3.4 uses.

Two of these values carry the study through the rest of its life. The **Accession Number** is the order's identifier, the one a reporting system matches on (Chapter 22). The **Study Instance UID**, when the worklist provides one, is the UID the machine should put on every image of the study (Chapter 11). The images and the order then agree on what "this study" means before the first image exists.

### How the machine finds its own entries

A worklist C-FIND is filtered. PS3.4 Table K.6-1 makes some keys **required matching keys**: every worklist SCP must support matching on them. Four are the ones a machine uses to say "mine, today":

- **Scheduled Station AE Title** (0040,0001), with single-value matching only: "scheduled for this station."
- **Scheduled Procedure Step Start Date** (0040,0002), single value or a range: "today," or "today and tomorrow."
- **Modality** (0008,0060): "ultrasound."
- **Patient ID** (0010,0020): used when the technologist searches for one patient.

Each machine's network settings decide which of these it sends. A common setup is "my AE title, today, US." It's tidy when it works, and it's the reason a correct order can still be invisible: entered for room 5, it never appears on room 3's machine. The lab reproduces exactly that.

### MPPS: the machine reports what it actually did

The worklist is the plan. **Modality Performed Procedure Step** (MPPS, SOP Class UID `1.2.840.10008.3.1.2.3.3`) is the report of what happened.

MPPS uses the other family of DIMSE services, **DIMSE-N**. The N stands for normalized: an N-service acts on one specific object, named by its SOP Instance UID. The machine is the SCU and creates a performed-procedure-step object at the SCP, then updates it:

<div class="pairs">
<div><span>N-CREATE</span><p>When the exam starts. The machine generates a new SOP Instance UID for this performed step, which the standard requires it to supply, and sends Performed Procedure Step Status (0040,0252) = <code>IN PROGRESS</code>, with the patient, its station AE title, the start date and time, and the Scheduled Step Attributes Sequence (0040,0270): the accession number, requested procedure ID and step ID copied from the worklist entry it fulfills.</p></div>
<div><span>N-SET</span><p>When the exam ends. It is sent to the same SOP Instance UID with status <code>COMPLETED</code> or <code>DISCONTINUED</code>, the end date and time, and the Performed Series Sequence (0040,0340): which series were made and which images (Referenced Image Sequence (0008,1140)) belong to them.</p></div>
</div>

The step is a small state machine (Figure 8.2), and the final states really are final. Once the status is COMPLETED or DISCONTINUED, the standard says the machine shall not modify the step again. An SCP that receives a later N-SET answers `0110` (processing failure) with Error ID `A710`, "Performed Procedure Step Object may no longer be updated."

<figure class="diagram">
<svg viewBox="0 0 720 200" role="img" aria-label="MPPS states: N-CREATE makes the step IN PROGRESS; N-SET moves it to COMPLETED or DISCONTINUED; both are final and further updates are refused with status 0110, error A710.">
<defs><marker id="ch08-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<line x1="30" y1="100" x2="200" y2="100" marker-end="url(#ch08-arrow2)"/>
<text x="115" y="90" text-anchor="middle" class="small">N-CREATE</text>
<rect x="200" y="72" width="160" height="56" rx="4" class="box accent"/>
<text x="280" y="105" text-anchor="middle">IN PROGRESS</text>
<line x1="360" y1="88" x2="500" y2="48" marker-end="url(#ch08-arrow2)"/>
<text x="420" y="56" text-anchor="middle" class="small">N-SET</text>
<line x1="360" y1="112" x2="500" y2="152" marker-end="url(#ch08-arrow2)"/>
<text x="420" y="152" text-anchor="middle" class="small">N-SET</text>
<rect x="500" y="20" width="180" height="56" rx="4" class="box"/>
<text x="590" y="53" text-anchor="middle">COMPLETED</text>
<rect x="500" y="124" width="180" height="56" rx="4" class="box"/>
<text x="590" y="157" text-anchor="middle">DISCONTINUED</text>
<text x="590" y="100" text-anchor="middle" class="small muted">final: later N-SET → 0110 / A710</text>
</svg>
<figcaption>Figure 8.2 — A performed procedure step's life. Only IN PROGRESS can change; COMPLETED and DISCONTINUED are final.</figcaption>
</figure>

### What MPPS is used for, and what it isn't

Downstream systems commonly use MPPS to:
- mark the order "in progress" and then "done" on the department's status board;
- tell the reading list a study is ready;
- know how many images to expect, so a study isn't read while it's still arriving;
- start charge capture.

A DISCONTINUED step, with its reason, explains why an ordered study has fewer images than planned, or none.

What MPPS is **not**: proof that any image was stored. N-SET COMPLETED is the machine's own account, sent to the RIS. The images go separately, by C-STORE, to the archive, and they can fail while the MPPS succeeds. Proof that the archive kept them is a third conversation, storage commitment (Chapter 9).

## Lab

**Build a worklist, query it as a machine, then report a procedure step.** Synthetic data only, all on your laptop. You need DCMTK and Python 3.10+, as in Chapter 7.

**Part 1: a worklist.** DCMTK's `wlmscpfs` serves worklist entries from files. The **called** AE title chooses a subdirectory, each entry is one `.wl` file, and each directory needs an empty file named `lockfile`.

```bash
mkdir -p wlistdb/LABWL && touch wlistdb/LABWL/lockfile
```

Save this text as `order1.dump`. It is one scheduled carotid duplex for `TEST^PATIENT`, for the station `US_ROOM3`. Change the date in (0040,0002) to today in `YYYYMMDD` form.

```text
# Synthetic worklist entry: one scheduled carotid duplex
(0008,0005) CS [ISO_IR 100]
(0008,0050) SH [ACC-0001]
(0008,0090) PN [ORDERING^DEMO]
(0010,0010) PN [TEST^PATIENT]
(0010,0020) LO [DEMO-0001]
(0010,0030) DA [19600101]
(0010,0040) CS [F]
(0020,000d) UI [2.25.100100100100]
(0032,1060) LO [Carotid duplex, bilateral]
(0040,0100) SQ
(fffe,e000) -
(0008,0060) CS [US]
(0040,0001) AE [US_ROOM3]
(0040,0002) DA [20261118]
(0040,0003) TM [090000]
(0040,0006) PN []
(0040,0007) LO [Carotid duplex]
(0040,0009) SH [SPS-0001]
(fffe,e00d) -
(fffe,e0dd) -
(0040,1001) SH [RP-0001]
```

Convert it to a DICOM file and start the worklist server on port 11114:

```bash
dump2dcm +te order1.dump wlistdb/LABWL/order1.wl
wlmscpfs -v -dfp wlistdb 11114
```

In a second terminal, be the machine in room 3. `-W` selects the worklist model. The sequence keys use DCMTK's path syntax, which puts a key inside the first item of the Scheduled Procedure Step Sequence:

```bash
findscu -v -W -aet US_ROOM3 -aec LABWL \
  -k PatientName -k PatientID -k AccessionNumber -k RequestedProcedureID -k StudyInstanceUID \
  -k "ScheduledProcedureStepSequence[0].ScheduledStationAETitle=US_ROOM3" \
  -k "ScheduledProcedureStepSequence[0].ScheduledProcedureStepStartDate=20261118" \
  -k "ScheduledProcedureStepSequence[0].Modality=US" \
  -k "ScheduledProcedureStepSequence[0].ScheduledProcedureStepID" \
  localhost 11114
```

You get one Pending response containing `TEST^PATIENT`, `ACC-0001`, the Study Instance UID and the step item, then Success. Now:

- **Be room 5.** Change both `US_ROOM3` values to `US_ROOM5`. You get only the final Success and no entry: the order exists, but not for this station.
- **Call the wrong service.** Use `-aec NOSUCH`. `wlmscpfs` rejects the association with "Called AE Title Not Recognized," because there is no `wlistdb/NOSUCH` directory.

**Part 2: a performed procedure step.** Neither DCMTK nor Orthanc includes an MPPS receiver, so write a small one with pynetdicom (`pip install pydicom==3.0.1 pynetdicom==3.0.1`). Install it in its own virtual environment: pynetdicom adds command-line apps named `echoscu`, `findscu`, `storescu` and so on, which would shadow DCMTK's in Part 1 while that environment is active. Save as `mpps_scp.py`:

```python
"""A tiny MPPS receiver (SCP) that prints each step's status. Synthetic, local only."""
from pydicom.dataset import Dataset
from pynetdicom import AE, evt
from pynetdicom.sop_class import ModalityPerformedProcedureStep

steps = {}  # SOP Instance UID -> current attributes


def on_create(event):
    req = event.request
    if req.AffectedSOPInstanceUID is None:  # the SCU must give the step its UID here
        return 0x0106, None  # Invalid attribute value
    attrs = event.attribute_list
    if attrs.PerformedProcedureStepStatus != "IN PROGRESS":
        return 0x0106, None
    steps[req.AffectedSOPInstanceUID] = attrs
    print("N-CREATE", attrs.PerformedProcedureStepStatus, flush=True)
    return 0x0000, attrs


def on_set(event):
    uid = event.request.RequestedSOPInstanceUID
    if uid not in steps:
        return 0x0112, None  # No such SOP Instance
    current = steps[uid]
    if current.PerformedProcedureStepStatus != "IN PROGRESS":
        status = Dataset()
        status.Status = 0x0110  # Processing failure
        status.ErrorID = 0xA710  # "Performed Procedure Step Object may no longer be updated"
        return status, None
    for element in event.modification_list:
        current.add(element)
    print("N-SET   ", current.PerformedProcedureStepStatus, flush=True)
    return 0x0000, current


ae = AE(ae_title="LABMPPS")
ae.add_supported_context(ModalityPerformedProcedureStep)
ae.start_server(("127.0.0.1", 11115), evt_handlers=[(evt.EVT_N_CREATE, on_create), (evt.EVT_N_SET, on_set)])
```

And the machine's side, `mpps_scu.py`. It copies the identifiers from the worklist entry into the Scheduled Step Attributes Sequence, reports IN PROGRESS, then COMPLETED, then tries to change the finished step:

```python
"""Play the ultrasound machine: report a step IN PROGRESS, then COMPLETED."""
from datetime import datetime

from pydicom.dataset import Dataset
from pydicom.uid import generate_uid
from pynetdicom import AE
from pynetdicom.sop_class import ModalityPerformedProcedureStep

now = datetime.now()
step_uid = generate_uid()

ssa = Dataset()  # which scheduled step this performed step fulfils (copied from the worklist)
ssa.AccessionNumber = "ACC-0001"
ssa.StudyInstanceUID = "2.25.100100100100"
ssa.RequestedProcedureID = "RP-0001"
ssa.ScheduledProcedureStepID = "SPS-0001"

create = Dataset()
create.ScheduledStepAttributesSequence = [ssa]
create.PatientName, create.PatientID = "TEST^PATIENT", "DEMO-0001"
create.PerformedProcedureStepID = "PPS-0001"
create.PerformedStationAETitle = "US_ROOM3"
create.PerformedProcedureStepStartDate = now.strftime("%Y%m%d")
create.PerformedProcedureStepStartTime = now.strftime("%H%M%S")
create.PerformedProcedureStepStatus = "IN PROGRESS"
create.Modality = "US"

ae = AE(ae_title="US_ROOM3")
ae.add_requested_context(ModalityPerformedProcedureStep)
assoc = ae.associate("127.0.0.1", 11115, ae_title="LABMPPS")
status, _ = assoc.send_n_create(create, ModalityPerformedProcedureStep, step_uid)
print("N-CREATE status 0x%04X" % status.Status)

done = Dataset()
done.PerformedProcedureStepStatus = "COMPLETED"
done.PerformedProcedureStepEndDate = now.strftime("%Y%m%d")
done.PerformedProcedureStepEndTime = datetime.now().strftime("%H%M%S")
status, _ = assoc.send_n_set(done, ModalityPerformedProcedureStep, step_uid)
print("N-SET status 0x%04X" % status.Status)

status, _ = assoc.send_n_set(done, ModalityPerformedProcedureStep, step_uid)
print("second N-SET status 0x%04X, Error ID 0x%04X" % (status.Status, status.get("ErrorID", 0)))
assoc.release()
```

Run `python mpps_scp.py` in one terminal and `python mpps_scu.py` in another. The machine side prints:

```text
N-CREATE status 0x0000
N-SET status 0x0000
second N-SET status 0x0110, Error ID 0xA710
```

The receiver prints `N-CREATE IN PROGRESS` then `N-SET COMPLETED`. The third message was refused: a completed step can't be reopened.

This receiver is a teaching toy. It keeps steps in memory, and it skips most of the attribute checks PS3.4 §F.7.2 requires of a real one.

## In Lumen

Lumen does not provide a worklist, and the planned design does not change that. In a facility, the machine already gets its worklist from the hospital's RIS or broker, fed by the same orders that create the exam on the reporting side. What Lumen needs from this chapter is the result. Because the machine took the patient from the worklist, every image it sends carries the order's **Accession Number**, and in the planned design that is how an incoming image finds its exam (Chapter 22). An image that arrives with no accession number usually means someone typed the patient in by hand. That image is the one most likely to land in the hold queue.

MPPS is not part of Lumen's planned design either. It's worth knowing as a signal Lumen could listen to later, through the gateway. "COMPLETED, 42 images" would let a reporting system know when a study has fully arrived, rather than guessing from a pause in the images. If that is ever built, the same rule applies as for images: it is the machine's own claim, so it is checked against what actually arrived, not trusted on its own.

## How it fails

- **The patient isn't on the worklist.** The order wasn't placed yet, or was entered for another room, date or modality, so the machine's filter hides it. The technologist types the patient in by hand, and the study arrives with typos and no accession number.
- **A stale list.** Machines cache the worklist and refresh on a timer or a button. An order changed after the last refresh, like a corrected name or a cancelled exam, isn't seen.
- **One order, two entries.** A rescheduled order whose old entry was never removed. The technologist picks the wrong one, and the study's UID and accession belong to a step that won't be read.
- **The Study Instance UID isn't used.** Some setups generate a new Study Instance UID on the machine instead of taking it from the worklist. Matching then depends on the accession number alone.
- **A step stuck IN PROGRESS.** The machine crashed or the network dropped before N-SET. Status boards show an exam that never ends, until someone closes it by hand.
- **MPPS COMPLETED, images missing.** MPPS and C-STORE are separate conversations to separate systems. A green status board does not mean the archive has the study.

## Evidence

You understand this chapter when you can take one study and show:
- the worklist entry it came from (accession number, requested procedure, scheduled step, station);
- the query that found it, and which keys did the filtering;
- the MPPS N-CREATE and N-SET that reported it;
- the link between them, the Scheduled Step Attributes Sequence.

You can also explain why a correct order might never appear on the machine in front of you.

## Workbook

1. A carotid order exists in the RIS, but the technologist in room 3 can't see it on the machine. Name three keys in the machine's worklist query that could be hiding it.
2. Which two values from a worklist entry matter most to a reporting system receiving the images, and what does each one tie together?
3. Why is MPPS sent with DIMSE-N services instead of C-STORE or C-FIND, and what identifies the object each N-SET updates?
4. The RIS shows a study as COMPLETED, but the archive has only half of its images. How is that possible, and which service would confirm the archive has them all?
5. A machine sends N-SET with status COMPLETED twice for the same step. What should a conformant receiver answer the second time?

## Answers

1. The query is usually filtered by Scheduled Station AE Title, Scheduled Procedure Step Start Date and Modality. These are required matching keys (see "How the machine finds its own entries"). If the order was entered for another station (`US_ROOM5`), for another day, or with another modality, the worklist provider correctly leaves it out. The lab's "be room 5" step shows exactly this. The fix is in the order or the scheduling, not on the machine.
2. The **Accession Number** ties the images to the order, and it's the key a reporting system uses to find the exam. The **Study Instance UID** ties all the images of the study together under one UID that, ideally, the order and the images share from the start (see "What a worklist entry contains"). If both are present and consistent, matching an incoming image is a lookup, not a guess.
3. MPPS is not a stored image or a query. It is an object at the receiver that is created once and then changed, which is what normalized DIMSE-N services are for (see "MPPS: the machine reports what it actually did"). N-CREATE makes it and N-SET changes it. Each N-SET names the object by the SOP Instance UID the machine assigned in its N-CREATE (Requested SOP Instance UID in the N-SET).
4. MPPS goes to the RIS and C-STORE goes to the archive. They're separate conversations, so the machine can report COMPLETED while some C-STOREs failed or are still queued (Figure 8.1 and "What MPPS is used for, and what it isn't"). Storage commitment (Chapter 9) is the service in which the archive itself confirms it holds each listed image.
5. It should refuse the update with status `0110` (processing failure) and Error ID `A710`, "Performed Procedure Step Object may no longer be updated." Once a step is COMPLETED or DISCONTINUED it is final (Figure 8.2), which is what the lab's third message demonstrates.

<p class="sources">Sources: DICOM PS3.4 §K.6 and Table K.6-1 (Modality Worklist Information Model, SOP Class UID, matching and return keys), §F.7.2 (MPPS N-CREATE and N-SET behavior, SCU-supplied SOP Instance UID, finality of COMPLETED/DISCONTINUED, status 0110 with Error ID A710), §F.7.3 (MPPS SOP Class UID); PS3.7 §10 (DIMSE-N services). DCMTK man pages for wlmscpfs, findscu (path syntax for sequence keys) and dump2dcm, and the DCMTK example worklist database README (lockfile, .wl files, AE-title subdirectories). pynetdicom 3.0 documentation (N-CREATE/N-SET handlers). Lab run with DCMTK 3.6.7, pydicom 3.0.1 and pynetdicom 3.0.1.</p>
