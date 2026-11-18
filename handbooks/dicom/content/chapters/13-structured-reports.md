---
number: 13
title: Structured Reports: measurements that travel with the images
objective: Read a DICOM Structured Report as a tree of coded content items, find a vascular measurement in it using the PS3.16 templates, and know what a reporting system may and may not do with imported measurements.
status: draft
---

## At the machine

During a carotid study you place the Doppler cursor, angle-correct, freeze, and the machine shows "PSV 128 cm/s, EDV 34 cm/s" next to the waveform. You label it "RT PROX ICA". At the end of the study the machine's report page lists every measurement you took, vessel by vessel, with the ratios already calculated.

Then, very often, you type them all again into the reporting system. Each typed number is a chance for a transposed digit, the wrong side, or the wrong segment, and it's time you're not spending with the next patient.

The machine already knows those numbers precisely, with units and anatomy. DICOM has a way to send them: a **Structured Report** (SR), a DICOM object that carries measurements as data instead of as pixels. This chapter is about reading one, and about the rule that keeps importing them safe.

## On the wire

### An SR is a document, not an image

An SR is a DICOM instance like any other: it has a SOP Class UID, a SOP Instance UID, a study and a series (Modality `SR`), and it travels by C-STORE alongside the images. Instead of Pixel Data, it holds a **content tree**. The SR storage classes differ in what the tree may contain (PS3.3 §A.35; UIDs from PS3.6):

| SOP Class | UID | What its tree can hold |
|---|---|---|
| Basic Text SR | `1.2.840.10008.5.1.4.1.1.88.11` | Headings, text, codes, references; **no numeric measurements**; by-value relationships only |
| Enhanced SR | `1.2.840.10008.5.1.4.1.1.88.22` | Adds numeric measurements with coded names and units, and regions of interest on referenced images |
| Comprehensive SR | `1.2.840.10008.5.1.4.1.1.88.33` | A superset of both, and allows relationships *by reference* between items |
| Comprehensive 3D SR | `1.2.840.10008.5.1.4.1.1.88.34` | Comprehensive SR with 3D coordinates |

Ultrasound measurement reports are usually Enhanced or Comprehensive SR. Your receiver should accept whichever its machines send, which is a conformance statement question (Chapter 6).

### Content items

Every node of the tree is a **content item**, and every content item has the same few parts (PS3.3 §C.17.3):

<div class="pairs">
<div><span>Value Type</span><p><code>(0040,A040)</code>: what kind of item. <code>CONTAINER</code>, <code>TEXT</code>, <code>CODE</code>, <code>NUM</code>, <code>DATE</code>, <code>TIME</code>, <code>DATETIME</code>, <code>UIDREF</code>, <code>PNAME</code>, <code>COMPOSITE</code>, <code>IMAGE</code>, <code>WAVEFORM</code>, <code>SCOORD</code>, <code>SCOORD3D</code>, <code>TCOORD</code>.</p></div>
<div><span>Concept Name</span><p><code>(0040,A043)</code>: what the item is about, as a coded concept: "Peak Systolic Velocity".</p></div>
<div><span>Value</span><p>Depends on the type. A <code>CODE</code> item has a Concept Code Sequence <code>(0040,A168)</code>; a <code>NUM</code> item has a Measured Value Sequence <code>(0040,A300)</code> holding a Numeric Value <code>(0040,A30A)</code> and Measurement Units Code Sequence <code>(0040,08EA)</code>.</p></div>
<div><span>Relationship</span><p><code>(0040,A010)</code>: how a child relates to its parent.</p></div>
<div><span>Children</span><p>A Content Sequence <code>(0040,A730)</code> of further content items.</p></div>
</div>

The relationship types are `CONTAINS` (a heading contains its content), `HAS PROPERTIES`, `HAS CONCEPT MOD` (modifies the meaning of the parent: which side, which segment), `HAS OBS CONTEXT` (who observed, about whom), `HAS ACQ CONTEXT`, `INFERRED FROM` (this conclusion was derived from that measurement) and `SELECTED FROM`.

