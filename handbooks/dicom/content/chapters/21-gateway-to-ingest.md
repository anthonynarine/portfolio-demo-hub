---
number: 21
title: Gateway to ingest to storage
objective: Trace one image from the machine's C-STORE to a stored, browser-viewable file in Lumen, and name the check that happens at every hop.
status: draft
---

## At the machine

From the technologist's side, nothing in this chapter is visible. You press End Exam, the send queue on the machine empties, and a few seconds later the images are in front of the reading physician. If it works, it is invisible. If it doesn't, the first person to notice is usually a physician asking where the images are.

That is the standard an ingest pipeline has to meet: the person at the machine should never need to know that a second system exists. Every safety check this chapter adds has to happen behind the gateway, without slowing down the send queue and without making the technologist resend anything by hand.

The rest of this chapter is the Lumen case study. Everything in it about receiving images from machines is **planned design**, not running code. Today, images reach Lumen only one way: a person uploads them into an exam in the browser. The design below is what replaces that upload with the machine itself.

## On the wire

### The whole system first

Before following one image hop by hop, place the image path inside the facility. Figure 21.1 shows every system that touches a study, from the order to the viewer. The numbers match the five steps listed under it. On the website, select any part of the figure to see what it does.

<figure class="diagram">
<svg viewBox="0 0 720 490" role="img" aria-label="Planned architecture. Inside the facility network: the EHR sends HL7 orders to an interface engine, which forwards them to Lumen, where they create exams; the same order reaches the RIS or worklist broker, which the ultrasound machine queries with C-FIND; the machine sends C-STORE to the facility gateway and its own copy to the hospital PACS. The gateway keeps the original, queues it, and sends STOW-RS over mutual TLS on port 443 to Lumen's DICOM ingest, which takes the organization from the certificate and matches images to exams by accession number, then hands them to Media and the exam image viewer.">
<defs><marker id="ch21-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="8" y="24" width="452" height="456" rx="6" class="dashed"/>
<text x="20" y="44" class="muted small">Facility network (hospital LAN)</text>
<rect x="476" y="24" width="236" height="456" rx="6" class="dashed"/>
<text x="488" y="44" class="muted small">Lumen (cloud)</text>
<line x1="140" y1="80" x2="260" y2="80" marker-end="url(#ch21-arrow)"/>
<text x="200" y="72" text-anchor="middle" class="small">HL7 ORM / ADT</text>
<line x1="400" y1="80" x2="500" y2="80" marker-end="url(#ch21-arrow)"/>
<text x="428" y="72" text-anchor="middle" class="small">HL7 order</text>
<circle cx="428" cy="96" r="9" class="box"/>
<text x="428" y="100" text-anchor="middle" class="small bold">1</text>
<line x1="80" y1="104" x2="80" y2="150" marker-end="url(#ch21-arrow)"/>
<text x="88" y="132" class="small">order</text>
<line x1="60" y1="270" x2="60" y2="206" marker-end="url(#ch21-arrow)"/>
<line x1="100" y1="206" x2="100" y2="270" marker-end="url(#ch21-arrow)" class="dashed"/>
<circle cx="160" cy="214" r="9" class="box"/>
<text x="160" y="218" text-anchor="middle" class="small bold">2</text>
<text x="176" y="232" class="small">C-FIND query (up)</text>
<text x="176" y="248" class="small">worklist entries (down)</text>
<line x1="140" y1="298" x2="200" y2="298" marker-end="url(#ch21-arrow)"/>
<text x="170" y="290" text-anchor="middle" class="small">C-STORE</text>
<text x="170" y="314" text-anchor="middle" class="small muted">automatic</text>
<circle cx="170" cy="334" r="9" class="box"/>
<text x="170" y="338" text-anchor="middle" class="small bold">3</text>
<polyline points="80,326 80,438 200,438" fill="none" marker-end="url(#ch21-arrow)"/>
<text x="140" y="432" text-anchor="middle" class="small">C-STORE</text>
<line x1="600" y1="104" x2="600" y2="262" marker-end="url(#ch21-arrow)" class="dashed"/>
<text x="608" y="180" class="small muted">accession</text>
<text x="608" y="194" class="small muted">to match</text>
<line x1="600" y1="342" x2="600" y2="366" marker-end="url(#ch21-arrow)"/>
<line x1="600" y1="406" x2="600" y2="428" marker-end="url(#ch21-arrow)"/>
<circle cx="488" cy="448" r="9" class="box"/>
<text x="488" y="452" text-anchor="middle" class="small bold">5</text>
<g class="part" data-part="ehr">
<rect x="20" y="56" width="120" height="48" rx="4" class="box"/>
<text x="80" y="84" text-anchor="middle">EHR / scheduler</text>
</g>
<g class="part" data-part="engine">
<rect x="260" y="56" width="140" height="48" rx="4" class="box"/>
<text x="330" y="84" text-anchor="middle">Interface engine</text>
</g>
<g class="part" data-part="exams">
<rect x="500" y="56" width="200" height="48" rx="4" class="box"/>
<text x="600" y="76" text-anchor="middle" class="bold">Exams</text>
<text x="600" y="94" text-anchor="middle" class="small muted">created from the HL7 order</text>
</g>
<g class="part" data-part="ris">
<rect x="20" y="150" width="120" height="56" rx="4" class="box"/>
<text x="80" y="174" text-anchor="middle">RIS or broker</text>
<text x="80" y="192" text-anchor="middle" class="small muted">worklist SCP</text>
</g>
<g class="part" data-part="ultrasound">
<rect x="20" y="270" width="120" height="56" rx="4" class="box"/>
<text x="80" y="292" text-anchor="middle">Ultrasound</text>
<text x="80" y="310" text-anchor="middle" class="small muted">AE US_ROOM3</text>
</g>
<g class="part" data-part="gateway">
<rect x="200" y="262" width="200" height="130" rx="4" class="box"/>
<text x="300" y="286" text-anchor="middle" class="bold">Facility gateway</text>
<text x="300" y="306" text-anchor="middle" class="small">Storage SCP</text>
<text x="300" y="322" text-anchor="middle" class="small muted">AE LUMEN_GATEWAY, port 11112</text>
<text x="300" y="342" text-anchor="middle" class="small">keeps the original,</text>
<text x="300" y="358" text-anchor="middle" class="small">queues it, and retries</text>
<text x="300" y="374" text-anchor="middle" class="small">until Lumen confirms</text>
</g>
<g class="part" data-part="pacs">
<rect x="200" y="420" width="200" height="36" rx="4" class="box"/>
<text x="300" y="436" text-anchor="middle">Hospital PACS</text>
<text x="300" y="450" text-anchor="middle" class="small muted">archive of record</text>
</g>
<g class="part" data-part="stow">
<rect x="402" y="278" width="96" height="70" class="hit"/>
<line x1="400" y1="300" x2="500" y2="300" marker-end="url(#ch21-arrow)" class="accent"/>
<text x="428" y="292" text-anchor="middle" class="small accent">STOW-RS</text>
<text x="428" y="316" text-anchor="middle" class="small">mTLS, 443</text>
<circle cx="428" cy="336" r="9" class="box"/>
<text x="428" y="340" text-anchor="middle" class="small bold">4</text>
</g>
<g class="part" data-part="ingest">
<rect x="500" y="262" width="200" height="80" rx="4" class="box accent"/>
<text x="600" y="284" text-anchor="middle" class="bold">DICOM ingest</text>
<text x="600" y="304" text-anchor="middle" class="small">organization from certificate</text>
<text x="600" y="320" text-anchor="middle" class="small">match by accession,</text>
<text x="600" y="334" text-anchor="middle" class="small">else the hold queue</text>
</g>
<g class="part" data-part="media">
<rect x="500" y="366" width="200" height="40" rx="4" class="box"/>
<text x="600" y="382" text-anchor="middle" class="bold">Media</text>
<text x="600" y="398" text-anchor="middle" class="small muted">object storage + image record</text>
</g>
<g class="part" data-part="viewer">
<rect x="500" y="428" width="200" height="40" rx="4" class="box"/>
<text x="600" y="445" text-anchor="middle" class="bold">Exam image viewer</text>
<text x="600" y="460" text-anchor="middle" class="small muted">images appear as they arrive</text>
</g>
</svg>
<figcaption>Figure 21.1 — The planned architecture. Orders reach Lumen as HL7; the worklist stays with the hospital's RIS or broker; images stay DICOM inside the facility and cross into Lumen only as STOW-RS over mutual TLS. Adapted from an AI-drawn overview.</figcaption>
<dl class="figure-key">
<div data-part="ehr"><dt>EHR / scheduler</dt><dd>Where the study starts. Booking a carotid duplex creates an order with the patient's MRN and an accession number, sent out as HL7: ORM for the order, ADT for registration and arrival. Chapters 2 and 3.</dd></div>
<div data-part="engine"><dt>Interface engine</dt><dd>The hospital's message router. It copies each order to every system that needs it, translating fields on the way. For Lumen it forwards the order as HL7, which creates the exam. Chapter 3.</dd></div>
<div data-part="exams"><dt>Exams</dt><dd>The order becomes an exam in Lumen, carrying the accession number. That number is what later ties incoming images to this exam. Chapter 22.</dd></div>
<div data-part="ris"><dt>RIS or worklist broker</dt><dd>The worklist SCP. It turns orders into Modality Worklist entries and answers the machine's C-FIND query, so the technologist picks the patient instead of typing them in. Lumen does not provide a worklist. Chapter 8.</dd></div>
<div data-part="ultrasound"><dt>Ultrasound machine</dt><dd>The SCU: it starts every exchange. It queries the worklist, reports progress with MPPS, and at End Exam sends the images with C-STORE to both the gateway and PACS. Its AE title, here US_ROOM3, names it but proves nothing about who it is. Chapters 4, 7 and 14.</dd></div>
<div data-part="gateway"><dt>Facility gateway</dt><dd>A Storage SCP inside the hospital, AE LUMEN_GATEWAY on port 11112. It stores the original before acknowledging the machine, then forwards from a persistent queue and keeps retrying until Lumen confirms each instance. It can be a router the hospital already runs or a dedicated Orthanc. Chapters 16 and 20.</dd></div>
<div data-part="pacs"><dt>Hospital PACS</dt><dd>The archive of record. The machine keeps sending its usual copy here; Lumen is a reporting system, not a replacement for the archive. Chapter 2.</dd></div>
<div data-part="stow"><dt>STOW-RS over mutual TLS</dt><dd>The only hop that leaves the hospital: HTTPS on port 443, opened outbound by the gateway. Both sides present certificates, and the gateway's certificate is how Lumen knows which organization and facility is sending. Chapters 15, 19 and 21.</dd></div>
<div data-part="ingest"><dt>DICOM ingest</dt><dd>Lumen's front door for images. It takes the organization from the certificate, never from the DICOM tags, checks the SOP class, answers per instance, and matches each image to an exam by accession number, or puts it in the hold queue for a person to resolve. Chapters 21 and 22.</dd></div>
<div data-part="media"><dt>Media</dt><dd>Stores the original file in object storage and a database row for it. The row is the source of truth, and object keys carry no patient information. This part runs today, for uploaded images. Chapter 21.</dd></div>
<div data-part="viewer"><dt>Exam image viewer</dt><dd>Where the technologist and physician see the images inside the exam and cut snips for the report. It runs today for uploaded images; with the gateway, images appear as they arrive. Chapters 21 and 29.</dd></div>
</dl>
</figure>

