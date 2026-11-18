---
number: 5
title: Associations: the handshake before every image
objective: Read an association negotiation line by line, tell an association-level rejection from a presentation-context rejection, and say who ends the conversation and how.
status: draft
---

## At the machine

Most of the time the network is invisible. You end the exam and the queue drains: a little counter on the machine's status bar goes from 42 to 0. Occasionally the counter stops. The job list shows one study stuck on "sending" or "failed", and the machine retries every few minutes, each time with the same result. Someone from IT asks for the log, and in it are words like *association rejected*, *no presentation context*, or *aborted*.

Those words describe the conversation that happens every time the machine sends anything, even a single still: a negotiation before any image moves, the data, and then a polite goodbye (or an abrupt hang-up). Chapter 1 called it the handshake. This chapter takes it apart.

## On the wire

### Everything travels in PDUs

Once a TCP connection is open, the two sides exchange **Protocol Data Units (PDUs)**, the messages of the DICOM Upper Layer protocol (PS3.8). There are only seven:

| Type | PDU | Sent by | Means |
|---|---|---|---|
| 01H | A-ASSOCIATE-RQ | requestor | "Here's who I am, who I want, and what I'd like to do." |
| 02H | A-ASSOCIATE-AC | acceptor | "Agreed, on these terms." |
| 03H | A-ASSOCIATE-RJ | acceptor | "No." |
| 04H | P-DATA-TF | either | A piece of a DICOM message (a command or a data set). |
| 05H | A-RELEASE-RQ | either (normally requestor) | "I'm done; let's close." |
| 06H | A-RELEASE-RP | the other side | "Agreed, closing." |
| 07H | A-ABORT | either | "Stop now." No agreement needed. |

The side that opens the TCP connection is the **association requestor**; the side that was listening is the **acceptor**. By default the requestor is the SCU and the acceptor the SCP (PS3.7 §D.3.3.4); Chapter 7 shows the cases where roles are negotiated differently.

<figure class="diagram">
<svg viewBox="0 0 720 470" role="img" aria-label="Sequence of one association: TCP connect, A-ASSOCIATE-RQ, A-ASSOCIATE-AC, P-DATA-TF messages for the request and response, A-RELEASE-RQ, A-RELEASE-RP, then the requestor closes the connection.">
<defs><marker id="ch05-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="60" y="20" width="180" height="44" rx="4" class="box"/>
<text x="150" y="47" text-anchor="middle">Requestor (SCU)</text>
<rect x="480" y="20" width="180" height="44" rx="4" class="box"/>
<text x="570" y="47" text-anchor="middle">Acceptor (SCP)</text>
<line x1="150" y1="64" x2="150" y2="450" class="dashed"/>
<line x1="570" y1="64" x2="570" y2="450" class="dashed"/>
<line x1="150" y1="95" x2="570" y2="95" marker-end="url(#ch05-arrow)" class="dashed"/>
<text x="360" y="88" text-anchor="middle" class="small muted">TCP connect (acceptor starts ARTIM)</text>
<line x1="150" y1="140" x2="570" y2="140" marker-end="url(#ch05-arrow)" class="accent"/>
<text x="360" y="133" text-anchor="middle" class="small">A-ASSOCIATE-RQ: titles, contexts, max PDU</text>
<line x1="570" y1="185" x2="150" y2="185" marker-end="url(#ch05-arrow)" class="accent"/>
<text x="360" y="178" text-anchor="middle" class="small">A-ASSOCIATE-AC: result per context</text>
<line x1="150" y1="235" x2="570" y2="235" marker-end="url(#ch05-arrow)"/>
<text x="360" y="228" text-anchor="middle" class="small">P-DATA-TF: C-ECHO-RQ / C-STORE-RQ</text>
<line x1="570" y1="280" x2="150" y2="280" marker-end="url(#ch05-arrow)"/>
<text x="360" y="273" text-anchor="middle" class="small">P-DATA-TF: response with status</text>
<text x="360" y="312" text-anchor="middle" class="small muted">(repeat for every image)</text>
<line x1="150" y1="345" x2="570" y2="345" marker-end="url(#ch05-arrow)"/>
<text x="360" y="338" text-anchor="middle" class="small">A-RELEASE-RQ</text>
<line x1="570" y1="390" x2="150" y2="390" marker-end="url(#ch05-arrow)"/>
<text x="360" y="383" text-anchor="middle" class="small">A-RELEASE-RP</text>
<text x="162" y="430" class="small muted">requestor closes TCP</text>
</svg>
<figcaption>Figure 5.1 — One association from connect to release. The negotiation (highlighted) happens once; many requests and responses can follow before the release.</figcaption>
</figure>

### What the request carries

