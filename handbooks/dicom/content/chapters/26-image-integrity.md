---
number: 26
title: Image and data integrity
objective: Prove that what you store and show is what the machine sent: tell lossless from lossy, hash at the right points, keep calibration and identifiers intact, and reconcile what was sent against what was stored.
status: draft
---

## At the machine

A vascular measurement is only as good as the image under it. When a technologist places calipers on a spectral Doppler trace, the machine converts pixel positions into velocities using calibration it stored alongside the image. When a physician later re-measures on a workstation, the workstation uses that same calibration. If an image is recompressed carelessly, resized, or stripped of its calibration on the way, it still *looks* like the same image. The numbers taken from it are not the same.

Integrity is the property nobody notices until it fails, and when it fails it fails quietly: a slightly softer image, a velocity scale that no longer lines up, a clip missing a few frames. This chapter is about making integrity something you can prove rather than assume.

## On the wire

### Three things that must survive

<div class="pairs">
<div><span>Pixels</span><p>The pixel values the machine produced, or a change to them that is deliberate, recorded in the object, and visible to the reader.</p></div>
<div><span>Meaning</span><p>The attributes that give pixels their meaning: calibration regions, frame timing, photometric interpretation, burned-in annotation flags.</p></div>
<div><span>Identity</span><p>Study, Series and SOP Instance UIDs, and the patient and order identifiers: Patient ID, Accession Number.</p></div>
</div>

Each can be damaged at a different point: by compression, by a conversion for display, by a gateway rule that "fixes" tags, by a de-identification step applied in the wrong place (Chapter 18).

### Lossless and lossy

Chapter 6 introduced transfer syntaxes. For integrity, the question about each one is simple: does decoding give back exactly the pixel values that were encoded?

| Transfer syntax | UID | Pixel values preserved exactly? |
|---|---|---|
| Explicit VR Little Endian (uncompressed) | 1.2.840.10008.1.2.1 | Yes |
| RLE Lossless | 1.2.840.10008.1.2.5 | Yes |
| JPEG Lossless, Non-Hierarchical, SV1 | 1.2.840.10008.1.2.4.70 | Yes |
| JPEG-LS Lossless Image Compression | 1.2.840.10008.1.2.4.80 | Yes |
| JPEG 2000 Image Compression (Lossless Only) | 1.2.840.10008.1.2.4.90 | Yes |
| JPEG Baseline (Process 1) | 1.2.840.10008.1.2.4.50 | No |
| JPEG-LS Lossy (Near-Lossless) Image Compression | 1.2.840.10008.1.2.4.81 | No |
| JPEG 2000 Image Compression | 1.2.840.10008.1.2.4.91 | Not guaranteed (lossy or lossless) |

Ultrasound machines often send JPEG Baseline. That is a clinical and departmental choice, made when the machine was configured, and it is not yours to undo. What matters for a receiver is two rules:

1. **Never make it worse silently.** If you store what you received, in the encoding you received it, you have added no loss. If you transcode, transcode only losslessly, or record the loss.
2. **Keep the record of loss.** The General Image module carries **Lossy Image Compression (0028,2110)**: `00` means the image has not been through lossy compression, `01` means it has. Once set to `01` it must never be reset. **Lossy Image Compression Ratio (0028,2112)** and **Lossy Image Compression Method (0028,2114)** record how much and how, and can hold several values in order if the image was compressed more than once. A system that recompresses lossily and leaves `00` in place is lying to every reader downstream.

### Hash at the right points

A hash is a short fingerprint of some bytes: change one byte and the fingerprint changes. For DICOM there are two useful things to hash, and they answer different questions.

<div class="pairs">
<div><span>Whole object</span><p>Hash of the exact bytes received (the Part 10 file or the STOW part). Answers: are the bytes I return today the bytes I received? Any change, even a harmless re-encoding, changes it.</p></div>
<div><span>Decoded pixels</span><p>Hash of the pixel values after decoding. Answers: would a viewer show the same picture? A lossless re-encoding keeps it; any lossy step changes it.</p></div>
</div>

Record the whole-object hash at ingest, before anything else touches the object, and store it next to the object's database row. Check it again whenever the object is read back for a reader or an export. If it ever differs, something modified the stored original, and that should be impossible by design, so it is an incident, not a warning.

Use the decoded-pixel hash when an object is legitimately transformed: when a gateway transcodes, or when you migrate storage formats. Equal pixel hashes before and after prove the transformation was lossless.

### Meaning: calibration and timing must travel with the pixels

