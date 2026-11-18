---
number: 11
title: UIDs: study, series, instance
objective: Explain what a DICOM UID is, how the study, series and instance UIDs fit together, and how to use them safely as identity and idempotency keys in an application.
status: draft
---

## At the machine

A carotid study on the machine is one exam, but it rarely arrives in PACS as one thing. It shows up as a study with several series: maybe a series of greyscale stills, another of color and Doppler images, a series of cine clips, a series of measurement pages. Re-open the exam on the machine to add one more image after you've ended it, and sometimes that image joins the same study in PACS. Sometimes, on a different machine or after a reboot, it turns up as a separate, second study for the same patient on the same day, and somebody has to merge them.

What decides which of those happens is a set of long dotted numbers in the header that nobody at the machine ever sees: the **UIDs**. This chapter is about those numbers, because an application that receives images will use them as its keys, and every merge, split and duplicate in PACS is a UID story.

## On the wire

### What a UID is

A **Unique Identifier** (VR `UI`, Chapter 10) is a string of numbers separated by dots, in the style of an ISO object identifier. PS3.5 §9.1 sets the rules:

- only the digits `0`–`9` and the dot;
- each component is a number of one or more digits, and its first digit can't be `0` unless the whole component is `0`, so `1.2.03.4` is invalid and `1.2.0.4` is fine;
- at most **64 characters** in total, dots included;
- in a data set, an odd-length UID is padded with one trailing NULL byte.

PS3.5 Chapter 9 splits a UID into an **org root** and a **suffix**. The root identifies an organization that has registered it; the organization then guarantees that the suffixes it hands out under that root never collide. The root `1.2.840.10008` belongs to DICOM itself. Every SOP Class UID and Transfer Syntax UID you met in Chapter 6 lives under it, and nobody may create instance UIDs there.

If you don't have a registered root, PS3.5 §B.2 offers a second way: take a freshly generated UUID, read its 128 bits as one big integer, and write `2.25.` followed by that integer in decimal (no leading zeros, at most 39 digits). That form is meant for UIDs created on the fly, such as instance UIDs, and is the usual choice for an application that has to mint UIDs.

UIDs are **identifiers, not data**. Don't parse them, don't infer a date or a device from their digits, and don't build new ones by appending to another system's UID. PS3.5 explicitly cautions against deriving UIDs from someone else's.

### Two kinds of UID

<div class="pairs">
<div><span>Fixed, by the standard</span><p>"What kind of thing": SOP Class UIDs such as Ultrasound Image Storage <code>1.2.840.10008.5.1.4.1.1.6.1</code>, Transfer Syntax UIDs. The same in every system in the world.</p></div>
<div><span>Minted, per object</span><p>"Which exact thing": Study, Series and SOP Instance UIDs. Created once, by the system that creates the object, and never again for anything else.</p></div>
</div>

This chapter is about the second kind.

### The hierarchy

