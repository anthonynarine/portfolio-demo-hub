---
number: 23
title: Testing an imaging integration without a scanner
objective: Build a test harness on a laptop that sends synthetic studies through a real gateway into the ingest endpoint, and write the contract and negative tests that prove each rule from Chapters 21 and 22.
status: draft
---

## At the machine

Ultrasound machines are clinical equipment. They are booked with patients all day, they belong to the facility, and changing their network settings is a job for the PACS or biomedical engineering team, usually with a change ticket and a maintenance window. You will get a little time on a real machine before go-live, and you should treat that time as precious.

Which means almost all of your testing has to happen without one. A good harness lets you do on a laptop, in seconds, everything a machine would do in a day: send a study, send it twice, send it wrong, send a thousand of them. When you finally do get time on a real machine, it should confirm what the harness already proved, not be the first time you find out.

This chapter is about the developer side: fakes, a harness, and the tests you run on every change. Part VII picks up where this leaves off: what "correct" means for an imaging integration, conformance testing with real equipment, verifying image integrity, acceptance testing with a facility, and QA once it is live.

## On the wire

### The harness

Figure 23.1 is the whole setup. Every box is something you can run locally; none of it needs a scanner, a hospital network, or real patient data.

<figure class="diagram">
<svg viewBox="0 0 720 260" role="img" aria-label="Test harness: pytest drives a fake modality that reads golden files and sends C-STORE to an Orthanc gateway in Docker, which forwards STOW-RS to the ingest endpoint under test; pytest also calls the endpoint directly for contract tests and asserts on its responses and records.">
<defs><marker id="ch23-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="100" width="120" height="56" rx="4" class="box"/>
<text x="80" y="133" text-anchor="middle">pytest</text>
<rect x="200" y="40" width="140" height="56" rx="4" class="box"/>
<text x="270" y="73" text-anchor="middle">Fake modality</text>
<rect x="200" y="170" width="140" height="50" rx="4" class="box dashed"/>
<text x="270" y="200" text-anchor="middle">Golden files</text>
<rect x="400" y="40" width="140" height="56" rx="4" class="box"/>
<text x="470" y="73" text-anchor="middle">Orthanc gateway</text>
<rect x="580" y="100" width="120" height="56" rx="4" class="box accent"/>
<text x="640" y="133" text-anchor="middle">Ingest (test)</text>
<line x1="140" y1="112" x2="200" y2="76" marker-end="url(#ch23-arrow)"/>
<text x="160" y="86" text-anchor="middle" class="small">drives</text>
<line x1="270" y1="170" x2="270" y2="96" marker-end="url(#ch23-arrow)"/>
<text x="278" y="162" class="small">reads</text>
<line x1="340" y1="68" x2="400" y2="68" marker-end="url(#ch23-arrow)"/>
<text x="370" y="60" text-anchor="middle" class="small">C-STORE</text>
<line x1="540" y1="76" x2="590" y2="100" marker-end="url(#ch23-arrow)"/>
<text x="578" y="80" text-anchor="middle" class="small">STOW-RS</text>
<line x1="140" y1="140" x2="580" y2="140" marker-end="url(#ch23-arrow)" class="dashed"/>
<text x="460" y="132" text-anchor="middle" class="small">direct contract tests</text>
<polyline points="640,156 640,240 80,240 80,156" class="dashed" marker-end="url(#ch23-arrow)"/>
<text x="460" y="234" text-anchor="middle" class="small">assert: status, rows, audit</text>
</svg>
<figcaption>Figure 23.1 — The local harness. The fake modality and the gateway exercise the real path end to end; direct calls to the endpoint test its contract on its own; every test ends by checking what was recorded, not just what was answered.</figcaption>
</figure>

<div class="pairs">
<div><span>Fake modality</span><p>DCMTK's <code>storescu</code> or a few lines of pynetdicom. It does what a machine does on End Exam: opens an association (Chapter 5) and sends C-STORE (Chapter 7).</p></div>
<div><span>Gateway</span><p>Orthanc in Docker, configured like the facility's gateway: it receives C-STORE and forwards with STOW-RS (Chapters 16 and 19).</p></div>
<div><span>Ingest under test</span><p>Your endpoint running locally, with a test gateway identity issued just for the harness.</p></div>
<div><span>Golden files</span><p>A small, versioned set of synthetic DICOM files whose expected outcome is written down.</p></div>
</div>

### Synthetic studies, generated

Real files are not test data. Even a "de-identified" file from a real study can carry identifying information burned into the pixels (Chapter 18). Generate your own. With pydicom you can build a complete, valid ultrasound still in thirty lines, and control every identifier the tests care about:

```python
# make_synthetic.py: one synthetic ultrasound still. Nothing in it is a real patient.
import sys

import numpy as np
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, UltrasoundImageStorage, generate_uid


def make_us_still(path, accession="ACC-0001", patient_id="DEMO-0001", study_uid=None):
    meta = FileMetaDataset()
    meta.MediaStorageSOPClassUID = UltrasoundImageStorage
    meta.MediaStorageSOPInstanceUID = generate_uid()
    meta.TransferSyntaxUID = ExplicitVRLittleEndian

    ds = Dataset()
    ds.file_meta = meta
    ds.SOPClassUID = UltrasoundImageStorage
    ds.SOPInstanceUID = meta.MediaStorageSOPInstanceUID
    ds.StudyInstanceUID = study_uid or generate_uid()
    ds.SeriesInstanceUID = generate_uid()
    ds.PatientName = "TEST^PATIENT"
    ds.PatientID = patient_id
    ds.AccessionNumber = accession
    ds.Modality = "US"
    ds.StudyDate = "20260101"
    ds.InstitutionName = "SYNTHETIC LAB"

    ds.Rows, ds.Columns = 64, 64
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated = ds.BitsStored = 8
    ds.HighBit = 7
    ds.PixelRepresentation = 0
    ds.PixelData = (np.arange(64 * 64) % 256).astype(np.uint8).tobytes()

    ds.save_as(path, enforce_file_format=True)
    return ds


if __name__ == "__main__":
    make_us_still(sys.argv[1] if len(sys.argv) > 1 else "synthetic-us.dcm")
```

`enforce_file_format=True` makes pydicom write a proper Part 10 file: the 128-byte preamble, `DICM`, and the file meta group (Chapter 10). `generate_uid()` makes UIDs under pydicom's own root, so they can't collide with a real study's (Chapter 11). A gradient is enough pixel data for a pipeline test; Chapter 12's multi-frame cine is the generator to add next.

### Golden files

Generated files cover the happy path. Golden files cover the cases you've already been bitten by, frozen so they never regress. Keep them small, synthetic, and in the repository next to a manifest that says what each one must do:

```text
golden/
  manifest.csv          file, expected_outcome, reason
  us-still-ok.dcm       stored, matched
  us-cine-ok.dcm        stored, matched
  no-accession.dcm      stored, held:no_accession
  unknown-sop.dcm       rejected:0122
  truncated.dcm         rejected:parse
```

When a real-world problem reaches you, reproduce it as a new synthetic golden file before you fix the code. The file is the bug report that never goes stale.

### Contract tests on the STOW endpoint

The ingest endpoint has a contract: PS3.18 §10.5 plus your own rules from Chapter 21. Test it directly, without the gateway, so a failure points at the endpoint and nothing else:

- **Multipart parsing.** One part, many parts, a boundary that appears inside a file's bytes (it mustn't break), a missing closing boundary, a part with the wrong Content-Type.
- **Status codes.** All stored → `200`; some failed → `202`; nothing stored → `400` or `409`; wrong media type → `415` (PS3.18 Table 10.5.3-1).
- **The body.** Every stored instance appears in Referenced SOP Sequence (0008,1199); every refused one in Failed SOP Sequence (0008,1198) with the right Failure Reason (0008,1197), such as `0122` for an unsupported SOP class (PS3.18 Annex I).
- **The records.** After each request, the database rows, object-store keys and audit events are exactly what the response claims. A test that only checks the HTTP status is half a test.

### Negative and abuse tests

Every rule in Chapters 21 and 22 needs a test that tries to break it. These matter more than the happy path, because they are the ones nobody exercises by accident.

| Test | Send | Must happen |
|---|---|---|
| Wrong tenant credential | A valid study using organization B's gateway certificate | Stored under B or refused; never visible to A |
| Spoofed Institution Name | A study from A's gateway with (0008,0080) set to B's name | Stored under A; the tag changes nothing |
| No credential | A valid study with no client certificate | TLS handshake fails; nothing stored; security event |
| Revoked gateway | A valid study from a revoked certificate | Refused; security event |
| Oversized file | One part above the size limit | Refused before it is read into memory |
| Unknown SOP class | A valid file with a class not on the allow-list | Failed SOP Sequence, reason `0122`; not stored |
| Malformed file | Truncated bytes, bad preamble, nonsense length field | Refused; endpoint still healthy; no partial row |
| Duplicate instance | The same SOP Instance UID twice, same content | One row; second answer is a harmless success |
| Duplicate, different content | Same SOP Instance UID, different pixels | Refused and recorded; the first image unchanged |
| Partial batch | Nine good files and one bad | `202`; nine stored; one listed as failed |
| Identity conflict | Accession of exam X, Patient ID of another patient | Held as `identity_conflict`; not attached |
| PHI in logs | Any of the above | Log output contains no name, MRN or accession |