### Coded concepts: the reason SR works

Every concept name, and every coded value, is a **triplet**:

| Code Value `(0008,0100)` | Coding Scheme Designator `(0008,0102)` | Code Meaning `(0008,0104)` |
|---|---|---|
| `11726-7` | `LN` (LOINC) | Peak Systolic Velocity |
| `86117002` | `SCT` (SNOMED CT) | Internal Carotid Artery |
| `cm/s` | `UCUM` | cm/s |

The **code value plus scheme** is the meaning; the code meaning is a human-readable label that may vary between vendors ("Peak Systolic Velocity", "PSV", "Peak systolic velocity"). Code that matches on Code Meaning text breaks on the next vendor. Match on `(scheme, value)`.

### Templates: where things go

A content tree could be shaped any way at all. **Templates** in PS3.16 pin the shape down, so that every vendor's vascular report puts the same things in the same places. The vascular templates are:

- **TID 5100 Vascular Ultrasound Report**, the root. Its title comes from CID 12100 (for example `24616-5` LN "US Carotid Arteries Report"). It carries the observation context (TID 1001), optional indications and patient characteristics (TID 5101), an image library, a procedure summary (TID 5102), and a series of anatomic sections.
- **TID 5103 Vascular Ultrasound Section**, one per region and side. Its container is "Findings" (`59776-5`, LN), with a Finding Site such as "Artery of neck" (`119568004`, SCT) and a Laterality, Right (`24028007`, SCT) or Left (`7771000`, SCT). The neck sections also allow ratio measurements from CID 12123, which contains the ICA/CCA velocity ratio (`33868-1`, LN).
- **TID 5104 Vascular Ultrasound Measurement Group**, one per vessel. Its container's concept is the vessel itself (CID 12104 for extracranial arteries, such as Internal Carotid Artery). It can carry a Topographical Modifier (`106233006`, SCT) from CID 12116 (Origin, Proximal, Middle, Distal) and contains `NUM` measurements from CID 12119, which includes the blood velocity measurements of CID 12120: Peak Systolic Velocity (`11726-7`, LN), End Diastolic Velocity (`11653-3`, LN) and others. Doppler Angle and Sample Volume Depth can be attached as properties.
- **TID 5105 Ultrasound Graft Section**, for bypass grafts.

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="An SR content tree for one measurement: the report container contains a Findings section modified by finding site Artery of neck and laterality Right, which contains an Internal Carotid Artery measurement group modified by Proximal, which contains a NUM item Peak Systolic Velocity 128 cm/s.">
<defs><marker id="ch13-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="16" width="300" height="44" rx="4" class="box"/>
<text x="170" y="36" text-anchor="middle">CONTAINER: US Carotid Arteries Report</text>
<text x="170" y="52" text-anchor="middle" class="small muted">TID 5100 root</text>
<line x1="60" y1="60" x2="60" y2="96"/>
<line x1="60" y1="96" x2="90" y2="96" marker-end="url(#ch13-arrow)"/>
<text x="64" y="86" class="small">CONTAINS</text>
<rect x="90" y="76" width="260" height="44" rx="4" class="box"/>
<text x="220" y="96" text-anchor="middle">CONTAINER: Findings</text>
<text x="220" y="112" text-anchor="middle" class="small muted">TID 5103 section</text>
<line x1="350" y1="88" x2="430" y2="88" class="dashed" marker-end="url(#ch13-arrow)"/>
<line x1="350" y1="108" x2="430" y2="128" class="dashed" marker-end="url(#ch13-arrow)"/>
<rect x="430" y="70" width="270" height="34" rx="4" class="box"/>
<text x="565" y="92" text-anchor="middle" class="small">CODE: Finding Site = Artery of neck</text>
<rect x="430" y="112" width="270" height="34" rx="4" class="box"/>
<text x="565" y="134" text-anchor="middle" class="small">CODE: Laterality = Right</text>
<text x="390" y="160" text-anchor="middle" class="small muted">HAS CONCEPT MOD</text>
<line x1="130" y1="120" x2="130" y2="196"/>
<line x1="130" y1="196" x2="160" y2="196" marker-end="url(#ch13-arrow)"/>
<text x="134" y="186" class="small">CONTAINS</text>
<rect x="160" y="176" width="260" height="44" rx="4" class="box"/>
<text x="290" y="196" text-anchor="middle">CONTAINER: Internal Carotid Artery</text>
<text x="290" y="212" text-anchor="middle" class="small muted">TID 5104 measurement group</text>
<line x1="420" y1="198" x2="450" y2="198" class="dashed" marker-end="url(#ch13-arrow)"/>
<rect x="450" y="181" width="260" height="34" rx="4" class="box"/>
<text x="580" y="203" text-anchor="middle" class="small">CODE: Topographical modifier = Proximal</text>
<line x1="200" y1="220" x2="200" y2="290"/>
<line x1="200" y1="290" x2="230" y2="290" marker-end="url(#ch13-arrow)"/>
<text x="204" y="280" class="small">CONTAINS</text>
<rect x="230" y="268" width="340" height="44" rx="4" class="box accent"/>
<text x="400" y="288" text-anchor="middle">NUM: Peak Systolic Velocity = 128 cm/s</text>
<text x="400" y="304" text-anchor="middle" class="small muted">(11726-7, LN) · units (cm/s, UCUM)</text>
</svg>
<figcaption>Figure 13.1 — One measurement, found by walking the tree: report, right neck section, proximal ICA group, PSV. This is the tree the lab builds and prints.</figcaption>
</figure>

