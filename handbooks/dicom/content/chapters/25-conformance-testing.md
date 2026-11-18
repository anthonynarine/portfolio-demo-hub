---
number: 25
title: Conformance and interoperability testing
objective: Read a device's DICOM Conformance Statement against your own, validate objects against the standard before you trust them, and know what IHE profiles and Connectathons add on top.
status: draft
---

## At the machine

When a new ultrasound machine arrives, someone in imaging informatics or biomedical engineering asks the vendor for a document most technologists never see: the **DICOM Conformance Statement**. It is usually a long PDF, mostly tables, published for each product and software version. It says exactly which kinds of objects the machine can send, in which encodings, which services it uses, and what it expects from the other side.

It is the closest thing DICOM has to a contract. When a machine and a receiver don't get along, the first useful step is almost never to look at the network. It is to open both conformance statements side by side and compare them line by line.

## On the wire

### What a conformance statement is for

PS3.2 defines the conformance statement and gives a template for it. Its purpose is narrow and practical: to state which optional parts of the standard an implementation supports, plus any extensions or specializations it adds. No product implements all of DICOM; each implements the SOP classes and services its job needs. Users then compare two products' statements to judge whether, and to what extent, they can work together.

The template in PS3.2 (Annex N) organizes the document into sections you will learn to jump between:

| Section | What you look for in it |
|---|---|
| Overview | One-page summary: services, roles (SCU/SCP), supported transfer syntaxes |
| Introduction | Scope, terms, and which product and version the statement covers |
| Implementation Model | The product's Application Entities and what each one does |
| Service and Interoperability Description | Per AE: the SOP classes, roles, and behavior, including how errors are handled |
| Configuration | What is configurable: AE titles, ports, timeouts |
| Network and Media Communication Details | Presentation contexts, transfer syntaxes, PDU sizes, association policies |
| Security | Supported security profiles (TLS, user identity) |
| Annexes | IOD contents, SR template details, attribute mappings, code sets |

Two places matter most for a receiving system like a reporting platform: the **SOP classes** the machine sends as SCU, and, for each, the **transfer syntaxes** it proposes. The Annex that lists **IOD contents** comes next, because it tells you which optional attributes the machine actually fills in: whether it writes the Sequence of Ultrasound Regions, whether it sets Burned In Annotation, which private tags it uses.

### Comparing two statements

Interoperability is the overlap between what one side offers and what the other accepts. Line the two statements up:

<figure class="diagram">
<svg viewBox="0 0 720 270" role="img" aria-label="A modality's conformance statement compared with a receiver's: ultrasound images overlap, multi-frame overlaps only in one encoding, and structured reports are not accepted.">
<rect x="10" y="20" width="260" height="34" rx="4" class="box"/>
<text x="140" y="42" text-anchor="middle" class="bold">Machine sends (SCU)</text>
<rect x="450" y="20" width="260" height="34" rx="4" class="box"/>
<text x="580" y="42" text-anchor="middle" class="bold">Receiver accepts (SCP)</text>
<text x="360" y="42" text-anchor="middle" class="small muted">overlap</text>
<text x="20" y="92" class="small">US Image Storage</text>
<text x="20" y="110" class="small muted">JPEG Baseline · Explicit VR LE</text>
<text x="460" y="92" class="small">US Image Storage</text>
<text x="460" y="110" class="small muted">Explicit VR LE · JPEG Baseline · RLE</text>
<text x="360" y="102" text-anchor="middle" class="accent bold">match</text>
<line x1="10" y1="128" x2="710" y2="128" class="dashed"/>
<text x="20" y="156" class="small">US Multi-frame Image Storage</text>
<text x="20" y="174" class="small muted">JPEG Baseline only</text>
<text x="460" y="156" class="small">US Multi-frame Image Storage</text>
<text x="460" y="174" class="small muted">Explicit VR LE only</text>
<text x="360" y="166" text-anchor="middle" class="bold">no common syntax</text>
<line x1="10" y1="192" x2="710" y2="192" class="dashed"/>
<text x="20" y="220" class="small">Comprehensive SR Storage</text>
<text x="20" y="238" class="small muted">Explicit VR LE</text>
<text x="460" y="220" class="small muted">(not listed)</text>
<text x="360" y="230" text-anchor="middle" class="bold">not accepted</text>
</svg>
<figcaption>Figure 25.1 — Comparing conformance statements: stills will flow, cine will be rejected at negotiation, and the measurements in SR will never arrive.</figcaption>
</figure>

