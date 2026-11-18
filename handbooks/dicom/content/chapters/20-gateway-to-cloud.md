---
number: 20
title: Gateway-to-cloud patterns
objective: Design the link between a facility and a cloud service so that images get there exactly once, survive outages, and never require opening the hospital to the internet.
status: draft
---

## At the machine

The scanner doesn't know or care where the cloud is. It sends to an AE title on the local network, gets its C-STORE successes, and moves on to the next patient. That is how it should be. A technologist shouldn't have to wait for a wide-area network, and a busy Monday morning shouldn't stall because an internet link is slow.

So something in the facility has to take the images fast and locally, then get them to the cloud reliably and patiently, even if the link is down for an hour. That something is the gateway (Chapter 16). This chapter is about its outward-facing half: how it moves images across the internet to a cloud service, and what both ends must do so that nothing is lost or duplicated.

## On the wire

### Never let the cloud call in

The first decision is the direction of the connection. There are two ways to connect a facility and a cloud service:

- **Inbound to the facility:** the cloud reaches into the hospital, or the hospital's DICOM SCP is published on the internet so that anything can send to it.
- **Outbound from the facility:** a gateway inside the hospital opens HTTPS connections *out* to the cloud service. Nothing ever connects in.

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="Before: a DICOM SCP exposed to the internet accepts associations from anywhere. After: a gateway inside the facility pushes outbound over HTTPS with mutual TLS, and nothing connects in.">
<defs><marker id="ch20-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="20" y="24" class="muted">Before: SCP exposed</text>
<rect x="20" y="40" width="300" height="110" rx="4" class="box"/>
<text x="40" y="62" class="small">Facility network</text>
<rect x="40" y="76" width="120" height="50" rx="4" class="box"/>
<text x="100" y="106" text-anchor="middle">Ultrasound</text>
<rect x="400" y="76" width="140" height="50" rx="4" class="box"/>
<text x="470" y="106" text-anchor="middle">SCP on internet</text>
<line x1="160" y1="101" x2="400" y2="101" marker-end="url(#ch20-arrow)"/>
<text x="262" y="93" text-anchor="middle" class="small">C-STORE, port 104</text>
<rect x="590" y="40" width="110" height="40" rx="4" class="box"/>
<text x="645" y="65" text-anchor="middle" class="small">anyone</text>
<line x1="590" y1="70" x2="540" y2="88" marker-end="url(#ch20-arrow)"/>
<rect x="590" y="110" width="110" height="40" rx="4" class="box"/>
<text x="645" y="135" text-anchor="middle" class="small">scanner bots</text>
<line x1="590" y1="125" x2="540" y2="112" marker-end="url(#ch20-arrow)"/>
<line x1="20" y1="180" x2="700" y2="180" class="dashed"/>
<text x="20" y="206" class="muted">After: gateway pushes out</text>
<rect x="20" y="220" width="320" height="100" rx="4" class="box"/>
<text x="40" y="242" class="small">Facility network</text>
<rect x="40" y="256" width="120" height="50" rx="4" class="box"/>
<text x="100" y="286" text-anchor="middle">Ultrasound</text>
<rect x="200" y="256" width="120" height="50" rx="4" class="box accent"/>
<text x="260" y="286" text-anchor="middle">Gateway + queue</text>
<line x1="160" y1="281" x2="200" y2="281" marker-end="url(#ch20-arrow)"/>
<text x="180" y="250" text-anchor="middle" class="small">C-STORE</text>
<rect x="540" y="256" width="160" height="50" rx="4" class="box"/>
<text x="620" y="286" text-anchor="middle">Cloud ingest</text>
<line x1="320" y1="281" x2="540" y2="281" marker-end="url(#ch20-arrow)"/>
<text x="430" y="273" text-anchor="middle" class="small">STOW-RS, HTTPS + mTLS</text>
<text x="430" y="300" text-anchor="middle" class="muted">outbound only</text>
</svg>
<figcaption>Figure 20.1 — Before, the archive's SCP is reachable from the internet, so anyone can open an association, and an AE title proves nothing (Chapter 14). After, DICOM never leaves the facility; the gateway opens outbound HTTPS connections, and both ends prove who they are with certificates.</figcaption>
</figure>