Figure 13.1 is the whole idea. To answer "what was the right proximal ICA PSV?", a program walks to the section whose laterality is Right, into the group whose concept is Internal Carotid Artery with modifier Proximal, and reads the `NUM` item whose concept is `(11726-7, LN)`. No guessing from labels, no OCR.

### Measurements as data, and as pictures

Real machines vary:

- Some send a complete SR following TID 5100, with every measurement and ratio.
- Some send an SR, but use their own private codes or a vendor-specific template for some items. Your importer then needs a mapping per vendor and model, from their codes to your fields, built from their conformance statement and real samples.
- Some send **no SR at all**, only a screenshot of the measurement page as an image, the numbers burned into pixels (Chapter 12). That is a picture of data, not data. Reading it would mean OCR, and you should treat OCR'd numbers as untrustworthy at best.

SR also has its own trust markers in the SR Document General Module (PS3.3 §C.17.2). **Completion Flag** `(0040,A491)` is `PARTIAL` or `COMPLETE`. **Verification Flag** `(0040,A493)` is `UNVERIFIED` or `VERIFIED`; `VERIFIED` means attested by a named Verifying Observer, and it may be used only on a complete document. A machine's measurement SR is almost always unverified: it records what the machine measured, not what a physician concluded.

### The rule: proposed, then confirmed

An imported measurement is a **proposal**. The technologist who took it is the person who knows whether the cursor was on the right vessel, whether the angle was right, which of three PSV attempts was the real one, and whether "RT" on the machine was really the right side. So a reporting system that imports SR should:

<figure class="diagram">
<svg viewBox="0 0 720 200" role="img" aria-label="Machine measurements travel as an SR to the reporting system, which shows them as proposed values; only after the technologist confirms or edits them do they become findings that feed the signed report.">
<defs><marker id="ch13-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="60" width="120" height="60" rx="4" class="box"/>
<text x="70" y="86" text-anchor="middle">Machine</text>
<text x="70" y="104" text-anchor="middle" class="small muted">measures</text>
<line x1="130" y1="90" x2="190" y2="90" marker-end="url(#ch13-arrow2)"/>
<text x="160" y="80" text-anchor="middle" class="small">SR</text>
<rect x="190" y="60" width="140" height="60" rx="4" class="box dashed"/>
<text x="260" y="86" text-anchor="middle">Proposed values</text>
<text x="260" y="104" text-anchor="middle" class="small muted">shown, not yet findings</text>
<line x1="330" y1="90" x2="390" y2="90" marker-end="url(#ch13-arrow2)"/>
<rect x="390" y="60" width="150" height="60" rx="4" class="box accent"/>
<text x="465" y="86" text-anchor="middle">Technologist</text>
<text x="465" y="104" text-anchor="middle" class="small muted">confirms or edits</text>
<line x1="540" y1="90" x2="590" y2="90" marker-end="url(#ch13-arrow2)"/>
<rect x="590" y="60" width="120" height="60" rx="4" class="box"/>
<text x="650" y="86" text-anchor="middle">Findings</text>
<text x="650" y="104" text-anchor="middle" class="small muted">to signed report</text>
<text x="360" y="160" text-anchor="middle" class="small muted">each value keeps its source: imported from SR (and which) or typed</text>
</svg>
<figcaption>Figure 13.2 — Imported measurements become findings only through a person.</figcaption>
</figure>

1. Show imported values clearly marked as imported, next to the field they would fill.
2. Require a person to accept or change them before they count as findings, and before any criteria or calculation uses them.
3. Record where each final value came from: imported (from which SR instance) or entered by hand, and who confirmed it.
4. Never let an import overwrite a value a person already entered.
5. Keep the SR instance itself as received; it's part of the study.

## Lab

**Build a tiny synthetic SR and walk its tree.** The values are invented, and the document is deliberately incomplete: a real TID 5100 report also needs its observation context and more of the SR Document General Module. It's enough to see the structure.

With the Chapter 10 environment (`pip install pydicom==3.0.1`), save as `make_sr.py`:

```python
# make_sr.py: a tiny synthetic vascular SR, one measurement, shaped like TID 5100 > 5103 > 5104.
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.sequence import Sequence
from pydicom.uid import ComprehensiveSRStorage, ExplicitVRLittleEndian, generate_uid


def code(value, scheme, meaning):
    c = Dataset()
    c.CodeValue, c.CodingSchemeDesignator, c.CodeMeaning = value, scheme, meaning
    return c


def item(relationship, value_type, concept, **fields):
    it = Dataset()
    if relationship:
        it.RelationshipType = relationship
    it.ValueType = value_type
    it.ConceptNameCodeSequence = Sequence([concept])
    for key, val in fields.items():
        setattr(it, key, val)
    return it


def code_item(relationship, concept, value):
    return item(relationship, "CODE", concept, ConceptCodeSequence=Sequence([value]))


def num_item(concept, number, unit):
    measured = Dataset()
    measured.NumericValue = number
    measured.MeasurementUnitsCodeSequence = Sequence([unit])
    return item("CONTAINS", "NUM", concept, MeasuredValueSequence=Sequence([measured]))


psv = num_item(code("11726-7", "LN", "Peak Systolic Velocity"), "128", code("cm/s", "UCUM", "cm/s"))

ica_group = item("CONTAINS", "CONTAINER", code("86117002", "SCT", "Internal Carotid Artery"),
                 ContinuityOfContent="SEPARATE")
ica_group.ContentSequence = Sequence([
    code_item("HAS CONCEPT MOD", code("106233006", "SCT", "Topographical modifier"),
              code("40415009", "SCT", "Proximal")),
    psv,
])

section = item("CONTAINS", "CONTAINER", code("59776-5", "LN", "Findings"), ContinuityOfContent="SEPARATE")
section.ContentSequence = Sequence([
    code_item("HAS CONCEPT MOD", code("363698007", "SCT", "Finding Site"),
              code("119568004", "SCT", "Artery of neck")),
    code_item("HAS CONCEPT MOD", code("272741003", "SCT", "Laterality"), code("24028007", "SCT", "Right")),
    ica_group,
])

ds = item(None, "CONTAINER", code("24616-5", "LN", "US Carotid Arteries Report"),
          ContinuityOfContent="SEPARATE")
ds.ContentSequence = Sequence([section])

ds.SOPClassUID = ComprehensiveSRStorage
ds.SOPInstanceUID = generate_uid()
ds.StudyInstanceUID = generate_uid()
ds.SeriesInstanceUID = generate_uid()
ds.Modality = "SR"
ds.PatientName = "TEST^PATIENT"
ds.PatientID = "DEMO-0001"
ds.AccessionNumber = "ACC-0001"
ds.CompletionFlag = "PARTIAL"
ds.VerificationFlag = "UNVERIFIED"
ds.file_meta = FileMetaDataset()
ds.file_meta.MediaStorageSOPClassUID = ds.SOPClassUID
ds.file_meta.MediaStorageSOPInstanceUID = ds.SOPInstanceUID
ds.file_meta.TransferSyntaxUID = ExplicitVRLittleEndian
ds.save_as("measurements-sr.dcm", enforce_file_format=True)
print("wrote measurements-sr.dcm")
```

