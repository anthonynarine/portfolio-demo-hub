---
number: 2
title: PACS, modalities, worklists: who's who on an imaging network
objective: Name every system a study touches, say which language each one speaks (HL7 or DICOM), and place a reporting system like Lumen on that map.
status: draft
---

## At the machine

From the scanner, the imaging network looks like two buttons and a list. The list is the worklist: today's patients, already typed in. The buttons are *Start* and *End Exam*. Everything else happens somewhere you never see.

Walk out of the scan room and the picture fills in. A clerk registered the patient at the front desk. A physician placed the order in the EHR. A scheduler gave it a time slot. When you press End Exam, the study goes to PACS, and the reading physician opens it at a workstation in another building. Later, the signed report appears in the patient's chart.

Each of those steps is a different computer system, often from a different vendor, and they don't all speak the same language. This chapter is the map: who the systems are, what each one is responsible for, and which of them talk DICOM and which talk HL7.

## On the wire

### The cast

<div class="pairs">
<div><span>Modality</span><p>The device that acquires images: an ultrasound system, a CT scanner, an MR scanner. In DICOM it is identified by its modality code, <code>US</code> for ultrasound. It asks for the worklist, reports progress and sends images.</p></div>
<div><span>EHR</span><p>The electronic health record. It holds the patient's chart, and it is usually where the order is placed and where the final report ends up.</p></div>
<div><span>RIS</span><p>The radiology (or departmental) information system. It schedules the procedure, tracks its status and often owns the accession number. In some departments the EHR plays this role.</p></div>
<div><span>Worklist broker</span><p>The component that turns scheduled orders into a DICOM Modality Worklist the machine can query. It may be a feature of the RIS, of PACS, or a separate product.</p></div>
<div><span>PACS</span><p>The picture archiving and communication system: an archive that receives and stores images over DICOM, plus the viewers that let physicians read them.</p></div>
<div><span>VNA</span><p>A vendor neutral archive: a long-term, enterprise-wide archive that several departments' PACS (and other image sources) store into, so images outlive any one PACS.</p></div>
<div><span>Interface engine</span><p>The switchboard for HL7 messages. It receives messages from one system, transforms and routes them to others, and queues them when a receiver is down.</p></div>
<div><span>Reporting system</span><p>Where the technologist's worksheet and the physician's report are written and signed. In vascular labs this is often its own system. Lumen is one.</p></div>
</div>

Real departments merge and split these roles. A large PACS may include a worklist broker and a viewer; a small lab may run the worklist straight out of the reporting system. What doesn't change is the set of *jobs*: register, order, schedule, publish the worklist, acquire, store, view, report, return the result.

### Two languages

Two standards carry almost all of this traffic, and they divide the work cleanly.

**HL7 version 2** carries *events about patients and orders*, as text messages between information systems:

| Message | Meaning | Typical sender → receiver |
|---|---|---|
| `ADT` (for example `ADT^A04`) | A patient was registered or their details changed | EHR → RIS, reporting system |
| `ORM^O01` | A new order, or a change to one | EHR → RIS, reporting system |
| `SIU` | A scheduling event: booked, moved, cancelled | Scheduling system → RIS |
| `ORU^R01` | A result: here is the report | Reporting system → EHR |

These messages travel over TCP using MLLP framing, usually through the interface engine. Chapter 3 follows them through a study, and the companion HIPAA handbook covers securing them.

**DICOM** carries *images and imaging workflow*, between modalities and imaging systems:

| Service | Meaning | Typical SCU → SCP |
|---|---|---|
| C-FIND (Modality Worklist) | Who is scheduled on this machine? | Modality → worklist broker |
| MPPS | The exam started; the exam finished | Modality → RIS or PACS |
| C-STORE | Here is an image; keep it | Modality → PACS |
| Storage Commitment | Do you now take responsibility for these images? | Modality → PACS |
| C-FIND / C-MOVE | Find a prior study; send it to a workstation | Viewer → PACS |

The rule of thumb: **HL7 moves between information systems, DICOM moves between imaging systems, and the worklist broker is where the two meet.** It receives the order as HL7 and publishes it as a DICOM worklist entry.