Outbound-only wins for three reasons:

1. **The hospital's firewall stays closed.** Opening an inbound port means a security review, a change to the perimeter, and a new thing to monitor. Most hospital networks already allow outbound HTTPS.
2. **The protocol crossing the internet is HTTP, not DIMSE.** HTTPS comes with mature TLS, client certificates, proxies and monitoring. DICOM's own network protocol has no authentication of its own (Chapter 14), and TLS for DIMSE is less widely configured on equipment (Chapter 15).
3. **The facility controls the pace.** The gateway decides when to send and how fast, and can hold work when the link is down.

A **pull** variant also exists: the gateway polls the cloud asking "is there work for me?" (for example, priors to fetch). It is still outbound. The rule is about who opens the connection, not which way the data flows.

### Both ends prove who they are: mutual TLS

Ordinary TLS proves the *server's* identity to the client. In **mutual TLS (mTLS)**, the client presents a certificate too, and the server refuses the connection before any HTTP request is read unless that certificate was issued to a device it knows.

For a facility gateway, that certificate *is* the gateway's identity. It is issued to one gateway at one facility, it can be revoked if the box is stolen or retired, and it is checked on every connection. Chapter 17 builds on this: because the credential says which facility is calling, the cloud service can decide which organization the images belong to *from the connection*, never from the tags inside the images.

### Exactly once, from at-least-once

Networks fail in the worst possible place: after the server stored the instance, but before the client heard back. The client doesn't know whether the send worked, so it must retry. That means every sender is **at-least-once**: it will sometimes send the same instance twice.

The receiver turns that into "exactly once" by making the store **idempotent**: storing the same thing twice has the same effect as storing it once. DICOM hands you the idempotency key for free: the **SOP Instance UID** (0008,0018), which is unique to exactly one image or clip (Chapter 11).

| The receiver sees | It should |
|---|---|
| A new SOP Instance UID | Store it and report success |
| A SOP Instance UID it already has, same content | Report success again, store nothing new |
| A SOP Instance UID it already has, *different* content | Not overwrite silently; flag it for a person, because something upstream is wrong |

The third row matters. Two different images with the same UID mean a device or a gateway is generating UIDs badly, or an image was edited without a new UID. Accepting the newer one silently could replace a clinical image with another.

### Store-and-forward and the queue

The gateway's core job is a **durable queue**. Each instance received from a scanner is written to the gateway's disk first, then queued for upload. Only when the cloud confirms it (a 200, or that instance listed in the Referenced SOP Sequence of a 202, Chapter 19) does it leave the queue.

<figure class="diagram">
<svg viewBox="0 0 720 220" role="img" aria-label="Each queued instance moves from received to queued to sending; a confirmation moves it to sent, a failure moves it to a retry wait with backoff, and repeated failures move it to dead letter for a person.">
<defs><marker id="ch20-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="30" width="110" height="46" rx="4" class="box"/>
<text x="75" y="58" text-anchor="middle">Received</text>
<rect x="170" y="30" width="110" height="46" rx="4" class="box"/>
<text x="225" y="58" text-anchor="middle">Queued</text>
<rect x="320" y="30" width="110" height="46" rx="4" class="box accent"/>
<text x="375" y="58" text-anchor="middle">Sending</text>
<rect x="470" y="30" width="110" height="46" rx="4" class="box"/>
<text x="525" y="58" text-anchor="middle">Confirmed</text>
<rect x="320" y="150" width="110" height="46" rx="4" class="box"/>
<text x="375" y="178" text-anchor="middle">Retry wait</text>
<rect x="470" y="150" width="110" height="46" rx="4" class="box"/>
<text x="525" y="178" text-anchor="middle">Dead letter</text>
<line x1="130" y1="53" x2="170" y2="53" marker-end="url(#ch20-arrow2)"/>
<text x="150" y="22" text-anchor="middle" class="small">on disk</text>
<line x1="280" y1="53" x2="320" y2="53" marker-end="url(#ch20-arrow2)"/>
<line x1="430" y1="53" x2="470" y2="53" marker-end="url(#ch20-arrow2)"/>
<text x="450" y="22" text-anchor="middle" class="small">2xx, listed as stored</text>
<line x1="360" y1="76" x2="360" y2="150" marker-end="url(#ch20-arrow2)"/>
<text x="352" y="118" text-anchor="end" class="small">timeout, 5xx, failed</text>
<line x1="390" y1="150" x2="390" y2="76" marker-end="url(#ch20-arrow2)"/>
<text x="398" y="118" class="small">after backoff</text>
<line x1="430" y1="173" x2="470" y2="173" marker-end="url(#ch20-arrow2)"/>
<text x="450" y="210" text-anchor="middle" class="small">too many tries</text>
</svg>
<figcaption>Figure 20.2 — The life of one instance in the gateway's queue. Nothing is deleted until the cloud confirms that exact instance; failures wait and retry, and repeated failures go to a dead-letter list that a person reviews.</figcaption>
</figure>