Figure 25.1 is a synthetic example, but each row is a real pattern:

- **Match.** Both sides list the SOP class and share at least one transfer syntax. Chapter 6's negotiation will succeed.
- **No common syntax.** Both sides know the SOP class but share no encoding. The association can still be accepted for other contexts, so stills arrive and every cine clip is refused. To the technologist this looks like "some images didn't send."
- **Not accepted.** The receiver never listed the SOP class. The machine's measurements in Structured Report form (Chapter 13) silently never arrive, unless someone checks.

The fix in each case is a decision, not a bug hunt: add the transfer syntax on the receiver, change the machine's configuration to propose another one, or add support for the SOP class.

### Validating objects against the standard

A conformance statement is a promise. The objects themselves are what actually arrives, and they don't always keep the promise. Each SOP class is defined by an **IOD** in PS3.3, made of modules, and each attribute in a module has a **type**:

<div class="pairs">
<div><span>Type 1</span><p>Required, and must have a value. Missing or empty is an error.</p></div>
<div><span>Type 2</span><p>Required, but may be empty when the value is unknown.</p></div>
<div><span>Type 3</span><p>Optional.</p></div>
<div><span>1C / 2C</span><p>Required (as Type 1 or 2) only when a stated condition is true.</p></div>
</div>

Three tools cover most validation work:

- **`dcmdump`** (DCMTK) prints every element of a file. It is how you look, not how you validate: it shows you what is there, not what is missing.
- **`dciodvfy`**, part of David Clunie's dicom3tools, checks a file's attributes against the IOD and module requirements in PS3.3, its encoding against PS3.5, and its VRs and value multiplicities against the PS3.6 dictionary. It reports errors (for example a missing Type 1 attribute, an illegal enumerated value, a value too long for its VR, a UID with a leading zero in a component) and warnings (for example unrecognized defined terms, retired attributes). Its own documentation is candid: a clean run does not prove full conformance, and some messages need interpretation.
- **Your own checks** in code, using pydicom. These are narrower than `dciodvfy`, but they run in your test suite on every sample file and on every object at ingest, and they encode the rules *your* system depends on: for a vascular reporting system, that Accession Number is present, that the SOP class is on your allow-list, that region calibration exists if you plan to show measurements.

Run validation on the vendor's sample files before go-live, and keep the results with the test evidence (Chapter 24). When a vendor's software update arrives, run it again (Chapter 28).

### Network conformance: keeping your own promises

Your receiver has a conformance statement too, written or not. Test that it keeps it:

- Every presentation context you claim to accept is accepted, and every one you don't is rejected cleanly, per context, not by dropping the association.
- Every status code you return is one the standard defines for that service (Chapter 7), and failures carry a reason a modality can show.
- Limits you publish (maximum PDU size, number of simultaneous associations, timeouts) are the limits the code actually enforces.
- Over DICOMweb, every failure in a STOW response comes with the failure attributes PS3.18 defines (Chapter 19), not just an HTTP 500.

A useful habit: write the conformance statement *first*, as a short table, and make each row a test. Then the document and the code can't drift apart without a test failing.

### IHE: from "speaks DICOM" to "fits the workflow"

Two products can each conform to DICOM and still not support the same *workflow*. **IHE** (Integrating the Healthcare Enterprise) addresses this with **integration profiles**: documents that pick specific DICOM and HL7 transactions and bind them into a use case, with named **actors**.

For the workflow in this book, the relevant profile is **Scheduled Workflow.b (SWF.b)** in the IHE Radiology Technical Framework. It keeps patient and order information consistent from registration through image storage and makes it possible to tell when a performed procedure step's images have been stored and are available for reporting. Its actors include the **ADT Patient Registration**, **Order Placer**, **Department System Scheduler/Order Filler**, **Acquisition Modality** and **Image Manager/Image Archive**. The Acquisition Modality's required transactions map directly onto Part II of this book:

| SWF.b transaction | What it is in DICOM terms | Chapter |
|---|---|---|
| Query Modality Worklist [RAD-5] | C-FIND on the worklist | 8 |
| Modality Procedure Step In Progress [RAD-6] | MPPS N-CREATE | 8 |
| Modality Procedure Step Completed [RAD-7] | MPPS N-SET | 8 |
| Modality Images Stored [RAD-8] | C-STORE | 7 |
| Storage Commitment [RAD-10] | Storage Commitment N-ACTION / N-EVENT-REPORT | 9 |

