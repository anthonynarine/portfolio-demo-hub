---
number: 6
title: SOP classes and transfer syntaxes: agreeing what and how
objective: Name the SOP class and transfer syntax of any DICOM object, predict which presentation contexts a sender will propose and a receiver will accept, and know when converting between encodings changes the image.
status: draft
---

## At the machine

On many ultrasound systems, the setup screen for a storage destination has a few options that rarely get touched after installation: *compression* (none, lossless, lossy at some quality), *send cine as multi-frame*, *send structured report*, sometimes *color: RGB or YBR*. Change one, and the archive may start refusing loops, or the reading physician may notice that the images look a little softer than they did last month.

Those options decide two things for every object the machine sends: **what kind of object** it is (a single ultrasound frame, a multi-frame cine loop, a structured report of measurements) and **how its bytes are encoded** (uncompressed, compressed without loss, compressed with loss). DICOM calls the first a **SOP class** and the second a **transfer syntax**. Chapter 5 showed that each presentation context pairs exactly these two. This chapter explains what they are and who decides.

## On the wire

### A SOP class is "this kind of object, with this service"

DICOM defines its objects in **Information Object Definitions (IODs)** in PS3.3: the Ultrasound Image IOD says which modules and attributes an ultrasound image carries. It defines its services in PS3.4 and PS3.7: store, find, move, verify. A **SOP class** (Service-Object Pair) joins one IOD with one service group; *Ultrasound Image Storage* means "storing an object that follows the Ultrasound Image IOD". Every object you send is a **SOP instance** of some SOP class, and carries the class's UID in **SOP Class UID (0008,0016)**.

The SOP classes this book meets most, all from the registry in PS3.6 Annex A:

| SOP class | UID | What it carries |
|---|---|---|
| Verification | `1.2.840.10008.1.1` | Nothing; it's C-ECHO's abstract syntax |
| Ultrasound Image Storage | `1.2.840.10008.5.1.4.1.1.6.1` | One ultrasound frame (a still) |
| Ultrasound Multi-frame Image Storage | `1.2.840.10008.5.1.4.1.1.3.1` | A sequence of frames (a cine loop) |
| Secondary Capture Image Storage | `1.2.840.10008.5.1.4.1.1.7` | A captured screen or converted picture with no acquisition details |
| Enhanced SR Storage | `1.2.840.10008.5.1.4.1.1.88.22` | A structured report: coded findings and numeric measurements |
| Comprehensive SR Storage | `1.2.840.10008.5.1.4.1.1.88.33` | The same, with fewer restrictions on how the report's items may refer to each other |

The difference between the first two ultrasound classes matters: a machine that sends cine loops proposes Ultrasound Multi-frame Image Storage as well as Ultrasound Image Storage. A receiver that accepts only the single-frame class takes the stills and refuses every loop. Chapter 12 covers what these objects contain, and Chapter 13 covers structured reports.

### A transfer syntax is "how the bytes are laid out"

A transfer syntax fixes three things (PS3.5 §10):

1. **Explicit or implicit VR.** Whether each data element carries its two-letter value representation (`PN`, `DA`, `UI`) on the wire, or the receiver must look it up in a dictionary. Chapter 10 shows the bytes.
2. **Byte order.** Little endian in practice. Big endian is retired.
3. **Pixel data: native or encapsulated.** Native means uncompressed pixels. Encapsulated means the pixel data is wrapped in a compressed format such as JPEG; every other element stays uncompressed.

| Transfer syntax | UID | Pixels |
|---|---|---|
| Implicit VR Little Endian (the default) | `1.2.840.10008.1.2` | native |
| Explicit VR Little Endian | `1.2.840.10008.1.2.1` | native |
| Deflated Explicit VR Little Endian | `1.2.840.10008.1.2.1.99` | whole data set deflated |
| JPEG Baseline (Process 1) | `1.2.840.10008.1.2.4.50` | lossy, 8-bit |
| JPEG Lossless, First-Order Prediction (SV1) | `1.2.840.10008.1.2.4.70` | lossless |
| JPEG-LS Lossless | `1.2.840.10008.1.2.4.80` | lossless |
| JPEG-LS Near-Lossless | `1.2.840.10008.1.2.4.81` | lossy, bounded error |
| JPEG 2000 (Lossless Only) | `1.2.840.10008.1.2.4.90` | lossless |
| JPEG 2000 | `1.2.840.10008.1.2.4.91` | lossless or lossy |
| RLE Lossless | `1.2.840.10008.1.2.5` | lossless |
| Explicit VR Big Endian | `1.2.840.10008.1.2.2` | retired |