A few rules make the queue trustworthy:

- **Persist before you acknowledge.** The gateway returns C-STORE success to the scanner only after the instance is on its own disk. If the gateway acknowledges first and then crashes, the scanner thinks the image is safe and it isn't.
- **Back off.** After a failure, wait before retrying, and wait longer each time (exponential backoff with some randomness). A thousand gateways retrying in the same second after an outage can knock the cloud over again.
- **Separate retryable from permanent failures.** A timeout or a 503 is worth retrying. A 409 for an unsupported SOP class (Chapter 19) will fail forever: send it to the dead-letter list at once, and tell someone.
- **Keep local copies until confirmed.** Storage space on the gateway is the safety margin for an outage. Size it for the longest outage you're willing to ride out.

### Size, batching and back-pressure

Ultrasound cine clips are large, and one study can hold dozens of objects. Three practical limits apply:

- **Request size.** Proxies, load balancers and the ingest service all cap request bodies. Send a study as several STOW requests (one instance, or a few, per request) rather than one huge multipart body. Smaller requests also mean a failure costs one clip, not the whole study.
- **Concurrency.** Uploading many instances in parallel is faster, until it saturates the facility's link and slows everything else in the hospital. Cap parallel uploads per gateway.
- **Back-pressure.** When the cloud is overloaded, it should say so (`429 Too Many Requests` or `503 Service Unavailable`, ideally with a `Retry-After` header) instead of timing out. The gateway honors that and slows down.

### Watching it

A queue that nobody watches is a queue that silently fills. At minimum, measure per gateway: the queue depth, the age of the oldest queued instance, the dead-letter count, and the time since the last successful upload. Alert on age, not just count: a hundred instances queued for one minute is normal on a busy day; one instance queued for six hours is a missing study.

### Managed cloud imaging services

You don't have to build the cloud end yourself. The major cloud providers offer managed DICOM services that store images and speak DICOMweb, and several open-source archives can run in the cloud too. They solve storage and the DICOMweb API; they don't solve which organization an image belongs to, which exam it matches, or who may see it. That remains your application's job.

Any cloud service that stores or processes images with patient information is handling ePHI. The vendor needs a Business Associate Agreement before it receives real patient data, and the configuration must meet your security requirements. The companion handbook, *HIPAA for Medical Application Developers*, covers the BAA perimeter and what to verify.

## Lab

**Watch a gateway survive an outage.** Two Orthanc containers on one Docker network: one plays the facility gateway, the other plays the cloud service. The gateway pushes over DICOMweb, the cloud goes down, and you recover. You need Docker, curl, and `study-0001.dcm` from Chapter 3's lab. Synthetic data only.

In the lab the link between the two is plain HTTP on a private Docker network. In production it is HTTPS with mutual TLS; the queueing behavior you're testing is the same.

