---
number: 7
title: C-ECHO, C-STORE, C-FIND, C-MOVE: the four verbs
objective: Read any DIMSE-C exchange as a command plus an optional data set, predict the status codes it can return, and run echo, store, query and retrieve against a real archive yourself.
status: draft
---

## At the machine

Most of a technologist's DICOM life is four buttons, even if they never have those names.

- **Verify** on the network setup screen, when biomed adds a new destination.
- **End Exam** or **Send**, which pushes the study to PACS.
- **Query** on the machine or a reading workstation: type a last name or an MRN, and a list of the patient's earlier studies appears.
- **Retrieve** next to one of those results, which pulls the prior carotid study onto the screen so you can compare the plaque you see today with the plaque someone measured last year.

Each of those buttons is one of DICOM's composite services, the **DIMSE-C** operations: C-ECHO, C-STORE, C-FIND and C-MOVE (plus a fifth, C-GET, which does Retrieve differently). Chapter 1 named three of them. This chapter opens them up. By the end you will have sent each one yourself and read the answer the archive sent back.

## On the wire

### Every message is a command, and sometimes a data set

Chapter 5 showed that nothing moves until an association is open and a presentation context is agreed. Once it is, the two sides exchange **messages**. Every DIMSE message has the same two-part shape (Figure 7.1):

1. A **Command Set**: a small group of elements, all in group `0000`, that says what is being asked and about which object.
2. An optional **Data Set**: the object itself (an image for C-STORE), or a query (for C-FIND and C-MOVE).

<figure class="diagram">
<svg viewBox="0 0 720 250" role="img" aria-label="A DIMSE message is a Command Set in group 0000, always Implicit VR Little Endian, followed by an optional Data Set in the negotiated transfer syntax.">
<rect x="40" y="40" width="300" height="170" rx="4" class="box accent"/>
<text x="190" y="70" text-anchor="middle">Command Set (group 0000)</text>
<text x="60" y="102" class="small">(0000,0100) Command Field</text>
<text x="60" y="126" class="small">(0000,0110) Message ID</text>
<text x="60" y="150" class="small">(0000,0002) Affected SOP Class UID</text>
<text x="60" y="174" class="small">(0000,0800) Command Data Set Type</text>
<text x="60" y="198" class="small muted">(0000,0900) Status, in responses</text>
<rect x="380" y="40" width="300" height="170" rx="4" class="box"/>
<text x="530" y="70" text-anchor="middle">Data Set (optional)</text>
<text x="400" y="102" class="small">C-STORE: the image</text>
<text x="400" y="126" class="small">C-FIND / C-MOVE: the query keys</text>
<text x="400" y="150" class="small">C-ECHO: none</text>
<text x="400" y="174" class="small muted">0101H in Command Data Set Type</text>
<text x="400" y="198" class="small muted">means "no data set follows"</text>
<text x="190" y="235" text-anchor="middle" class="small muted">always Implicit VR Little Endian</text>
<text x="530" y="235" text-anchor="middle" class="small muted">in the negotiated transfer syntax</text>
</svg>
<figcaption>Figure 7.1 — A DIMSE message: a fixed-format command, then an optional data set encoded in the transfer syntax the presentation context agreed.</figcaption>
</figure>

The Command Set is always encoded Little Endian with implicit VRs, whatever transfer syntax was negotiated for the data. That is why a receiver can always read the command, even before it decides what to do with the payload.

Three command elements do most of the work:

<div class="pairs">
<div><span>Command Field</span><p>(0000,0100). Which operation this is. Requests have the high bit clear and responses have it set: C-STORE-RQ is 0001H and C-STORE-RSP is 8001H.</p></div>
<div><span>Message ID</span><p>(0000,0110). A number the sender picks for each request. The response carries it back in Message ID Being Responded To (0000,0120), so replies can be matched to requests.</p></div>
<div><span>Status</span><p>(0000,0900). In every response: did it work, and if not, why.</p></div>
</div>

| Operation | Request | Response |
|---|---|---|
| C-STORE | 0001H | 8001H |
| C-GET | 0010H | 8010H |
| C-FIND | 0020H | 8020H |
| C-MOVE | 0021H | 8021H |
| C-ECHO | 0030H | 8030H |
| C-CANCEL | 0FFFH | (no response) |

### Status codes: read the first digit