Ultrasound images carry their physical meaning in attributes, not in the picture:

- The **Sequence of Ultrasound Regions (0018,6011)** (Chapter 12) describes each region of the image, a B-mode area or a spectral Doppler strip, with its physical units and scale. Measurements depend on it.
- **Frame Time (0018,1063)** and related timing attributes give a cine clip its real speed. A clip played at the wrong rate is a different clip, clinically.
- **Burned In Annotation (0028,0301)** says whether the pixels themselves contain identifying text, which matters when images leave the system (Chapter 18).

A useful integrity test compares these attributes as sent and as stored, element by element. They should be identical. If a pipeline step ever needs to change one, that is a design review, not a code change.

### Renditions are never the record

Browsers can't display most DICOM directly, so systems generate **renditions**: PNG for stills, MP4 for cine. Renditions are copies made for viewing. They can be regenerated at any time, and they can be lossy, because nobody measures on them. That last part is a rule you have to enforce in the design:

- The stored DICOM original is the record. Renditions are derived from it and point back to it.
- Measurement tools work from the original and its calibration, never from a rendition's pixels.
- A rendition can be deleted and rebuilt without losing anything. If deleting one would lose information, it has become a record, and the design has gone wrong.

### Identity: preserve, don't repair

UIDs and patient identifiers arrive set by the machine. Receivers are tempted to "fix" them: trim, reformat, regenerate a UID that looks odd. Don't. A regenerated SOP Instance UID breaks deduplication and reconciliation (Chapter 11), and a reformatted Patient ID can break matching with the order. If an identifier is wrong, the right path is a visible reconciliation (the hold queue, Chapter 22, or the facility's own patient-update workflow), recorded in the audit trail, not a silent rewrite in a pipeline.

### Reconciliation: sent versus stored versus committed

Hashes prove that what you have is unchanged. They can't prove you have everything. For that you reconcile lists of SOP Instance UIDs, per study:

- **Sent:** what the machine says it sent. Sources include the machine's own logs, the Referenced SOP Sequence in its Storage Commitment request (Chapter 9), and the image references in its MPPS completion (Chapter 8).
- **Stored:** what your database holds for that study, after ingest.
- **Committed:** what you confirmed in a Storage Commitment result.

Any instance in *sent* but not *stored* is lost. Any instance in *stored* but not *sent* is unexpected: a wrong study, a list from the wrong machine, or a bug. Any instance you *committed* but cannot retrieve is the worst case, because the machine may already have deleted its copy.

<figure class="diagram">
<svg viewBox="0 0 720 250" role="img" aria-label="Integrity checkpoints along the pipeline: UID lists at the machine and gateway, a hash at ingest, a hash check at retrieval, and renditions as a derived side branch.">
<defs><marker id="ch26-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="40" width="120" height="56" rx="4" class="box"/>
<text x="70" y="73" text-anchor="middle">Machine</text>
<rect x="160" y="40" width="120" height="56" rx="4" class="box"/>
<text x="220" y="73" text-anchor="middle">Gateway</text>
<rect x="310" y="40" width="120" height="56" rx="4" class="box"/>
<text x="370" y="73" text-anchor="middle">Ingest</text>
<rect x="460" y="40" width="120" height="56" rx="4" class="box accent"/>
<text x="520" y="66" text-anchor="middle">Stored original</text>
<text x="520" y="84" text-anchor="middle" class="small muted">the record</text>
<rect x="610" y="40" width="100" height="56" rx="4" class="box"/>
<text x="660" y="73" text-anchor="middle">Reader</text>
<line x1="130" y1="68" x2="158" y2="68" marker-end="url(#ch26-arrow)"/>
<line x1="280" y1="68" x2="308" y2="68" marker-end="url(#ch26-arrow)"/>
<line x1="430" y1="68" x2="458" y2="68" marker-end="url(#ch26-arrow)"/>
<line x1="580" y1="68" x2="608" y2="68" marker-end="url(#ch26-arrow)"/>
<text x="70" y="124" text-anchor="middle" class="small">1. UIDs sent</text>
<text x="220" y="124" text-anchor="middle" class="small">2. UIDs received</text>
<text x="370" y="124" text-anchor="middle" class="small">3. hash recorded</text>
<text x="520" y="124" text-anchor="middle" class="small">4. UIDs stored</text>
<text x="660" y="124" text-anchor="middle" class="small">5. hash checked</text>
<rect x="460" y="170" width="120" height="50" rx="4" class="box dashed"/>
<text x="520" y="192" text-anchor="middle" class="small">PNG / MP4</text>
<text x="520" y="208" text-anchor="middle" class="small muted">rendition, rebuildable</text>
<line x1="520" y1="96" x2="520" y2="168" marker-end="url(#ch26-arrow)" class="dashed"/>
<text x="250" y="200" text-anchor="middle" class="small muted">reconcile 1 = 2 = 4 per study; 3 = 5 per object</text>
</svg>
<figcaption>Figure 26.1 — Integrity checkpoints: UID lists prove nothing is missing, hashes prove nothing changed, and renditions sit off to the side.</figcaption>
</figure>

