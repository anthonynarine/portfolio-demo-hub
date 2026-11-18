---
number: 9
title: Storage Commitment: "did you really keep it?"
objective: Explain why a successful C-STORE is not the same as safekeeping, run a storage commitment request and read its answer, and state what a receiver must guarantee before it says "committed."
status: draft
---

## At the machine

An ultrasound system's disk is not an archive. It fills up, and the machine has to delete old studies to make room. The question every department has to answer is **when is it safe to delete a study from the machine?**

"After it was sent" is the tempting answer, and it's the wrong one. A send can succeed while the image is still sitting in a queue, on a disk that fails that night, or in a system that will quietly reject it later. Many machines can be configured differently: keep each study until the archive has explicitly said it has taken responsibility for every image, and only then allow the study to be deleted, automatically or by hand. On some systems you can see the difference in the study list, as one mark for "sent" and another for "committed."

That explicit promise is **Storage Commitment**. It is DICOM's way of asking: did you really keep it?

## On the wire

### Sent is not kept

Chapter 7's C-STORE ends with a status, and `0000` means the receiver accepted the object. It is one message, about one object, at one moment. It says nothing about whether the object is on durable storage, whether it will still be there next week, or whether the other 39 images of the study arrived.

Storage commitment is a separate request, sent after the images, about a list of them. The receiver answers for each one: "I now hold this, and I take responsibility for keeping it." The standard specifies what holding means here. The SCP stores the instances at Storage Level 2 (Full), keeping every attribute including private ones (PS3.4 §J.3.3.1.2).

### The Push Model

The usual form is the **Storage Commitment Push Model**, SOP Class UID `1.2.840.10008.1.20.1`. "Push" because the sender has already pushed the images by C-STORE and now asks about them. Like MPPS (Chapter 8), it uses DIMSE-N services: **N-ACTION** for the request and **N-EVENT-REPORT** for the answer.

N-ACTION normally acts on a specific object. Storage commitment has nothing to create, so every request is addressed to one constant, well-known SOP Instance UID, `1.2.840.10008.1.20.1.1` (§J.3.5). Conceptually that instance exists for as long as the SCP application runs.

The request (Action Type ID `1`, "Request Storage Commitment") carries:

<div class="pairs">
<div><span>Transaction UID</span><p>(0008,1195). A new UID the sender generates for this request, so it can match the answer to it later, even on another association.</p></div>
<div><span>Referenced SOP Sequence</span><p>(0008,1199). One item per instance: Referenced SOP Class UID (0008,1150) and Referenced SOP Instance UID (0008,1155). Each instance may appear only once.</p></div>
</div>

The N-ACTION response is easy to misread. Success here means only **"I received your request."** It does not mean anything was committed. The actual answer comes later, as a separate message.

### The answer: N-EVENT-REPORT

When the SCP has checked every listed instance, it sends an N-EVENT-REPORT with the same Transaction UID and one of two Event Type IDs (PS3.4 Table J.3-2):

| Event Type ID | Meaning | Contains |
|---|---|---|
| `1` | Storage Commitment Request Successful | Referenced SOP Sequence: every instance, all committed |
| `2` | Storage Commitment Request Complete - Failures Exist | Failed SOP Sequence (0008,1198), and a Referenced SOP Sequence for any that did succeed |

Every instance in the original request appears in exactly one of the two lists. A failed item says why, in Failure Reason (0008,1197) (PS3.3 §C.14.1.1):

| Failure Reason | Meaning |
|---|---|
| `0110` | Processing failure |
| `0112` | No such SOP Instance: "I don't have it" |
| `0119` | Class/Instance conflict: the SOP class doesn't match what was stored under that UID |
| `0122` | Referenced SOP Class not supported |
| `0131` | Duplicate Transaction UID |
| `0213` | Resource limitation |

After the report, the Transaction UID is finished and must not be reused.

### Possibly on a different connection

The machine is free to release the association as soon as it gets the N-ACTION response. The answer might come minutes later, after the archive has written everything to its long-term store. So the standard requires that an SCP be able to send the N-EVENT-REPORT **on a different association**, which it opens itself, and that the SCU be able to receive it there (§J.3.3.1.2–3). Figure 9.1 shows the exchange.