The flow at a glance:

1. **Order created.** The EHR sends the order as HL7; the interface engine passes it to Lumen, which creates the exam with its accession number.
2. **Worklist query.** The machine asks the RIS or worklist broker for today's patients with C-FIND. Lumen is not in this exchange (Chapter 8).
3. **Scan and send.** At End Exam the machine sends C-STORE to the gateway automatically, and its usual copy to the hospital PACS. Lumen does not replace the archive of record.
4. **Secure transfer.** The gateway stores the original, queues it, and sends STOW-RS to Lumen over mutual TLS on port 443. It deletes nothing until Lumen confirms each instance (Chapter 20).
5. **Images in Lumen.** Ingest matches each image to its exam by accession number, or holds it for review; Media stores it, and it appears in the exam's viewer.

The gateway can be a router the hospital has already approved or a dedicated Orthanc deployment; either way it plays the same role. All of this is a design, and the real routing in any hospital needs its IT team's approval.

### The whole path, one hop at a time

Figure 21.2 shows the planned path. It crosses two networks and one trust boundary that matters more than all the others.

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="The planned path: the machine sends C-STORE to a gateway inside the facility; the gateway sends STOW-RS over mutual TLS to Lumen's ingest endpoint, which takes the organization from the gateway's certificate, then hands the validated object to Media, which writes the file to object storage and a database row.">
<defs><marker id="ch21-arrow-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="8" y="24" width="310" height="150" rx="6" class="dashed"/>
<text x="20" y="44" class="muted small">Facility network</text>
<rect x="414" y="24" width="298" height="268" rx="6" class="dashed"/>
<text x="426" y="44" class="muted small">Lumen</text>
<rect x="20" y="80" width="120" height="56" rx="4" class="box"/>
<text x="80" y="113" text-anchor="middle">Ultrasound</text>
<line x1="140" y1="108" x2="196" y2="108" marker-end="url(#ch21-arrow-b)"/>
<text x="168" y="100" text-anchor="middle" class="small">C-STORE</text>
<rect x="196" y="80" width="116" height="56" rx="4" class="box"/>
<text x="254" y="113" text-anchor="middle">Gateway</text>
<text x="254" y="158" text-anchor="middle" class="muted small">device certificate</text>
<line x1="312" y1="96" x2="430" y2="96" marker-end="url(#ch21-arrow-b)" class="accent"/>
<text x="366" y="88" text-anchor="middle" class="small">STOW-RS, mTLS</text>
<line x1="430" y1="124" x2="312" y2="124" marker-end="url(#ch21-arrow-b)" class="dashed"/>
<text x="366" y="146" text-anchor="middle" class="small">STOW response</text>
<rect x="430" y="80" width="130" height="56" rx="4" class="box accent"/>
<text x="495" y="113" text-anchor="middle">Ingest endpoint</text>
<text x="572" y="100" class="muted small">org from certificate,</text>
<text x="572" y="116" class="muted small">never from tags</text>
<line x1="495" y1="136" x2="495" y2="200" marker-end="url(#ch21-arrow-b)"/>
<text x="503" y="172" class="small">validated object</text>
<rect x="430" y="200" width="130" height="56" rx="4" class="box"/>
<text x="495" y="233" text-anchor="middle">Media service</text>
<line x1="560" y1="210" x2="598" y2="210" marker-end="url(#ch21-arrow-b)"/>
<text x="579" y="204" text-anchor="middle" class="small">file</text>
<rect x="598" y="180" width="106" height="40" rx="4" class="box"/>
<text x="651" y="205" text-anchor="middle">Object storage</text>
<line x1="560" y1="246" x2="598" y2="246" marker-end="url(#ch21-arrow-b)"/>
<text x="579" y="240" text-anchor="middle" class="small">row</text>
<rect x="598" y="236" width="106" height="40" rx="4" class="box"/>
<text x="651" y="261" text-anchor="middle">Database row</text>
</svg>
<figcaption>Figure 21.2 — The planned path. DICOM stays inside the facility; only HTTPS with mutual TLS crosses the internet, and the ingest endpoint is where Lumen decides who is sending.</figcaption>
</figure>

