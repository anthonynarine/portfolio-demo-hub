---
number: 3
title: A study's life: order, worklist, scan, send, read, report
objective: Follow one study from the order to the signed report, and name the identifier that carries it across each hand-off.
status: draft
---

## At the machine

A study has a life before you meet it and after you finish with it. Before: someone ordered it, someone scheduled it, and it appeared on your worklist with the patient's name already filled in. After: a physician read it, signed a report, and the report reached the chart.

From the scan room you see only the middle. But every complaint you have ever heard about a "missing study" or a "report filed to the wrong exam" is a failure somewhere in the parts you don't see. This chapter follows one synthetic carotid study, accession `ACC-0001`, for patient `TEST^PATIENT` (MRN `DEMO-0001`), through every hand-off, and watches which identifier carries it each time.

## On the wire

### The ten steps

<figure class="diagram">
<svg viewBox="0 0 720 520" role="img" aria-label="Sequence of one study across EHR, RIS and worklist broker, modality, PACS and reporting system, from order to result.">
<defs><marker id="ch03-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="120" height="40" rx="4" class="box"/>
<text x="70" y="35" text-anchor="middle">EHR</text>
<rect x="155" y="10" width="120" height="40" rx="4" class="box"/>
<text x="215" y="35" text-anchor="middle">RIS / broker</text>
<rect x="300" y="10" width="120" height="40" rx="4" class="box"/>
<text x="360" y="35" text-anchor="middle">Ultrasound</text>
<rect x="445" y="10" width="120" height="40" rx="4" class="box"/>
<text x="505" y="35" text-anchor="middle">PACS</text>
<rect x="590" y="10" width="120" height="40" rx="4" class="box accent"/>
<text x="650" y="35" text-anchor="middle">Reporting</text>
<line x1="70" y1="50" x2="70" y2="510" class="dashed"/>
<line x1="215" y1="50" x2="215" y2="510" class="dashed"/>
<line x1="360" y1="50" x2="360" y2="510" class="dashed"/>
<line x1="505" y1="50" x2="505" y2="510" class="dashed"/>
<line x1="650" y1="50" x2="650" y2="510" class="dashed"/>
<line x1="70" y1="85" x2="215" y2="85" marker-end="url(#ch03-arrow)"/>
<text x="142" y="78" text-anchor="middle" class="small">1 ORM order</text>
<line x1="70" y1="120" x2="650" y2="120" marker-end="url(#ch03-arrow)"/>
<text x="430" y="113" text-anchor="middle" class="small">1 ORM order (copy)</text>
<text x="222" y="164" class="small">2 schedule, publish to worklist</text>
<line x1="360" y1="200" x2="215" y2="200" marker-end="url(#ch03-arrow)"/>
<text x="288" y="193" text-anchor="middle" class="small">3 C-FIND worklist</text>
<line x1="360" y1="240" x2="215" y2="240" marker-end="url(#ch03-arrow)"/>
<text x="288" y="233" text-anchor="middle" class="small">4 MPPS in progress</text>
<line x1="360" y1="280" x2="505" y2="280" marker-end="url(#ch03-arrow)"/>
<text x="432" y="273" text-anchor="middle" class="small">5 C-STORE images</text>
<line x1="360" y1="320" x2="505" y2="320" marker-end="url(#ch03-arrow)"/>
<text x="432" y="313" text-anchor="middle" class="small">6 storage commitment</text>
<line x1="360" y1="360" x2="215" y2="360" marker-end="url(#ch03-arrow)"/>
<text x="288" y="353" text-anchor="middle" class="small">7 MPPS completed</text>
<line x1="505" y1="400" x2="650" y2="400" class="dashed" marker-end="url(#ch03-arrow)"/>
<text x="577" y="393" text-anchor="middle" class="small">8 images to read</text>
<text x="643" y="444" text-anchor="end" class="small">9 read, sign report</text>
<line x1="650" y1="480" x2="70" y2="480" marker-end="url(#ch03-arrow)"/>
<text x="360" y="473" text-anchor="middle" class="small">10 ORU result</text>
</svg>
<figcaption>Figure 3.1: One study's life. Time runs down the page; each arrow is one message. Steps 1 and 10 are HL7, steps 3 to 7 are DICOM, and step 8 depends on how the reporting system gets images (Chapter 2).</figcaption>
</figure>