## Lab

**Prove a lossless re-encode, catch a lossy change, and reconcile two lists.** Synthetic data only. `pip install pydicom==3.0.1 numpy==2.1.3`. Create `synthetic_us.dcm` with the `make_synthetic.py` script from Chapter 25's Lab.

1. Hash the decoded pixels, re-encode with RLE Lossless (pydicom 3 can encode RLE without extra packages), and compare. Then simulate a lossy step by quantizing the pixel values; it stands in for any lossy codec:

```python
# integrity.py
import hashlib
import numpy as np
import pydicom
from pydicom.uid import RLELossless

def pixel_hash(ds):
    """SHA-256 of the decoded pixel values: what a viewer would actually show."""
    return hashlib.sha256(ds.pixel_array.tobytes()).hexdigest()

original = pydicom.dcmread("synthetic_us.dcm")
h0 = pixel_hash(original)
print("original      ", original.file_meta.TransferSyntaxUID.name, h0[:16])

# 1. Lossless re-encode: the bytes on disk change, the pixel values must not.
rle = pydicom.dcmread("synthetic_us.dcm")
rle.compress(RLELossless)
rle.save_as("synthetic_us_rle.dcm")
rle = pydicom.dcmread("synthetic_us_rle.dcm")
h1 = pixel_hash(rle)
print("RLE lossless  ", rle.file_meta.TransferSyntaxUID.name, h1[:16], "same" if h1 == h0 else "CHANGED")

# 2. Simulated lossy step: quantize to 32 grey levels.
lossy = pydicom.dcmread("synthetic_us.dcm")
arr = (lossy.pixel_array // 8) * 8
lossy.PixelData = arr.astype(np.uint8).tobytes()
h2 = pixel_hash(lossy)
diff = np.abs(arr.astype(int) - original.pixel_array.astype(int))
print("quantized     ", "(simulated lossy)", h2[:16], "same" if h2 == h0 else "CHANGED",
      f"max diff {diff.max()}, pixels changed {np.count_nonzero(diff)}")
```

Expect output like this (your hashes will differ):

```text
original       Explicit VR Little Endian 067eb2f808eb78f7
RLE lossless   RLE Lossless 067eb2f808eb78f7 same
quantized      (simulated lossy) 64ae9f1a14f39848 CHANGED max diff 7, pixels changed 72654
```

Now compare the file sizes and the whole-file hashes (`shasum -a 256 synthetic_us.dcm synthetic_us_rle.dcm`): different bytes, same picture. That is the difference between the two kinds of hash.

2. Reconcile what was "sent" with what was "stored":

```python
# reconcile.py: compare the SOP Instance UIDs a machine sent with what the receiver stored.
import sys

def load(path):
    with open(path) as f:
        return {line.strip() for line in f if line.strip()}

sent, stored = load(sys.argv[1]), load(sys.argv[2])
missing = sorted(sent - stored)      # sent but never stored: lost
unexpected = sorted(stored - sent)   # stored but not in the sent list

print(f"sent {len(sent)}  stored {len(stored)}  matched {len(sent & stored)}")
for uid in missing:
    print("MISSING   ", uid)
for uid in unexpected:
    print("UNEXPECTED", uid)
sys.exit(1 if missing or unexpected else 0)
```

```bash
printf '1.2.826.0.1.3680043.8.498.1\n1.2.826.0.1.3680043.8.498.2\n1.2.826.0.1.3680043.8.498.3\n' > sent.txt
printf '1.2.826.0.1.3680043.8.498.1\n1.2.826.0.1.3680043.8.498.3\n1.2.826.0.1.3680043.8.498.9\n' > stored.txt
python reconcile.py sent.txt stored.txt; echo "exit $?"
```

```text
sent 3  stored 3  matched 2
MISSING    1.2.826.0.1.3680043.8.498.2
UNEXPECTED 1.2.826.0.1.3680043.8.498.9
exit 1
```

Notice the counts match (3 and 3) while the study is wrong in two ways. Counting is not reconciling; compare identities.

