---
number: 14
title: Why an AE title is not an identity
objective: Explain what an AE title does and does not prove, test it against a real DICOM server, and choose controls that actually establish who is sending images.
status: draft
---

## At the machine

When a new ultrasound system is installed, someone from PACS or biomedical engineering adds it to the archive's list of known devices: the AE title `US_ROOM3`, its IP address, its port. From then on, everyone talks about "Room 3 sending to PACS" as if the archive knows that the images really came from Room 3.

It does not. It knows that something on the network said "I am `US_ROOM3`" and maybe that it called from a particular address. The AE title is a label the sender typed into its own setup screen. Any laptop on the same network can type the same label. This chapter is about the difference between a name a device claims and an identity a system can prove, because that difference decides who is allowed to put images into a patient's record.

## On the wire

### What the association request carries

Chapter 5 walked through the association handshake. The `A-ASSOCIATE-RQ` the machine sends carries two AE titles: the **Calling AE Title** (who I say I am) and the **Called AE Title** (who I think you are). Both are plain text fields of up to 16 characters, filled in by the sender. Nothing in the base DICOM Upper Layer protocol signs them, encrypts them, or ties them to the hardware.

A receiving system can do only three things with them:

<div class="pairs">
<div><span>Ignore</span><p>Accept any calling AE. Many archives and gateways ship this way, because it makes installation easy.</p></div>
<div><span>Match</span><p>Accept only calling AEs that appear in its configured list of known devices.</p></div>
<div><span>Match plus host</span><p>Accept a known calling AE only when the connection also comes from that device's configured IP address.</p></div>
</div>

None of these proves identity. Matching a name proves the sender knows the name. Matching the IP address proves the packets came from that address, which on a hospital network usually means "from that switch port or that VLAN," and addresses can be reassigned, shared through NAT, or borrowed by another device.

### The receiver's address book is a policy, not a proof

In Chapter 4 the address book told the *sender* where to send. On the receiving side, the same kind of list is used as an allow-list. That is useful: it stops accidental sends from a misconfigured device, and it gives you a place to say "this device may store, but may not query." It is still only a policy keyed on a claimed name.

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="Each control checks something different: the AE title is a claim, the IP check proves network location, a TLS client certificate proves possession of a key, and user identity negotiation carries a credential.">
<defs><marker id="ch14-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="110" width="140" height="70" rx="4" class="box"/>
<text x="90" y="140" text-anchor="middle">Sender</text>
<text x="90" y="160" text-anchor="middle" class="small">says US_ROOM3</text>
<line x1="160" y1="145" x2="250" y2="145" marker-end="url(#ch14-arrow)"/>
<line x1="270" y1="20" x2="270" y2="280" class="dashed"/>
<text x="270" y="296" text-anchor="middle" class="small">trust boundary</text>
<rect x="290" y="20" width="410" height="52" rx="4" class="box"/>
<text x="310" y="42">Calling AE title</text>
<text x="310" y="60" class="small">checks: the sender knows a name</text>
<rect x="290" y="84" width="410" height="52" rx="4" class="box"/>
<text x="310" y="106">IP / host check</text>
<text x="310" y="124" class="small">checks: packets came from an address</text>
<rect x="290" y="148" width="410" height="52" rx="4" class="box accent"/>
<text x="310" y="170">TLS client certificate</text>
<text x="310" y="188" class="small">checks: the sender holds a private key you trust</text>
<rect x="290" y="212" width="410" height="52" rx="4" class="box"/>
<text x="310" y="234">User Identity Negotiation</text>
<text x="310" y="252" class="small">carries: a username, ticket, assertion or token</text>
</svg>
<figcaption>Figure 14.1 — What each control actually verifies. Only the certificate proves that the sender holds a secret; the AE title and the address are claims about name and location.</figcaption>
</figure>

### User Identity Negotiation

DICOM does have a way to carry a real credential inside the association. **User Identity Negotiation** (PS3.7 Annex D.3.3.7) adds a sub-item to the `A-ASSOCIATE-RQ` with a *User-Identity-Type*:

| Type | Carries |
|---|---|
| 1 | A username (UTF-8) |
| 2 | A username and passcode |
| 3 | A Kerberos service ticket |
| 4 | A SAML assertion |
| 5 | A JSON Web Token (JWT) |

Two details matter for an engineer. First, the requester can set *positive-response-requested*. If it does not, the acceptor sends nothing back about identity, so the sender cannot tell whether its credential was checked at all. Second, an acceptor that does not support user identity simply accepts the association without a positive response. The standard leaves it to the requester to decide whether to go on. In other words, user identity is optional on both ends, and silence is a legal answer.

Type 1 is just another claimed name. Type 2 sends a passcode, which is only safe inside an encrypted connection (Chapter 15). Types 3 to 5 can carry something verifiable, but they need an identity infrastructure behind them, and support for them on modalities is uncommon. Before relying on any of this, read the device's DICOM Conformance Statement: it says which user identity types, if any, the device sends.

### Spoofing, in practice

You do not need special tools to impersonate a device. Every DICOM toolkit lets you set the calling AE title. Three realistic ways it goes wrong:

1. **A test laptop on the clinical VLAN** uses `US_ROOM3` because that is the title in the instructions it was given. Its images land in the archive as if Room 3 sent them.
2. **A replaced machine** keeps the old AE title but gets a new address. Someone widens the allow-list "temporarily" to accept the name from anywhere.
3. **A compromised workstation** on the same network sends objects under a trusted name, with tags for a real patient. The archive files them, because names matched.

### Defense in depth

Because the protocol itself proves so little, the controls that matter sit around it:

- **Network segmentation.** Modalities live on their own VLAN; only that VLAN can reach the receiver's DICOM port. The IP check then means something about place.
- **TLS with client certificates.** The receiver accepts only connections whose certificate chains to a CA it trusts (Chapter 15). Now "Room 3" is "whoever holds Room 3's private key."
- **A gateway that holds the facility's identity.** Machines talk to a gateway on their own segment; only the gateway talks outward, with its own credential (Chapter 16). The cloud system authenticates one well-managed identity per facility instead of trusting dozens of device labels.
- **Least privilege per device.** A device that only stores should not be allowed to query or retrieve.

## Lab

You will run a DICOM receiver, send it an image under any name you like, then lock it down and watch what the lock does and does not stop. Everything here uses synthetic data.

**Set up.** You need Docker and Python 3.10 or later.

```bash
python3 -m venv dicom-lab && source dicom-lab/bin/activate
pip install pydicom==3.0.1 pynetdicom==3.0.1 numpy==2.1.3
```

Save this as `make_synthetic_us.py`. It writes one small synthetic ultrasound image.

```python
"""Write one synthetic ultrasound image (no real patient) to a DICOM file."""
import sys

import numpy as np
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, generate_uid

US_IMAGE_STORAGE = "1.2.840.10008.5.1.4.1.1.6.1"

def make(path):
    meta = FileMetaDataset()
    meta.MediaStorageSOPClassUID = US_IMAGE_STORAGE
    meta.MediaStorageSOPInstanceUID = generate_uid()
    meta.TransferSyntaxUID = ExplicitVRLittleEndian

    ds = Dataset()
    ds.file_meta = meta
    ds.SOPClassUID = US_IMAGE_STORAGE
    ds.SOPInstanceUID = meta.MediaStorageSOPInstanceUID
    ds.StudyInstanceUID = generate_uid()
    ds.SeriesInstanceUID = generate_uid()
    ds.PatientName = "TEST^PATIENT"
    ds.PatientID = "DEMO-0001"
    ds.AccessionNumber = "ACC-0001"
    ds.Modality = "US"
    ds.StudyDate = "20260101"
    ds.InstitutionName = "SYNTHETIC LAB"
    ds.StationName = "US_ROOM3"
    ds.SeriesNumber = 1
    ds.InstanceNumber = 1
    ds.Rows, ds.Columns = 120, 160
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated, ds.BitsStored, ds.HighBit = 8, 8, 7
    ds.PixelRepresentation = 0
    ds.PixelData = np.tile(np.linspace(0, 255, 160, dtype=np.uint8), (120, 1)).tobytes()
    ds.save_as(path, enforce_file_format=True)

if __name__ == "__main__":
    make(sys.argv[1])
```