Every response has a Status. PS3.7 Annex C sorts every code into five classes, and the class is what your code should branch on first:

| Class | Codes | What it means for you |
|---|---|---|
| Success | `0000` | Done. |
| Warning | `0001`, `Bxxx`, `0107`, `0116` | Done, but not exactly as sent. Log it; someone may need to look. |
| Failure | `Axxx`, `Cxxx`, `01xx`, `02xx` (except 0107 and 0116) | Not done. |
| Cancel | `FE00` | Stopped because you asked it to stop. |
| Pending | `FF00`, `FF01` | More is coming; keep reading. |

Each service then gives the `x` digits a meaning. For C-STORE (PS3.4 Table B.2-1):

| Status | Meaning |
|---|---|
| `0000` | Success |
| `A7xx` | Refused: out of resources (the archive is full or busy) |
| `A9xx` | Error: data set does not match SOP Class |
| `Cxxx` | Error: cannot understand |
| `B000` | Warning: coercion of data elements (the archive changed some values) |
| `B006` | Warning: elements discarded |
| `B007` | Warning: data set does not match SOP Class |

The `x` digits are left to the implementation, so a receiver can say *which* resource ran out. A sender is only required to recognize the range. In practice: treat `A7xx` as "try again later," treat `A9xx` and `Cxxx` as "this object needs a human," and never treat a `B` warning as a silent success. `B000` means the archive stored something other than what the machine sent.

### C-ECHO: "are you there?"

C-ECHO has no data set and one status: success, or one of the general failures. It proves the network path, the AE titles and the association are all right. It proves nothing about whether the receiver will accept an ultrasound image. Chapter 5's presentation contexts are where that is decided.

### C-STORE: "here is one object; keep it"

One C-STORE carries exactly one SOP Instance: one still, one cine clip, one Structured Report. A study of forty images is forty C-STOREs, usually sent one after another on a single association. Each gets its own status, so a single study can be partly stored. A sender that only looks at the last response will miss the failures.

### C-FIND: "what do you have?"

C-FIND sends a data set called the **identifier**. It is a query written as a DICOM data set:

- An element with a **value** is a **matching key**: "Patient ID must be `DEMO-0001`."
- An element that is **empty** is a **return key**: "tell me the Study Date of each match." It also matches everything, which the standard calls universal matching.

Matching has a few forms: a single value; a wildcard (`*` and `?`); a range for dates and times (`20260101-20261231`); and a list of UIDs.

The archive answers with one **Pending** response (`FF00`) per match, each carrying an identifier filled in with that match's values, then one final **Success** (`0000`) with no data set. `FF01` is also Pending, but warns that some optional keys were not supported. If a query matches 300 studies, you get 301 responses.

The query is asked against an **information model**, a hierarchy (Figure 7.2), and at one **level** of it, named in Query/Retrieve Level (0008,0052). Two models matter today:

- **Study Root**: levels STUDY, SERIES, IMAGE. This is the one most systems use.
- **Patient Root**: adds a PATIENT level above STUDY.

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="The query/retrieve hierarchy: Patient, Study, Series, Image, each level with its unique key. Study Root starts at Study.">
<rect x="60" y="20" width="220" height="50" rx="4" class="box dashed"/>
<text x="170" y="50" text-anchor="middle">PATIENT</text>
<rect x="60" y="90" width="220" height="50" rx="4" class="box accent"/>
<text x="170" y="120" text-anchor="middle">STUDY</text>
<rect x="60" y="160" width="220" height="50" rx="4" class="box"/>
<text x="170" y="190" text-anchor="middle">SERIES</text>
<rect x="60" y="230" width="220" height="50" rx="4" class="box"/>
<text x="170" y="260" text-anchor="middle">IMAGE</text>
<line x1="170" y1="70" x2="170" y2="90" class="dashed"/>
<line x1="170" y1="140" x2="170" y2="160"/>
<line x1="170" y1="210" x2="170" y2="230"/>
<text x="320" y="50" class="small">Patient ID (0010,0020)</text>
<text x="320" y="120" class="small">Study Instance UID (0020,000D)</text>
<text x="320" y="190" class="small">Series Instance UID (0020,000E)</text>
<text x="320" y="260" class="small">SOP Instance UID (0008,0018)</text>
<text x="560" y="50" class="small muted">Patient Root only</text>
<text x="560" y="120" class="small muted">Study Root starts here</text>
</svg>
<figcaption>Figure 7.2 — The query/retrieve hierarchy and the unique key at each level. Study Root begins at STUDY; Patient Root adds PATIENT above it.</figcaption>
</figure>

