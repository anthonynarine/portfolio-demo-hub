---
number: 10
title: Tags, VRs, and the DICOM file
objective: Read a DICOM object byte by byte, know what every part of a data element means, and tell a Part 10 file from a bare data set.
status: draft
---

## At the machine

Open any ultrasound study in PACS and choose "show header" or "DICOM tags". A long list scrolls past: Patient's Name, Study Date, Accession Number, Rows, Columns, and hundreds of lines you have never needed. Most technologists see that screen once, during a troubleshooting call, when someone asks "what does the header say the accession number is?"

That list is not a report PACS wrote about the image. It *is* the image, minus the pixels. Everything the machine knew when it sent the study (who, when, which order, how the pixels are laid out, how big a pixel is in centimeters) travels inside the object as a list of data elements. Part III of this book is about that list. This chapter teaches you to read it at the level an application has to: bytes.

## On the wire

### A data set is a list of data elements

Chapter 1 called the header "a header of tags". The precise word is **data set**: an ordered list of **data elements**, sorted by tag. Each data element has four parts:

<div class="pairs">
<div><span>Tag</span><p>Two 16-bit numbers, group and element, written <code>(gggg,eeee)</code> in hex. <code>(0010,0010)</code> is Patient's Name.</p></div>
<div><span>VR</span><p>Value Representation: the data type, two upper-case letters such as <code>PN</code> or <code>UI</code>.</p></div>
<div><span>Length</span><p>How many bytes the value takes. Always an even number.</p></div>
<div><span>Value</span><p>The bytes themselves, interpreted according to the VR.</p></div>
</div>

The **data dictionary** in PS3.6 lists every standard tag with its name and VR. That is how a toolkit knows that `(0008,0060)` is Modality and holds a Code String. Your code should look up tags by keyword through a toolkit, not by memorizing hex.

### The value representations you will meet most

There are a few dozen VRs. A vascular imaging integration touches a handful again and again:

| VR | Name | What it holds | Limit (PS3.5 §6.2) |
|---|---|---|---|
| `PN` | Person Name | Caret-separated components: `TEST^PATIENT` | 64 characters per component group |
| `LO` | Long String | Free text, no backslash: Patient ID, Private Creator | 64 characters |
| `SH` | Short String | Short text: Accession Number | 16 characters |
| `CS` | Code String | Upper case, digits, space, underscore: `US`, `YES` | 16 bytes |
| `DA` | Date | `YYYYMMDD` | 8 bytes, fixed |
| `TM` | Time | `HHMMSS.FFFFFF`, trailing parts optional | 14 bytes |
| `UI` | Unique Identifier | Digits and dots (Chapter 11) | 64 bytes |
| `DS` / `IS` | Decimal / Integer String | Numbers written as text | 16 / 12 bytes |
| `US` | Unsigned Short | A 16-bit binary integer: Rows, Columns | 2 bytes, fixed |
| `SQ` | Sequence of Items | Nested data sets | See below |
| `OB` / `OW` | Other Byte / Other Word | Raw bytes or 16-bit words: pixel data | Up to 2³²−2 bytes |
| `UN` | Unknown | Bytes whose VR the sender didn't know | Any |