There are also video transfer syntaxes (MPEG-2, H.264, HEVC) that some systems use for long cine; PS3.5 §8.2 lists them.

### The default, and the rule that comes with it

**Implicit VR Little Endian** is DICOM's default transfer syntax, and PS3.5 §10.1 makes two promises about it:

- Every implementation must support it. A requestor must **offer it in at least one presentation context for each abstract syntax** it proposes.
- A receiver that gets such a request **may not reject every context for a SOP class on the grounds that it supports none of the transfer syntaxes**. It can decline the default only if it accepts another context for the same class.

Both promises are waived in one important case: when the sender has the pixels **only in lossy compressed form**, or in a form too large to fit the default encoding. A machine that compressed its loops with JPEG Baseline when it acquired them cannot honestly offer them uncompressed, because decompressing would not restore the lost detail.

In practice the rule says: **the sender must be able to convert anything it sends into the default encoding.** That's why storescu always adds a second context with Implicit VR Little Endian, as you'll see in the lab.

### Who chooses, and when

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="The sender proposes the same SOP class in two presentation contexts with different transfer syntaxes; the receiver accepts one transfer syntax per context; the sender then sends each image on a context it can encode for.">
<defs><marker id="ch06-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="130" y="28" text-anchor="middle" class="small muted">Sender proposes</text>
<text x="590" y="28" text-anchor="middle" class="small muted">Receiver answers</text>
<rect x="20" y="40" width="220" height="110" rx="4" class="box"/>
<text x="130" y="64" text-anchor="middle">Context 1</text>
<text x="130" y="88" text-anchor="middle" class="small">US Multi-frame Image Storage</text>
<text x="130" y="110" text-anchor="middle" class="small">JPEG Baseline</text>
<text x="130" y="130" text-anchor="middle" class="small">JPEG 2000</text>
<rect x="20" y="180" width="220" height="110" rx="4" class="box"/>
<text x="130" y="204" text-anchor="middle">Context 3</text>
<text x="130" y="228" text-anchor="middle" class="small">US Multi-frame Image Storage</text>
<text x="130" y="250" text-anchor="middle" class="small">Explicit VR Little Endian</text>
<text x="130" y="270" text-anchor="middle" class="small">Implicit VR Little Endian</text>
<rect x="480" y="40" width="220" height="110" rx="4" class="box accent"/>
<text x="590" y="64" text-anchor="middle">Context 1: accepted</text>
<text x="590" y="94" text-anchor="middle" class="small">chosen: JPEG Baseline</text>
<text x="590" y="118" text-anchor="middle" class="small muted">(exactly one per context)</text>
<rect x="480" y="180" width="220" height="110" rx="4" class="box"/>
<text x="590" y="204" text-anchor="middle">Context 3: accepted</text>
<text x="590" y="234" text-anchor="middle" class="small">chosen: Explicit VR LE</text>
<line x1="240" y1="95" x2="480" y2="95" marker-end="url(#ch06-arrow)"/>
<text x="360" y="86" text-anchor="middle" class="small">offers a list</text>
<line x1="240" y1="235" x2="480" y2="235" marker-end="url(#ch06-arrow)"/>
<text x="360" y="226" text-anchor="middle" class="small">offers a list</text>
<text x="360" y="318" text-anchor="middle" class="small muted">Then, per image, the sender picks an accepted context it can encode for.</text>
</svg>
<figcaption>Figure 6.1 — The sender offers transfer syntaxes; the receiver picks one per presentation context; the sender then uses whichever accepted context matches the image it has.</figcaption>
</figure>

