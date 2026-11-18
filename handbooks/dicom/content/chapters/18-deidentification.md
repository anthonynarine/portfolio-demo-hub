---
number: 18
title: De-identification for test data and teaching
objective: Explain what the DICOM confidentiality profile removes and why removing the name is not enough, de-identify a synthetic study consistently, and know when to generate synthetic data instead.
status: draft
---

## At the machine

Sooner or later someone asks for "a few anonymized studies": for a teaching file, a vendor's support ticket, a conference talk, a developer testing a new feature. The usual answer is to export the study, open it in a viewer, delete the patient name, and send it.

Look closely at an ultrasound image from your own lab and you will see why that is not enough. The name, MRN, date of birth and date of the exam are often written across the top of the image itself, in pixels, by the machine. The header carries the institution, the station, the operator, the referring physician, and private vendor fields nobody can read without the vendor's documentation. Deleting one tag leaves most of the person behind.

## On the wire

### Two places identity lives

<div class="pairs">
<div><span>Header</span><p>Tags: patient name and ID, dates, accession number, people's names, institution and device, UIDs, free-text comments, private vendor tags, and sequences that nest more of the same.</p></div>
<div><span>Pixels</span><p>Text burned into the image by the machine: in ultrasound, usually a band at the top with the patient's name, ID and the exam date. Some objects also carry overlays or graphic annotations that draw text on top of the pixels.</p></div>
</div>

The tag **Burned In Annotation (0028,0301)** says whether the image contains burned-in text that could identify the patient. Treat anything other than `NO` as "assume it does." Ultrasound is the modality where it most often does.

### The Basic Application Level Confidentiality Profile

DICOM's answer is **PS3.15 Annex E**, the Attribute Confidentiality Profiles. Its **Basic Application Level Confidentiality Profile** lists, in Table E.1-1, every standard attribute that can carry identifying information, with an action for each:

| Code | Action |
|---|---|
| D | Replace with a non-empty dummy value that fits the VR |
| Z | Replace with an empty value (or a dummy) |
| X | Remove the attribute; for a sequence, remove all its items |
| K | Keep (sequences are still cleaned inside) |
| C | Clean: replace with values of similar meaning known not to identify |
| U | Replace the UID with a new UID that is internally consistent within the set of instances |

Some attributes get combined codes such as `Z/D`, meaning "Z unless the object's definition requires a value, then D." Private attributes (odd group numbers) are marked `X`: remove them, because nobody can promise what a vendor put there.

The profile also requires the de-identifier to record what it did: **Patient Identity Removed (0012,0062)** set to `YES`, and the method in **De-identification Method (0012,0063)** or **De-identification Method Code Sequence (0012,0064)**.

### The options

The basic profile removes a lot, sometimes too much for the purpose. PS3.15 Annex E.3 defines options that either remove *more* or deliberately *keep* something:

<div class="pairs">
<div><span>Clean Pixel Data</span><p>Remove identifying text burned into the pixels, by changing (blacking out) the stored pixel values; then set Burned In Annotation to NO. The standard notes this may need a person to check.</p></div>
<div><span>Clean Recognizable Visual Features</span><p>For images where the anatomy itself could identify someone, such as a face.</p></div>
<div><span>Clean Graphics</span><p>Remove or clean overlays and graphic annotations that draw text.</p></div>
<div><span>Clean Structured Content</span><p>Clean identifying content inside structured reports (Chapter 13).</p></div>
<div><span>Clean Descriptors</span><p>Clean free-text descriptions and comments.</p></div>
<div><span>Retain Longitudinal Temporal Information</span><p>Keep dates, either as Full Dates or as Modified Dates (consistently shifted), when intervals between studies matter.</p></div>
<div><span>Retain Patient Characteristics</span><p>Keep things like sex, age, size and weight.</p></div>
<div><span>Retain Device Identity</span><p>Keep device details, for example for quality or vendor support.</p></div>
<div><span>Retain UIDs</span><p>Keep the original UIDs.</p></div>
<div><span>Retain Safe Private</span><p>Keep private attributes known to be safe.</p></div>
<div><span>Retain Institution Identity</span><p>Keep the institution.</p></div>
</div>

Every "retain" option trades privacy for usefulness. Choose them for a stated purpose, and write the purpose down.

### UIDs must stay consistent

