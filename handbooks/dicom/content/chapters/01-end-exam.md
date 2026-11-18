---
number: 1
title: What happens when you press End Exam
objective: See the imaging network you already use every day, and name its parts, so that every later chapter has somewhere to land.
status: draft
---

## At the machine

For seventeen years, the end of every study looked the same to me. Last image, review the clips, press **End Exam**. A moment later the study was in PACS, and the reading physician could open it from anywhere in the hospital. I never typed the patient's name into PACS. I never told it which exam the images belonged to. It just knew.

That "it just knew" is a DICOM network doing its job. This book is about what happens in the moment between pressing the button and the images appearing, because that moment is exactly what an application has to reproduce if it wants to receive images from a scanner.

## On the wire

### Every device is an Application Entity

On a DICOM network, every participant is an **Application Entity (AE)**: the ultrasound machine, PACS, a reporting system, a gateway. An AE is described by three settings, and only three:

<div class="pairs">
<div><span>AE title</span><p>A short name, at most 16 characters: <code>US_ROOM3</code>, <code>PACS_MAIN</code>.</p></div>
<div><span>IP address</span><p>Where the AE lives on the network.</p></div>
<div><span>Port</span><p>The door it listens on. DICOM's well-known port is 104; the registered alternative is 11112.</p></div>
</div>

Somewhere in your machine's setup menu, PACS is entered as exactly those three values. That entry is the entire "configuration" of a DICOM destination. There is no URL.

### Two roles: who asks, who answers

In every conversation, one side starts and the other listens:

- **SCU** (Service Class User): the side that initiates. When the machine sends images, it is the SCU.
- **SCP** (Service Class Provider): the side that is listening and provides the service. PACS is the SCP for storage.

A device can play both roles in different conversations. For an application to receive images from a scanner, it has to be an **SCP**: a service that is always listening on a port, waiting to be called.

### The handshake: an association

No image moves until the two sides agree on terms. This negotiation is called an **association**:

> **Machine:** "I'm `US_ROOM3`, calling `PACS_MAIN`. I'd like to send ultrasound images and ultrasound cine, encoded as JPEG or uncompressed."
>
> **PACS:** "I know you. I'll accept ultrasound images, uncompressed only."

If PACS doesn't recognize the caller's AE title, or can't accept what the caller proposes, it rejects the association and nothing is sent. A "failed to send" on a new machine very often dies right here, before a single image has moved.

<figure class="diagram">
<svg viewBox="0 0 720 230" role="img" aria-label="The ultrasound machine, as SCU, opens an association with PACS, sends one C-STORE per image, then releases the association.">
<defs><marker id="ch01-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="30" width="190" height="170" rx="4" class="box"/>
<text x="115" y="96" text-anchor="middle" class="bold">Ultrasound machine</text>
<text x="115" y="120" text-anchor="middle">US_ROOM3</text>
<text x="115" y="142" text-anchor="middle" class="small muted">SCU · calls out</text>
<rect x="510" y="30" width="190" height="170" rx="4" class="box accent"/>
<text x="605" y="96" text-anchor="middle" class="bold">PACS</text>
<text x="605" y="120" text-anchor="middle">PACS_MAIN</text>
<text x="605" y="142" text-anchor="middle" class="small muted">SCP · 10.0.0.20 : 104</text>
<text x="360" y="54" text-anchor="middle" class="small">1. A-ASSOCIATE request: who I am, what I will send</text>
<line x1="210" y1="64" x2="508" y2="64" marker-end="url(#ch01-arrow)"/>
<text x="360" y="90" text-anchor="middle" class="small">2. Accepted: what I will take</text>
<line x1="510" y1="100" x2="212" y2="100" marker-end="url(#ch01-arrow)"/>
<text x="360" y="126" text-anchor="middle" class="small">3. C-STORE, once per still or clip</text>
<line x1="210" y1="136" x2="508" y2="136" marker-end="url(#ch01-arrow)" class="accent"/>
<text x="360" y="162" text-anchor="middle" class="small">4. Release</text>
<line x1="210" y1="172" x2="508" y2="172" marker-end="url(#ch01-arrow)" class="dashed"/>
</svg>
<figcaption>Figure 1.1 — Pressing End Exam: the machine calls PACS by AE title, IP and port, agrees terms, sends every image, and hangs up.</figcaption>
</figure>

### Four services cover most of it

<div class="pairs">
<div><span>C-ECHO</span><p>"Are you there?" The <em>Verify</em> or <em>Test connection</em> button in the machine's network setup.</p></div>
<div><span>C-STORE</span><p>"Here is one image; keep it." End Exam sends one C-STORE per still or cine clip.</p></div>
<div><span>C-FIND</span><p>"Who's on the schedule?" How the machine's patient list fills itself in (Modality Worklist).</p></div>
<div><span>MPPS</span><p>"I started this exam" / "I finished it." Status messages the machine sends quietly in the background (Chapter 8).</p></div>
</div>

### Every image carries its own label

Each object the machine sends is the picture plus a header of **tags**, numbered pairs that say what the picture is:

| Tag | Name | What it tells the receiver |
|---|---|---|
| (0010,0010) | Patient's Name | Who |
| (0010,0020) | Patient ID | The MRN |
| (0008,0050) | Accession Number | Which order or exam |
| (0020,000D) | Study Instance UID | Ties every image of one study together |
| (0008,0060) | Modality | `US` for ultrasound |

This is how PACS "just knew." The machine copied those values from the worklist entry I selected at the start of the study, and stamped them on every image it sent.

<figure class="diagram">
<svg viewBox="0 0 720 200" role="img" aria-label="Patient and order values flow from the worklist entry, through the machine, into the header of every image it sends.">
<defs><marker id="ch01-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="30" width="190" height="140" rx="4" class="box"/>
<text x="115" y="60" text-anchor="middle" class="bold">Worklist entry</text>
<text x="40" y="92" class="small">Patient's Name</text>
<text x="40" y="114" class="small">Patient ID (MRN)</text>
<text x="40" y="136" class="small">Accession Number</text>
<rect x="265" y="55" width="190" height="90" rx="4" class="box"/>
<text x="360" y="95" text-anchor="middle" class="bold">Machine</text>
<text x="360" y="117" text-anchor="middle" class="small muted">tech selects the patient</text>
<rect x="510" y="30" width="190" height="140" rx="4" class="box accent"/>
<text x="605" y="60" text-anchor="middle" class="bold">Every image header</text>
<text x="530" y="92" class="small">(0010,0010) (0010,0020)</text>
<text x="530" y="114" class="small">(0008,0050) Accession</text>
<text x="530" y="136" class="small">(0020,000D) Study UID</text>
<line x1="210" y1="100" x2="263" y2="100" marker-end="url(#ch01-arrow2)"/>
<text x="237" y="88" text-anchor="middle" class="small">C-FIND</text>
<line x1="455" y1="100" x2="508" y2="100" marker-end="url(#ch01-arrow2)"/>
<text x="482" y="88" text-anchor="middle" class="small">stamps</text>
</svg>
<figcaption>Figure 1.2 — Why PACS "just knows": the machine copies the worklist values into the header of every image it sends.</figcaption>
</figure>

## Lab

**Find your machine's DICOM address book.** On an ultrasound system you're allowed to look at (with your PACS or biomed team's permission), open the network or DICOM configuration screen. Without changing anything, write down:

1. The machine's own AE title.
2. Each destination: its AE title, IP address, port, and what it's for (storage, worklist, MPPS, storage commitment).
3. Whether a *Verify* or *Echo* button exists, and what it reports when pressed.

You'll recognize every field from this chapter. In Chapter 4 you'll run an SCP of your own and press "Verify" against it from a terminal.

## In Lumen

Lumen is the reporting platform this book uses as its case study. Today its images arrive only through a browser upload. To receive images the way PACS does, something has to be an SCP that machines can call. In the planned design that SCP is a gateway inside the facility, which forwards the images to Lumen over HTTPS. Part VI describes that design, and Part IV explains why the SCP doesn't sit on the open internet.

## How it fails

- **Unknown caller.** The receiver rejects an AE title it hasn't been told about. Typical for a new or renamed machine.
- **Nothing in common.** The machine proposes only compressed cine and the receiver accepts only uncompressed: the association succeeds, but those objects are refused (Figure 1.1, step 2).
- **Right door, wrong house.** A correct AE title with the wrong IP or port times out, and looks exactly like the receiver being down.

## Evidence

You understand this chapter when you can draw, for one study at your lab, which AE called which, on what port, and which tags tied each image to the patient and the order.

## Workbook

1. When the machine sends images to Lumen, which side is the SCU and which is the SCP?
2. A new machine's first send to PACS fails, but every other room sends fine. Using the association handshake, give two likely causes.
3. Why can PACS file an image under the right patient without anyone typing the patient's name into PACS?

## Answers

1. The machine starts the conversation, so it is the **SCU**; whatever listens on a port and accepts the images is the **SCP**. In the design this book builds toward (Part VI), the machine actually calls a gateway inside the facility, which is the SCP; Lumen then receives the images from that gateway over HTTPS, so Lumen itself never has to listen for DICOM calls from the internet.
2. Look at the handshake in Figure 1.1. If PACS has not been told about the new machine's AE title, it rejects the association at step 1 ("unknown caller"). If the machine has PACS's AE title right but the IP address or port wrong, the call never reaches PACS and times out. And if the two sides share no SOP class and encoding they both accept, the association may succeed while the images themselves are refused at step 2. The other rooms working tells you PACS is up, which points at this one machine's entries.
3. Because the values travel inside every image (Figure 1.2). At the start of the study the technologist picked the patient from the worklist, and the machine copied Patient's Name, Patient ID and Accession Number into the header of every image it created, along with a Study Instance UID that ties them together. PACS reads those tags when it stores the image.

<p class="sources">Sources: DICOM PS3.5 §6.2 (AE value representation, 16 bytes maximum); PS3.6 (data dictionary: tag names); PS3.7 (DIMSE services: C-ECHO, C-STORE, C-FIND); PS3.8 §9.1.1 (port 104 and registered port 11112); PS3.4 (Modality Worklist and MPPS service classes).</p>