## In Lumen

Lumen's Media service already treats its database row as the source of truth for each stored file, with the object itself in S3-compatible storage. The planned DICOM ingest (Chapter 21) builds the integrity rules on that:

- The original object is stored as received, in the encoding received, and is never modified afterwards.
- A whole-object hash is recorded on the row at ingest and checked when the object is read back.
- Browser renditions (PNG for stills, MP4 for cine) are generated from the original, can be rebuilt at any time, and are never used for measurements.
- A technologist's snip for the Final Report is already a separate, labelled image that records which source image it came from and where it was cut; it is a new derived image, and the source is untouched.
- SOP Instance UIDs are kept exactly as received; they are the key for deduplication and for reconciliation reports.

Everything about receiving DICOM from machines is planned design; today images arrive by browser upload.

## How it fails

- **Silent lossy transcoding.** A gateway set to "compress to save space" turns lossless images lossy and leaves Lossy Image Compression at `00`.
- **The rendition becomes the record.** The originals are deleted to save storage "because we have the PNGs," and calibration goes with them.
- **Helpful tag repair.** A pipeline step regenerates UIDs it finds malformed, and reconciliation and deduplication both break.
- **Counts instead of identities.** "We received 42 and stored 42" while one is missing and one belongs to another study.
- **Hashing too late.** The hash is computed after a processing step, so it proves only that the processed object hasn't changed since.

## Evidence

You understand this chapter when, for one study, you can show the UID lists from at least two checkpoints reconciling exactly, the ingest hash matching the hash at retrieval for every instance, the calibration attributes identical as sent and as stored, and the Lossy Image Compression value consistent with the transfer syntax history.

## Workbook

1. Why does a whole-object hash change after an RLE Lossless re-encode while a decoded-pixel hash does not? Which one would you record at ingest, and why?
2. A gateway transcodes JPEG Baseline images to JPEG 2000 to save space. What must happen to Lossy Image Compression (0028,2110), and why can't it go back to `00`?
3. Why must measurements never be taken from a PNG or MP4 rendition?
4. In the Lab's reconciliation, sent and stored counts were equal. Why was the study still wrong?
5. Which reconciliation failure is most dangerous when Storage Commitment is in use, and why?

## Answers

1. A whole-object hash covers the exact bytes, and re-encoding changes the bytes even when the picture is identical. A decoded-pixel hash covers the pixel values a viewer shows, which lossless encoding preserves. Record the whole-object hash at ingest, because the stored original should never change at all, so any difference later is an incident. Keep the decoded-pixel hash for proving that a deliberate transformation was lossless. See "Hash at the right points" and Lab step 1.
2. It stays `01`, because the images were already lossy from JPEG Baseline. If the JPEG 2000 step is lossy too, the ratio and method attributes should gain a second value in order. The standard also treats a lossily recompressed image as a new, derived image that gets its own SOP Instance UID. It says once the attribute is `01` it shall not be reset, because no later step can restore the information the lossy compression discarded. Resetting it would tell every downstream reader the pixels are original when they are not. See "Lossless and lossy".
3. Renditions are made for viewing. They may be lossy, resized or re-timed, and they don't carry the Sequence of Ultrasound Regions that turns pixel positions into physical units. A velocity measured on one could be wrong while looking right. The DICOM original with its calibration is the record. See "Renditions are never the record" and "Meaning".
4. One sent instance was missing and one unexpected instance was stored, so the totals still matched. Only comparing the sets of SOP Instance UIDs reveals both problems. See Lab step 2 and "Reconciliation".
5. An instance you confirmed as committed but cannot retrieve. A machine that receives a successful commitment may delete its local copy, so that instance may now exist nowhere. That is why commitment must only be sent after the object is durably stored and checked. See "Reconciliation" and Chapter 9.

<p class="sources">Sources: DICOM PS3.3 C.7.6.1 and C.7.6.1.1.5 (General Image Module: Lossy Image Compression (0028,2110), Lossy Image Compression Ratio (0028,2112), Lossy Image Compression Method (0028,2114), Burned In Annotation (0028,0301)); PS3.3 C.8.5.5 (US Region Calibration Module, Sequence of Ultrasound Regions (0018,6011)); PS3.5 §8.2 and §10 (native and encapsulated pixel data, transfer syntaxes); PS3.6 Annex A (transfer syntax UIDs); PS3.4 Annex J (Storage Commitment). pydicom 3.0.1 documentation (Dataset.compress, RLE Lossless encoding).</p>