The last row deserves a word: run the whole suite with logging captured, then search the captured output for the synthetic patient's name and identifiers. If they appear anywhere, the test fails. It is the cheapest way to keep PHI out of logs as the code changes.

### Load and concurrency

A busy lab finishes many studies at once, and a gateway that was offline all morning will flush its queue in one burst. Two tests are worth automating:

- **Burst.** Send a few hundred synthetic studies as fast as the gateway will forward them. Watch latency, memory, and the gateway's retry queue. Nothing should be lost; the count of rows should equal the count of SOP Instance UIDs sent.
- **The race.** Send the same instance from two connections at the same moment, many times. Exactly one row must exist afterwards. This is the test that proves the uniqueness rule lives in the database (Chapter 21), not in an application check that two requests can both pass.

## Lab

**Run a small contract suite against a local receiver.** Orthanc stands in for the ingest endpoint here, because it speaks both C-STORE and STOW-RS. The tests are written so you can later point them at your own endpoint by changing two environment variables. Synthetic data only.

1. Start Orthanc with DICOMweb (authentication off because this is a throwaway local lab):

```bash
docker run --rm -p 8042:8042 -p 4242:4242 \
  -e DICOM_WEB_PLUGIN_ENABLED=true \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  orthancteam/orthanc:24.10.1
```

2. In another terminal, make a virtual environment and install pinned versions. pynetdicom 3.x is the line that works with pydicom 3.x:

```bash
python3 -m venv .venv
.venv/bin/pip install pydicom==3.0.1 pynetdicom==3.0.1 numpy==2.1.3 pytest==8.3.3 requests==2.32.3
```

3. Save `make_synthetic.py` from above, and this as `test_ingest.py` in the same folder:

```python
"""Contract and negative tests against a local STOW-RS receiver (Orthanc stands in for the ingest endpoint)."""
import os

import pytest
import requests
from pynetdicom import AE
from pynetdicom.sop_class import UltrasoundImageStorage

from make_synthetic import make_us_still

STOW_URL = os.environ.get("STOW_URL", "http://localhost:8042/dicom-web/studies")
DICOM_HOST = os.environ.get("DICOM_HOST", "localhost")
DICOM_PORT = int(os.environ.get("DICOM_PORT", "4242"))

REFERENCED_SOP_SEQUENCE = "00081199"
REFERENCED_SOP_INSTANCE_UID = "00081155"


def stow(*files):
    """POST one or more Part 10 files as multipart/related, the way a gateway would."""
    boundary = "lab-boundary"
    body = b""
    for data in files:
        body += f"--{boundary}\r\nContent-Type: application/dicom\r\n\r\n".encode() + data + b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    headers = {
        "Content-Type": f'multipart/related; type="application/dicom"; boundary={boundary}',
        "Accept": "application/dicom+json",
    }
    return requests.post(STOW_URL, data=body, headers=headers, timeout=30)


def stored_uids(response):
    items = response.json().get(REFERENCED_SOP_SEQUENCE, {}).get("Value", [])
    return {item[REFERENCED_SOP_INSTANCE_UID]["Value"][0] for item in items}


@pytest.fixture
def us_file(tmp_path):
    path = tmp_path / "us.dcm"
    ds = make_us_still(path)
    return ds, path.read_bytes()


def test_valid_instance_is_stored_and_reported(us_file):
    ds, data = us_file
    response = stow(data)
    assert response.status_code == 200
    assert ds.SOPInstanceUID in stored_uids(response)


def test_resending_the_same_instance_is_harmless(us_file):
    ds, data = us_file
    assert stow(data).status_code == 200
    second = stow(data)
    assert second.status_code in (200, 409)  # write down which one your receiver chose


def test_a_file_that_is_not_dicom_stores_nothing():
    response = stow(b"this is not a DICOM file")
    assert response.status_code in (400, 409)
    assert not response.json().get(REFERENCED_SOP_SEQUENCE, {}).get("Value")


def test_fake_modality_c_store(us_file):
    ds, _ = us_file
    ae = AE(ae_title="FAKE_US")
    ae.add_requested_context(UltrasoundImageStorage, ds.file_meta.TransferSyntaxUID)
    assoc = ae.associate(DICOM_HOST, DICOM_PORT, ae_title="ORTHANC")
    assert assoc.is_established, "association rejected or no answer"
    try:
        status = assoc.send_c_store(ds)
        assert status.Status == 0x0000
    finally:
        assoc.release()
```