Each level has a **unique key** that names exactly one entity there. To ask for the series in a study, you query at SERIES level and give that study's Study Instance UID as the unique key of the level above.

| SOP Class | UID |
|---|---|
| Study Root Query/Retrieve Information Model - FIND | 1.2.840.10008.5.1.4.1.2.2.1 |
| Study Root Query/Retrieve Information Model - MOVE | 1.2.840.10008.5.1.4.1.2.2.2 |
| Study Root Query/Retrieve Information Model - GET | 1.2.840.10008.5.1.4.1.2.2.3 |
| Patient Root Query/Retrieve Information Model - FIND | 1.2.840.10008.5.1.4.1.2.1.1 |
| Patient Root Query/Retrieve Information Model - MOVE | 1.2.840.10008.5.1.4.1.2.1.2 |
| Patient Root Query/Retrieve Information Model - GET | 1.2.840.10008.5.1.4.1.2.1.3 |

Each of these must be agreed as a presentation context, exactly like a storage SOP class.

### C-MOVE: "send it over there"

C-MOVE is how Retrieve usually works, and it surprises everyone the first time. The request does not say "send the images back to me." It says "send them to the AE titled X." That AE title goes in Move Destination (0000,0600), and it can be the requester itself or a third system.

The archive has only that name. To turn it into an address, it looks the name up in **its own** address book (Chapter 4). Then it opens a **second association**, as the SCU this time, to that destination and performs one C-STORE per image (Figure 7.3). The standard is explicit: these sub-operations always happen on an association *different* from the one carrying the C-MOVE.

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="C-MOVE uses two associations: the requester asks the archive to move a study to a destination AE; the archive looks the AE up and opens a new association to it, sending C-STORE sub-operations, while reporting progress back on the first.">
<defs><marker id="ch07-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="30" width="170" height="56" rx="4" class="box"/>
<text x="105" y="56" text-anchor="middle">Workstation</text>
<text x="105" y="76" text-anchor="middle" class="small muted">calling AE LABSCU</text>
<rect x="275" y="30" width="170" height="56" rx="4" class="box accent"/>
<text x="360" y="56" text-anchor="middle">Archive</text>
<text x="360" y="76" text-anchor="middle" class="small muted">AE LABPACS</text>
<rect x="530" y="30" width="170" height="56" rx="4" class="box"/>
<text x="615" y="56" text-anchor="middle">Destination</text>
<text x="615" y="76" text-anchor="middle" class="small muted">AE LABSTORE</text>
<line x1="105" y1="86" x2="105" y2="290" class="dashed"/>
<line x1="360" y1="86" x2="360" y2="290" class="dashed"/>
<line x1="615" y1="86" x2="615" y2="290" class="dashed"/>
<line x1="105" y1="120" x2="355" y2="120" marker-end="url(#ch07-arrow)"/>
<text x="230" y="112" text-anchor="middle" class="small">C-MOVE-RQ, destination LABSTORE</text>
<text x="490" y="140" text-anchor="middle" class="small muted">look up LABSTORE</text>
<line x1="360" y1="165" x2="610" y2="165" marker-end="url(#ch07-arrow)" class="accent"/>
<text x="487" y="157" text-anchor="middle" class="small">association 2: C-STORE x N</text>
<line x1="355" y1="205" x2="110" y2="205" marker-end="url(#ch07-arrow)"/>
<text x="230" y="197" text-anchor="middle" class="small">C-MOVE-RSP Pending (FF00), counts</text>
<line x1="355" y1="255" x2="110" y2="255" marker-end="url(#ch07-arrow)"/>
<text x="230" y="247" text-anchor="middle" class="small">final C-MOVE-RSP 0000 or B000</text>
</svg>
<figcaption>Figure 7.3 — C-MOVE needs two associations. The images travel on a new association the archive opens to the destination; the first one only carries progress.</figcaption>
</figure>

While it works, the archive sends Pending responses on the first association. Each carries four counters: remaining (0000,1020), completed (0000,1021), failed (0000,1022) and warning (0000,1023) sub-operations. The final response then tells you how it went (PS3.4 Table C.4-2):