1. **Order.** A physician orders a bilateral carotid duplex in the EHR. The EHR sends an HL7 `ORM^O01` message. It reaches the RIS, and usually also the reporting system, so both know the exam exists. The order carries the MRN and the **accession number**, `ACC-0001`.
2. **Schedule and publish.** The RIS books a room and a time. The worklist broker turns the order into a Modality Worklist entry: patient demographics, accession number, a **Requested Procedure ID** and a **Scheduled Procedure Step**, with the AE title of the machine it's scheduled on.
3. **Worklist query.** At the machine, you open the worklist. The ultrasound system sends a C-FIND to the broker ("what's scheduled for `US_ROOM3` today?") and gets back the matching entries. You pick the patient. Nothing is typed by hand.
4. **Exam started.** If MPPS is configured, the machine sends an N-CREATE with status `IN PROGRESS`. The RIS now knows the patient is on the table.
5. **Images sent.** Each still and each cine clip is a separate C-STORE to PACS. Every object carries the values copied from the worklist entry, plus identifiers the machine creates itself.
6. **Storage commitment.** The machine asks PACS: "do you take responsibility for these instances?" PACS confirms asynchronously. Only then is it safe for the machine to delete its local copies. (Chapter 9 explains how this works.)
7. **Exam completed.** The machine sends an MPPS N-SET with status `COMPLETED`, listing what was produced. The RIS marks the exam ready to read.
8. **Images reach the reader.** The reading physician opens the study, in the PACS viewer or in the reporting system, depending on how the department is wired.
9. **Report signed.** The technologist's worksheet and measurements become the physician's report, and the physician signs it.
10. **Result returned.** The reporting system sends an HL7 `ORU^R01` back to the EHR, carrying the report and the accession number, so it files under the right order.

Not every department runs every step. Many skip MPPS, some skip storage commitment, and some have no worklist at all (the technologist types the patient in). Each skipped step is a place where something can go wrong without anyone being told, which is why the IHE *Scheduled Workflow* integration profile bundles the whole chain together.

### The identifiers that hold it together

Two kinds of identifier travel with the study. **Business identifiers** come from the order side and are meaningful to people. **UIDs** are created by the imaging side and are meant for machines.

| Identifier | Tag | Created by | Ties together |
|---|---|---|---|
| Patient ID (MRN) | (0010,0020) | EHR registration | Every exam for this patient |
| Accession Number | (0008,0050) | EHR or RIS, with the order | The order, the images and the report |
| Requested Procedure ID | (0040,1001) | RIS | The procedure within the order |
| Scheduled Procedure Step ID | (0040,0009) | RIS / worklist broker | The worklist entry the tech selected |
| Study Instance UID | (0020,000D) | Usually the worklist or the modality | Every image of one study |
| Series Instance UID | (0020,000E) | Modality | One series within the study |
| SOP Instance UID | (0008,0018) | Modality | Exactly one image or clip |

In the image header, the Requested Procedure ID and Scheduled Procedure Step ID live inside the **Request Attributes Sequence** (0040,0275), which records which scheduled request the images were acquired for. MPPS messages refer to the same values, and Storage Commitment refers to SOP Instance UIDs.

The **accession number is the bridge between the two worlds.** HL7 messages know about orders and accession numbers, but nothing about UIDs. DICOM objects carry both. That makes the accession number the natural key for matching images to an exam, which is exactly what Lumen's planned design does (Chapter 22).