<div class="pairs">
<div><span>Hop 1</span><p>The machine sends C-STORE to the gateway over the facility's own network, exactly as it would send to PACS (Chapter 7). The machine never talks to Lumen directly.</p></div>
<div><span>Hop 2</span><p>The gateway forwards each object to Lumen with STOW-RS, the DICOMweb store transaction (Chapter 19), over HTTPS with mutual TLS (Chapter 15). The gateway presents its own certificate.</p></div>
<div><span>Hop 3</span><p>The ingest endpoint authenticates the gateway, resolves the organization and facility from that identity, and validates the object before anything is stored.</p></div>
<div><span>Hop 4</span><p>The Media service writes the original file to object storage and records a database row. The row, not the bucket, is the source of truth.</p></div>
<div><span>Hop 5</span><p>Browser renditions (a PNG for a still, an MP4 for a cine clip) are made from the stored original, and the exam's image pane shows them.</p></div>
</div>

### Hop 2: what the gateway actually sends

STOW-RS is an HTTP `POST`. The body is `multipart/related` with one part per DICOM file, each part typed `application/dicom`. PS3.18 §10.5 defines two targets: `/studies`, which accepts instances from any number of studies, and `/studies/{study}`, which requires every instance in the request to carry that Study Instance UID.

```text
POST /dicomweb/studies HTTP/1.1
Host: ingest.example.org
Content-Type: multipart/related; type="application/dicom"; boundary=XyZ
Accept: application/dicom+json

--XyZ
Content-Type: application/dicom

<bytes of one Part 10 file>
--XyZ--
```