| Status | Meaning |
|---|---|
| `0000` | Sub-operations complete, no failures |
| `B000` | Sub-operations complete, one or more failures |
| `A701` | Refused: out of resources, unable to calculate number of matches |
| `A702` | Refused: out of resources, unable to perform sub-operations |
| `A801` | Refused: Move Destination unknown |
| `A900` | Error: data set does not match SOP Class |
| `Cxxx` | Failed: unable to process |
| `FE00` | Sub-operations terminated by a cancel |
| `FF00` | Pending: sub-operations are continuing |

Two consequences follow, and they are the source of most C-MOVE trouble:

1. **The archive must know the destination**: its AE title, its IP address, its port. A requester can't just ask for "back to me" without being registered.
2. **The archive must be able to connect to the destination.** If a firewall allows connections into the archive but none out of it, C-MOVE fails even though C-FIND works perfectly.

### C-GET: retrieve on the same connection

C-GET solves the second problem. The archive sends the C-STORE sub-operations back **on the same association** as the C-GET. The requester receives them as a storage SCP inside a connection it opened itself. To make that legal, the requester proposes storage presentation contexts with SCU/SCP role selection, offering to be the SCP for those SOP classes (Chapter 5). There is no Move Destination, no second connection and no address-book entry. The cost is that support varies: check the archive's conformance statement before you rely on it.

## Lab

**Echo, store, query and retrieve against an archive you run.** This lab uses only synthetic data and runs on a laptop.

You need Docker, DCMTK (`brew install dcmtk`, or `sudo apt install dcmtk` on Debian or Ubuntu), and Python 3.10 or newer.

**1. Start an archive.** Orthanc is an open-source DICOM server. This command names it `LABPACS`, binds its ports to `127.0.0.1` so nothing outside your laptop can reach them, turns off web logins (acceptable on your own laptop only), and gives its address book two entries: `LABSCU`, which is you querying, and `LABSTORE`, the destination you will move images to. `host.docker.internal` is how a container reaches your laptop. On Linux, add `--add-host=host.docker.internal:host-gateway` to the command.

```bash
docker run -d --name labpacs -p 127.0.0.1:4242:4242 -p 127.0.0.1:8042:8042 \
  -e ORTHANC__DICOM_AET=LABPACS \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  -e ORTHANC__DICOM_MODALITIES='{"labscu": ["LABSCU", "host.docker.internal", 11112], "labstore": ["LABSTORE", "host.docker.internal", 11113]}' \
  orthancteam/orthanc:24.10.1
```

**2. Make three synthetic images.** In a fresh virtual environment (`pip install pydicom==3.0.1 numpy==2.1.3`), save this as `make_synthetic.py` and run it. It writes one study of three ultrasound stills with random-noise pixels, patient `TEST^PATIENT`.

```python
from datetime import date
from pathlib import Path

import numpy as np
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, UltrasoundImageStorage, generate_uid

out = Path("synthetic")
out.mkdir(exist_ok=True)
study_uid, series_uid = generate_uid(), generate_uid()

for n in range(1, 4):
    ds = Dataset()
    ds.file_meta = FileMetaDataset()
    ds.file_meta.MediaStorageSOPClassUID = UltrasoundImageStorage
    ds.file_meta.MediaStorageSOPInstanceUID = generate_uid()
    ds.file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

    ds.SOPClassUID = UltrasoundImageStorage
    ds.SOPInstanceUID = ds.file_meta.MediaStorageSOPInstanceUID
    ds.StudyInstanceUID, ds.SeriesInstanceUID = study_uid, series_uid
    ds.PatientName, ds.PatientID = "TEST^PATIENT", "DEMO-0001"
    ds.AccessionNumber, ds.Modality = "ACC-0001", "US"
    ds.StudyDate = date.today().strftime("%Y%m%d")
    ds.StudyDescription = "SYNTHETIC CAROTID DUPLEX"
    ds.SeriesNumber, ds.InstanceNumber = 1, n

    ds.Rows, ds.Columns = 64, 64
    ds.SamplesPerPixel, ds.PhotometricInterpretation = 1, "MONOCHROME2"
    ds.BitsAllocated, ds.BitsStored, ds.HighBit, ds.PixelRepresentation = 8, 8, 7, 0
    ds.PixelData = np.random.default_rng(n).integers(0, 255, (64, 64), dtype=np.uint8).tobytes()

    ds.save_as(out / f"us{n}.dcm", enforce_file_format=True)
```