Vendors publish **IHE Integration Statements** saying which actors and profiles a product implements. Read them next to the conformance statement: the conformance statement says what the product can do in DICOM; the integration statement says which workflow roles it claims to play.

**Connectathons** are IHE's supervised testing events, where vendors test their systems against each other's for the actor roles and profiles they have chosen. A product that has passed a Connectathon for an actor has been exercised against other implementations, which is real evidence, though not a guarantee about your specific site, versions and configuration. You still test at the facility (Chapter 27).

## Lab

**Validate a good file and a broken one.** Synthetic data only. Install `pip install pydicom==3.0.1 numpy==2.1.3` and DCMTK (`brew install dcmtk`, or the `dcmtk` package on Linux).

1. Create a synthetic ultrasound image:

```python
# make_synthetic.py: write one synthetic ultrasound image (no real patient data).
import numpy as np
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, UltrasoundImageStorage, generate_uid

meta = FileMetaDataset()
meta.MediaStorageSOPClassUID = UltrasoundImageStorage
meta.MediaStorageSOPInstanceUID = generate_uid()
meta.TransferSyntaxUID = ExplicitVRLittleEndian

ds = Dataset()
ds.file_meta = meta
ds.SOPClassUID = UltrasoundImageStorage
ds.SOPInstanceUID = meta.MediaStorageSOPInstanceUID
ds.StudyInstanceUID = generate_uid()
ds.SeriesInstanceUID = generate_uid()
ds.PatientName = "TEST^PATIENT"
ds.PatientID = "DEMO-0001"
ds.AccessionNumber = "ACC-0001"
ds.Modality = "US"
ds.StudyDate = "20260101"

rows, cols = 256, 320
img = np.tile(np.linspace(0, 200, cols, dtype=np.uint8), (rows, 1))
img[110:140, :] = 250
ds.Rows, ds.Columns = rows, cols
ds.SamplesPerPixel = 1
ds.PhotometricInterpretation = "MONOCHROME2"
ds.BitsAllocated, ds.BitsStored, ds.HighBit = 8, 8, 7
ds.PixelRepresentation = 0
ds.PixelData = img.tobytes()

ds.save_as("synthetic_us.dcm", enforce_file_format=True)
print("wrote synthetic_us.dcm", ds.SOPInstanceUID)
```

2. Break a copy the way a buggy sender might, by dropping a Type 1 attribute (Modality is Type 1 in the General Series module):

```python
# break_it.py
import pydicom

ds = pydicom.dcmread("synthetic_us.dcm")
del ds.Modality
ds.save_as("broken_us.dcm")
print("wrote broken_us.dcm without Modality (0008,0060)")
```

3. Look at both with `dcmdump synthetic_us.dcm` and `dcmdump broken_us.dcm`. Notice that `dcmdump` prints the broken file without complaint: it shows what is there, not what should be.

4. Now check them with a deliberately small Type 1 checker, the kind you would run in CI on every sample file:

```python
# check_type1.py: a partial check of Type 1 attributes for an ultrasound image.
# Not an IOD validator (use dciodvfy for that).
import sys
import pydicom

TYPE1 = {
    "SOP Common": ["SOPClassUID", "SOPInstanceUID"],
    "General Study": ["StudyInstanceUID"],
    "General Series": ["Modality", "SeriesInstanceUID"],
    "Image Pixel": ["Rows", "Columns", "SamplesPerPixel", "PhotometricInterpretation",
                    "BitsAllocated", "BitsStored", "HighBit", "PixelRepresentation"],
}

ds = pydicom.dcmread(sys.argv[1])
problems = []
for module, keywords in TYPE1.items():
    for keyword in keywords:
        value = ds.get(keyword)
        if value is None:
            problems.append(f"{module}: {keyword} is missing (Type 1)")
        elif value == "":
            problems.append(f"{module}: {keyword} is empty (Type 1 must have a value)")

for problem in problems:
    print("ERROR", problem)
print("OK" if not problems else f"{len(problems)} problem(s)")
sys.exit(1 if problems else 0)
```

```text
$ python check_type1.py synthetic_us.dcm
OK
$ python check_type1.py broken_us.dcm
ERROR General Series: Modality is missing (Type 1)
1 problem(s)
```