The gateway can batch many instances into one request or send them one at a time. The design should accept both, but a gateway configured to send small batches makes failures cheaper: a refused request costs a few images, not a whole study.

### Hop 3: the checks at the door

The ingest endpoint is the trust boundary. Everything before it is the facility's network and the facility's equipment; everything after it is Lumen's data, scoped to one organization. So the order of checks matters:

1. **Who is sending.** The TLS handshake has already proven the gateway holds the private key for its certificate. The endpoint looks that certificate up in a registry of gateway identities: each identity belongs to exactly one organization and one facility, and can be revoked. An unknown or revoked certificate gets nothing stored, and the reason is recorded as a security event.
2. **Tenant from the credential.** The organization and facility come from that registry entry. Institution Name (0008,0080), Station Name (0008,1010) and every other tag are claims written by the machine. Chapter 17 is the full argument; the short form is that anyone who can edit a tag can otherwise choose which customer they are.
3. **Size.** Reject any part above a configured limit before reading it into memory. Ultrasound cine can be large, so the limit is a deliberate number, not a default.
4. **Parse safely.** Parse the file with a hardened DICOM library, in a process that can fail without taking down the endpoint. Check the preamble and `DICM` prefix and the file meta group (Chapter 10). Never trust a length field enough to allocate from it.
5. **What kind of object.** Compare SOP Class UID (0008,0016) to an allow-list. For a vascular lab that is a short list: Ultrasound Image Storage (`1.2.840.10008.5.1.4.1.1.6.1`), Ultrasound Multi-frame Image Storage (`1.2.840.10008.5.1.4.1.1.3.1`), and, when Lumen reads measurements, the Structured Report classes the lab's machines actually send (Chapter 13). Anything else is refused with a reason, not stored "just in case".
6. **Required identifiers.** SOP Instance UID (0008,0018), Study Instance UID (0020,000D), Series Instance UID (0020,000E) and Accession Number (0008,0050) must be present and well-formed (Chapter 11). A missing accession is not a failure: the object is stored and held for a person (Chapter 22).