The A-ASSOCIATE-RQ has a fixed header and then a list of items (PS3.8 §9.3.2):

- **Called and Calling AE titles**, each in a 16-byte field. This is where Chapter 4's titles actually travel, and why a longer title gets cut off.
- **Application Context Name.** Always the same UID for DICOM: `1.2.840.10008.3.1.1.1`. It says "we are speaking DICOM".
- **One or more presentation contexts** (next section).
- **User Information**, with sub-items: the **Maximum Length** the requestor can receive (required), its **Implementation Class UID** (required: a UID identifying the software, PS3.7 §D.3.3.2), optionally an **Implementation Version Name**, and optional negotiations such as role selection and user identity.

### Presentation contexts: one proposal per kind of thing

A **presentation context** pairs one *abstract syntax* (what will be sent, usually a SOP class such as Verification or Ultrasound Image Storage) with one or more *transfer syntaxes* (how it will be encoded). Chapter 6 covers both in detail; for now, treat them as "what" and "how".

Each context has an ID, an **odd number from 1 to 255** (PS3.8 Table 9-13), so one association can propose at most 128 of them. A machine that may send ultrasound stills, cine loops and a structured report proposes at least three contexts, often more, because it proposes the same SOP class several times with different encodings.

The acceptor answers **every context separately** in its A-ASSOCIATE-AC (PS3.8 Table 9-18):

| Result | Meaning |
|---|---|
| 0 | acceptance (and the one transfer syntax chosen) |
| 1 | user-rejection |
| 2 | no-reason (provider rejection) |
| 3 | abstract-syntax-not-supported (provider rejection) |
| 4 | transfer-syntaxes-not-supported (provider rejection) |

This is the most important idea in the chapter: **an accepted association can still be useless.** If every context comes back rejected, the association succeeded but nothing can be sent on it. If only the cine context is rejected, the stills go and the loops don't.

### Maximum PDU length

Each side tells the other the largest P-DATA-TF it is willing to receive (PS3.7 §D.3.3.1, PS3.8 Annex D.1). A value of 0 means "no limit". Messages bigger than the limit are cut into pieces; a 40 MB cine clip travels as thousands of P-DATA-TF PDUs. A sender that ignores the receiver's limit has committed a protocol error, and the receiver will abort.

### Rejection: who said no, and why

If the acceptor refuses the whole association, it sends an A-ASSOCIATE-RJ with three numbers (PS3.8 §9.3.4, Table 9-21):

<div class="pairs">
<div><span>Result</span><p>1 = rejected-permanent ("don't retry until something changes"); 2 = rejected-transient ("try again later").</p></div>
<div><span>Source</span><p>1 = the DICOM service-user (the application said no); 2 = the service-provider, ACSE related; 3 = the service-provider, presentation related.</p></div>
<div><span>Reason</span><p>From the user: 1 no-reason-given, 2 application-context-name-not-supported, 3 calling-AE-title-not-recognized, 7 called-AE-title-not-recognized. From the ACSE provider: 2 protocol-version-not-supported. From the presentation provider: 1 temporary-congestion, 2 local-limit-exceeded.</p></div>
</div>

So "Rejected Permanent, Source: Service User, Reason: Called AE Title Not Recognized", the line you saw in Chapter 4, decodes as: the receiving application read your request and won't accept it as long as you keep asking for that title.

### Release, abort, and the ARTIM timer

A normal ending is a **release**: one side (normally the requestor) sends A-RELEASE-RQ, the other answers A-RELEASE-RP, and the requestor closes the TCP connection. A release is a handshake: both sides agree the work is done.

An **A-ABORT** is a hang-up. Either side can send it at any time; there is no reply. Its *source* says who aborted: 0 = the DICOM service-user (the application chose to), 2 = the service-provider (the protocol layer found something wrong), with reasons such as unrecognized-PDU, unexpected-PDU, or invalid-PDU-parameter value (PS3.8 §9.3.8, Table 9-26). Anything in flight is lost. A sender that sees an abort mid-study cannot assume the last image was stored.

The **ARTIM timer** (Association Request/Reject/Release Timer, PS3.8 §9.1.2, §9.1.5, §9.2.2) keeps half-finished conversations from holding connections open forever. The acceptor starts it the moment a TCP connection arrives; if no A-ASSOCIATE-RQ shows up before it expires, the connection is closed. It runs again after a side sends a reject, a release reply or an abort, so a peer that never closes its end gets disconnected. Its value must be configurable. It is not a timeout for slow image transfers; those are governed by each product's own network and DIMSE timeouts.

## Lab

Reuse the Orthanc container from Chapter 4's step 6 (calling-title checks on, `US_ROOM3` known). If you removed it, run step 6 again.

**1. Watch a full negotiation.** `-d` turns on debug output:

```bash
echoscu -d -aet US_ROOM3 -aec LUMEN_LAB localhost 4242
```

Find the two blocks between `BEGIN A-ASSOCIATE-RQ` and `END A-ASSOCIATE-AC`. Trimmed, they look like this:

```text
D: ====================== BEGIN A-ASSOCIATE-RQ =====================
D: Our Implementation Class UID:      1.2.276.0.7230010.3.0.3.6.7
D: Our Implementation Version Name:   OFFIS_DCMTK_367
D: Application Context Name:    1.2.840.10008.3.1.1.1
D: Calling Application Name:    US_ROOM3
D: Called Application Name:     LUMEN_LAB
D: Our Max PDU Receive Size:    16384
D: Presentation Contexts:
D:   Context ID:        1 (Proposed)
D:     Abstract Syntax: =VerificationSOPClass
D:     Proposed SCP/SCU Role: Default
D:     Proposed Transfer Syntax(es):
D:       =LittleEndianImplicit
...
D: PDU Type: Associate Accept, PDU Length: 184 + 6 bytes PDU header
D:   02  00  00  00  00  b8  00  01  00  00  4c  55  4d  45  4e  5f
...
D: Their Max PDU Receive Size:  16384
D:   Context ID:        1 (Accepted)
D:     Abstract Syntax: =VerificationSOPClass
D:     Accepted Transfer Syntax: =LittleEndianImplicit
D: ======================= END A-ASSOCIATE-AC ======================
I: Association Accepted (Max Send PDV: 16372)
I: Sending Echo Request (MsgID 1)
I: Received Echo Response (Success)
I: Releasing Association
```

Match each line to Figure 5.1. The raw bytes start with `02`, the PDU type of an A-ASSOCIATE-AC; `4c 55 4d 45 4e 5f` is ASCII for `LUMEN_`, the start of the called title. "Max Send PDV" is a little under Orthanc's 16384-byte limit because each piece carries its own small headers.

**2. Propose several contexts.** `-ppc` makes echoscu propose the Verification class in several presentation contexts at once:

```bash
echoscu -v -ppc 3 -aet US_ROOM3 -aec LUMEN_LAB localhost 4242
echoscu -d -ppc 3 -aet US_ROOM3 -aec LUMEN_LAB localhost 4242 | grep "Context ID"
```

You should see context IDs 1, 3 and 5: odd numbers, answered one by one.

**3. Provoke an association-level rejection.** You did this in Chapter 4; do it once more and decode it with the table above:

```bash
echoscu -v -aet NOBODY -aec LUMEN_LAB localhost 4242
```

**4. Provoke a presentation-context rejection.** Restart Orthanc so that its storage service accepts only one encoding, Explicit VR Little Endian (UID `1.2.840.10008.1.2.1`):

```bash
docker rm -f dicom-lab
docker run -d --name dicom-lab \
  -p 127.0.0.1:4242:4242 -p 127.0.0.1:8042:8042 \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  -e ORTHANC__DICOM_AET=LUMEN_LAB \
  -e ORTHANC__DICOM_CHECK_CALLED_AET=true \
  -e ORTHANC__DICOM_ALWAYS_ALLOW_ECHO=false \
  -e ORTHANC__DICOM_ALWAYS_ALLOW_STORE=false \
  -e 'ORTHANC__DICOM_MODALITIES={"us_room3": ["US_ROOM3", "127.0.0.1", 104]}' \
  -e 'ORTHANC__ACCEPTED_TRANSFER_SYNTAXES=["1.2.840.10008.1.2.1"]' \
  orthancteam/orthanc:24.10.1
```

You need a file to send. Chapter 6's lab builds a synthetic one with Python (`synthetic_us.dcm`); jump there for step 1 of that lab, then come back. Send it while proposing only Implicit VR Little Endian (`-xi`), and only the context the file needs (`-R`); `+v` prints the contexts:

```bash
storescu -v +v -R -xi -aet US_ROOM3 -aec LUMEN_LAB localhost 4242 synthetic_us.dcm
```

```text
I: Association Parameters Negotiated:
I: Presentation Contexts:
I:   Context ID:        1 (Abstract Syntax Not Supported)
I:     Abstract Syntax: =UltrasoundImageStorage
F: No Acceptable Presentation Contexts
```

The association itself was **accepted**: titles were fine. Then the one context it proposed was rejected, so there was nothing to send on. Notice the reason Orthanc chose: "abstract syntax not supported", although the real problem was the encoding (result 4, transfer-syntaxes-not-supported, would have been more precise). Products differ in which reason they report, so read the reason as a hint and check the contexts themselves. Now send again proposing Explicit VR Little Endian (`-xe`) and it succeeds.