5. If you install dicom3tools (from its author's site, dclunie.com), run `dciodvfy synthetic_us.dcm` and `dciodvfy broken_us.dcm`. Expect it to find more than your checker, even on the "good" file: the minimal synthetic file leaves out attributes the full Ultrasound Image IOD requires. Read each message and decide which ones your system cares about. That gap between "my checker says OK" and "the full IOD check has findings" is exactly why both kinds of validation exist.

## In Lumen

Lumen's planned ingest validates every object before it is stored (Chapter 21): a SOP class allow-list, size limits, required tags, safe parsing. That allow-list is, in effect, the "SCP accepts" column of Figure 25.1, and it should be published as Lumen's own conformance statement table so a facility can compare it with its machines before go-live.

The plan for each new facility starts with conformance, not cables: collect each machine's conformance statement and IHE integration statement, compare them with Lumen's table, run the vendor's sample files (or synthetic files built to match the statement) through validation, and record the gaps as decisions in the QA plan (Chapter 24). All of this is planned; today images reach Lumen only by browser upload.

## How it fails

- **No comparison.** The receiver is configured from defaults, and the first sign of a transfer syntax mismatch is a technologist saying cine "sometimes doesn't send."
- **The wrong version.** The conformance statement on file is for last year's software; the machine was upgraded and now sends a new SOP class or private tags.
- **Trusting `dcmdump`.** A file "looks fine" in a dump and is missing a Type 1 attribute that a downstream system requires.
- **Validation that rejects too much.** Strict checks at ingest that reject a whole study over a warning-level issue. Decide per rule: reject, accept and flag, or accept. Write the decision down.
- **"IHE compliant" as a blanket claim.** Profiles have actors and options; a product implements specific ones. Ask which.

## Evidence

You understand this chapter when you can take a machine's conformance statement and your receiver's, produce a table like Figure 25.1 with a decision for every non-matching row, and show validation output for that machine's sample objects with each finding either fixed, accepted with a reason, or blocking go-live.

## Workbook

1. In Figure 25.1, why do stills arrive while every cine clip is refused, on the same association?
2. What is the difference between what `dcmdump` tells you and what `dciodvfy` tells you?
3. Your receiver says it accepts Comprehensive SR. How would you test that claim, and what evidence would you keep?
4. Name the SWF.b transactions an Acquisition Modality must support, and the chapter of this book that explains each.
5. A vendor says its machine is "IHE compliant." What two documents do you ask for, and what do you look for in each?

## Answers

1. Negotiation happens per presentation context, not per association. The US Image Storage context shares a transfer syntax with the receiver and is accepted; the US Multi-frame context shares none and is rejected, while the association as a whole succeeds. Each clip is then refused because there is no accepted context to send it on. See "Comparing two statements" and Chapter 6.
2. `dcmdump` shows what is in the file: every element, its VR and value. It never reports what is missing. `dciodvfy` compares the file with the IOD's module requirements (PS3.3), the encoding rules (PS3.5) and the dictionary (PS3.6), so it can report a missing Type 1 attribute or an illegal value. See "Validating objects against the standard" and step 3 of the Lab.
3. Send a synthetic Comprehensive SR from a test SCU and confirm the presentation context is accepted, the instance is stored, and its content is readable after retrieval. Then send one in a transfer syntax you don't claim, and confirm only that context is rejected. Keep the test log and the stored object's identifiers with the commit the test ran against. See "Network conformance" and Chapter 24's evidence column.
4. Query Modality Worklist [RAD-5] and Modality Procedure Step In Progress and Completed [RAD-6, RAD-7] are in Chapter 8. Modality Images Stored [RAD-8] is in Chapter 7, and Storage Commitment [RAD-10] in Chapter 9. See the SWF.b table in "IHE".
5. Ask for the DICOM Conformance Statement for the exact software version, and look for the SOP classes and transfer syntaxes it sends and the attributes it fills in. Ask for the IHE Integration Statement, and look for which actors and profiles (for example the Acquisition Modality in SWF.b) and options it claims. "IHE compliant" means nothing until you know which actor, in which profile. See "What a conformance statement is for" and "IHE".

<p class="sources">Sources: DICOM PS3.2 (Conformance; Annex N, Conformance Statement Template); PS3.3 (IODs, modules and attribute types; General Series Module); PS3.5 (encoding); PS3.6 (data dictionary and UIDs); PS3.18 (STOW-RS responses). IHE Radiology Technical Framework, Vol. 1 (RAD TF-1), Rev. 23.0, §34 Scheduled Workflow.b, Table 34.1-1, and §1.4.3 IHE Integration Statements; IHE Connectathon (ihe.net). dicom3tools dciodvfy documentation (dclunie.com).</p>