### Hop 4: the row is the source of truth

Media writes the original bytes to object storage under a key that contains no patient information: a random identifier plus an extension, never a filename and never a name. Then it records the database row: organization, facility, the identifiers above, size, a content hash, and the object's state. This is how Lumen's browser uploads already work today: the database row is authoritative, and a file in the bucket with no row is unreachable and can be cleaned up.

The order matters for failure. Write the object first, then the row, in the same unit of work as the response. If the row fails, the object is orphaned and invisible, which is safe. The reverse, a row pointing at bytes that were never written, would show a physician an exam with a broken image.

### Hop 5: renditions come from the original

Browsers can't display DICOM. Lumen already shows uploaded stills, cine and DICOM files in the exam's image pane, so the planned ingest path feeds that same pane: in the design, a background job reads the stored original, makes a PNG or an MP4 (Chapter 12 covers frames, photometric interpretation and frame timing), and stores the rendition as a derived object linked to the original row. The original is never modified. If a rendition is wrong, delete it and make it again.

### Idempotency: the same image, sent twice

Gateways retry. A network blip after Lumen stored an object but before the gateway read the response means the gateway sends it again. The SOP Instance UID is the natural idempotency key: it identifies one image, globally and permanently.

| Second arrival of the same SOP Instance UID | What ingest does |
|---|---|
| Same organization, same content hash | Success, no new row. The retry is harmless. |
| Same organization, different content | Refuse that instance and record it. Two different images must not share a UID; something upstream is broken. |
| Different organization | Refuse it, and treat it as a security event. The other tenant's row is never revealed or touched. |

