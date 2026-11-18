---
number: 19
title: STOW, WADO, and QIDO: DICOM over HTTPS
objective: Store, search and retrieve DICOM objects over HTTP, read the JSON that comes back, and tell a full success from a partial one.
status: draft
---

## At the machine

When a physician opens a study in a modern web viewer, the browser isn't speaking DIMSE. There is no association, no AE title, no port 104. The viewer makes ordinary HTTPS requests ("find this patient's studies", "give me frame 12 of this clip as a PNG") and the archive answers in JSON and images.

That family of HTTP services is **DICOMweb**, defined in PS3.18. The machine in the scan room still sends C-STORE, and probably will for years. But everything that sits behind the hospital's edge (cloud archives, web viewers, a reporting platform like Lumen) increasingly talks DICOMweb. It is the bridge this book uses to get images from a facility into Lumen.

## On the wire

### The same data, a different transport

DICOMweb doesn't change *what* DICOM is. The objects are the same Part 10 files with the same tags and UIDs (Chapters 10 and 11). What changes is how they travel:

| | DIMSE (Chapters 4 to 9) | DICOMweb (PS3.18) |
|---|---|---|
| Transport | DICOM Upper Layer over TCP | HTTP over TLS |
| Who you are | AE title (a claim, Chapter 14) | HTTP authentication: tokens, client certificates |
| Store | C-STORE | STOW-RS: `POST` |
| Search | C-FIND | QIDO-RS: `GET` with query parameters |
| Retrieve | C-MOVE / C-GET | WADO-RS: `GET` |
| Results | DIMSE status codes | HTTP status codes plus a DICOM response body |

The three names are older abbreviations still in daily use: **STOW-RS** (Store Over the Web), **QIDO-RS** (Query based on ID for DICOM Objects) and **WADO-RS** (Web Access to DICOM Objects). PS3.18 now calls them the Store, Search and Retrieve transactions of the *Studies Service*.

### Resources are a URL tree