And a walker, `walk_sr.py`, the core of any SR importer:

```python
# walk_sr.py: print an SR content tree, one line per content item.
import sys
from pydicom import dcmread


def describe(it):
    name = it.ConceptNameCodeSequence[0].CodeMeaning
    if it.ValueType == "NUM":
        mv = it.MeasuredValueSequence[0]
        return f"{name} = {mv.NumericValue} {mv.MeasurementUnitsCodeSequence[0].CodeValue}"
    if it.ValueType == "CODE":
        return f"{name} = {it.ConceptCodeSequence[0].CodeMeaning}"
    return name


def walk(it, depth=0):
    rel = it.get("RelationshipType", "ROOT")
    print("  " * depth + f"{rel} {it.ValueType}: {describe(it)}")
    for child in it.get("ContentSequence", []):
        walk(child, depth + 1)


walk(dcmread(sys.argv[1]))
```

```bash
python make_sr.py
python walk_sr.py measurements-sr.dcm
```

```text
ROOT CONTAINER: US Carotid Arteries Report
  CONTAINS CONTAINER: Findings
    HAS CONCEPT MOD CODE: Finding Site = Artery of neck
    HAS CONCEPT MOD CODE: Laterality = Right
    CONTAINS CONTAINER: Internal Carotid Artery
      HAS CONCEPT MOD CODE: Topographical modifier = Proximal
      CONTAINS NUM: Peak Systolic Velocity = 128 cm/s
```

That's Figure 13.1 as text. Now extend it:

1. Add an End Diastolic Velocity (`11653-3`, LN) to the ICA group and a Left section with its own ICA group. Re-run the walker.
2. Change the walker to print *codes* (`scheme:value`) instead of meanings, then write a function `find_psv(ds, laterality_code, vessel_code, segment_code)` that walks the tree and returns the number. It should match only on codes.
3. Change "Peak Systolic Velocity" to "PSV" in the Code Meaning only. Your `find_psv` should still work; a version that matched on text would not.

If you have DCMTK installed, `dsrdump +Pc measurements-sr.dcm` prints the same document in DCMTK's SR notation, with codes. Expect it to warn about what this minimal document leaves out; reading those warnings is a good way to learn what a complete SR requires.

## In Lumen

Today a Lumen technologist enters every measurement by hand, segment by segment, in the exam's findings grid, and Lumen applies the facility's diagnostic criteria to them. Lumen's data model already records *how* each measurement was captured, so a value imported from an SR will be distinguishable from one typed in.