**3. Echo and store.** `-aet` is your calling AE title; `-aec` is the archive's.

```bash
echoscu -v -aet LABSCU -aec LABPACS localhost 4242
storescu -v -aet LABSCU -aec LABPACS localhost 4242 synthetic/*.dcm
```

You should see `Received Echo Response (Success)`, then one `Received Store Response (Success)` per file. Open `http://localhost:8042` and the study is there.

**4. Query at STUDY level.** `-S` selects Study Root. Each `-k` with `=value` is a matching key; each `-k` without one is a return key.

```bash
findscu -v -S -aet LABSCU -aec LABPACS \
  -k QueryRetrieveLevel=STUDY -k PatientID=DEMO-0001 \
  -k StudyInstanceUID -k StudyDate -k AccessionNumber -k StudyDescription \
  -k NumberOfStudyRelatedInstances \
  localhost 4242
```

You get one `Find Response: 1 (Pending)` with the filled-in identifier, `NumberOfStudyRelatedInstances` of 3, and a final `Success`. Copy the Study Instance UID it returned.

**5. Retrieve with C-MOVE.** Start a storage SCP called `LABSTORE` in a second terminal, then ask the archive to move the study to it:

```bash
mkdir -p received && storescp -v -aet LABSTORE -od received 11113
```

```bash
movescu -v -S -aet LABSCU -aec LABPACS -aem LABSTORE \
  -k QueryRetrieveLevel=STUDY -k StudyInstanceUID=<the UID from step 4> \
  localhost 4242
```

Watch both terminals. `movescu` prints Pending responses and a final `Success`. `storescp` prints three incoming C-STOREs on an association *it* accepted, which is the second association in Figure 7.3. Three files appear in `received/`.

**6. Break it on purpose.**

- Repeat step 5 with `-aem NOBODY`. The standard's code for an unknown destination is `A801`. Orthanc 1.12 (in this image) answers `C000`, "Failed: unable to process", and its log says `Unknown modality for AET: NOBODY`. Both are legal failures, which is exactly why your code should branch on the class of a status, not one specific value.
- Repeat step 4 with `-aet STRANGER`. Orthanc aborts the association, and its log (`docker logs labpacs`) says the AE "is not listed in configuration option DicomModalities." Queries are not open to just anyone who can reach the port.
- Try C-GET, which needs no destination: `getscu -v -S -aet LABSCU -aec LABPACS -od received -k QueryRetrieveLevel=STUDY -k StudyInstanceUID=<UID> localhost 4242`. Note that `storescp` sees nothing this time: the images came back on `getscu`'s own association.

Clean up with `docker rm -f labpacs`.

## In Lumen

Lumen today receives images by browser upload into an exam, and the planned machine path (Chapter 21) uses only the storing verb. The machine sends **C-STORE** to a gateway inside the facility, and the gateway forwards each object to Lumen over HTTPS. Lumen is a receiver. It does not answer C-FIND or C-MOVE, and it does not need to in order to receive a study.

Query and retrieve matter to the design in two other ways.

- **The gateway's own conversations.** A facility gateway such as Orthanc speaks all four verbs. If it ever needed to pull a prior study from the hospital PACS for comparison, it would do so with C-FIND and then C-MOVE or C-GET, inside the facility network. That is not part of Lumen's planned design today.
- **Statuses become Lumen's contract.** When the gateway relays an image, the result of Lumen's ingest decides what the gateway tells the machine. "Stored" has to mean stored (`0000`), and "not now" has to be distinguishable from "never" (`A7xx` versus `A9xx` or `Cxxx`), so retries happen only where they can help. Chapter 9 makes that promise stronger, with storage commitment.

## How it fails