And this as `send.py`, a sender that calls with whatever AE title you give it:

```python
"""Send one DICOM file with C-STORE, calling as any AE title you choose."""
import sys

from pydicom import dcmread
from pynetdicom import AE

calling_ae, host, port, path = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
ds = dcmread(path)

ae = AE(ae_title=calling_ae)
ae.add_requested_context(ds.SOPClassUID, ds.file_meta.TransferSyntaxUID)
assoc = ae.associate(host, port, ae_title="ORTHANC")
if not assoc.is_established:
    sys.exit(f"{calling_ae}: association rejected or aborted")
status = assoc.send_c_store(ds)
assoc.release()
print(f"{calling_ae}: C-STORE status 0x{status.Status:04X}" if status else f"{calling_ae}: refused, no success status")
```

**Step 1: the default receiver accepts anyone.** Start Orthanc with its DICOM port on your laptop only:

```bash
docker run -d --rm --name ch14-orthanc \
  -p 127.0.0.1:4242:4242 -p 127.0.0.1:8042:8042 \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  orthancteam/orthanc:24.10.1

python make_synthetic_us.py a.dcm
python send.py ANY_NAME_I_LIKE 127.0.0.1 4242 a.dcm
python send.py PACS_MAIN 127.0.0.1 4242 a.dcm
```

Both print `C-STORE status 0x0000`, which is success. Orthanc's configuration option `DicomAlwaysAllowStore` defaults to `true`: it accepts C-STORE "even from SCU modalities it does not know about."

**Step 2: allow only Room 3.** Stop the container and start it again with three options: refuse unknown senders, check the sender's address, and list one known device.

```bash
docker rm -f ch14-orthanc
docker run -d --rm --name ch14-orthanc \
  -p 127.0.0.1:4242:4242 -p 127.0.0.1:8042:8042 \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  -e ORTHANC__DICOM_ALWAYS_ALLOW_STORE=false \
  -e ORTHANC__DICOM_CHECK_MODALITY_HOST=true \
  -e 'ORTHANC__DICOM_MODALITIES={"room3": ["US_ROOM3", "192.0.2.10", 104]}' \
  orthancteam/orthanc:24.10.1

python send.py US_ROOM3 127.0.0.1 4242 a.dcm
docker logs ch14-orthanc 2>&1 | grep -i rejected
```

The store is refused. The log explains why, and tells you the address your connection really came from (with Docker on a laptop it is usually the Docker bridge, something like `172.17.0.1`):

```text
DICOM authorization rejected for AET US_ROOM3 on IP 172.17.0.1: Its IP address
should be 192.0.2.10 according to configuration option "DicomModalities"
```

**Step 3: put in the address you saw** and send again, first as a stranger, then as Room 3:

```bash
docker rm -f ch14-orthanc
docker run -d --rm --name ch14-orthanc \
  -p 127.0.0.1:4242:4242 -p 127.0.0.1:8042:8042 \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  -e ORTHANC__DICOM_ALWAYS_ALLOW_STORE=false \
  -e ORTHANC__DICOM_CHECK_MODALITY_HOST=true \
  -e 'ORTHANC__DICOM_MODALITIES={"room3": ["US_ROOM3", "172.17.0.1", 104]}' \
  orthancteam/orthanc:24.10.1

python send.py STRANGER 127.0.0.1 4242 a.dcm
python send.py US_ROOM3 127.0.0.1 4242 a.dcm
```

`STRANGER` is refused (the log says the AET "is not listed"). `US_ROOM3` succeeds. Notice what just happened: the "real Room 3" and your Python script are the same program on the same laptop. You proved you are Room 3 by typing `US_ROOM3`, from an address you share with everything else on your machine. That is the whole lesson of this chapter.