The uniqueness rule belongs in the database: a constraint on (organization, SOP Instance UID). A check in application code alone loses a race between two retries arriving at once.

### Partial failure: answering per instance

One STOW request can carry fifty instances, and forty-nine can be fine. PS3.18 §10.5.3 defines the answers:

| HTTP status | Meaning (PS3.18 Table 10.5.3-1) |
|---|---|
| `200` OK | All instances stored. |
| `202` Accepted | Some stored; warnings or failures exist for others, described in the body. |
| `400` Bad Request | Nothing stored: bad syntax. |
| `409` Conflict | Well-formed, but nothing could be stored; per-instance reasons are in the body. |
| `415` Unsupported Media Type | The Content-Type isn't one the server accepts. |

The response body is the Store Instances Response Module (PS3.18 Annex I). Stored instances are listed in Referenced SOP Sequence (0008,1199); refused ones in Failed SOP Sequence (0008,1198), each with a Failure Reason (0008,1197). The Annex I codes include `0110` processing failure, `0122` SOP Class not supported, `C122` transfer syntax not supported, `A7xx` out of resources and `A9xx` data set does not match SOP class. Answering precisely lets the gateway retry only what can succeed: retry an `A7xx`, never retry a `0122`.

### The per-instance lifecycle

<figure class="diagram">
<svg viewBox="0 0 720 220" role="img" aria-label="Each instance moves from received to validated to stored, and then either matches one exam or is held for a person. A bad file or a disallowed object is rejected and never stored.">
<defs><marker id="ch21-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="70" width="120" height="48" rx="4" class="box"/>
<text x="80" y="99" text-anchor="middle">Received</text>
<line x1="140" y1="94" x2="190" y2="94" marker-end="url(#ch21-arrow2)"/>
<text x="165" y="86" text-anchor="middle" class="small">parses</text>
<rect x="190" y="70" width="120" height="48" rx="4" class="box"/>
<text x="250" y="99" text-anchor="middle">Validated</text>
<line x1="310" y1="94" x2="360" y2="94" marker-end="url(#ch21-arrow2)"/>
<text x="335" y="86" text-anchor="middle" class="small">written</text>
<rect x="360" y="70" width="120" height="48" rx="4" class="box"/>
<text x="420" y="99" text-anchor="middle">Stored</text>
<line x1="480" y1="84" x2="560" y2="56" marker-end="url(#ch21-arrow2)"/>
<text x="514" y="60" text-anchor="middle" class="small">1 exam</text>
<line x1="480" y1="104" x2="560" y2="140" marker-end="url(#ch21-arrow2)"/>
<text x="514" y="138" text-anchor="middle" class="small">0 or many</text>
<rect x="560" y="30" width="140" height="48" rx="4" class="box"/>
<text x="630" y="59" text-anchor="middle">Matched</text>
<rect x="560" y="120" width="140" height="48" rx="4" class="box accent"/>
<text x="630" y="149" text-anchor="middle">Held</text>
<line x1="630" y1="120" x2="630" y2="78" marker-end="url(#ch21-arrow2)" class="dashed"/>
<text x="638" y="104" class="small">resolved</text>
<rect x="190" y="160" width="120" height="44" rx="4" class="box dashed"/>
<text x="250" y="187" text-anchor="middle">Rejected</text>
<line x1="80" y1="118" x2="190" y2="176" marker-end="url(#ch21-arrow2)"/>
<text x="112" y="160" text-anchor="middle" class="small">bad file</text>
<line x1="250" y1="118" x2="250" y2="160" marker-end="url(#ch21-arrow2)"/>
<text x="258" y="144" class="small">not allowed</text>
</svg>
<figcaption>Figure 21.3 — One instance's states. Rejected objects are never stored; stored objects either match exactly one exam or wait in the hold queue.</figcaption>
</figure>