1. The **sender proposes**: for each SOP class, one or more contexts, each listing the transfer syntaxes it can produce.
2. The **receiver picks**: for each context it accepts, exactly **one** transfer syntax from the list.
3. The **sender sends**: for each object, it uses an accepted context for that SOP class and encodes the object in that context's transfer syntax, converting if necessary.

Step 3 is where trouble hides. If the object on disk is JPEG-compressed but the only accepted context is uncompressed, the sender has to decompress it first. If it has no decoder, the send fails. If the object is uncompressed and the accepted context is lossy JPEG, a sender that compresses on the fly has just changed the image.

### Transcoding, and the one-way door

Converting between transfer syntaxes is called **transcoding**. Between the uncompressed syntaxes it's lossless bookkeeping: the same pixels, laid out differently. Lossless compression and decompression also preserve every pixel. **Lossy compression is a one-way door.** PS3.3 §C.7.6.1.1.5 says that when an image is a lossy compressed version of another image, **Lossy Image Compression (0028,2110)** is set to `01`, Image Type becomes `DERIVED`, and the image gets a **new SOP Instance UID**: it is a different object now. Decompressing it later does not set the flag back, because the detail is gone.

For a reporting system this matters twice. Measurements made on a lossy copy may differ slightly from the original. And a system that deduplicates by SOP Instance UID will see the lossy copy as a second image.

### Reading a conformance statement

Every DICOM product publishes a **DICOM Conformance Statement** (structure in PS3.2 Annex N). Before connecting a new machine or receiver, this is the document to read, not the brochure. The parts that answer this chapter's questions:

- **Supported transfer syntaxes** (a summary table in the overview).
- **SOP classes per AE, with roles** (SCU, SCP, or both).
- **Association parameters**: maximum PDU size, number of simultaneous associations.
- **Transfer syntax selection**: the order in which the product prefers transfer syntaxes when it accepts, and which ones it proposes when it sends.
- **Transcoding**: whether and how it converts.

Put the sender's and receiver's statements side by side and you can predict which contexts will be accepted before anyone plugs in a cable.

## Lab

You'll make a synthetic ultrasound object, read its SOP class and transfer syntax, then send it to Orthanc several ways and watch the negotiation. Start Orthanc as in Chapter 4, step 2 (permissive, called-title check on).

**1. Make a synthetic object.** Install pinned packages in a fresh environment:

```bash
python3 -m venv dicom-lab-venv
dicom-lab-venv/bin/pip install pydicom==3.0.1 numpy==2.1.3
```

Save this as `make_synthetic_us.py`:

```python
"""Write one synthetic ultrasound image (no real patient) as a DICOM file."""
import sys

import numpy as np
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, UltrasoundImageStorage, generate_uid

out = sys.argv[1] if len(sys.argv) > 1 else "synthetic_us.dcm"

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
ds.SeriesNumber = 1
ds.InstanceNumber = 1

# A 64 x 64 grey gradient stands in for the image.
pixels = np.tile(np.arange(64, dtype=np.uint8) * 4, (64, 1))
ds.Rows, ds.Columns = pixels.shape
ds.SamplesPerPixel = 1
ds.PhotometricInterpretation = "MONOCHROME2"
ds.BitsAllocated = 8
ds.BitsStored = 8
ds.HighBit = 7
ds.PixelRepresentation = 0
ds.PixelData = pixels.tobytes()

ds.save_as(out, enforce_file_format=True)
print("wrote", out)
```

```bash
dicom-lab-venv/bin/python make_synthetic_us.py
```

This is a minimal object: enough for the network to carry and a viewer to show, not every attribute the Ultrasound Image IOD requires. Chapters 10 and 12 fill in the rest.

**2. Read its "what" and "how".**

```bash
dcmdump synthetic_us.dcm | grep -E "TransferSyntaxUID|SOPClassUID"
```

```text
(0002,0002) UI =UltrasoundImageStorage                  #  28, 1 MediaStorageSOPClassUID
(0002,0010) UI =LittleEndianExplicit                    #  20, 1 TransferSyntaxUID
(0008,0016) UI =UltrasoundImageStorage                  #  28, 1 SOPClassUID
```