Two details from PS3.5 §6.2 cause real bugs. Values must have even length, so text VRs are padded with a trailing space and `UI` values with a trailing NULL byte. And text VRs use the backslash `\` to separate multiple values, so a backslash inside a Patient ID is not a character, it is a second value. Strip padding when you read; never strip meaning.

The Accession Number is an `SH`: 16 characters at most. If your order system issues longer accession numbers, they cannot survive the trip through the machine unchanged. That is worth knowing before you choose accession number as your matching key (Chapter 22).

### Explicit and implicit VR

The VR can be written into every data element, or left out and implied by the dictionary. That choice belongs to the **transfer syntax** (Chapter 6 introduced it as the "how" of an association):

- **Explicit VR Little Endian** (`1.2.840.10008.1.2.1`) writes the two VR letters into each element.
- **Implicit VR Little Endian** (`1.2.840.10008.1.2`), the DICOM default, leaves them out. The receiver must already know the VR of every tag from its dictionary.

Explicit VR comes in two layouts (PS3.5 §7.1.2). Most VRs (`AE`, `AS`, `AT`, `CS`, `DA`, `DS`, `DT`, `FL`, `FD`, `IS`, `LO`, `LT`, `PN`, `SH`, `SL`, `SS`, `ST`, `TM`, `UI`, `UL`, `US`) use a 2-byte length. All the others, including `OB`, `OW`, `SQ`, `UN` and `UT`, put two reserved zero bytes after the VR and then a 4-byte length, because their values can be enormous. Implicit VR always uses a 4-byte length.

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="The same Modality element encoded three ways: explicit VR with a 2-byte length, implicit VR with a 4-byte length, and the explicit VR layout with reserved bytes used by OB, OW, SQ and UN.">
<text x="20" y="28">Explicit VR, 2-byte length: Modality = "US"</text>
<rect x="20" y="40" width="110" height="44" rx="3" class="box"/>
<text x="75" y="60" text-anchor="middle">08 00 60 00</text>
<text x="75" y="76" text-anchor="middle" class="small muted">tag (0008,0060)</text>
<rect x="140" y="40" width="90" height="44" rx="3" class="box accent"/>
<text x="185" y="60" text-anchor="middle">43 53</text>
<text x="185" y="76" text-anchor="middle" class="small muted">VR "CS"</text>
<rect x="240" y="40" width="90" height="44" rx="3" class="box"/>
<text x="285" y="60" text-anchor="middle">02 00</text>
<text x="285" y="76" text-anchor="middle" class="small muted">length 2</text>
<rect x="340" y="40" width="90" height="44" rx="3" class="box"/>
<text x="385" y="60" text-anchor="middle">55 53</text>
<text x="385" y="76" text-anchor="middle" class="small muted">"US"</text>
<text x="20" y="128">Implicit VR, 4-byte length: the same element</text>
<rect x="20" y="140" width="110" height="44" rx="3" class="box"/>
<text x="75" y="160" text-anchor="middle">08 00 60 00</text>
<text x="75" y="176" text-anchor="middle" class="small muted">tag (0008,0060)</text>
<rect x="140" y="140" width="190" height="44" rx="3" class="box"/>
<text x="235" y="160" text-anchor="middle">02 00 00 00</text>
<text x="235" y="176" text-anchor="middle" class="small muted">length 2 (no VR)</text>
<rect x="340" y="140" width="90" height="44" rx="3" class="box"/>
<text x="385" y="160" text-anchor="middle">55 53</text>
<text x="385" y="176" text-anchor="middle" class="small muted">"US"</text>
<text x="20" y="228">Explicit VR, 4-byte length: OB, OW, SQ, UN, UT...</text>
<rect x="20" y="240" width="110" height="44" rx="3" class="box"/>
<text x="75" y="260" text-anchor="middle">gggg eeee</text>
<text x="75" y="276" text-anchor="middle" class="small muted">tag</text>
<rect x="140" y="240" width="90" height="44" rx="3" class="box accent"/>
<text x="185" y="260" text-anchor="middle">"OB"</text>
<text x="185" y="276" text-anchor="middle" class="small muted">VR</text>
<rect x="240" y="240" width="90" height="44" rx="3" class="box"/>
<text x="285" y="260" text-anchor="middle">00 00</text>
<text x="285" y="276" text-anchor="middle" class="small muted">reserved</text>
<rect x="340" y="240" width="110" height="44" rx="3" class="box"/>
<text x="395" y="260" text-anchor="middle">4 bytes</text>
<text x="395" y="276" text-anchor="middle" class="small muted">length</text>
<rect x="460" y="240" width="240" height="44" rx="3" class="box dashed"/>
<text x="580" y="267" text-anchor="middle">value (can be megabytes)</text>
</svg>
<figcaption>Figure 10.1 — One data element, three encodings. These are the real bytes from this chapter's lab, written little-endian, so group 0008 appears as <code>08 00</code>.</figcaption>
</figure>

Figure 10.1 shows why you never parse DICOM with your own byte reader unless you must: the same element is 10 bytes in one transfer syntax and 10 bytes laid out differently in another, and the reader has to know which before it can find the next tag.

### Sequences: data sets inside data sets

An `SQ` element holds a list of **items**, and each item is a complete nested data set. Ultrasound uses this constantly: the Sequence of Ultrasound Regions (Chapter 12) is one item per calibrated region, and a Structured Report (Chapter 13) is sequences nested many levels deep.

Items are framed by three special tags from PS3.5 §7.5: Item `(FFFE,E000)`, Item Delimitation Item `(FFFE,E00D)` and Sequence Delimitation Item `(FFFE,E0DD)`. A sequence or item can give its length in bytes, or say "undefined length" with the value `FFFFFFFF` and end with a delimitation item instead. Both are legal, both appear in real files, and your toolkit handles both. The lesson for application code is simpler: when you read a sequence, expect zero, one or many items, never "exactly one".

### Private tags

Vendors need to store things the standard has no tag for. PS3.5 §7.8 gives them **private data elements** in odd-numbered groups (not 0001, 0003, 0005, 0007 or FFFF).

A private group works by reservation. A **Private Creator** element at `(gggg,0010)`, a `LO` string naming the vendor's block, reserves the elements `(gggg,1000)` to `(gggg,10FF)`. The creator at `(gggg,0011)` reserves `(gggg,1100)`–`(gggg,11FF)`, and so on. So the same private tag number can mean completely different things from two vendors. You can only interpret a private element by first reading its creator string.

For an application, private tags mean two things. Never depend on them for anything that matters, such as matching or identity. And never assume they are free of patient data: Chapter 18 shows that de-identification has to deal with them too.

### The Part 10 file

Everything so far describes a data set. When a data set is saved to disk or uploaded through a browser, it is wrapped in the **DICOM File Format** of PS3.10 §7.1:

<figure class="diagram">
<svg viewBox="0 0 720 210" role="img" aria-label="A DICOM Part 10 file: a 128-byte preamble, the four bytes DICM, the File Meta Information group 0002 in Explicit VR Little Endian, then the data set in the transfer syntax named by (0002,0010).">
<defs><marker id="ch10-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="40" width="150" height="60" rx="3" class="box"/>
<text x="95" y="66" text-anchor="middle">Preamble</text>
<text x="95" y="84" text-anchor="middle" class="small muted">128 bytes</text>
<rect x="180" y="40" width="80" height="60" rx="3" class="box accent"/>
<text x="220" y="66" text-anchor="middle">"DICM"</text>
<text x="220" y="84" text-anchor="middle" class="small muted">4 bytes</text>
<rect x="270" y="40" width="190" height="60" rx="3" class="box"/>
<text x="365" y="66" text-anchor="middle">File Meta (0002,xxxx)</text>
<text x="365" y="84" text-anchor="middle" class="small muted">always Explicit VR LE</text>
<rect x="470" y="40" width="230" height="60" rx="3" class="box"/>
<text x="585" y="66" text-anchor="middle">Data set</text>
<text x="585" y="84" text-anchor="middle" class="small muted">in the file's transfer syntax</text>
<text x="20" y="28" class="small muted">byte 0</text>
<text x="180" y="28" class="small muted">byte 128</text>
<line x1="365" y1="100" x2="365" y2="140" class="dashed"/>
<line x1="365" y1="140" x2="585" y2="140" class="dashed"/>
<line x1="585" y1="140" x2="585" y2="104" class="dashed" marker-end="url(#ch10-arrow)"/>
<text x="475" y="170" text-anchor="middle" class="small">(0002,0010) Transfer Syntax UID says how to read this part</text>
</svg>
<figcaption>Figure 10.2 — The Part 10 file. The meta header is always readable the same way; it then tells you how to read the rest.</figcaption>
</figure>

- **Preamble**: 128 bytes for application use, usually all zeros. Never trust or execute its contents.
- **Prefix**: the four characters `DICM`. A file without them at byte 128 is not a Part 10 file. It may be a bare data set, which toolkits can sometimes still read by guessing.
- **File Meta Information**, group `0002`, always encoded in Explicit VR Little Endian, whatever the rest of the file uses. Its Type 1 elements are the Group Length `(0002,0000)`, the File Meta Information Version `(0002,0001)`, the **Media Storage SOP Class UID** `(0002,0002)` and **Media Storage SOP Instance UID** `(0002,0003)` (what the object is and which one), the **Transfer Syntax UID** `(0002,0010)`, and the Implementation Class UID `(0002,0012)` naming the software that wrote the file.
- **The data set**, in the transfer syntax `(0002,0010)` names.

Group `0002` exists only in files. When a machine sends an image with C-STORE, the data set goes over the association without a meta header: the transfer syntax was agreed during association negotiation (Chapter 5). A receiver that writes received objects to disk adds the meta header itself. That is why the meta header names the *writing* implementation, not the scanner.

## Lab

**Write a DICOM file and read its bytes.** Everything here is synthetic: the patient is `TEST^PATIENT`, and the file contains no pixel data.

```bash
python3 -m venv dicom-lab && source dicom-lab/bin/activate
pip install pydicom==3.0.1
```

Save this as `make_file.py`:

```python
# make_file.py: write one small, synthetic DICOM file (no patient data).
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, UltrasoundImageStorage, generate_uid