DICOM's information model nests every image four levels deep, and each level has its identifying attribute:

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="The DICOM hierarchy: one patient identified by Patient ID has a study identified by Study Instance UID, which has two series identified by Series Instance UID, which contain instances identified by SOP Instance UID.">
<defs><marker id="ch11-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="260" y="20" width="200" height="52" rx="4" class="box"/>
<text x="360" y="42" text-anchor="middle">Patient</text>
<text x="360" y="60" text-anchor="middle" class="small muted">Patient ID (0010,0020)</text>
<line x1="360" y1="72" x2="360" y2="100" marker-end="url(#ch11-arrow)"/>
<rect x="240" y="100" width="240" height="52" rx="4" class="box accent"/>
<text x="360" y="122" text-anchor="middle">Study: one exam</text>
<text x="360" y="140" text-anchor="middle" class="small muted">Study Instance UID (0020,000D)</text>
<line x1="320" y1="152" x2="190" y2="190" marker-end="url(#ch11-arrow)"/>
<line x1="400" y1="152" x2="530" y2="190" marker-end="url(#ch11-arrow)"/>
<rect x="70" y="190" width="240" height="52" rx="4" class="box"/>
<text x="190" y="212" text-anchor="middle">Series 1: Right carotid</text>
<text x="190" y="230" text-anchor="middle" class="small muted">Series Instance UID (0020,000E)</text>
<rect x="410" y="190" width="240" height="52" rx="4" class="box"/>
<text x="530" y="212" text-anchor="middle">Series 2: Left carotid</text>
<text x="530" y="230" text-anchor="middle" class="small muted">Series Instance UID (0020,000E)</text>
<line x1="150" y1="242" x2="110" y2="270" marker-end="url(#ch11-arrow)"/>
<line x1="230" y1="242" x2="270" y2="270" marker-end="url(#ch11-arrow)"/>
<line x1="530" y1="242" x2="530" y2="270" marker-end="url(#ch11-arrow)"/>
<rect x="40" y="270" width="140" height="44" rx="4" class="box"/>
<text x="110" y="290" text-anchor="middle">Image 1</text>
<text x="110" y="306" text-anchor="middle" class="small muted">SOP Instance UID</text>
<rect x="200" y="270" width="140" height="44" rx="4" class="box"/>
<text x="270" y="290" text-anchor="middle">Image 2</text>
<text x="270" y="306" text-anchor="middle" class="small muted">SOP Instance UID</text>
<rect x="460" y="270" width="140" height="44" rx="4" class="box"/>
<text x="530" y="290" text-anchor="middle">Image 1</text>
<text x="530" y="306" text-anchor="middle" class="small muted">SOP Instance UID</text>
</svg>
<figcaption>Figure 11.1 — Patient, study, series, instance. This is exactly the study the lab builds and loads into Orthanc.</figcaption>
</figure>

- **Patient** is identified by Patient ID `(0010,0020)`, which is *not* a UID. It's whatever the order system issued, usually the MRN, and it's only unique within that system.
- **Study** is one exam: everything performed under one order on one visit. Its **Study Instance UID** `(0020,000D)` ties every image of the exam together. The Accession Number `(0008,0050)` usually travels alongside it, linking the study to the order.
- **Series** is a group of images acquired together, created by the modality: commonly one per protocol step or image type. Its **Series Instance UID** `(0020,000E)` is new for every series. Series Number `(0020,0011)` is just a display ordering, not an identifier.
- **Instance** is one object: one still, one cine clip, one Structured Report. Its **SOP Instance UID** `(0008,0018)` identifies that object everywhere, forever. Instance Number `(0020,0013)` is again only an ordering.

The rule for a sender is simple to state. Mint the Study Instance UID once per exam, a Series Instance UID once per series, and a SOP Instance UID once per object, and never reuse any of them for something else. PS3.5 notes that the same UID can't identify both a study and a series.

### Who mints them

The machine mints all three when it acquires images. Where does the Study Instance UID come from? If the machine took the patient from the **Modality Worklist** (Chapter 8), the worklist entry can carry a Study Instance UID chosen by the order system, and the machine uses it. Then the order, the images and the report agree on one study from the start. If the technologist typed the patient in by hand, the machine invents its own. That second path is how "two studies for one exam" happens: the order system's study and the machine's study are different UIDs, and only the accession number (if it was typed correctly) can join them.

### UIDs as keys in an application

For a system that receives images, the SOP Instance UID is a gift: a globally unique, sender-assigned name for the exact object.