- **The destination is unknown to the archive.** C-MOVE to an AE that isn't in the archive's address book fails immediately (`A801`, or an implementation-specific `Cxxx` as you saw). New workstations hit this until PACS administrators add them.
- **The return path is blocked.** C-FIND works, C-MOVE does not: the archive cannot open the second association to the destination through a firewall or NAT. The sub-operations fail, or the move hangs until a timeout. C-GET avoids it, if both sides support it.
- **The caller isn't registered.** Many archives refuse queries and retrieves from AE titles they don't know, either by rejecting or aborting the association. It looks like a network fault, but the archive's log says otherwise.
- **Too broad a query.** A C-FIND with no matching keys asks for everything. Archives cap or refuse these (`A700`), or answer slowly with thousands of Pending responses.
- **A warning treated as success.** `B000` on C-MOVE means some images did not arrive; `B000` on C-STORE means the archive changed values. Both need someone to look.
- **Reading only the last response.** A study stored with 40 C-STOREs has 40 statuses. A retrieve that ends in `B000` has a failed-sub-operations count. Code that only checks "did the association end cleanly" will report success for a half-sent study.

## Evidence

You understand this chapter when you can take the output of steps 4 and 5 and point to:

- the Pending responses and the final response, and what each status class means;
- the Study Instance UID you used as the unique key;
- the moment the second association opened;
- the sub-operation counters that prove all three images arrived.

You can then predict, before running it, what changes when the destination is unknown or the caller isn't registered.

## Workbook

1. A C-FIND identifier contains `PatientID=DEMO-0001` and an empty `StudyDate`. What does each element do, and how many responses do you get if the patient has four studies?
2. C-FIND from a new reading workstation returns the patient's studies, but Retrieve fails every time. Using Figure 7.3, give two causes on the archive's side.
3. A machine sends a 40-image study and the association ends normally. Why is that not proof the whole study was stored, and what should the sender check?
4. When would you choose C-GET over C-MOVE, and what must the requester offer during association negotiation to use it?
5. Your gateway relays an image to a receiver that is temporarily full. Which status class should the gateway report to the machine, and why does it matter which one?

## Answers

1. `PatientID=DEMO-0001` has a value, so it is a matching key and restricts the results to that patient. The empty `StudyDate` is a return key: it matches everything and asks the archive to fill in each study's date. Four studies produce four Pending (`FF00`) responses, one per match, then one final Success (`0000`) with no data set, so five responses in all (see "C-FIND: what do you have?").
2. C-FIND working proves the workstation can reach the archive and is allowed to query. C-MOVE also needs the archive to know the workstation's AE title as a destination, with its IP address and port, and to be able to open a second association back to it (Figure 7.3). Either a missing address-book entry or a firewall blocking the archive's outbound connection explains the failure.
3. Each of the 40 C-STOREs has its own response and status, and an association can end cleanly after some of them failed or returned warnings. The sender has to check every C-STORE response: `0000` for each, and no `Axxx` or `Cxxx` failures or ignored `Bxxx` warnings. Chapter 9's storage commitment adds a separate confirmation that the archive has taken responsibility for all of them.
4. Choose C-GET when the archive cannot connect back to the requester, for example through NAT or a firewall that allows only outbound connections from the requester, or when you don't want a destination entry in the archive's address book. The images come back on the same association. The requester must propose storage presentation contexts for the image SOP classes, with SCU/SCP role selection offering to act as their SCP (see "C-GET: retrieve on the same connection").
5. A full receiver is a refusal for lack of resources, the `A7xx` range for C-STORE, which says "not now" and invites a later retry. Reporting `A9xx` or `Cxxx` instead would tell the machine the object itself is unacceptable, so it would stop retrying an image that could have been stored a minute later. The status class is the only signal the sender has for choosing between retry and escalate (see "Status codes: read the first digit").

<p class="sources">Sources: DICOM PS3.7 §6.3.1 (Command Set encoding), §9.1 and §9.3 (C-STORE, C-FIND, C-GET, C-MOVE, C-ECHO services and protocols), Annex C (status classes), Annex E Table E.1-1 (command dictionary and Command Field values); PS3.4 §B.2.3 Table B.2-1 (C-STORE statuses), §C.2.2.2 (matching types), §C.4.1–C.4.3 Tables C.4-1 to C.4-3 (C-FIND, C-MOVE, C-GET behavior and statuses), §C.6.1.3 and §C.6.2.3 (Patient Root and Study Root SOP Class UIDs), Table C.6.2-1 (Study Root levels). DCMTK man pages for echoscu, storescu, findscu, movescu, getscu and storescp. Orthanc Book, "Orthanc for Docker" (environment-variable configuration). Lab run against orthancteam/orthanc:24.10.1 (Orthanc 1.12.4) and DCMTK.</p>
