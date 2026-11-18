---
number: 16
title: Gateways: keeping DICOM on the inside
objective: Explain what a facility DICOM gateway does, build one that receives C-STORE and forwards over DICOMweb, and watch it fail and recover when the far side is down.
status: draft
---

## At the machine

From the machine's point of view, nothing in this chapter is visible. You press End Exam, the images go to an AE title, the queue on the machine empties. Whether that AE title belongs to the archive itself or to a small box in the network closet that passes images along does not change what you see.

That is exactly why gateways work. A gateway is a DICOM receiver that the machine treats as its destination, sitting inside the facility, next to the machines. It accepts images in the plain way every machine already supports, keeps them safe, and sends them on, in whatever secure form the next system needs. For an application that lives outside the hospital, the gateway is how images get to it without anyone opening a DICOM port to the internet.

## On the wire

### What a gateway does

<div class="pairs">
<div><span>Receive</span><p>Act as a C-STORE SCP for the facility's machines, on the facility network (Chapters 5 and 7).</p></div>
<div><span>Store</span><p>Write each object to its own disk before acknowledging it, so a power cut does not lose images the machine thinks were sent.</p></div>
<div><span>Queue</span><p>Record every object that still has to be forwarded.</p></div>
<div><span>Forward</span><p>Send onward: C-STORE to an archive, or STOW-RS over HTTPS to a cloud system (Chapter 19).</p></div>
<div><span>Retry</span><p>When the far side is down, keep the object and try again later instead of dropping it.</p></div>
<div><span>Filter and transform</span><p>Drop what should not leave (test patients, unwanted series), fix known vendor quirks, or change the encoding.</p></div>
</div>

Open-source examples are Orthanc and dcm4chee; commercial archives and routers do the same job. What makes something a gateway is its position and its responsibilities, not the product.

### Store and forward

The critical rule is the order of two events: the gateway must have the object safely on disk **before** it returns success to the machine. After the machine sees `0000` (Chapter 7), it may delete the image from its own storage. If the gateway acknowledged first and crashed second, the image is gone.

After that, the gateway's queue is the source of truth for "what still has to go out." Figure 16.1 shows the flow.

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="The machine sends C-STORE to the gateway, which writes to disk and adds to the queue before replying success; a forwarder sends from the queue to the cloud over STOW-RS with mTLS, retrying on failure and marking the item done only on success.">
<defs><marker id="ch16-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="110" width="120" height="56" rx="4" class="box"/>
<text x="70" y="143" text-anchor="middle">Machine</text>
<line x1="130" y1="128" x2="210" y2="128" marker-end="url(#ch16-arrow)"/>
<text x="170" y="120" text-anchor="middle" class="small">C-STORE</text>
<line x1="210" y1="152" x2="130" y2="152" marker-end="url(#ch16-arrow)"/>
<text x="170" y="170" text-anchor="middle" class="small">0000 after disk</text>
<rect x="210" y="40" width="300" height="220" rx="6" class="box"/>
<text x="360" y="62" text-anchor="middle">Gateway (inside the facility)</text>
<rect x="230" y="100" width="110" height="50" rx="4" class="box"/>
<text x="285" y="130" text-anchor="middle">Disk</text>
<rect x="370" y="100" width="120" height="50" rx="4" class="box accent"/>
<text x="430" y="130" text-anchor="middle">Queue</text>
<line x1="340" y1="125" x2="370" y2="125" marker-end="url(#ch16-arrow)"/>
<rect x="370" y="190" width="120" height="50" rx="4" class="box"/>
<text x="430" y="220" text-anchor="middle">Forwarder</text>
<line x1="430" y1="150" x2="430" y2="190" marker-end="url(#ch16-arrow)"/>
<path d="M370,215 L300,215 L300,150" class="dashed" marker-end="url(#ch16-arrow)"/>
<text x="290" y="235" text-anchor="middle" class="small">failed: retry later</text>
<line x1="490" y1="215" x2="590" y2="215" marker-end="url(#ch16-arrow)"/>
<text x="550" y="207" text-anchor="middle" class="small">STOW-RS</text>
<text x="550" y="232" text-anchor="middle" class="small">+ mTLS</text>
<rect x="590" y="190" width="120" height="50" rx="4" class="box"/>
<text x="650" y="220" text-anchor="middle">Cloud ingest</text>
</svg>
<figcaption>Figure 16.1 — Store, then acknowledge, then forward. The queue, not the network, decides what has been delivered; a failed forward goes back to the queue instead of being lost.</figcaption>
</figure>