Chapter 11 showed that UIDs hold a study together: every image in a study shares a Study Instance UID, and every image in a series shares a Series Instance UID. The original UIDs can be traced back to the source system, so the profile replaces them (action `U`). The replacement must be **consistent across the set**: if two images shared a Study Instance UID before, they must share the *same new* one after, or the study falls apart into single images. In practice that means one mapping table (old UID to new UID) for the whole job, not a fresh random UID per file.

Figure 18.1 shows the pipeline.

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="An identified study passes through five steps: check burned-in annotation and clean pixels, replace or remove identifying tags per Table E.1-1, remove private tags, remap UIDs with one shared table, and record the method, producing a de-identified study.">
<defs><marker id="ch18-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="120" width="110" height="60" rx="4" class="box"/>
<text x="65" y="146" text-anchor="middle">Identified</text>
<text x="65" y="164" text-anchor="middle">study</text>
<line x1="120" y1="150" x2="150" y2="150" marker-end="url(#ch18-arrow)"/>
<rect x="150" y="20" width="420" height="260" rx="6" class="box"/>
<rect x="170" y="35" width="380" height="38" rx="4" class="box accent"/>
<text x="185" y="59">1. Pixels: clean burned-in text, set flag NO</text>
<rect x="170" y="83" width="380" height="38" rx="4" class="box"/>
<text x="185" y="107">2. Tags: D / Z / X / K / C per Table E.1-1</text>
<rect x="170" y="131" width="380" height="38" rx="4" class="box"/>
<text x="185" y="155">3. Private tags: remove</text>
<rect x="170" y="179" width="380" height="38" rx="4" class="box"/>
<text x="185" y="203">4. UIDs: remap with one shared table</text>
<rect x="170" y="227" width="380" height="38" rx="4" class="box"/>
<text x="185" y="251">5. Record: Patient Identity Removed = YES</text>
<line x1="570" y1="150" x2="600" y2="150" marker-end="url(#ch18-arrow)"/>
<rect x="600" y="120" width="110" height="60" rx="4" class="box"/>
<text x="655" y="146" text-anchor="middle">De-identified</text>
<text x="655" y="164" text-anchor="middle">study</text>
</svg>
<figcaption>Figure 18.1 — De-identification is a pipeline, not a tag deletion. The pixel step comes first, because in ultrasound it is the one most often missed.</figcaption>
</figure>

### What the profile does not promise