4. Run it: `.venv/bin/python -m pytest -q test_ingest.py`. All four should pass. The `stow()` helper builds the multipart body by hand on purpose, so you can see exactly what a gateway puts on the wire.

5. Now break things on purpose. Change the first test to expect `202` and watch it fail; add a test that sends two files in one request, one valid and one not, and record what this receiver answers. Then, with DCMTK installed, send a file the way a modality would from the command line: `storescu -aet FAKE_US -aec ORTHANC localhost 4242 synthetic-us.dcm`.

6. Write down which rows of the negative-test table above Orthanc *can't* show you (the tenant and credential rows). Those are the tests that only exist once your own endpoint exists, and they are the most important ones in the table.

## In Lumen

Today Lumen receives images only by browser upload into an exam, so there is no machine path to test yet. Everything in this chapter is **planned**, alongside the ingest endpoint itself: the synthetic generator and golden files in the repository; the contract suite run against the endpoint on every change; the negative-test table as tests, with the tenant and credential rows first; the PHI-in-logs check; and a harness configuration that runs Orthanc as the gateway in Docker with a test-only gateway identity. Testing with real machines and real facilities is Part VII's subject.

## How it fails

- **Testing with real files.** A "harmless" file from a real study ends up in a repository, a bug tracker, or a screenshot. Generate synthetic data; never borrow it.
- **Only the happy path.** Every test sends a perfect study, so the first malformed file, duplicate or spoofed tag is found in production.
- **Asserting on the response only.** The endpoint answers `200` while storing nothing, or storing twice. Check rows, keys and audit events after every call.
- **Mocking the database.** The uniqueness race only shows up against a real database with real concurrent connections.
- **A harness nobody can run.** If it takes an afternoon to set up, it won't run on every change. Keep it to one `docker run` and one `pytest`.

## Evidence

You understand this chapter when you can run one command and show: a synthetic study sent through a fake modality and a gateway into the endpoint; the contract tests passing; every row of the negative-test table covered by a test you can name; and a test that fails if PHI ever reaches the logs.

## Workbook

1. Why generate synthetic files rather than de-identify real ones for the test suite?
2. A contract test checks that the endpoint returns `200`. What else must it check, and why?
3. Which rows of the negative-test table can't be tested against plain Orthanc, and what does that tell you about where your most important tests must run?
4. Describe the race test, and explain why it can pass against a mock and fail against a real database.
5. A facility reports that one machine's images were refused last night. What do you add to the repository before you fix anything?

## Answers

1. A real file can carry identifying information in places a de-identification step misses, especially text burned into ultrasound pixels (Chapter 18), and once it is in a repository it is copied everywhere. Synthetic files also let you control every identifier the tests depend on, which real files don't. See "Synthetic studies, generated".
2. It must check what was recorded: the database rows, the object-store keys and the audit events, and that they match what the response claims. An endpoint can answer `200` while storing nothing, storing twice, or logging PHI. See "Contract tests on the STOW endpoint" and the arrow back to pytest in Figure 23.1.
3. The tenant and credential rows (wrong tenant credential, spoofed Institution Name, no credential, revoked gateway), because Orthanc has no notion of Lumen's organizations or gateway identities; the identity-conflict row needs your own matching rules too. The tests that matter most only exist once your own endpoint exists, so they must run against it, not against a stand-in. See the lab's step 6.
4. Send the same SOP Instance UID from two connections at once, many times, and check that exactly one row exists. A mock usually processes requests one at a time, so an application-level "does it exist?" check looks correct; against a real database two requests can both pass that check before either writes, and only a database constraint stops the duplicate. See "Load and concurrency".
5. A synthetic golden file that reproduces the refusal, with its expected outcome in the manifest. It proves the fix and stops the problem from coming back. See "Golden files".

<p class="sources">Sources: DICOM PS3.18 §10.5 (Store transaction, Table 10.5.3-1 status codes) and Annex I (Store Instances Response Module, Table I.2-2 failure reasons); PS3.10 §7 (Part 10 file format); PS3.4 Annex B (Ultrasound Image Storage SOP Class); PS3.7 Annex C (status encoding; 0000 is success); pydicom 3.0 documentation (Dataset.save_as, enforce_file_format, generate_uid); pynetdicom 3.0 documentation (AE, associate, send_c_store); DCMTK storescu documentation; Orthanc Book (Docker images, DICOMweb plugin). Lab verified against orthancteam/orthanc:24.10.1 with pydicom 3.0.1 and pynetdicom 3.0.1.</p>