Each state change is a row update with a timestamp, so "where is this image?" always has an answer.

### Audit without PHI

Every hop writes an audit event: gateway authenticated, instance received, refused and why, stored, matched or held. The event carries identifiers that are not about the patient: the gateway identity, the organization, the internal media row id, the SOP Instance UID, the status code. It does not carry the patient's name, MRN, birth date or the accession number into general-purpose logs. The companion HIPAA handbook covers the difference between security telemetry and a record of who touched ePHI; the design keeps the two apart.

## Lab

**STOW to a stand-in receiver and read the per-instance answer.** You'll stand in for Lumen with an Orthanc that has the DICOMweb plugin, and play the gateway yourself with `curl`, so you can see real STOW responses. Synthetic data only.

1. Start an Orthanc with DICOMweb enabled (as in Chapter 19, but with authentication off, only because this is a throwaway local lab):

```bash
docker run --rm -p 8042:8042 -p 4242:4242 \
  -e DICOM_WEB_PLUGIN_ENABLED=true \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  orthancteam/orthanc:24.10.1
```

2. Make one synthetic ultrasound file with the generator from Chapter 23 (or any synthetic file from earlier labs) and STOW it with `curl`:

```bash
curl -s -X POST http://localhost:8042/dicom-web/studies \
  -H 'Content-Type: multipart/related; type="application/dicom"' \
  -H 'Accept: application/dicom+json' \
  -F "file=@synthetic-us.dcm;type=application/dicom" -w '\nHTTP %{http_code}\n'
```

`curl -F` builds a multipart body; the explicit header changes its type to `multipart/related`. Read the JSON that comes back: find tag `00081199` (Referenced SOP Sequence) and the SOP Instance UID inside it.

3. Send the same file again. Does the server answer success again, or a failure? Write down what it did; that is one server's idempotency policy, and you now know to ask any receiver what theirs is.

4. Send a text file as `application/dicom`. Find Failed SOP Sequence (`00081198`) and the Failure Reason in the answer, or the status code if the server refused the whole request.

## In Lumen

What exists today: the Media service stores uploaded stills, cine and DICOM files in S3-compatible object storage, with the database row as the source of truth; every request is scoped to an organization and facility; object keys contain no patient information; an exam's image pane shows what was uploaded; and a technologist can cut a labelled snip for the Final Report.

What is planned, in this chapter's order: a gateway identity registry tied to one organization and facility; an ingest endpoint that speaks STOW-RS over mutual TLS and answers per instance; the SOP class allow-list; the per-instance states of Figure 21.3; idempotency on (organization, SOP Instance UID) enforced by the database; and renditions made from the stored original by a background job.