dcmdump prints well-known UIDs by name after `=`; add `-Un` to see the numbers.

**3. Send it and watch the proposal.** `-R` proposes only the SOP class this file needs; `+v` prints the presentation contexts:

```bash
storescu -v +v -R -aet US_ROOM3 -aec LUMEN_LAB localhost 4242 synthetic_us.dcm
```

```text
I:   Context ID:        1 (Proposed)
I:     Abstract Syntax: =UltrasoundImageStorage
I:       =LittleEndianExplicit
I:   Context ID:        3 (Proposed)
I:     Abstract Syntax: =UltrasoundImageStorage
I:       =BigEndianExplicit
I:       =LittleEndianImplicit
...
I:   Context ID:        1 (Accepted)
I:     Accepted Transfer Syntax: =LittleEndianExplicit
I:   Context ID:        3 (Accepted)
I:     Accepted Transfer Syntax: =BigEndianExplicit
I: Received Store Response (Success)
```

Two contexts for one SOP class, and the second one carries the default, Implicit VR Little Endian, exactly as PS3.5 §10.1 requires. Orthanc picked one transfer syntax per context. (It picked the retired Big Endian for context 3, which it still supports; storescu used context 1.)

**4. Compress it losslessly and send it compressed.** DCMTK's `dcmcjpeg +e1` encodes with JPEG Lossless SV1:

```bash
dcmcjpeg +e1 synthetic_us.dcm synthetic_us_jpegll.dcm
storescu -v +v -R -xs -aet US_ROOM3 -aec LUMEN_LAB localhost 4242 synthetic_us_jpegll.dcm
```

`-xs` proposes JPEG Lossless first, with an uncompressed context as the fallback. Orthanc accepts `JPEGLossless:Non-hierarchical-1stOrderPrediction` for context 1, and storescu sends the file as it is.

**5. Watch a sender fail to convert.** Send the same compressed file proposing only uncompressed syntaxes:

```bash
storescu -v -R -aet US_ROOM3 -aec LUMEN_LAB localhost 4242 synthetic_us_jpegll.dcm
```

```text
I: Converting transfer syntax: JPEG Lossless, Non-hierarchical, 1st Order Prediction -> Little Endian Explicit
I: Sending Store Request (MsgID 1, US)
E: Store Failed, file: synthetic_us_jpegll.dcm:
E: 0006:020e DIMSE Failed to send message
```

The negotiation succeeded, but storescu, as invoked here, has no JPEG decoder loaded, so it cannot produce the uncompressed encoding it agreed to send. This is the sender failing the "must be able to convert to the default" rule, and it produces a confusing error at the moment of sending, not at negotiation.

**6. Walk through the one-way door.** Compress with lossy JPEG Baseline, decompress again, and compare:

```bash
dcmcjpeg +eb synthetic_us.dcm synthetic_us_lossy.dcm
dcmdjpeg synthetic_us_lossy.dcm synthetic_us_back.dcm
for f in synthetic_us.dcm synthetic_us_lossy.dcm synthetic_us_back.dcm; do
  echo "== $f"; dcmdump +P TransferSyntaxUID +P LossyImageCompression +P SOPInstanceUID $f
done
```

The original has no Lossy Image Compression element. The lossy copy has `(0028,2110) CS [01]` and a **different SOP Instance UID**. The decompressed copy is uncompressed again, but still says `01` and keeps the lossy copy's UID: the file is honest about its history.

## In Lumen

Lumen already stores DICOM files that users upload through the browser, and it has to show them in a browser, which cannot display most of these transfer syntaxes directly. The general approach for a web system is to keep the original object exactly as received, and to make **separate renditions** for display (a PNG for a still, a video for a loop), never overwriting or re-encoding the original. The original is the record; the renditions are conveniences that can be regenerated.

For the planned gateway, the decisions in this chapter belong in its configuration: which SOP classes it accepts (stills, multi-frame, structured reports), and which transfer syntaxes. A reasonable default is to accept whatever the machine sends without transcoding, so that the image Lumen stores is bit-for-bit the image the machine produced, including its lossy-compression flag if it has one.