Clean up with `docker rm -f ch14-orthanc`.

## In Lumen

Today Lumen receives images only by browser upload, from a signed-in person whose organization and facility membership is checked on every request. There is no DICOM port at all, so there is nothing for a machine to impersonate.

The planned design for receiving images from machines does not change that rule. Machines will send to a gateway inside the facility, and only the gateway talks to Lumen, over HTTPS with mutual TLS and its own device identity. Lumen will never accept an AE title, or any tag, as proof of who is sending. The AE title can still be recorded, because it is useful for troubleshooting ("which room sent this?"), but it is stored as a claim, next to the identity that was actually verified.

## How it fails

- **The open default.** A receiver installed with "accept any caller" and never tightened. Anyone who can reach the port can add images to the archive.
- **The allow-list that grew.** Each new device was added by name only; host checking was never turned on. The list documents devices but stops nobody.
- **Address reuse.** A modality is retired, its IP is handed to a new workstation, and the new device inherits the old one's trust.
- **Silent identity.** A sender passes a username without asking for a positive response; the receiver never checked it, and both sides believe the session was authenticated.
- **Trusting the label downstream.** A later system decides which organization or patient an image belongs to because of the AE title or station name. Chapter 17 shows why this is the dangerous one.

## Evidence

You understand this chapter when you can show, from your own lab, a store accepted under a name you invented; a store refused because of the host check, with the log line that says so; and a one-page table for one real receiver listing which control establishes each of: name, network location, and possession of a secret.

## Workbook

1. In the lab, Step 3 accepted your script as `US_ROOM3`. What exactly did Orthanc verify, and what would an attacker on the same network need in order to pass the same check?
2. A device's Conformance Statement says it sends User Identity type 1. What does that add over the calling AE title, and what does it not add?
3. Why does the *positive-response-requested* flag matter to the sender?
4. Rank these from weakest to strongest as proof of who is sending: calling AE title, source IP on a dedicated modality VLAN, TLS client certificate issued by your own CA. Justify each step.
5. Your archive must accept images from a machine that supports none of the stronger controls. Where would you put the trust instead?

## Answers

1. Orthanc verified that the calling AE title was `US_ROOM3` and that the connection came from the configured address. An attacker needs only to type the same title and send from that address, or from behind the same NAT or bridge, as your script did. Neither check involves a secret (see "The receiver's address book is a policy, not a proof" and Figure 14.1).
2. Type 1 carries a username, but without a passcode or a verifiable token it is still a self-declared string, just a second label next to the AE title. It can help with auditing who was logged in at the machine, but it proves nothing to the receiver (see the User Identity Negotiation table).
3. Without it, an acceptor that ignored or did not support the credential sends no identity response, and that silence is legal. Asking for a positive response is the only way the sender learns that its credential was actually accepted, so it can refuse to continue otherwise (PS3.7 Annex D.3.3.7).
4. The AE title is weakest: anyone can type it. The source IP on a dedicated VLAN is stronger, because it ties the connection to a controlled network location, but addresses can be reused or shared. A TLS client certificate is strongest, because the sender must hold a private key that chains to a CA you control (see "Defense in depth").
5. Put it in the network and a gateway. Place the machine on a segment where only it and a gateway can reach each other, have the gateway accept only that machine, and give the gateway the strong identity (a client certificate) toward everything beyond the segment. Chapter 16 builds this.

<p class="sources">Sources: DICOM PS3.8 §7.1 and §9.3 (A-ASSOCIATE service and PDU, Calling and Called AE Title fields); PS3.5 §6.2 (AE value representation); PS3.7 Annex D.3.3.7 (User Identity Negotiation, Table D.3-14 User-Identity-Type values, positive response behavior); PS3.15 Annex B (secure transport and user identity association profiles); Orthanc default configuration file (DicomAlwaysAllowStore, DicomCheckModalityHost, DicomModalities, Orthanc 24.10.1 Docker image).</p>