## How it fails

- **Tenant taken from the tags.** A gateway, or anyone holding its certificate, writes another hospital's Institution Name and the images land in that hospital's account. Prevented only by Hop 3's rule: the credential decides.
- **One bad image fails a whole study.** The endpoint answers `400` to a fifty-image request because one part was malformed; the gateway retries all fifty forever. Prevented by per-instance answers and `202`.
- **Row and file disagree.** A crash between the bucket write and the row leaves an orphan (harmless, cleanable). The reverse order leaves a broken image in front of a physician (harmful). Write the file first.
- **Retries make duplicates.** Without a uniqueness constraint, two simultaneous retries create two rows for one image, and the report shows it twice.
- **PHI in the logs.** A helpful debug line prints the patient's name from the header. Logs are copied, shipped and kept longer than anyone expects.

## Evidence

You understand this chapter when you can take one synthetic image and show, for each hop in Figure 21.2, the record that proves it happened: the gateway's send log, the TLS identity the endpoint saw, the organization it resolved, the STOW response listing that SOP Instance UID, the database row and its state, and the object key in storage that contains no patient information.

## Workbook

1. Why is Hop 3, not Hop 4, the place where the organization is decided?
2. A STOW request carries 20 instances; 19 are valid and one has an unknown SOP class. What HTTP status should the endpoint return, and what does the gateway learn from the body?
3. The same SOP Instance UID arrives twice from the same gateway with different content hashes. What do you do, and why not keep the newer one?
4. Give two reasons the original file is never edited, even to fix a wrong tag.
5. Write one audit event for "instance stored" that would let you trace the image later without containing any PHI.

## Answers

1. Hop 3 is the trust boundary: it is the first point where Lumen knows, from the TLS handshake and the identity registry, who is sending. Everything after it, including where Media stores the file, depends on that decision, so it has to be made before anything is written. Deciding later would mean storing an object before knowing whose it is. See "Hop 3: the checks at the door".
2. `202` Accepted: 19 instances were stored and one failed. The body lists the 19 in Referenced SOP Sequence (0008,1199) and the refused one in Failed SOP Sequence (0008,1198) with Failure Reason `0122` (SOP Class not supported). From that, the gateway knows not to retry the failed one, because retrying can't succeed. See "Partial failure: answering per instance".
3. Refuse the second instance and record it as an error, leaving the first one untouched. A SOP Instance UID must identify exactly one image, so two different images sharing one means something upstream is broken. Silently keeping the newer one would change an image a physician may already have read, and would erase the evidence of the problem. See the idempotency table.
4. The original is the evidence of what the machine actually sent, so editing it destroys that record. Renditions can always be remade from an unchanged original, but never from an edited one. Corrections belong in Lumen's records (Chapter 22), not inside the file. See "Hop 5: renditions come from the original".
5. Something like: `{event: "instance.stored", at: <timestamp>, gateway: <gateway id>, organization: <org id>, facility: <facility id>, media_id: <row id>, sop_instance_uid: <uid>, sop_class: "US Image", size_bytes: <n>, sha256: <hash>}`. It has no name, MRN, birth date or accession number, yet the media row id and SOP Instance UID let an authorized person find the image and its patient through Lumen. See "Audit without PHI".

<p class="sources">Sources: DICOM PS3.18 §10.5 (Store transaction: target resources, Table 10.5.3-1 status codes) and Annex I (Store Instances Response Module, Table I.1-1 attributes, Tables I.2-1 and I.2-2 warning and failure reasons); PS3.4 Annex B (Storage Service Class, SOP Class UIDs); PS3.10 §7 (file preamble, DICM prefix, file meta information); PS3.6 (tag names); Orthanc Book, Docker images (orthancteam/orthanc, environment configuration, DICOMweb plugin).</p>