Importing SR is planned, after machine ingest itself (Part VI). The design follows this chapter's rule: when an SR arrives with a study and matches an exam, Lumen maps its coded measurements (by scheme and code value, with a per-vendor mapping where a machine uses private codes) onto findings fields as **proposed** values. The technologist confirms or corrects each one, nothing is calculated or reported from an unconfirmed value, nothing typed is overwritten, and each final value records its source. The SR object itself is kept with the study, like any other received instance.

## How it fails

- **Matching on text.** The importer looks for "Peak Systolic Velocity" and misses the vendor that writes "PSV". Match on `(scheme, value)`.
- **Wrong side or segment.** The importer reads the first PSV it finds instead of walking section laterality and group modifiers, and puts a left value in a right field.
- **Several values, one field.** The technologist measured the same segment three times; the SR has all three. The importer silently picks one. Show them all and let the person choose.
- **Units assumed.** A value in m/s read as cm/s. Read the units code every time.
- **Imports that overwrite.** A late SR replaces numbers the technologist already corrected.
- **Machine numbers treated as final.** An unverified SR feeds criteria and the report with no human check. The report says something the technologist never confirmed.
- **Screenshots treated as data.** OCR of a measurement page fills fields with misread digits.

## Evidence

You understand this chapter when you can take an SR from a machine, print its tree, find one named measurement for one side and segment by code alone, and show where in your system that value would appear as a proposal and who would confirm it.

## Workbook

1. Why is a Basic Text SR not enough for a vascular measurement report?
2. Two vendors send `(11726-7, LN)`, one with meaning "Peak Systolic Velocity" and one with "PSV". Are these the same measurement? What should your code compare?
3. In TID 5103 and TID 5104, where do "Right" and "Proximal" live, and why does an importer have to read them before it reads the number?
4. A machine sends only a screenshot of its measurement page. What can a reporting system safely do with it?
5. List three things a reporting system must do before an imported PSV can appear in a signed report.

## Answers

1. Basic Text SR doesn't allow `NUM` content items, so it can't carry a measurement as a number with coded units (the SOP class table in "An SR is a document, not an image"). It can only hold text and codes. Vascular measurements need Enhanced or Comprehensive SR.
2. Yes. The meaning of a coded concept is its code value plus coding scheme, `11726-7` in LOINC; Code Meaning is a display label that may differ between vendors ("Coded concepts"). Compare `(scheme, value)` and ignore the meaning text when matching.
3. "Right" is the Laterality concept modifier on the TID 5103 section, and "Proximal" is the Topographical Modifier on the TID 5104 measurement group (Figure 13.1). A PSV item by itself says only "a peak systolic velocity". Its side and segment come from the containers above it. An importer that reads the number without walking those modifiers can file it under the wrong vessel or side.
4. Store it and show it as an image in the study, like any other screen capture (with the same protection, since it may contain burned-in identifiers). It is not data: any numbers read from it by OCR would have to be treated as unreliable and entered or confirmed by a person, so in practice the technologist enters the values ("Measurements as data, and as pictures").
5. Show it as an imported proposal; have the technologist accept or correct it (choosing among repeated measurements if there are several); record its source and who confirmed it. Also check units, never overwrite a value a person entered, and only then let criteria and the report use it ("The rule: proposed, then confirmed").

<p class="sources">Sources: DICOM PS3.3 §A.35 (Basic Text, Enhanced and Comprehensive SR IODs), §C.17.2 (SR Document General Module: Completion Flag, Verification Flag, Verifying Observer), §C.17.3 (SR Document Content Module: value types, relationship types, content item attributes); PS3.6 (SR storage SOP class UIDs, data dictionary); PS3.16 TID 5100 Vascular Ultrasound Report, TID 5103 Vascular Ultrasound Section, TID 5104 Vascular Ultrasound Measurement Group, TID 5105 Ultrasound Graft Section, CID 12100, 12104, 12116, 12119, 12120, 12123. DCMTK dsrdump options from its manual page.</p>