ds = Dataset()
ds.SOPClassUID = UltrasoundImageStorage
ds.SOPInstanceUID = generate_uid()
ds.StudyInstanceUID = generate_uid()
ds.SeriesInstanceUID = generate_uid()
ds.Modality = "US"
ds.PatientName = "TEST^PATIENT"
ds.PatientID = "DEMO-0001"
ds.AccessionNumber = "ACC-0001"
ds.StudyDate = "20261118"
ds.StudyTime = "093000"

# A private block: creator at (0009,0010) reserves (0009,1000)-(0009,10FF).
block = ds.private_block(0x0009, "HANDBOOK DEMO", create=True)
block.add_new(0x01, "LO", "a private note")

ds.file_meta = FileMetaDataset()
ds.file_meta.MediaStorageSOPClassUID = ds.SOPClassUID
ds.file_meta.MediaStorageSOPInstanceUID = ds.SOPInstanceUID
ds.file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

ds.save_as("demo.dcm", enforce_file_format=True)
print("wrote demo.dcm")
```

Run it, then look at the result three ways:

```bash
python make_file.py
pydicom show demo.dcm          # the data set, element by element
dcmdump demo.dcm               # the same, with DCMTK (brew install dcmtk)
xxd -l 220 demo.dcm            # the raw bytes
```

`pydicom show` prints the meta header first, then the data set:

```text
(0002,0000) File Meta Information Group Length  UL: 208
(0002,0001) File Meta Information Version       OB: b'\x00\x01'
(0002,0002) Media Storage SOP Class UID         UI: Ultrasound Image Storage
(0002,0010) Transfer Syntax UID                 UI: Explicit VR Little Endian
...
(0008,0060) Modality                            CS: 'US'
(0009,0010) Private Creator                     LO: 'HANDBOOK DEMO'
(0009,1001) Private tag data                    LO: 'a private note'
(0010,0010) Patient's Name                      PN: 'TEST^PATIENT'
```

In the hex view, find these landmarks:

```text
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000080: 4449 434d 0200 0000 554c 0400 d000 0000  DICM....UL......
00000090: 0200 0100 4f42 0000 0200 0000 0001 0200  ....OB..........
```

1. Bytes 0–127 are zeros: the preamble.
2. At byte 128 (`0x80`): `44 49 43 4d`, "DICM".
3. Right after it: `02 00 00 00` is tag `(0002,0000)`, then `55 4c` ("UL"), a 2-byte length `04 00`, and the value `d0 00 00 00` = 208, the length of the rest of the meta header.
4. Next: `(0002,0001)` with VR `4f 42` ("OB"), the two reserved bytes `00 00`, and a 4-byte length. That is the second layout in Figure 10.1, seen for real.

Now re-encode the same data set as Implicit VR and compare one element:

```python
# to_implicit.py: re-encode the same dataset as Implicit VR Little Endian.
import sys
from pydicom import dcmread
from pydicom.uid import ImplicitVRLittleEndian