This configuration is deliberately broken: as Chapter 6 explains, every DICOM implementation is required to accept the default encoding, Implicit VR Little Endian. A real receiver set up like this would be non-conformant. Restore the normal container (Chapter 4, step 6) before moving on.

**5. Abort instead of releasing.**

```bash
echoscu -v --abort -aet US_ROOM3 -aec LUMEN_LAB localhost 4242
```

The last line changes from `Releasing Association` to `Aborting Association`. For an echo nothing is lost; for a store in progress, everything not yet acknowledged would be.

## In Lumen

In the planned design, the association with the machine ends at the facility gateway, not at Lumen. That matters for two reasons. First, all the negotiation in this chapter (which SOP classes, which encodings, which callers) is configured on the gateway, close to the machines and the people who manage them. Second, the gateway accepts the image, acknowledges it to the machine, and only later forwards it to Lumen over HTTPS. A successful C-STORE response from the gateway therefore means "the gateway has it", not "Lumen has it". Chapter 9 (Storage Commitment) and Chapter 20 return to what that gap means and how to close it.

## How it fails

- **Accepted but empty.** The association is accepted, every presentation context is rejected, and the sender logs "no acceptable presentation contexts". The titles are fine; the "what" or "how" doesn't match. Compare the proposed and accepted contexts in a debug log.
- **Partly accepted.** Stills arrive and cine loops don't, because only the cine context (a different SOP class or a compressed transfer syntax) was rejected. Users report "some images are missing".
- **Rejected transient.** The receiver is overloaded or at a connection limit (presentation-related source, reason temporary-congestion or local-limit-exceeded). Retrying later is the right response.
- **Abort mid-study.** A network drop, a protocol error, or a receiver giving up. The sender must resend anything without a success response.
- **PDU size mismatch.** A sender that ignores the negotiated maximum length triggers an abort from the receiver, usually only with large objects, so stills work and long cine loops fail.

## Evidence

You understand this chapter when you can take a debug log of a failed send and say: whether the TCP connection opened, whether the association was accepted or rejected (and by whom, for what reason), which presentation contexts were proposed and which were accepted, and whether the association ended by release or abort.

## Workbook

1. An association is accepted but the sender logs "No Acceptable Presentation Contexts". What was accepted, what was not, and where in the log do you look?
2. Decode: "Result: Rejected Transient, Source: Service Provider (Presentation), Reason: Local Limit Exceeded". Should the machine retry?
3. Why are presentation context IDs odd numbers, and what is the most a single association can propose?
4. A cine clip transfer is aborted halfway through. Can the sender assume the earlier stills in the same association were stored?
5. What is the ARTIM timer protecting against on the acceptor's side?

## Answers

1. The association itself was accepted: the titles and application context passed. Every proposed presentation context was rejected, so there was no agreed "what and how" to send on. Look at the A-ASSOCIATE-AC block in the debug output, where each context ID shows Accepted or a rejection reason, as in lab step 4 and the "Presentation contexts" section.
2. The acceptor's protocol layer (presentation-related source) refused because a local resource limit was reached, and the result is transient. Yes, retrying later is appropriate; nothing about the configuration is wrong. See the rejection table under "Rejection: who said no, and why".
3. PS3.8 defines presentation-context IDs as odd integers between 1 and 255, so there are 128 possible values and at most 128 contexts per association. The "Presentation contexts" section and lab step 2 show the numbering.
4. It can trust only what was acknowledged: every still that received a success C-STORE response is stored by the receiver; the cine clip in flight is not, and must be resent. An A-ABORT gives no guarantees about anything unacknowledged (see "Release, abort, and the ARTIM timer").
5. Connections that are opened and then go nowhere. The acceptor starts ARTIM when a TCP connection arrives and closes it if no A-ASSOCIATE-RQ arrives in time; it runs again after a reject, release reply or abort so a peer that never closes its end is disconnected. PS3.8 §9.1.2 and §9.2.2 define it.

<p class="sources">Sources: DICOM PS3.8 §9.1.1–9.1.5 (TCP use, ARTIM timer), §9.2.2 (state machine actions), §9.3.1–9.3.8 and Tables 9-11 to 9-26 (PDU types, A-ASSOCIATE-RQ structure, presentation context results, A-ASSOCIATE-RJ and A-ABORT values), Annex D.1 (maximum length negotiation); PS3.7 Annex A.2.1 and PS3.6 Table A-1 (DICOM Application Context Name 1.2.840.10008.3.1.1.1), §D.3.3.1 (maximum length, required), §D.3.3.2 (Implementation Class UID required, version name optional), §D.3.3.4 (default roles). Lab output captured with DCMTK 3.6.7 against <code>orthancteam/orthanc:24.10.1</code>.</p>