## How it fails

- **Stills arrive, loops don't.** The receiver accepts Ultrasound Image Storage but not Ultrasound Multi-frame Image Storage. Check the SOP classes in the receiver's conformance statement.
- **Accepted, then failed on send.** The negotiated transfer syntax needs a conversion the sender cannot do (lab step 5). The log shows a successful association followed by a store failure.
- **The softer image.** A gateway or archive transcodes to lossy JPEG to save space, and measurements made on the copy differ slightly. Look for `(0028,2110) = 01` and `DERIVED` in Image Type.
- **Duplicates after compression.** A lossy copy carries a new SOP Instance UID, so it looks like a second image of the same study.
- **The receiver that refuses the default.** A receiver that accepts only one compressed syntax violates PS3.5 §10.1; machines that send uncompressed data get "no acceptable presentation contexts" (Chapter 5, lab step 4).

## Evidence

You understand this chapter when you can open any DICOM object and name its SOP class and transfer syntax; predict, from two conformance statements, which presentation contexts will be accepted; and prove, from the object's own attributes, whether its pixels have ever been lossy compressed.

## Workbook

1. A machine sends stills and cine loops to a new receiver. Stills arrive; loops are refused. Name the two SOP classes involved and the most likely cause.
2. Why does storescu propose a second presentation context containing Implicit VR Little Endian, even when the file is Explicit VR Little Endian?
3. A gateway receives an uncompressed image and stores a JPEG Baseline copy to save space. What three things change in the stored object, according to PS3.3?
4. When is a sender allowed not to offer the default transfer syntax?
5. Why should a reporting system keep the object exactly as received and generate browser renditions separately?

## Answers

1. Ultrasound Image Storage (`1.2.840.10008.5.1.4.1.1.6.1`) for stills and Ultrasound Multi-frame Image Storage (`1.2.840.10008.5.1.4.1.1.3.1`) for loops. Most likely the receiver accepts only the single-frame class, so the multi-frame contexts are rejected. See the SOP class table and "How it fails".
2. PS3.5 §10.1 requires a requestor to offer the default transfer syntax in at least one presentation context for every abstract syntax it proposes, so the receiver always has an encoding it is obliged to support. Lab step 3 shows the second context. See "The default, and the rule that comes with it".
3. Lossy Image Compression (0028,2110) is set to `01`, Image Type value 1 becomes `DERIVED`, and the object gets a new SOP Instance UID because it is a different object. PS3.3 §C.7.6.1.1.5 defines this; lab step 6 shows the flag and the new UID.
4. When it has the pixel data only in lossy compressed form, or in a form too large to be encoded in the default transfer syntax (and no pixel-data-reference transfer syntax is offered). Decompressing a lossy image would not restore the original, so the obligation is waived. See "The default, and the rule that comes with it".
5. The original is the clinical record; any re-encoding risks changing pixels (lossy) or identity (new UIDs), and browsers cannot display most DICOM encodings anyway. Renditions can always be regenerated from the original, but an overwritten original cannot be recovered. See "In Lumen" and "Transcoding, and the one-way door".

<p class="sources">Sources: DICOM PS3.6 Annex A, Table A-1 (SOP class, transfer syntax and application context UIDs); PS3.5 §8.2 (native and encapsulated pixel data), §10 and §10.1 (transfer syntaxes; the default transfer syntax and its offer/accept rules, including the lossy-only waiver); PS3.3 §C.7.6.1.1.5 (Lossy Image Compression, DERIVED, new SOP Instance UID); PS3.4 §3.9 (SOP instance, SCU, SCP); PS3.1 (definition of SOP class); PS3.2 §6 and Annex N (Conformance Statement contents); PS3.10 §7.1 (file meta information in Explicit VR Little Endian). pydicom 3.0.1 documentation (FileMetaDataset, generate_uid, save_as). Lab output captured with DCMTK 3.6.7 (storescu, dcmdump, dcmcjpeg, dcmdjpeg) against <code>orthancteam/orthanc:24.10.1</code>.</p>