The standard is direct about its limits: applying the profile "does not guarantee" that all identifying information is removed, and it is part of a de-identification process, not a replacement for one. Free text can contain anything. Burned-in text in an unusual place can be missed by an automatic cleaner. A rare condition plus a date plus a small town can identify a person with no name at all. Whether a de-identified set meets a legal standard (for example HIPAA's de-identification methods) is a separate question for your privacy and compliance teams; the companion handbook, *HIPAA for Medical Application Developers*, covers it, and nothing here is legal advice.

### Prefer synthetic data

For development and testing, the safest data is data that never belonged to anyone. Every lab in this book generates its own images with fake names like `TEST^PATIENT`. Synthetic data cannot be re-identified, needs no review, and can be shared freely. De-identify real studies only when you need something synthetic data cannot give you, such as real anatomy for teaching or a vendor bug that only appears with a particular machine's output, and then follow the whole pipeline.

## Lab

You will create a synthetic two-image study with fake "burned-in" text and a private vendor tag, then de-identify it with a small script that follows part of the profile, and check the result. You need Python 3.10 or later with `pydicom==3.0.1` and `numpy==2.1.3`, and `make_synthetic_us.py` from Chapter 14's lab in the same directory.

**Make the study.** Save as `burn_in.py`:

```python
"""Make a synthetic study of two images whose top rows stand in for burned-in patient text."""
from pydicom import dcmread

from make_synthetic_us import make

make("img1.dcm")
make("img2.dcm")
first = dcmread("img1.dcm")
for path in ["img1.dcm", "img2.dcm"]:
    ds = dcmread(path)
    ds.StudyInstanceUID = first.StudyInstanceUID      # same study
    ds.SeriesInstanceUID = first.SeriesInstanceUID    # same series
    pixels = ds.pixel_array.copy()
    pixels[:20, :] = 255                              # pretend "TEST^PATIENT DEMO-0001" is drawn here
    ds.PixelData = pixels.tobytes()
    ds.BurnedInAnnotation = "YES"
    ds.private_block(0x0009, "SYNTHETIC VENDOR", create=True).add_new(0x01, "LO", "operator note: TEST")
    ds.save_as(path)
```

**De-identify it.** Save as `deid.py`. It covers a handful of the profile's attributes so you can see each step; a real job uses a complete, maintained implementation of Table E.1-1.

```python
"""A teaching subset of the Basic Application Level Confidentiality Profile. Not a complete de-identifier."""
import sys
from pathlib import Path

from pydicom import dcmread
from pydicom.uid import generate_uid

REMOVE = ["InstitutionName", "InstitutionAddress", "StationName", "ReferringPhysicianName",
          "OperatorsName", "PerformingPhysicianName", "PatientBirthDate", "DeviceSerialNumber"]
UID_KEYWORDS = ["StudyInstanceUID", "SeriesInstanceUID", "SOPInstanceUID", "FrameOfReferenceUID"]
HEADER_ROWS = 20  # this lab's "device" burns text into the top 20 rows

uid_map = {}  # old UID -> new UID, shared by every file in one run

def new_uid(old):
    if old not in uid_map:
        uid_map[old] = generate_uid()
    return uid_map[old]

def clean_pixels(ds):
    """Black out the region where this device model burns in text."""
    pixels = ds.pixel_array.copy()
    pixels[:HEADER_ROWS, :] = 0
    ds.PixelData = pixels.tobytes()
    ds.BurnedInAnnotation = "NO"

def deidentify(src, dst, subject_code):
    ds = dcmread(src)
    if ds.get("BurnedInAnnotation") != "NO":
        clean_pixels(ds)
    ds.PatientName = subject_code
    ds.PatientID = subject_code
    ds.AccessionNumber = ""
    for keyword in REMOVE:
        if keyword in ds:
            delattr(ds, keyword)
    for keyword in UID_KEYWORDS:
        if keyword in ds:
            setattr(ds, keyword, new_uid(getattr(ds, keyword)))
    ds.file_meta.MediaStorageSOPInstanceUID = ds.SOPInstanceUID
    ds.remove_private_tags()
    ds.PatientIdentityRemoved = "YES"
    ds.DeidentificationMethod = "Teaching subset of PS3.15 Annex E; not a complete profile"
    ds.save_as(dst, enforce_file_format=True)
    print(f"{src} -> {dst}")

if __name__ == "__main__":
    out = Path(sys.argv[1])
    out.mkdir(exist_ok=True)
    for path in sys.argv[2:]:
        deidentify(path, out / Path(path).name, "SUBJECT-001")
```

**Run and check:**

```bash
python burn_in.py
python deid.py out img1.dcm img2.dcm
python - <<'EOF'
from pydicom import dcmread
a, b, o = dcmread("out/img1.dcm"), dcmread("out/img2.dcm"), dcmread("img1.dcm")
print("same new study:", a.StudyInstanceUID == b.StudyInstanceUID, "| changed:", a.StudyInstanceUID != o.StudyInstanceUID)
print("top band max:", a.pixel_array[:20].max(), "| rest untouched:", (a.pixel_array[20:] == o.pixel_array[20:]).all())
print("private tags left:", any(e.tag.is_private for e in a), "| name:", a.PatientName, "| burned-in:", a.BurnedInAnnotation)
EOF
```

You should see `same new study: True | changed: True`, a top band of `0`, no private tags, and `SUBJECT-001`. Now break it on purpose: in `deidentify()`, change `new_uid(getattr(ds, keyword))` to `generate_uid()`, so every file gets fresh UIDs, and run both commands again. `same new study` becomes `False`, and your study is now two unrelated images.

Notice how `clean_pixels` works: it knows where *this* device draws its text. Real pixel cleaning works the same way, with a mask per machine model and screen layout, plus a person checking samples, because an automatic cleaner cannot know about text it was not told to look for.

**Optional: Orthanc.** Orthanc's REST API has a built-in anonymizer that applies Table E.1-1 (by default the 2023b edition of the table). Start Orthanc as in Chapter 14, then:

```bash
curl -s -X POST localhost:8042/instances --data-binary @img1.dcm
curl -s localhost:8042/instances    # copy the instance ID
curl -s -X POST localhost:8042/instances/<id>/anonymize -d '{"Keep": ["StudyDate"]}' -o anon.dcm
```

The download is a new de-identified file; Orthanc does not store it. It changes the header, with `Keep` listing tags to retain. Open `anon.dcm` with pydicom and check the top 20 rows: the "burned-in" band is still there (`pixel_array[:20].max()` is `255`), and Burned In Annotation still says `YES`. Tag-based anonymization does not look at pixels.

## In Lumen

Lumen's rule is that development and test environments contain synthetic data only: its demo exams carry invented patients, and real studies are not to be copied down from a clinical environment to debug a problem.

In the planned machine path, de-identification is not part of ingest: images belong to the patient's record and arrive intact, under that organization's access rules. A de-identified copy would be a separate, explicit export for a stated purpose (teaching, or sending a sample to a vendor), following the full pipeline above with a person checking pixel cleaning, and recorded in the audit trail.

## How it fails

- **Name-only anonymization.** The patient name is deleted; the ID, dates, accession number, institution and burned-in text remain.
- **Pixels forgotten.** The header is perfectly clean and the patient's name is printed across the top of every image.
- **Fresh UIDs per file.** Every image gets a new random Study Instance UID; the study falls apart, and someone "fixes" it by restoring the originals.
- **Private tags kept "just in case."** A vendor's private field contains the operator's notes, or the patient's name in another format.
- **Retain everything.** So many retain options are turned on for convenience that the result is barely de-identified, with no written purpose for any of them.
- **Real data in test.** A production study is copied into a developer environment "just for today."

## Evidence

You can show the lab's check output, including the deliberate UID failure; for any real de-identification job, the profile and options used, the stated purpose for each retain option, the pixel-cleaning method and who reviewed samples; and the values of Patient Identity Removed and De-identification Method in the output files.

## Workbook

1. Name three places in an ultrasound DICOM object where identifying information can survive after the Patient Name tag is deleted.
2. What does action `U` require, and what breaks if you ignore "internally consistent"?
3. Why are private attributes removed by default?
4. Orthanc's anonymizer left the burned-in band in place. Why, and what does that tell you about tag-based tools?
5. A research partner wants the time between a patient's two studies. Which option fits, and what is the trade-off?

## Answers

1. Burned-in text in the pixels, especially the header band of an ultrasound image. Other header tags such as Patient ID, birth date, study dates, Accession Number, institution, station and people's names. Private vendor tags and free-text fields, sometimes inside nested sequences (see "Two places identity lives").
2. `U` requires replacing each UID with a new UID that is consistent within the set of instances: the same old UID always becomes the same new UID. Ignore that, and images that shared a study or series no longer do, so the study falls apart, as the lab's deliberate failure shows (see "UIDs must stay consistent").
3. Their contents are defined by each vendor, not by the standard, so nobody can promise they hold no identifying information. Table E.1-1 marks them `X` (remove), and Retain Safe Private exists for the cases where specific private tags are known to be safe (see the profile table and options).
4. It works on the header only; it does not inspect or change pixel data. Tag-based tools are necessary but never sufficient for ultrasound: pixel cleaning is a separate step (the Clean Pixel Data option) and needs to know where each device draws its text (see the Orthanc step of the lab).
5. Retain Longitudinal Temporal Information, preferably with Modified Dates, which shifts dates consistently so intervals survive while the real dates do not. The trade-off is that keeping any date information increases the chance of re-identification, so it must be justified by the purpose and written down (see "The options").

<p class="sources">Sources: DICOM PS3.15 Annex E (Attribute Confidentiality Profiles; E.1 (Application Level Confidentiality Profile: Table E.1-1 and the action codes D, Z, X, K, C, U of Table E.1-1a), E.2 (Basic Application Level Confidentiality Profile); Patient Identity Removed (0012,0062), De-identification Method (0012,0063), De-identification Method Code Sequence (0012,0064); E.3 options including Clean Pixel Data and Retain Longitudinal Temporal Information with Full or Modified Dates); PS3.6 (Burned In Annotation (0028,0301)); Orthanc Book, anonymization (POST /instances/{id}/anonymize, Keep, PS3.15 Table E.1-1 2023b default). Lab verified with pydicom 3.0.1 and orthancteam/orthanc:24.10.1.</p>