Everything hangs off one root URL (the server's *base URL*) and follows the patient-free study hierarchy:

```text
{base}/studies
{base}/studies/{study}
{base}/studies/{study}/series
{base}/studies/{study}/series/{series}
{base}/studies/{study}/series/{series}/instances/{instance}
{base}/studies/{study}/series/{series}/instances/{instance}/frames/{frames}
```

Where `{study}`, `{series}` and `{instance}` are the Study, Series and SOP Instance UIDs. Each resource also has variants: `/metadata` (the header as JSON, without pixel data), `/rendered` (a consumer image format such as JPEG or PNG) and `/thumbnail`.

### Store: STOW-RS

To store, you `POST` to `{base}/studies` (any studies) or `{base}/studies/{study}` (all instances must belong to that study). The body is **multipart/related**: one part per DICOM instance, each with `Content-Type: application/dicom`:

```text
POST /dicom-web/studies HTTP/1.1
Content-Type: multipart/related; type="application/dicom"; boundary=dicom-lab-boundary
Accept: application/dicom+json

--dicom-lab-boundary
Content-Type: application/dicom

<the bytes of one Part 10 file>
--dicom-lab-boundary--
```

The server answers with an HTTP status *and* a body describing what happened to each instance:

| Status | Meaning (PS3.18 Table 10.5.3-1) |
|---|---|
| 200 OK | All instances stored |
| 202 Accepted | Some stored, but warnings or failures exist for others |
| 400 Bad Request | None stored: bad syntax |
| 409 Conflict | None stored: e.g. unsupported SOP Class, or a Study Instance UID mismatch |
| 415 Unsupported Media Type | The server doesn't accept that Content-Type |

**202 is the one that bites.** It is a success code to most HTTP libraries, yet it means some of your images were *not* stored. The response body says which:

<div class="pairs">
<div><span>(0008,1199)</span><p>Referenced SOP Sequence: one item per instance that was stored, each with its Retrieve URL (0008,1190), and a Warning Reason (0008,1196) if the server changed something.</p></div>
<div><span>(0008,1198)</span><p>Failed SOP Sequence: one item per instance that wasn't stored, each with a Failure Reason (0008,1197).</p></div>
<div><span>(0008,1190)</span><p>Retrieve URL: where the stored study or instance can now be fetched.</p></div>
</div>

A sender that only checks "is the status 2xx?" will silently lose images on a 202. A correct sender reads the Failed SOP Sequence and retries or escalates each failed instance.

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="A STOW request posts a multipart body of DICOM instances and gets a status plus a JSON body listing stored and failed instances; a QIDO request gets a JSON array of matching studies.">
<defs><marker id="ch19-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="150" height="50" rx="4" class="box"/>
<text x="95" y="50" text-anchor="middle">Sender / client</text>
<rect x="550" y="20" width="150" height="50" rx="4" class="box accent"/>
<text x="625" y="50" text-anchor="middle">DICOMweb server</text>
<line x1="95" y1="70" x2="95" y2="320" class="dashed"/>
<line x1="625" y1="70" x2="625" y2="320" class="dashed"/>
<text x="20" y="100" class="muted">Store (STOW-RS)</text>
<line x1="95" y1="125" x2="625" y2="125" marker-end="url(#ch19-arrow)"/>
<text x="360" y="117" text-anchor="middle" class="small">POST /studies · multipart/related; type="application/dicom"</text>
<line x1="625" y1="165" x2="95" y2="165" marker-end="url(#ch19-arrow)"/>
<text x="360" y="157" text-anchor="middle" class="small">200 / 202 / 409 · Referenced SOP Seq + Failed SOP Seq</text>
<text x="20" y="215" class="muted">Search (QIDO-RS)</text>
<line x1="95" y1="240" x2="625" y2="240" marker-end="url(#ch19-arrow)"/>
<text x="360" y="232" text-anchor="middle" class="small">GET /studies?AccessionNumber=ACC-0001</text>
<line x1="625" y1="280" x2="95" y2="280" marker-end="url(#ch19-arrow)"/>
<text x="360" y="272" text-anchor="middle" class="small">200 · application/dicom+json: array of matching studies</text>
</svg>
<figcaption>Figure 19.1 — STOW and QIDO as HTTP exchanges. A store answers with a status and a per-instance report; a search answers with a JSON array, one element per match.</figcaption>
</figure>

### Search: QIDO-RS

Search is a `GET` on a collection with attributes as query parameters:

```text
GET {base}/studies?AccessionNumber=ACC-0001
GET {base}/studies?PatientID=DEMO-0001&StudyDate=20261101-20261130
GET {base}/studies/{study}/series
```

Parameters can be attribute keywords (`AccessionNumber`) or tags (`00080050`). The answer is a JSON array, one element per matching study (or series, or instance). When nothing matches, the current standard says the answer is `200 OK` with an empty array. Earlier editions specified `204 No Content` instead, and some servers still send it, so a client should handle both.

PS3.18 defines which resources a server must support. All studies, a study's series, and a series' instances are always required; searching *all* series or *all* instances across studies is mandatory for a native server but optional for one that proxies a DIMSE archive.

### Retrieve: WADO-RS

Retrieve is a `GET` on a resource, and the `Accept` header chooses the form:

| You want | Request | Accept |
|---|---|---|
| The DICOM files | `GET {base}/studies/{study}` | `multipart/related; type="application/dicom"` |
| Just the headers | `GET {base}/studies/{study}/metadata` | `application/dicom+json` |
| A picture of one frame | `GET .../instances/{instance}/frames/1/rendered` | `image/png` or `image/jpeg` |

Rendered resources matter for ultrasound. A browser can't display a DICOM file, but it can display a PNG. The server applies the image's presentation (windowing, color) and hands back something any `<img>` tag can show.

### The DICOM JSON model

Search results, metadata and store responses all use the **DICOM JSON model** (PS3.18 Annex F, media type `application/dicom+json`). Each attribute is keyed by its eight-hex-digit tag, with its VR and an array of values:

```json
{
  "00080050": { "vr": "SH", "Value": ["ACC-0001"] },
  "00100010": { "vr": "PN", "Value": [{ "Alphabetic": "TEST^PATIENT" }] },
  "0020000D": { "vr": "UI", "Value": ["1.2.826.0.1.3680043.8.498.1082..."] }
}
```

Three things to notice: values are always arrays, even when there's one; person names are objects (with `Alphabetic`, and optionally `Ideographic` and `Phonetic` parts); and an attribute with no value has a `vr` but no `Value`. Code that reads this JSON should look up by tag, not assume an order, and must tolerate a missing `Value`.

## Lab

**Store, search and retrieve over HTTP.** You need Docker, curl and the `study-0001.dcm` file from Chapter 3's lab (run Chapter 3's `make_study.py` again if you don't have it; Chapter 11's script of the same name writes different files). Everything is synthetic.