<figure class="diagram">
<svg viewBox="0 0 720 360" role="img" aria-label="Storage commitment sequence: the machine stores images with C-STORE, sends N-ACTION with a Transaction UID and gets a response meaning only 'request received', releases; later the archive opens a new association back to the machine and sends N-EVENT-REPORT with the same Transaction UID, listing committed and failed instances.">
<defs><marker id="ch09-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="60" y="20" width="180" height="50" rx="4" class="box"/>
<text x="150" y="50" text-anchor="middle">Ultrasound (SCU)</text>
<rect x="480" y="20" width="180" height="50" rx="4" class="box accent"/>
<text x="570" y="50" text-anchor="middle">Archive (SCP)</text>
<line x1="150" y1="70" x2="150" y2="350" class="dashed"/>
<line x1="570" y1="70" x2="570" y2="350" class="dashed"/>
<text x="360" y="92" text-anchor="middle" class="small muted">association 1</text>
<line x1="150" y1="110" x2="565" y2="110" marker-end="url(#ch09-arrow)"/>
<text x="360" y="102" text-anchor="middle" class="small">C-STORE x N (earlier)</text>
<line x1="150" y1="150" x2="565" y2="150" marker-end="url(#ch09-arrow)" class="accent"/>
<text x="360" y="142" text-anchor="middle" class="small">N-ACTION: Transaction UID T, list of N instances</text>
<line x1="565" y1="185" x2="155" y2="185" marker-end="url(#ch09-arrow)"/>
<text x="360" y="177" text-anchor="middle" class="small">N-ACTION-RSP 0000 = "request received"</text>
<text x="360" y="212" text-anchor="middle" class="small muted">machine releases; archive writes to long-term storage</text>
<text x="360" y="250" text-anchor="middle" class="small muted">association 2, opened by the archive</text>
<line x1="565" y1="275" x2="155" y2="275" marker-end="url(#ch09-arrow)" class="accent"/>
<text x="360" y="267" text-anchor="middle" class="small">N-EVENT-REPORT: T, committed list, failed list</text>
<line x1="150" y1="315" x2="565" y2="315" marker-end="url(#ch09-arrow)"/>
<text x="360" y="307" text-anchor="middle" class="small">N-EVENT-REPORT-RSP 0000</text>
</svg>
<figcaption>Figure 9.1 — Storage commitment. The request and the answer are separate messages, tied together by the Transaction UID, and the answer may arrive on a new association the archive opens.</figcaption>
</figure>

Three things follow, and each is a common deployment surprise:

1. **The archive must be able to reach the machine.** Like C-MOVE (Chapter 7), the machine has to be in the archive's address book with a correct IP address and port, and no firewall can block the archive's outbound connection.
2. **The machine must be listening.** It needs an SCP port open for the answer, even though it is normally only a sender.
3. **Roles flip.** On the second association the archive is the requestor but still the commitment SCP, so it proposes the SCP role through SCU/SCP role selection (Chapter 5), and it must use the same AE title as before.

### What the machine does with the answer

The standard deliberately stops at the message. What a machine does with the answer is left to the implementation and described in its conformance statement. The usual behavior, and the only safe one, is:

<figure class="diagram">
<svg viewBox="0 0 720 230" role="img" aria-label="Decision after a commitment request: Event Type 1 means all committed and the study may be deleted; Event Type 2 means re-send the failed instances and ask again; no answer before the timeout means keep everything.">
<defs><marker id="ch09-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="85" width="170" height="60" rx="4" class="box"/>
<text x="105" y="112" text-anchor="middle">Waiting for</text>
<text x="105" y="132" text-anchor="middle">transaction T</text>
<line x1="190" y1="100" x2="300" y2="40" marker-end="url(#ch09-arrow2)"/>
<text x="230" y="58" text-anchor="middle" class="small">Event 1</text>
<line x1="190" y1="115" x2="300" y2="115" marker-end="url(#ch09-arrow2)"/>
<text x="245" y="107" text-anchor="middle" class="small">Event 2</text>
<line x1="190" y1="130" x2="300" y2="190" marker-end="url(#ch09-arrow2)" class="dashed"/>
<text x="230" y="178" text-anchor="middle" class="small">timeout</text>
<rect x="300" y="12" width="400" height="56" rx="4" class="box accent"/>
<text x="500" y="45" text-anchor="middle">All committed: the study may be deleted locally</text>
<rect x="300" y="87" width="400" height="56" rx="4" class="box"/>
<text x="500" y="120" text-anchor="middle">Re-send the failed instances, ask again (new T)</text>
<rect x="300" y="162" width="400" height="56" rx="4" class="box"/>
<text x="500" y="195" text-anchor="middle">No answer: nothing is committed; keep it all</text>
</svg>
<figcaption>Figure 9.2 — What a careful sender does with each outcome. Silence is never a yes.</figcaption>
</figure>