ds = dcmread(sys.argv[1])
ds.file_meta.TransferSyntaxUID = ImplicitVRLittleEndian
ds.save_as(sys.argv[2], enforce_file_format=True)
print("wrote", sys.argv[2])
```

```bash
python to_implicit.py demo.dcm demo-implicit.dcm
xxd -p demo.dcm | tr -d '\n' | grep -o '08006000.\{12\}'
xxd -p demo-implicit.dcm | tr -d '\n' | grep -o '08006000.\{12\}'
```

You'll see `08006000435302005553` (explicit: tag `08006000`, "CS" `4353`, length `0200`, "US" `5553`) and `08006000020000005553` (implicit: tag, 4-byte length `02000000`, "US"). Same meaning, different bytes. The meta header at the top of both files is still Explicit VR, exactly as PS3.10 requires.

## In Lumen

Lumen already accepts DICOM files today: a technologist can drag a `.dcm` file into an exam's image pane, and the Media service stores the original bytes in object storage, with a database row as the source of truth.

The planned machine ingest (Part VI) adds a reader. When an object arrives from a facility's gateway, Lumen's ingest will parse the meta header and a small set of data elements (SOP Class and Instance UID, Study Instance UID, Accession Number, Modality), check them for shape (`SH` length, `UI` syntax, `CS` values), and keep the original object unchanged. It will not trust private tags for anything, and it will not copy header values into logs (the companion HIPAA handbook explains why).

## How it fails

- **Padding taken as data.** `"ACC-0001 "` with its trailing pad space doesn't equal `"ACC-0001"`. An accession match fails for no visible reason. Strip padding when you read.
- **Backslash surprises.** A text value containing `\` reads back as two values. A Patient ID becomes a list.
- **Too long to fit.** A 20-character accession number from the order system is cut or rejected by the machine, because `SH` holds 16.
- **Not a Part 10 file.** A "DICOM" file without `DICM` at byte 128 is a bare data set. Some tools guess its transfer syntax and some refuse it. Reject it clearly, or accept it deliberately, but don't let it fail silently.
- **Private data assumed meaningless.** A private tag carries a patient name or a free-text note into a teaching file or a log.
- **Hand-rolled parsing.** Your own byte reader handles Explicit VR but meets an Implicit VR object, or a sequence with undefined length, and reads garbage. Use a maintained toolkit.

## Evidence

You understand this chapter when you can take any `.dcm` file, find `DICM` in a hex dump, read the Transfer Syntax UID from the meta header, and decode one data element by hand, naming its tag, VR (or why there isn't one), length and value.

## Workbook

1. Why is the File Meta Information always Explicit VR Little Endian, even in a file whose data set is Implicit VR?
2. A machine sends an image by C-STORE. Where is its group 0002, and who writes it?
3. Two vendors both use tag `(0029,1010)`. How can your code tell whether the two values mean the same thing?
4. Your order system issues 18-character accession numbers. What happens to them on an ultrasound machine, and what would you change?
5. In the Implicit VR file from the lab, how does a reader know that `(0008,0060)` is a Code String?

## Answers

1. A reader has to be able to open any file before it knows how the file was encoded. Fixing group 0002 to Explicit VR Little Endian means every reader can parse it the same way, find the Transfer Syntax UID `(0002,0010)`, and only then switch to whatever encoding the data set uses (Figure 10.2). If the meta header followed the data set's transfer syntax, you'd need to know the answer before you could read the question.
2. It doesn't exist on the wire. C-STORE sends only the data set, and its transfer syntax was agreed during association negotiation (Chapter 5). The receiver writes a meta header when it saves the object to disk, which is why the Implementation Class UID in a stored file names the receiving software, not the scanner ("The Part 10 file").
3. Read the Private Creator element that reserves that block: `(0029,0010)` owns `(0029,1000)`–`(0029,10FF)`. If both files carry the same creator string in that slot, the element means the same thing; if the strings differ, it's a different vendor's field that happens to share a number ("Private tags"). Code that reads a private tag without checking its creator is guessing.
4. Accession Number is an `SH`, limited to 16 characters (the VR table). The machine will either truncate the value or refuse it, so the images carry an accession that doesn't match the order. Fix it at the source: issue accession numbers of 16 characters or fewer, and test the whole path through the worklist before relying on accession matching (Chapter 22).
5. From the data dictionary. Implicit VR leaves the VR out of the element (Figure 10.1), so the reader looks the tag up in PS3.6, which says Modality is `CS`. That is also why private tags in an Implicit VR file are a problem: no public dictionary knows their VR, so toolkits fall back to treating them as unknown bytes.

<p class="sources">Sources: DICOM PS3.5 §6.2 (value representations, lengths, padding), §7.1 (data element structure, explicit and implicit VR), §7.5 (nesting, Item and delimitation tags, undefined length), §7.8 (private data elements and private creators), §10.1 (default transfer syntax); PS3.6 (data dictionary, transfer syntax and SOP class UIDs); PS3.10 §7.1 (DICOM File Format: preamble, prefix, File Meta Information).</p>