- **Idempotency.** Networks retry. A gateway re-sends after a timeout; a technologist presses "send" twice. If your ingest treats the SOP Instance UID as the object's key, a repeat send is recognized and can be acknowledged without creating a duplicate.
- **But identical UID doesn't prove identical content.** Some receivers keep the first copy and silently ignore later ones with the same UID; others overwrite. The lab shows Orthanc's default: it keeps the first. If a sender corrects an object without minting a new UID (it shouldn't, but it happens), a "keep first" receiver will never see the correction. Decide your policy deliberately and record what you did.
- **Never mint a UID in place of the sender's.** If your system re-writes received objects (for example when converting formats), the original object's UIDs remain the identity. A converted copy is a different object and needs its own UID; it should never pretend to be the original.
- **De-identification changes UIDs on purpose.** A teaching copy of a study must not carry the original UIDs, because they're a link back to the patient's record. Chapter 18 covers how to remap them consistently, so the copy keeps its internal structure: all images of the copy still share one new Study UID.

## Lab

**Build a synthetic two-series study, load it into a local Orthanc, and watch the hierarchy and a duplicate send.** Everything here is synthetic.

Start Orthanc in Docker. For this lab only, on your own laptop, turn its HTTP authentication off:

```bash
docker run --rm --name orthanc-lab -p 8042:8042 -p 4242:4242 \
  -e ORTHANC__AUTHENTICATION_ENABLED=false orthancteam/orthanc:24.10.1
```

In another terminal, with the virtual environment from Chapter 10 (`pip install pydicom==3.0.1`), first look at what a UID looks like:

```python
from pydicom.uid import generate_uid
print(generate_uid())             # under pydicom's registered root 1.2.826.0.1.3680043.8.498.
print(generate_uid(prefix=None))  # the 2.25.<UUID as integer> form from PS3.5 §B.2
```

Then save this as `make_two_series.py`:

```python
# make_two_series.py: one synthetic study, two series, three instances.
from pathlib import Path
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, UltrasoundImageStorage, generate_uid

study_uid = generate_uid()                     # one per study, made once
series = [
    ("Right carotid", [generate_uid(), generate_uid()]),  # two images
    ("Left carotid", [generate_uid()]),                   # one image
]
out = Path("study")
out.mkdir(exist_ok=True)

for series_number, (description, instance_uids) in enumerate(series, start=1):
    series_uid = generate_uid()                # one per series, made once
    for instance_number, sop_uid in enumerate(instance_uids, start=1):
        ds = Dataset()
        ds.SOPClassUID = UltrasoundImageStorage
        ds.SOPInstanceUID = sop_uid            # one per image
        ds.StudyInstanceUID = study_uid
        ds.SeriesInstanceUID = series_uid
        ds.SeriesNumber = series_number
        ds.SeriesDescription = description
        ds.InstanceNumber = instance_number
        ds.Modality = "US"
        ds.PatientName = "TEST^PATIENT"
        ds.PatientID = "DEMO-0001"
        ds.AccessionNumber = "ACC-0001"
        ds.StudyDate = "20261118"
        ds.file_meta = FileMetaDataset()
        ds.file_meta.MediaStorageSOPClassUID = ds.SOPClassUID
        ds.file_meta.MediaStorageSOPInstanceUID = sop_uid
        ds.file_meta.TransferSyntaxUID = ExplicitVRLittleEndian
        ds.save_as(out / f"s{series_number}-i{instance_number}.dcm", enforce_file_format=True)

print("study", study_uid)
```

Run it and upload the three files through Orthanc's REST API:

```bash
python make_two_series.py
for f in study/*.dcm; do curl -s -X POST http://localhost:8042/instances --data-binary @"$f" | grep Status; done
```

Each prints `"Status" : "Success"`. Open `http://localhost:8042/ui/app/` in a browser (Orthanc's web interface) and you'll see one patient, one study, and inside it the two series with two and one images: Figure 11.1. Or ask the REST API directly:

```bash
curl -s http://localhost:8042/studies            # one study id
curl -s "http://localhost:8042/studies/<id>/series?expand" | grep SeriesDescription
```

Now send the first image a second time:

```bash
curl -s -X POST http://localhost:8042/instances --data-binary @study/s1-i1.dcm | grep Status
```

Orthanc answers `"Status" : "AlreadyStored"`. It recognized the SOP Instance UID and stored nothing new: idempotency for free.

Last, the trap. Change the series description in that file *without* changing its UID, and send it:

```python
from pydicom import dcmread
ds = dcmread("study/s1-i1.dcm")
ds.SeriesDescription = "CHANGED"
ds.save_as("changed.dcm", enforce_file_format=True)
```

```bash
curl -s -X POST http://localhost:8042/instances --data-binary @changed.dcm | grep Status
```

Again `AlreadyStored`, and the study still says "Right carotid": the changed content was quietly dropped, because Orthanc by default keeps the first copy of a UID. Neither behavior is wrong. What would be wrong is not knowing which one your system has.

Stop Orthanc with `Ctrl+C` when you're done. The container is removed (`--rm`) along with everything you uploaded.

## In Lumen

Lumen's exams today are created by Lumen, not by an order system's Study Instance UID, and images uploaded by browser are stored by the Media service under generated keys, with a database row per image.

In the planned machine ingest, the UIDs become Lumen's keys for received objects. The design keeps the SOP Instance UID of every received object, so a re-send from the facility's gateway is recognized as a duplicate rather than stored twice, and records the policy for a same-UID object with different content (keep the first and flag the conflict for review, rather than silently overwrite a clinical image). The Study Instance UID groups the objects of one exam. But Lumen matches a study to an exam by Accession Number, not by UID (Chapter 22), because a study started without the worklist carries a UID that Lumen has never seen. Any rendition Lumen makes for the browser (Chapter 12) is a derived copy linked to the original's SOP Instance UID, never a replacement for it.

## How it fails

- **Two studies for one exam.** The patient was typed in by hand, or the machine restarted mid-exam and minted a new Study UID. PACS shows two studies the same day; someone merges them.
- **One UID, two objects.** A misconfigured device or a buggy converter reuses a SOP Instance UID. A "keep first" receiver loses the second image without an error; an "overwrite" receiver replaces a clinical image.
- **Invalid UIDs.** A component with a leading zero, a trailing dot, or more than 64 characters. Strict receivers reject the object, lenient ones accept it, and the failure shows up only at the next system.
- **UIDs treated as meaningful.** Code extracts a "date" or "device" from UID digits and breaks on the first object from another vendor.
- **De-identified copies that still link.** A teaching file keeps the original UIDs, so anyone with access to the source PACS can look up the real patient.
- **Series Number used as identity.** Two series both numbered 1 (from two machines, or after a restart) overwrite each other in code that keyed on the number.

## Evidence

You understand this chapter when you can take a study in a viewer and say, for every image, which UID would change and which would stay the same if the technologist added one more image, sent the study twice, or exported a de-identified copy, and when you can show your receiver's actual behavior for a duplicate SOP Instance UID with different content.

## Workbook

1. Why does the Modality Worklist path produce fewer "two studies for one exam" problems than manual patient entry?
2. Your ingest receives an object whose SOP Instance UID it already holds, but whose bytes differ. What should it do, and what should it record?
3. Which of these may an application mint itself: a SOP Class UID, a Study Instance UID for a study it creates, a Transfer Syntax UID? Why?
4. What is wrong with `1.2.840.10008.05.1`, and what would a strict receiver do with it?
5. You convert a received DICOM cine into an MP4 for the browser. Does the MP4 get the original's SOP Instance UID? How do you keep the link between them?

## Answers

1. A worklist entry can carry the Study Instance UID the order system chose for the requested procedure (PS3.3's Requested Procedure Module includes it), and the machine uses it for the images. The order, the images and the report then agree on one study from the start. With manual entry the machine mints its own Study UID, and only a correctly typed accession number can link it back to the order ("Who mints them").
2. Treat it as a conflict, not a duplicate. Store nothing silently: keep the first copy (or, by a deliberate policy, the new one), flag the difference for a person to review, and record both versions' checksums, the time and the sender. The lab shows that a receiver's default can quietly drop the second version, which is exactly the outcome you want to make visible ("UIDs as keys in an application").
3. Only the Study Instance UID, and only for a study the application itself creates. SOP Class and Transfer Syntax UIDs are fixed by the standard under `1.2.840.10008` and name kinds of things, so you use them and never invent them. Instance-level UIDs are minted by whoever creates the object, under a registered root or the `2.25` UUID form ("Two kinds of UID").
4. The component `05` has a leading zero, which PS3.5 §9.1 forbids (a component may start with `0` only if it is exactly `0`). It also sits under DICOM's own root, where nobody may create UIDs. A strict receiver rejects the object; a lenient one accepts it, and the problem appears at the next, stricter system.
5. No. The MP4 is a different object, a derived rendition, so it must not claim the original's identity. Store it with its own identifier and a reference to the source's SOP Instance UID, so the original stays the record and you can always regenerate the rendition from it ("Never mint a UID in place of the sender's"; Chapter 12).

<p class="sources">Sources: DICOM PS3.5 Chapter 9 (UID structure, org root and suffix), §9.1 (encoding rules: digits and dots, no leading zeros, 64 characters, NULL padding), Annex B.2 (UUID-derived UIDs under 2.25); PS3.3 (Patient, Study and Series identification attributes); PS3.6 (UID registry: SOP classes and transfer syntaxes). Orthanc behavior for repeated SOP Instance UIDs observed with orthancteam/orthanc:24.10.1 at its default configuration.</p>