<figure class="diagram">
<svg viewBox="0 0 720 210" role="img" aria-label="The accession number appears in the order, the worklist entry, every image and the result, while UIDs exist only on the DICOM side.">
<defs><marker id="ch03-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="30" width="150" height="70" rx="4" class="box"/>
<text x="95" y="58" text-anchor="middle">HL7 order</text>
<text x="95" y="80" text-anchor="middle" class="small">MRN · Accession</text>
<rect x="200" y="30" width="150" height="70" rx="4" class="box"/>
<text x="275" y="58" text-anchor="middle">Worklist entry</text>
<text x="275" y="80" text-anchor="middle" class="small">+ procedure, step IDs</text>
<rect x="380" y="30" width="150" height="70" rx="4" class="box accent"/>
<text x="455" y="58" text-anchor="middle">Each image</text>
<text x="455" y="80" text-anchor="middle" class="small">+ Study/Series/SOP UIDs</text>
<rect x="560" y="30" width="150" height="70" rx="4" class="box"/>
<text x="635" y="58" text-anchor="middle">HL7 result</text>
<text x="635" y="80" text-anchor="middle" class="small">MRN · Accession</text>
<line x1="170" y1="65" x2="200" y2="65" marker-end="url(#ch03-arrow2)"/>
<line x1="350" y1="65" x2="380" y2="65" marker-end="url(#ch03-arrow2)"/>
<line x1="530" y1="65" x2="560" y2="65" marker-end="url(#ch03-arrow2)"/>
<line x1="95" y1="130" x2="635" y2="130"/>
<text x="365" y="152" text-anchor="middle">Accession Number: ACC-0001 travels the whole way</text>
<line x1="380" y1="175" x2="530" y2="175" class="dashed"/>
<text x="455" y="197" text-anchor="middle" class="muted">UIDs exist only here</text>
</svg>
<figcaption>Figure 3.2: The accession number is the one value present at every stage, on both the HL7 and DICOM sides. UIDs are created on the imaging side and HL7 never sees them.</figcaption>
</figure>

### Who creates the Study Instance UID

This catches developers out. The Study Instance UID can be created in two places: the worklist broker can supply one in the worklist entry, or the modality generates its own when the study starts. Both are allowed, and departments differ. If the worklist supplied one, every image should carry it, and other systems can know the UID before any image arrives. If the modality made one, the first time anyone sees it is in the first C-STORE.

A receiving system should therefore never assume it knows the Study Instance UID in advance. It knows the accession number in advance; it learns the UID from the images.

## Lab

**Trace one study's identifiers.** This lab uses Python and a synthetic file; no scanner or server.

Install pydicom in a fresh virtual environment:

```bash
python3 -m venv dicom-lab && source dicom-lab/bin/activate
pip install pydicom==3.0.1
```

Save this as `make_study.py`. It builds a header-only synthetic ultrasound object (no pixel data) carrying the identifiers from this chapter, writes it as a DICOM file, and prints the linking tags:

```python
"""Create one synthetic ultrasound study file and print the tags that link it to its order."""
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, generate_uid

US_IMAGE_STORAGE = "1.2.840.10008.5.1.4.1.1.6.1"

meta = FileMetaDataset()
meta.MediaStorageSOPClassUID = US_IMAGE_STORAGE
meta.MediaStorageSOPInstanceUID = generate_uid()
meta.TransferSyntaxUID = ExplicitVRLittleEndian

ds = Dataset()
ds.file_meta = meta
ds.SOPClassUID = US_IMAGE_STORAGE
ds.SOPInstanceUID = meta.MediaStorageSOPInstanceUID
ds.PatientName = "TEST^PATIENT"
ds.PatientID = "DEMO-0001"
ds.AccessionNumber = "ACC-0001"
ds.Modality = "US"
ds.StudyDescription = "CAROTID DUPLEX BILATERAL"
ds.StudyInstanceUID = generate_uid()
ds.SeriesInstanceUID = generate_uid()

# The worklist entry this image was acquired against.
request = Dataset()
request.RequestedProcedureID = "RP-0001"
request.ScheduledProcedureStepID = "SPS-0001"
ds.RequestAttributesSequence = [request]

ds.save_as("study-0001.dcm", enforce_file_format=True)

for keyword in ("PatientID", "AccessionNumber", "StudyInstanceUID",
                "SeriesInstanceUID", "SOPInstanceUID"):
    print(f"{keyword:<20} {ds[keyword].tag}  {ds[keyword].value}")
item = ds.RequestAttributesSequence[0]
print(f"{'RequestedProcedureID':<20} {item['RequestedProcedureID'].tag}  {item.RequestedProcedureID}")
print(f"{'ScheduledProcStepID':<20} {item['ScheduledProcedureStepID'].tag}  {item.ScheduledProcedureStepID}")
```

Run it:

```bash
python make_study.py
```

You'll see each identifier with its tag. The UIDs will differ from anyone else's, because `generate_uid()` makes a new one each time. Keep `study-0001.dcm`: Chapter 19 sends it to a server.