How long to wait is also left to the implementation. Whatever the timeout, the rule is that **no answer means nothing was committed.**

## Lab

**Ask an archive to commit to four images, one of which it never received.** This lab uses the Orthanc archive and the synthetic images from Chapter 7's lab, so start Orthanc again with the same command (its address book entry `LABSCU` → `host.docker.internal:11112` is the one it will call back on) and store the images:

```bash
storescu -aet LABSCU -aec LABPACS localhost 4242 synthetic/*.dcm
```

Orthanc includes a storage commitment SCP. Save this as `commit.py` (`pip install pydicom==3.0.1 pynetdicom==3.0.1`). pynetdicom installs its own command-line apps named `storescu`, `findscu` and so on, so run the DCMTK `storescu` above before activating that environment, or from another terminal. The script plays the ultrasound machine:
1. It starts listening as `LABSCU` on port 11112 *before* asking, because the answer may arrive on a new association.
2. It sends one N-ACTION listing the three stored images plus one made-up instance.
3. It releases the association and waits for the N-EVENT-REPORT.

```python
"""Play the ultrasound machine: ask the archive to commit to three stored images and one
image it never received, then wait for the answer. Synthetic data, local only."""
import sys
import threading
from pathlib import Path

import pydicom
from pydicom.dataset import Dataset
from pydicom.uid import UltrasoundImageStorage, generate_uid
from pynetdicom import AE, evt
from pynetdicom.sop_class import StorageCommitmentPushModel

ARCHIVE = ("127.0.0.1", 4242, "LABPACS")  # where the images were sent
MY_AET, MY_PORT = "LABSCU", 11112  # the archive must know this AE to call back
WELL_KNOWN_INSTANCE = "1.2.840.10008.1.20.1.1"  # PS3.4 J.3.5
answered = threading.Event()


def on_event_report(event):
    info = event.event_information
    how = "a new association the archive opened" if event.assoc.is_acceptor else "the same association"
    print("N-EVENT-REPORT on", how, "- Event Type ID", event.request.EventTypeID,
          "- transaction", info.TransactionUID[-12:])
    for item in info.get("ReferencedSOPSequence", []):
        print("  committed:", item.ReferencedSOPInstanceUID[-12:])
    for item in info.get("FailedSOPSequence", []):
        print("  FAILED:   ", item.ReferencedSOPInstanceUID[-12:], "reason 0x%04X" % item.FailureReason)
    answered.set()
    return 0x0000, None


# 1. Listen for the answer first: it may arrive on a new association the archive opens to us.
listener = AE(ae_title=MY_AET)
listener.add_supported_context(StorageCommitmentPushModel, scu_role=True, scp_role=True)
server = listener.start_server(("0.0.0.0", MY_PORT), block=False,
                               evt_handlers=[(evt.EVT_N_EVENT_REPORT, on_event_report)])

# 2. Build the request: one Transaction UID, one reference per image.
refs = []
for path in sorted(Path(sys.argv[1]).glob("*.dcm")):
    ds = pydicom.dcmread(path, stop_before_pixels=True)
    ref = Dataset()
    ref.ReferencedSOPClassUID, ref.ReferencedSOPInstanceUID = ds.SOPClassUID, ds.SOPInstanceUID
    refs.append(ref)
missing = Dataset()  # an image the archive never received
missing.ReferencedSOPClassUID, missing.ReferencedSOPInstanceUID = UltrasoundImageStorage, generate_uid()
refs.append(missing)

request = Dataset()
request.TransactionUID = generate_uid()
request.ReferencedSOPSequence = refs

# 3. Send N-ACTION (Action Type ID 1 = Request Storage Commitment) and release.
ae = AE(ae_title=MY_AET)
ae.add_requested_context(StorageCommitmentPushModel)
host, port, aet = ARCHIVE
assoc = ae.associate(host, port, ae_title=aet)
status = None
if assoc.is_established:
    status, _ = assoc.send_n_action(request, 1, StorageCommitmentPushModel, WELL_KNOWN_INSTANCE)
    if assoc.is_established:
        assoc.release()  # the machine may hang up; the answer can come later

if status is None or "Status" not in status or status.Status != 0x0000:
    print("request refused or aborted: nothing is committed; keep the images")
else:
    print("N-ACTION status 0x0000 (request received, not yet committed)")
    if not answered.wait(30):
        print("no answer within 30 s: nothing is committed; keep the images")
server.shutdown()
```