```bash
docker network create gateway-lab

# The "cloud": accepts uploads from one ingest credential.
docker run -d --rm --name cloud --network gateway-lab -p 127.0.0.1:8042:8042 \
  -e DICOM_WEB_PLUGIN_ENABLED=true \
  -e ORTHANC__AUTHENTICATION_ENABLED=true \
  -e 'ORTHANC__REGISTERED_USERS={"cloud-ingest": "lab-secret"}' \
  orthancteam/orthanc:24.10.1

# The "gateway": knows the cloud as a DICOMweb destination named "cloud".
docker run -d --rm --name gateway --network gateway-lab -p 127.0.0.1:8043:8042 \
  -e DICOM_WEB_PLUGIN_ENABLED=true \
  -e ORTHANC__AUTHENTICATION_ENABLED=true \
  -e 'ORTHANC__REGISTERED_USERS={"demo": "demo"}' \
  -e 'ORTHANC__DICOM_WEB__SERVERS={"cloud": ["http://cloud:8042/dicom-web/", "cloud-ingest", "lab-secret"]}' \
  orthancteam/orthanc:24.10.1
```

**1. The scanner's send.** Put the study into the gateway (standing in for a C-STORE from the machine) and note Orthanc's study ID in the answer (`ParentStudy`):

```bash
curl -s -u demo:demo -X POST http://localhost:8043/instances --data-binary @study-0001.dcm
STUDY_ID=<paste ParentStudy>
```

**2. Forward.** Ask the gateway to push the study to the cloud with STOW-RS, then check the cloud has it:

```bash
curl -s -u demo:demo -X POST http://localhost:8043/dicom-web/servers/cloud/stow \
  -d "{\"Resources\": [\"$STUDY_ID\"]}"
curl -s -u cloud-ingest:lab-secret "http://localhost:8042/dicom-web/studies?AccessionNumber=ACC-0001"
```

**3. Retry is harmless.** Push the same study again, then count the cloud's instances:

```bash
curl -s -u demo:demo -X POST http://localhost:8043/dicom-web/servers/cloud/stow \
  -d "{\"Resources\": [\"$STUDY_ID\"]}"
curl -s -u cloud-ingest:lab-secret http://localhost:8042/instances
```

Still one instance. Orthanc identifies an instance by its DICOM UIDs, so the second store of the same SOP Instance UID didn't create a copy.

**4. Outage.** Stop the cloud and push again, this time as a background job:

```bash
docker stop cloud
curl -s -u demo:demo -X POST http://localhost:8043/dicom-web/servers/cloud/stow \
  -d "{\"Resources\": [\"$STUDY_ID\"], \"Synchronous\": false}"
JOB=<paste the job ID>
curl -s -u demo:demo http://localhost:8043/jobs/$JOB
```

The job's `State` becomes `Failure`. Note the study is still safe on the gateway's disk. Nothing was lost; it just hasn't been delivered.

**5. Recover.** Start the cloud again (the first `docker run` command for `cloud`), then resubmit the failed job and watch it complete:

```bash
curl -s -u demo:demo -X POST http://localhost:8043/jobs/$JOB/resubmit
curl -s -u demo:demo http://localhost:8043/jobs/$JOB
curl -s -u cloud-ingest:lab-secret "http://localhost:8042/dicom-web/studies?AccessionNumber=ACC-0001"
```

The `--rm` cloud container started empty, so the study arriving there now came from the gateway's retry. (A real cloud service keeps its storage across restarts, of course.)

**6. Write it down.** In this lab *you* pressed resubmit. List what a production gateway must do on its own instead: when it retries, how long it waits, when it gives up, and who it tells.

Clean up:

```bash
docker stop gateway cloud; docker network rm gateway-lab
```

## In Lumen

This chapter is the shape of Lumen's planned image path. Each facility runs a small gateway (Orthanc is the candidate) that the machines send to over DICOM on the local network. The gateway holds each study on disk and pushes it outbound to Lumen's ingest endpoint with STOW-RS over HTTPS with mutual TLS. Nothing at the facility accepts connections from outside.

On Lumen's side, the design calls for the ingest to follow the rules above:

- the gateway's client certificate is a **device identity**; it says which facility is calling, and that, never a tag, decides which organization the images go to;
- each instance is stored through the Media service, keyed by its SOP Instance UID so a retry is harmless, and a same-UID-different-content conflict is held for a person rather than overwritten;
- the response lists exactly which instances were kept, so the gateway knows what to resend;
- an instance whose accession number matches no exam isn't dropped; it waits in a hold queue (Chapter 22).

None of this is built yet. The design is recorded here so that the chapters in Part VI build exactly this, and so that you can test it the way the lab did.

## How it fails

- **Acknowledge before persist.** The gateway tells the scanner "stored", crashes before writing to disk, and the scanner deletes its copy. The image is gone and every log says success.
- **Retry storm.** After a cloud outage, every gateway retries at once with no backoff, and the recovering service falls over again.
- **Poison message.** One instance the cloud will never accept sits at the head of the queue, retried forever, blocking everything behind it. Classify permanent failures and move them aside.
- **Silent overwrite.** A device reuses SOP Instance UIDs, and the receiver accepts the second image over the first. A clinical image is replaced and nobody knows.
- **Full disk.** A long outage fills the gateway's disk; it starts refusing C-STOREs and technologists see send failures on the machine. Size for the outage, and alert on age before it gets there.
- **Tenant from tags.** The cloud trusts the institution name in the image to decide the organization. One misconfigured or malicious sender files images under another customer. Use the connection's credential (Chapter 17).

## Evidence

You understand this chapter when you can take down the cloud end in a test, show that no instance was lost or duplicated when it came back, and point to the metric that would have told you about the outage before anyone called.

## Workbook

1. Why should the facility gateway connect out to the cloud, rather than the cloud connecting in to the facility?
2. The gateway sent an instance and the connection dropped before any response arrived. What should it do, and what makes that safe?
3. The ingest service receives a SOP Instance UID it already has, but the pixel data differs. What should it do, and why not keep the newer one?
4. Which failures should a gateway retry, and which should go straight to the dead-letter list? Give an example of each.
5. What single metric would you alert on to catch a stuck queue, and why is it better than queue length?

## Answers

1. Outbound connections keep the hospital's firewall closed: no inbound port is opened or exposed to the internet, and most hospital networks already allow outbound HTTPS. The protocol crossing the internet becomes HTTPS, with strong TLS and client certificates, instead of DIMSE, whose AE titles prove nothing. And the facility controls when and how fast it sends. See "Never let the cloud call in" and Figure 20.1.
2. Retry it. The gateway can't know whether the cloud stored it, so the only way to be sure is to send again. That's safe because the receiver treats the SOP Instance UID as an idempotency key: storing the same instance twice has the effect of storing it once. See "Exactly once, from at-least-once".
3. It should refuse to overwrite and flag the instance for a person to review. A SOP Instance UID identifies exactly one image, so two different images with the same UID mean something upstream is wrong (bad UID generation, or an edit without a new UID). Silently keeping the newer one could replace a clinical image with a different one. See the table in "Exactly once, from at-least-once".
4. Retry transient failures, where the same request can succeed later: timeouts, connection errors, 503 or 429 (after the `Retry-After` delay). Send permanent failures to the dead-letter list at once, because retrying can never succeed: for example, a 409 for an unsupported SOP class, or an instance the server reports as malformed. See "Store-and-forward and the queue".
5. The age of the oldest queued instance. A long queue on a busy morning is normal and drains on its own; an old item means delivery has stopped for it, which is a missing study. Age catches a single stuck instance that a count would hide. See "Watching it".

<p class="sources">Sources: DICOM PS3.18 §10.5 (Store Transaction, status codes, Store Instances Response Module) and Annex I; PS3.3 (SOP Common Module, SOP Instance UID (0008,0018)); PS3.5 Chapter 9 (unique identifiers); PS3.15 (security profiles); RFC 9110 (HTTP semantics: 503 status code, Retry-After), RFC 6585 (429 Too Many Requests); RFC 8446 (TLS 1.3, client authentication); Orthanc Book, DICOMweb plugin (DicomWeb.Servers, the /servers/{name}/stow call) and REST API jobs (resubmit).</p>