Then fill in this worksheet for `ACC-0001`, writing which system creates each value and at which step of Figure 3.1 it first appears:

| Value | Created by | First appears at step |
|---|---|---|
| `DEMO-0001` | | |
| `ACC-0001` | | |
| `RP-0001` / `SPS-0001` | | |
| Study Instance UID | | |
| SOP Instance UID | | |
| The signed report | | |

Finally, run the script twice and compare. Which values changed between runs and which stayed the same? The ones that changed are what a receiver must *learn* from the images; the ones that stayed are what it can *know* in advance.

## In Lumen

Lumen is the reporting system, the right-hand lifeline in Figure 3.1. Today it covers steps 8 and 9: a technologist uploads images into the exam, fills in the measurements, and the physician signs the report.

The planned image path changes step 8. Images will come from the machine through a gateway at the facility, and Lumen will find the exam for each incoming image by its **accession number**, the one identifier the exam and the images already share. An image whose accession number matches no exam isn't guessed at. It waits in a hold queue for a person to resolve (Chapter 22).

## How it fails

- **No worklist, typed by hand.** The technologist types `ACC-001` instead of `ACC-0001`. The images reach PACS under an accession that matches no order, and the study sits unread until someone reconciles it.
- **Wrong patient picked.** Two similar names are on the worklist and the wrong one is selected. Every identifier is internally consistent, and every one is wrong. No matching logic can catch this; only the technologist's check at the start of the study can.
- **MPPS never sent.** The exam is finished, but the RIS still thinks it's in progress and the reading queue never shows it.
- **Machine deletes too early.** Without storage commitment, the machine frees its disk after sending, but one C-STORE had silently failed. The image is gone.
- **ORU without the accession.** The report reaches the EHR but can't be matched to its order, and lands in an error queue instead of the chart.

## Evidence

You understand this chapter when you can take any one image from a study and, using only its header, find its order (by accession number), its worklist entry (by the request attributes) and every other image of the same study (by Study Instance UID).

## Workbook

1. Which identifier links the HL7 order to the DICOM images, and why can't a Study Instance UID do that job?
2. A study arrives with an accession number that matches no order. List three ways that could have happened, using the steps in Figure 3.1.
3. Why is it unsafe for a receiving system to expect a particular Study Instance UID before the first image arrives?
4. Which step would you add first in a department that has none of MPPS, storage commitment or a worklist, and why?

## Answers

1. The accession number. It is created with the order on the HL7 side and copied into every image on the DICOM side, so it is the one value both worlds share (Figure 3.2). A Study Instance UID can't do the job because HL7 orders never carry it, and it may not exist until the machine creates it at the start of the study.
2. Any three of: the technologist typed the patient in without the worklist and mistyped the accession; the order was cancelled and re-placed with a new accession after the study started; the images were sent before the order reached the receiving system; the wrong patient was selected on the worklist, so the images carry another order's accession. See steps 1 to 5 of Figure 3.1 and "How it fails".
3. Because the UID can be created in two places. If the worklist supplies one, the images carry it; if not, the machine generates its own, and nobody sees it until the first C-STORE arrives. A receiver can know the accession number in advance, but it must learn the UID from the images. See "Who creates the Study Instance UID".
4. The worklist. It removes hand-typed identifiers, which cause most matching failures, and it is what makes every later step's identifiers trustworthy. MPPS and storage commitment add status and safety, but they can't repair a study filed under the wrong accession. See steps 2 and 3 and "How it fails".

<p class="sources">Sources: DICOM PS3.4 Annex K (Basic Worklist Management Service, Modality Worklist), Annex F (Procedure Step SOP Classes, including Modality Performed Procedure Step), Annex J (Storage Commitment Service Class); PS3.6 (data dictionary: tags (0008,0050), (0010,0020), (0020,000D), (0020,000E), (0008,0018), (0040,0009), (0040,1001), (0040,0275), (0040,0252)); PS3.3 §C.7.3.1 (General Series Module, Request Attributes Sequence); HL7 Version 2 (ORM^O01, ORU^R01); IHE Radiology Technical Framework, Scheduled Workflow; pydicom 3.0 documentation.</p>