Start Orthanc with its DICOMweb plugin, listening only on your own machine, with a lab-only user:

```bash
docker run -d --rm --name dicomweb-lab \
  -p 127.0.0.1:8042:8042 \
  -e DICOM_WEB_PLUGIN_ENABLED=true \
  -e ORTHANC__AUTHENTICATION_ENABLED=true \
  -e 'ORTHANC__REGISTERED_USERS={"demo": "demo"}' \
  orthancteam/orthanc:24.10.1
```

Orthanc's DICOMweb root is `/dicom-web/` by default (the `DicomWeb.Root` setting). Check it is up, and that it refuses you without credentials:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8042/dicom-web/studies           # 401
curl -s -u demo:demo http://localhost:8042/dicom-web/studies                             # []
```

**1. Store.** curl has no STOW button, so build the multipart body yourself. Seeing it byte by byte is the point:

```bash
BOUNDARY=dicom-lab-boundary
{ printf -- '--%s\r\nContent-Type: application/dicom\r\n\r\n' "$BOUNDARY"
  cat study-0001.dcm
  printf -- '\r\n--%s--\r\n' "$BOUNDARY"; } > stow-body.bin

curl -s -u demo:demo -X POST http://localhost:8042/dicom-web/studies \
  -H "Content-Type: multipart/related; type=\"application/dicom\"; boundary=$BOUNDARY" \
  -H "Accept: application/dicom+json" \
  --data-binary @stow-body.bin -w "\nHTTP %{http_code}\n"
```

You should get `HTTP 200` and a body whose `00081199` (Referenced SOP Sequence) lists your instance with a `00081190` Retrieve URL, and whose `00081198` (Failed SOP Sequence) is empty.

**2. Search** by the accession number, the way a reporting system would look for its exam's images:

```bash
curl -s -u demo:demo "http://localhost:8042/dicom-web/studies?AccessionNumber=ACC-0001" \
  -H "Accept: application/dicom+json"
```

Find `0020000D` in the answer. That's the Study Instance UID, learned from the archive and not known in advance (Chapter 3). Copy it into a shell variable:

```bash
STUDY=<paste the Study Instance UID>
```

**3. Retrieve** the headers, then the files:

```bash
curl -s -u demo:demo "http://localhost:8042/dicom-web/studies/$STUDY/metadata" \
  -H "Accept: application/dicom+json"

curl -s -u demo:demo "http://localhost:8042/dicom-web/studies/$STUDY" \
  -H 'Accept: multipart/related; type="application/dicom"' -D - -o retrieved.bin
```

The second command prints the response headers: a `multipart/related` Content-Type with the server's own boundary. `retrieved.bin` holds your file wrapped in that multipart envelope.

**4. Store it again.** Run the step 1 command a second time. Note the status. Re-sending an instance with the same SOP Instance UID is the normal retry case, and Chapter 20 builds on how a server treats it.

**5. Make it fail.** Send a part that isn't DICOM:

```bash
printf -- '--%s\r\nContent-Type: application/dicom\r\n\r\nnot dicom\r\n--%s--\r\n' \
  "$BOUNDARY" "$BOUNDARY" > bad.bin
curl -s -u demo:demo -X POST http://localhost:8042/dicom-web/studies \
  -H "Content-Type: multipart/related; type=\"application/dicom\"; boundary=$BOUNDARY" \
  -H "Accept: application/dicom+json" --data-binary @bad.bin -w "\nHTTP %{http_code}\n"