### Routing rules

A small facility has one rule: everything goes to one destination. Larger ones route by what they receive: ultrasound to the reporting system and the archive, a research copy (de-identified, Chapter 18) to a teaching server, nothing from the service engineer's test AE anywhere. Routing on tags such as Modality is fine *inside* the facility, where the facility owns the decision. Chapter 17 explains why the receiving cloud system must not route on tags.

### Why the SCP stays inside

A DICOM port reachable from the internet is a bad idea for every reason in Chapter 14: the protocol has no built-in authentication, many receivers accept any caller, and DIMSE was designed for trusted local networks. A gateway changes the direction of the connection:

- machines connect **in** to the gateway, on the facility's own network;
- the gateway connects **out** to the cloud system, over HTTPS on port 443, with its own client certificate.

No inbound firewall rule is needed at the facility, and no DIMSE port exists on the internet. The hospital's network team only has to allow one outbound HTTPS destination, which is the kind of request they are used to reviewing.

### The gateway holds the facility's identity

Chapter 14 showed that machines cannot prove who they are. The gateway can. It is one managed system per facility, with one client certificate that the cloud system issued and can revoke. The cloud trusts the gateway, and the facility controls which machines may send to the gateway. Responsibility splits cleanly along that line.

### Watch the queue

A gateway that silently stops forwarding is worse than one that fails loudly, because the machines keep showing "sent." Monitor at least:

- **queue depth**: how many objects are waiting;
- **age of the oldest item**: a few seconds is normal, an hour is an incident;
- **failures by reason**: TLS errors, rejected objects, timeouts;
- **disk space**: the queue lives on the gateway's disk, and a full disk stops C-STORE.

## Lab

You will run two Orthanc servers: a **gateway** that receives DICOM, and a **central** server that stands in for the cloud system and receives DICOMweb. A small Lua script makes the gateway forward every image it receives. Then you will take the central server down and watch what happens. Synthetic data only; you need Docker and the Python setup and scripts (`make_synthetic_us.py`, `send.py`) from Chapter 14's lab.

**Forwarding rule.** Save this as `forward.lua`:

```text
-- Forward every instance the gateway receives over DICOM to "central", over DICOMweb.
function OnStoredInstance(instanceId, tags, metadata, origin)
  if origin['RequestOrigin'] == 'DicomProtocol' then
    RestApiPost('/dicom-web/servers/central/stow',
      '{"Resources": ["' .. instanceId .. '"], "Synchronous": false}')
  end
end
```

`/dicom-web/servers/central/stow` is the DICOMweb plugin's call for sending Orthanc resources to a configured remote server with STOW-RS. With `"Synchronous": false` it returns at once and creates a job you can watch.

**Start both servers** on a private Docker network:

```bash
docker network create dicom-lab

docker run -d --rm --name central --network dicom-lab -p 127.0.0.1:8043:8042 \
  -e ORTHANC__AUTHENTICATION_ENABLED=false -e DICOM_WEB_PLUGIN_ENABLED=true \
  orthancteam/orthanc:24.10.1

docker run -d --rm --name gateway --network dicom-lab \
  -p 127.0.0.1:4242:4242 -p 127.0.0.1:8042:8042 \
  -v "$PWD/forward.lua:/etc/orthanc/forward.lua:ro" \
  -e ORTHANC__AUTHENTICATION_ENABLED=false -e DICOM_WEB_PLUGIN_ENABLED=true \
  -e 'ORTHANC__DICOM_WEB__SERVERS={"central": ["http://central:8042/dicom-web/"]}' \
  -e 'ORTHANC__LUA_SCRIPTS=["/etc/orthanc/forward.lua"]' \
  orthancteam/orthanc:24.10.1
```

Only the gateway has a DICOM port published. `central` is reachable only from the gateway, over HTTP on the private network. (A real deployment would use HTTPS with mutual TLS here, as in Chapter 15. This lab skips TLS to stay short.)

**Send from the "machine"** and look at both servers:

```bash
python make_synthetic_us.py b.dcm
python send.py US_ROOM3 127.0.0.1 4242 b.dcm
sleep 3
curl -s localhost:8042/instances     # gateway: one instance
curl -s localhost:8043/instances     # central: the same instance
curl -s 'localhost:8042/jobs?expand' # one DicomWebStowClient job, State "Success"
```

**Now break the far side.** Stop central, send another image, and look at the jobs:

```bash
docker stop central
python make_synthetic_us.py c.dcm
python send.py US_ROOM3 127.0.0.1 4242 c.dcm
sleep 5
curl -s 'localhost:8042/jobs?expand'
```