Run `python commit.py synthetic`. Port 11112 listens on all interfaces so the container can reach it, and the script closes it when it finishes. The output looks like this (UIDs shortened; the two lines can swap places if the archive answers very quickly):

```text
N-ACTION status 0x0000 (request received, not yet committed)
N-EVENT-REPORT on a new association the archive opened - Event Type ID 2 - transaction 274652139485
  committed: 363830582304
  committed: 428110609037
  committed: 136219343201
  FAILED:    581102146516 reason 0x0112
```

Read it against Figure 9.1. The N-ACTION status came first and promised nothing. The answer arrived on an association Orthanc opened back to you. Event Type 2 says failures exist: the three real images are committed, and the invented one failed with `0112`, "No such SOP Instance."

Then break it:
- **Remove the made-up instance** (delete the `refs.append(missing)` line) and run again. You get Event Type ID `1`, with all three committed.
- **Make yourself unknown.** Start Orthanc again without the `labscu` entry in `ORTHANC__DICOM_MODALITIES`, store the images, and rerun. The script prints `request refused or aborted`, and `docker logs labpacs` shows Orthanc rejected the N-ACTION because `LABSCU` "is not listed in configuration option DicomModalities". An archive that can't call you back can't answer you, so this one refuses up front. Other archives may accept the request and then never answer. A careful machine treats both outcomes the same way: nothing is committed, keep everything.

## In Lumen

This chapter sets the rule for what "stored" has to mean when Lumen receives images from machines. In the planned design (Chapter 21), the ultrasound machine's DICOM peer is the facility gateway, not Lumen itself. If the machine asks for storage commitment, the **gateway** answers it. The gateway may only say "committed" for an image when one of two things is true:

- **The gateway has kept it durably itself**, on storage it is responsible for, until Lumen confirms it has the image (store-and-forward). The commitment is the gateway's own promise.
- **Lumen has confirmed it.** That means the image is in Lumen's object storage *and* its database record exists. In Lumen's Media service the database row is the source of truth, so an object in the bucket with no row is not "kept" in any useful sense.

The design has to follow a few more rules:

- **Commit by SOP Instance UID.** A re-sent image with the same UID must not become a second copy, and a request listing it must get the same answer both times.
- **Commitment is about safekeeping, not matching.** An image that arrives with no matching exam goes to the hold queue (Chapter 22), and it is still stored. It can be committed, because the image is safe even while a person decides which exam it belongs to.
- **Never commit early.** "We'll write it in a moment" is how a disk failure becomes lost images that the machine has already deleted.

Lumen itself does not answer storage commitment today. All of this is the design the gateway path has to meet.

## How it fails