```

You get a 4xx status, and a body in which nothing was stored. Record the exact status your server returned, and compare it with Table 10.5.3-1.

The lab file has no pixel data, so there is nothing to render. If you have a synthetic ultrasound image with pixel data, store it and try a `/frames/1/rendered` request with `Accept: image/png`.

Clean up:

```bash
docker stop dicomweb-lab
```

## In Lumen

Lumen already serves images to the browser over HTTPS, but through its own API, not DICOMweb: the browser asks Lumen for an exam's images, and Lumen checks the user's organization and facility before serving them.

DICOMweb enters on the *inbound* side. In the planned design, the facility gateway forwards each study to Lumen with **STOW-RS**, over HTTPS with mutual TLS. The ingest endpoint will then:

- read the Failed SOP Sequence semantics from the *server* side: answer 200 only when every instance was kept, and 202 with a precise failure list otherwise, so the gateway knows exactly what to resend;
- take the organization from the gateway's credential, never from anything in the body (Chapter 17);
- match each instance to an exam by Accession Number, or hold it (Chapter 22).

Exposing QIDO and WADO to outside viewers is not part of the plan. Lumen's browser already has its own API.

## How it fails

- **202 treated as success.** The sender logs "stored" and moves on; three of forty clips were rejected. Always read the Failed SOP Sequence.
- **Broken multipart.** A missing CRLF, or a boundary in the header that differs from the one in the body, and the server sees zero parts or one garbled part. Build bodies with a tested library in production; build them by hand only to learn.
- **Wrong Accept.** Asking WADO-RS for `application/dicom` without the `multipart/related` wrapper, or for a rendered image from a resource that has no pixel data, gets a 406 or 4xx with no images.
- **JSON assumptions.** Code that reads `Value[0]` crashes on an attribute present with no value, or reads a person name as a string when it's an object.
- **Credentials in the URL.** Putting a token in a query string sends it into proxy and server logs. Use the `Authorization` header or a client certificate.

## Evidence

You understand this chapter when you can store a synthetic study over HTTP, find it by accession number, retrieve its headers, and explain from the response body (not just the status code) exactly which instances the server kept.

## Workbook

1. A STOW-RS request returns 202. What two things must the sender do before it can say the study arrived?
2. Why does DICOMweb put the Study Instance UID in the URL for retrieve, but use the Accession Number as a query parameter for search?
3. Name two ways DICOMweb identifies a caller that DIMSE cannot, and why that matters for a cloud service.
4. Your viewer needs to show a cine frame in a browser `<img>`. Which resource and which Accept header do you ask for?
5. Rewrite this check so it can't lose images: `if response.status_code // 100 == 2: mark_sent(study)`.

## Answers

1. It must read the Failed SOP Sequence (0008,1198) in the response body to find which instances weren't stored, then retry or escalate each one until every instance has been confirmed in a Referenced SOP Sequence (0008,1199). A 202 means "some stored, some not", so the study hasn't arrived until the failures are dealt with. See "Store: STOW-RS".
2. Retrieve addresses a specific, known resource, and DICOMweb resources are identified by their UIDs in the URL tree. Search is for finding things you don't yet know the UID of, so you filter by attributes you do know, like the accession number. That mirrors Chapter 3: the accession number is known in advance and the UID is learned. See "Resources are a URL tree" and "Search: QIDO-RS".
3. HTTP authentication, such as bearer tokens or credentials verified by the server, and TLS client certificates (mutual TLS). An AE title is only a claim the caller makes (Chapter 14), while these are proofs that can be issued, checked and revoked per device. A service reachable from outside the hospital network needs exactly that. See the comparison table in "The same data, a different transport".
4. The rendered frame resource, `.../instances/{instance}/frames/{n}/rendered`, with `Accept: image/png` or `Accept: image/jpeg`. The server applies the image's presentation and returns a format the browser can show directly. See "Retrieve: WADO-RS".
5. Treat only 200 as complete. On 202, or any 2xx, parse the body, mark the instances in the Referenced SOP Sequence as sent, and requeue every instance in the Failed SOP Sequence. On 4xx or 5xx, mark none as sent and retry or escalate according to the status. For example: `stored, failed = parse_stow_response(response)`, `mark_sent(stored)`, `requeue(failed)`, and `mark_study_sent` only when nothing failed and nothing remains. See "Store: STOW-RS" and "How it fails".

<p class="sources">Sources: DICOM PS3.18 §10.4 (Retrieve Transaction, including Table 10.4.1-1 instance and Table 10.4.1-3 rendered resources), §10.5 (Store Transaction: Table 10.5.1-1 resources, Table 10.5.3-1 status codes), §10.6 (Search Transaction: Table 10.6.1-1 resources, empty-result behavior), §8.5 (status codes, 406 Not Acceptable), Annex F (DICOM JSON Model), Annex I (Store Instances Response Module: Referenced SOP Sequence (0008,1199), Failed SOP Sequence (0008,1198), Failure Reason (0008,1197), Warning Reason (0008,1196), Retrieve URL (0008,1190)); Orthanc Book, DICOMweb plugin and Docker image (orthancteam/orthanc) documentation.</p>