The machine still got `C-STORE status 0x0000`, because the gateway stored the image. The new job's `State` is `Failure`. The image is safe on the gateway, but it has not been delivered, and nothing on the machine shows it.

**Recover.** Start central again (the same `docker run` as before), then resubmit the failed job by its `ID`:

```bash
curl -s -X POST localhost:8042/jobs/<failed-job-id>/resubmit
sleep 3
curl -s localhost:8043/instances
```

The image arrives. Note what you had to do: Orthanc kept the failed job, but it did not retry by itself. A production gateway needs an automatic retry policy, a monitor on failed jobs, or both. That gap, "accepted but not delivered," is the one the queue metrics above exist to catch.

Clean up: `docker rm -f gateway central && docker network rm dicom-lab`.

## In Lumen

Lumen does not have a gateway today; images arrive by browser upload. In the planned design, each facility runs a gateway (Orthanc is the first candidate). Machines send C-STORE to it on the facility network; it forwards over HTTPS with STOW-RS and mutual TLS to a Lumen ingest endpoint, which hands the objects to Lumen's Media service for storage. Lumen never accepts inbound DIMSE. The gateway's certificate is the facility's device identity, and Lumen will monitor delivery from its own side as well: images that a gateway reports as sent but Lumen never received should be visible to someone.

## How it fails

- **Acknowledge before storing.** The gateway replies success and then crashes; the machine deletes its copy; the image exists nowhere.
- **Silent failure.** Forwarding jobs fail for days because a certificate expired, and nobody watches the queue.
- **Disk full.** The queue grows while the far side is down until the gateway's disk fills and every machine starts failing at once.
- **Retry storms.** A rejected object (a bad file, an unsupported SOP class) is retried forever, filling logs and blocking the queue. Some errors are permanent and should go to a person, not back to the queue.
- **The DICOM port on the internet.** Someone skips the gateway and publishes the archive's DIMSE port "just for this one clinic."

## Evidence

You can show: the gateway and central instance lists after a successful forward; a failed job created while central was down, with the machine's success status for the same image; the resubmitted job succeeding; and, for a real facility, the queue depth and oldest-item age on a dashboard with an alert threshold.

## Workbook

1. Why must the gateway write the image to disk before it returns success to the machine?
2. In the lab, central was down but the machine still received `0000`. Was that correct behavior? What is the risk it creates?
3. Why does a gateway reduce the firewall changes a hospital must make for a cloud imaging system?
4. Name two errors that should be retried and two that should not, and say where the second kind should go.
5. Which four numbers would you put on a gateway dashboard, and what would make each one an alert?

## Answers

1. A success status tells the machine the receiver now owns the image, and the machine may delete its own copy. If the gateway acknowledged before the image was durable, a crash in between would lose the only copy (see "Store and forward").
2. Yes. The gateway had stored the image safely, so it owned it. The risk is that the image is accepted but not delivered, and nothing at the machine shows it, so delivery has to be monitored on the gateway (see the lab's "Recover" step and "Watch the queue").
3. Machines connect inward to a gateway on the facility network, and only the gateway connects outward, over HTTPS on port 443. The hospital needs no inbound rule and no internet-facing DICOM port, only one reviewed outbound destination (see "Why the SCP stays inside").
4. Retry temporary errors, such as a timeout or connection refused while the far side restarts, or a 503 from an overloaded endpoint. Do not retry permanent errors, such as an object the receiver rejects as invalid or unsupported, or one refused because the facility's identity is not authorized. Send those to a review queue for a person (see "How it fails").
5. Queue depth, age of the oldest item, failures by reason, and free disk space. Alert when the oldest item is older than your delivery target (for example, minutes rather than hours), when failures appear for a new reason or keep rising, and when disk space falls below what a long outage would need (see "Watch the queue").

<p class="sources">Sources: DICOM PS3.4 Annex B (Storage Service Class) and PS3.7 §9.1.1 (C-STORE, status 0000 success); PS3.18 §10.5 (STOW-RS Store Transaction); Orthanc Book, DICOMweb plugin (DicomWeb.Servers configuration, POST /dicom-web/servers/{name}/stow with Resources and Synchronous); Orthanc Book, Docker images (ORTHANC__ environment variables, DICOM_WEB_PLUGIN_ENABLED); Orthanc REST API (jobs, /jobs/{id}/resubmit); lab verified with orthancteam/orthanc:24.10.1.</p>