- **The answer never arrives.** The archive can't open the second association: the machine is missing from its address book, has the wrong port, or a firewall blocks the connection. The machine waits, times out, and correctly keeps the study. But studies pile up on its disk, and someone eventually deletes them by hand.
- **Deleting on C-STORE success.** A machine set to delete after "sent" rather than "committed" loses the only copy of any image the archive later fails to keep.
- **Committing too early.** An archive or gateway that answers "committed" before its write is durable has made a promise it can't keep. Nothing on the wire can detect this; only testing can (Chapters 23 and 27).
- **Partial results ignored.** An Event Type 2 handled as "done" leaves the failed instances unstored and, if the machine deletes them, gone.
- **Reused Transaction UIDs.** A sender that reuses a Transaction UID gets `0131`, Duplicate Transaction UID, or a confused answer matched to the wrong request.
- **The wrong AE title on the callback.** An archive that calls back under a different AE title than the one the machine sent to may be rejected by the machine. The standard requires the same AE title on both associations.

## Evidence

You understand this chapter when you can take one commitment exchange and show:
- the Transaction UID in the request and in the answer;
- which association each message travelled on;
- which instances were committed, which failed, and why.

You can also state, for a system you are building, exactly which durable write has to finish before it may say "committed."

## Workbook

1. An archive returns status `0000` to every C-STORE and to the N-ACTION. Has it committed to keeping the images? What message would tell you?
2. Why does the standard require an SCP to be able to send the N-EVENT-REPORT on a different association, and what does that require from the network and the machine's configuration?
3. A machine asks for commitment on 40 images and gets Event Type ID 2 with 38 in the Referenced SOP Sequence. What is in the rest of the report, and what should the machine do?
4. In the planned Lumen design, the gateway receives the machine's commitment request. Give the two conditions under which it may answer "committed" for an image.
5. An image arrives with an accession number that matches no exam, and goes to the hold queue. Should it be committed? Explain.

## Answers

1. No. C-STORE `0000` means each image was accepted, and N-ACTION `0000` means only that the commitment request was received (see "Sent is not kept" and "The Push Model"). The commitment is the later N-EVENT-REPORT with the same Transaction UID. Event Type ID 1 says every listed instance is committed; Event Type ID 2 lists failures.
2. The SCP may need time to write images to durable storage, and the machine is free to release the first association as soon as it has the N-ACTION response. So the standard lets the answer come later, on an association the SCP opens itself (§J.3.3.1.2–3, Figure 9.1). That only works if the archive knows the machine's AE title, IP address and port, no firewall blocks the archive's outbound connection, and the machine is listening as an SCP for that SOP class.
3. The two remaining instances are in the Failed SOP Sequence, each with a Failure Reason such as `0112` (no such instance) or `0213` (resource limitation). Every requested instance appears in exactly one list (see "The answer: N-EVENT-REPORT"). The machine should keep all 40 locally, re-send the two failed images, and request commitment again with a new Transaction UID (Figure 9.2). It may delete only the instances an archive has explicitly committed, never because some answer arrived.
4. Either the gateway itself holds the image durably and takes responsibility for it until Lumen confirms receipt, or Lumen has confirmed that the image is both in its object storage and recorded in its database, which is the Media service's source of truth (see "In Lumen"). In both cases the durable write must finish before the answer goes out.
5. Yes, once it is durably stored. Commitment promises safekeeping, not that the image has been filed to the right exam. The image in the hold queue is stored and waiting for a person to resolve its match (Chapter 22). Refusing to commit would only make the machine keep, and probably re-send, an image that is already safe.

<p class="sources">Sources: DICOM PS3.4 §J.3 (Storage Commitment Push Model SOP Class): §J.3.1 (DIMSE-N services), §J.3.2 Table J.3-1 (N-ACTION request, Action Type ID 1, Transaction UID, Referenced SOP Sequence, N-ACTION status meaning), §J.3.3 Table J.3-2 (N-EVENT-REPORT Event Types 1 and 2, Failed SOP Sequence, Storage Level 2, different-association rules, same AE title), §J.3.4 (SOP Class UID), §J.3.5 (well-known SOP Instance UID); PS3.3 §C.14.1.1 (Failure Reason values); PS3.7 §10 (DIMSE-N). pynetdicom 3.0 documentation (N-ACTION, N-EVENT-REPORT handlers, role selection). Lab run against orthancteam/orthanc:24.10.1 (Orthanc 1.12.4), whose storage commitment SCP answered on a new association, with pydicom 3.0.1 and pynetdicom 3.0.1.</p>