<figure class="diagram">
<svg viewBox="0 0 720 360" role="img" aria-label="HL7 links connect the EHR, interface engine, RIS and reporting system; DICOM links connect the modality, worklist broker and PACS, with the worklist broker bridging the two.">
<defs><marker id="ch02-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="20" y="28" class="muted">HL7 v2 (information systems)</text>
<rect x="20" y="44" width="140" height="52" rx="4" class="box"/>
<text x="90" y="75" text-anchor="middle">EHR</text>
<rect x="290" y="44" width="140" height="52" rx="4" class="box"/>
<text x="360" y="75" text-anchor="middle">Interface engine</text>
<rect x="560" y="44" width="140" height="52" rx="4" class="box"/>
<text x="630" y="75" text-anchor="middle">RIS</text>
<line x1="160" y1="62" x2="290" y2="62" marker-end="url(#ch02-arrow)"/>
<text x="225" y="55" text-anchor="middle" class="small">ADT, ORM</text>
<line x1="290" y1="80" x2="160" y2="80" marker-end="url(#ch02-arrow)"/>
<text x="225" y="96" text-anchor="middle" class="small">ORU</text>
<line x1="430" y1="70" x2="560" y2="70" marker-end="url(#ch02-arrow)"/>
<text x="495" y="63" text-anchor="middle" class="small">ORM</text>
<rect x="290" y="150" width="140" height="52" rx="4" class="box accent"/>
<text x="360" y="181" text-anchor="middle">Reporting system</text>
<line x1="345" y1="96" x2="345" y2="150" marker-end="url(#ch02-arrow)"/>
<text x="338" y="128" text-anchor="end" class="small">ADT, ORM</text>
<line x1="375" y1="150" x2="375" y2="96" marker-end="url(#ch02-arrow)"/>
<text x="382" y="128" class="small">ORU</text>
<rect x="560" y="150" width="140" height="52" rx="4" class="box"/>
<text x="630" y="181" text-anchor="middle">Worklist broker</text>
<line x1="630" y1="96" x2="630" y2="150" marker-end="url(#ch02-arrow)"/>
<text x="637" y="128" class="small">orders</text>
<line x1="20" y1="232" x2="700" y2="232" class="dashed"/>
<text x="20" y="254" class="muted">DICOM (imaging systems)</text>
<rect x="20" y="280" width="140" height="52" rx="4" class="box"/>
<text x="90" y="311" text-anchor="middle">Ultrasound</text>
<rect x="290" y="280" width="140" height="52" rx="4" class="box"/>
<text x="360" y="311" text-anchor="middle">PACS</text>
<line x1="160" y1="306" x2="290" y2="306" marker-end="url(#ch02-arrow)"/>
<text x="225" y="298" text-anchor="middle" class="small">C-STORE, MPPS</text>
<path d="M160,290 C320,250 480,250 560,190" marker-end="url(#ch02-arrow)"/>
<text x="470" y="268" text-anchor="middle" class="small">C-FIND (worklist)</text>
<line x1="360" y1="280" x2="360" y2="202" class="dashed" marker-end="url(#ch02-arrow)"/>
<text x="367" y="246" class="small">images (planned)</text>
</svg>
<figcaption>Figure 2.1: The department map. HL7 messages connect the information systems along the top, DICOM connects the imaging systems along the bottom, and the worklist broker turns orders into worklist entries. The dashed link is how a reporting system gets images, the subject of Parts IV to VI.</figcaption>
</figure>

### Who is in charge of what

Each system is the *source of truth* for a different thing, and confusion starts when two systems both think they own the same fact.

| Fact | Usually owned by |
|---|---|
| Who the patient is (MRN, demographics) | EHR, through ADT |
| What was ordered, and its accession number | EHR or RIS, through ORM |
| When and where it is scheduled | RIS or scheduling system |
| The images, and their UIDs | The modality creates them; PACS keeps them |
| The measurements and the signed report | The reporting system |
| The report in the chart | EHR, after receiving ORU |

Notice the hand-offs. The modality didn't invent the patient's name; it copied it from the worklist, which copied it from the order, which came from registration. When a name is misspelled on an image, the fix belongs at the source, not in the image.

### Where a reporting system sits

A reporting system lives on both sides of the line. On the HL7 side, it needs to know the patient and the order (ADT, ORM in) and it must send the signed report back (ORU out). On the DICOM side, it needs the images, or at least the ones the physician will look at and the technologist will snip into the report.

There are two ways a reporting system usually gets images:

1. **From PACS.** The reporting system asks PACS for a study (C-FIND then C-MOVE, or DICOMweb, Chapter 19), or it simply links to the PACS viewer.
2. **From the machine, alongside PACS.** The modality sends each study to two destinations: PACS for the archive, and a second AE for the reporting system. Most ultrasound systems can be configured with several storage destinations.

Either way, the reporting system is *not* the archive of record. PACS or the VNA is. That shapes the design later: the reporting system keeps what it needs for reporting and can always point back to the archive.

## Lab

**Draw your department's map.** No scanner needed, just what you know or can ask.

1. Copy the boxes from Figure 2.1 onto paper. Cross out any your department doesn't have; merge any that are one product where you work.
2. For each arrow, write which way it goes and whether it is HL7 or DICOM. If you don't know, mark it with a question mark. Those question marks are your questions for the PACS administrator or interface analyst.
3. Find where the accession number is created. Ask: is it assigned by the EHR when the order is placed, or by the RIS when it is scheduled? Write that system's name on the arrow that carries it.
4. If your machine sends to more than one storage destination (Chapter 1's lab found this list), add each destination as a box.

Keep the drawing. Chapter 3 walks one study across it, and every later chapter adds detail to one of its arrows.

## In Lumen

Lumen is a reporting system, the accent box in Figure 2.1. Today it holds exams, measurements and signed reports, and its images arrive only one way: a person uploads them into an exam from the browser.

The rest of the map is where Lumen is going:

- **HL7 in and out.** Orders and registrations arriving as HL7, and the signed report going back to the chart as `ORU`, are their own integration subsystem. This book covers the DICOM side; the HL7 side is a separate story.
- **Images in (planned).** The design is for each facility to run a small DICOM gateway that the machines send to, which forwards the images to Lumen over HTTPS. Chapter 16 explains why the gateway exists; Part VI builds the path.

## How it fails

- **Two owners for one fact.** A technologist corrects a patient's name on the machine. PACS now disagrees with the EHR, and the next ADT update doesn't reach the image. Fix demographics at the source.
- **The missing bridge.** Orders flow into the RIS, but the worklist broker was never configured for a new room. The machine's worklist is empty, technologists type patients in by hand, and typos follow.
- **Silent interface queue.** The interface engine stops delivering ORU messages to the EHR. Reports are signed but never reach the chart, and nobody notices until a physician asks where the result is.
- **"PACS has it, so we have it."** A reporting system that only links to PACS can't show images when PACS is down, and can't snip what it can't fetch.

## Evidence

You understand this chapter when you can point at any arrow on your department map and say: which standard it uses, which system starts the conversation, and which system is the source of truth for the data on it.

## Workbook

1. Which system is the source of truth for the patient's name, and how does that name reach the image header?
2. A reporting system needs to know about an exam before the images arrive. Which HL7 message tells it, and who sends it?
3. Give one advantage and one disadvantage of a machine sending each study to both PACS and the reporting system, compared with the reporting system fetching images from PACS.
4. On your map, which single component would stop the most work if it went down? What would technologists do instead?

## Answers

1. The EHR owns the patient's name: registration creates it, and ADT messages carry it to the other information systems. The RIS includes it with the order, the worklist broker publishes it in the Modality Worklist entry, and the machine copies it from the entry the technologist selects into every image header. See "Who is in charge of what"; that chain is why a misspelled name must be fixed at the EHR, not in the image.
2. The order message, `ORM^O01`, sent by the EHR (often relayed by the interface engine). It carries the MRN and the accession number, so the reporting system can create the exam and later match images and send the result back. See the HL7 table in "Two languages".
3. Advantage: the reporting system has the images as soon as the machine sends them, and doesn't depend on PACS being up or reachable. Disadvantage: there are now two copies to configure and keep consistent, and a send that succeeds to PACS can fail to the reporting system (or the other way round) without either side knowing. See "Where a reporting system sits".
4. This depends on your department, but it is usually the worklist broker or the interface engine. Without the broker, technologists type patients in by hand and identifiers drift; without the interface engine, orders stop arriving and reports stop reaching the chart, often silently. See "How it fails".

<p class="sources">Sources: DICOM PS3.4 (Modality Worklist, Modality Performed Procedure Step, Storage Commitment and Query/Retrieve Service Classes); PS3.3 §C.7.3.1 (General Series Module: Modality); PS3.18 (DICOMweb); HL7 Version 2 messaging standard (ADT, ORM, SIU, ORU message types); IHE Radiology Technical Framework, Scheduled Workflow integration profile.</p>
