---
number: 4
title: Application Entities, ports, and the address book
objective: Configure two DICOM Application Entities so they can find and accept each other, and diagnose the three ways that configuration usually goes wrong.
status: draft
---

## At the machine

When a new ultrasound system is installed, someone from the PACS team or biomedical engineering spends a few minutes at it with a printed sheet. They type in a name for the machine, then add destinations: the archive, the worklist server, maybe a second archive for teaching. Then they press **Verify** next to each one and wait for a green check.

At the same time, on the other side of the building, someone adds the new machine to the archive's list of known devices. Both lists have to agree. If the machine's sheet says the archive is `PACS_MAIN` and the archive was told to expect `US_ROOM3` from a certain address, the green check appears. If either side has a typo, the check turns red and the error message rarely says which side is wrong.

Chapter 1 introduced the three values that describe a DICOM device. This chapter is about the two lists, one on each side, and why both of them matter.

## On the wire

### Three values, three different jobs

An **Application Entity (AE)** is a piece of software that speaks DICOM: the scanner's network service, the archive's storage service, a reporting system's receiver. One physical box can host several AEs, and one AE can run on several boxes behind a load balancer. The three values do different jobs:

<div class="pairs">
<div><span>Host</span><p>Which machine to open a TCP connection to: an IP address or a DNS name.</p></div>
<div><span>Port</span><p>Which listening process on that machine. One server can run several AEs on different ports.</p></div>
<div><span>AE title</span><p>Which application the caller means to talk to, and who the caller claims to be. It travels inside the DICOM handshake, not in the TCP connection.</p></div>
</div>

Host and port get you a TCP connection. The AE title is checked only after that connection exists, as part of the association request (Chapter 5). That ordering explains most of the errors you will see later in this chapter's lab.

### The rules for an AE title

The DICOM Standard defines the AE title as a value representation (VR) called **AE** (PS3.5 §6.2):

- At most **16 characters** (bytes).
- Characters from the default repertoire (basic ASCII), **excluding the backslash** `\` and all **control characters**.
- **Leading and trailing spaces are not significant**: `US_ROOM3` and `US_ROOM3   ` are the same title. A title made only of spaces is not allowed.

In practice, sites stick to uppercase letters, digits and underscores, because some older equipment compares titles case-sensitively and some displays them only in capitals. A naming convention such as `<site>_<modality>_<room>` (`NORTH_US_03`) saves arguments later, but it has to fit in 16 characters.

### Calling and called

Every association carries two AE titles:

- The **Calling AE title**: who is opening the connection ("I am `US_ROOM3`").
- The **Called AE title**: who the caller expects to reach ("I am calling `PACS_MAIN`").

The receiver can check both. A receiver that checks the called title rejects callers that dialled the right host and port but asked for the wrong application. A receiver that checks the calling title rejects callers it has not been told about. Both checks are optional and configured per product. As you'll see in Chapter 14, the calling title is only a claim; nothing in plain DICOM proves the caller is who it says.

### Ports: 104, 11112, and whatever the vendor chose

PS3.8 §9.1.1 names **port 104** as DICOM's well-known port and **11112** as the registered alternative, for systems that cannot or should not bind a privileged port (below 1024). In the field you will meet both, plus whatever a vendor shipped as the default. Orthanc, the open-source server used in this book's labs, listens on **4242** by default. Nothing about DICOM requires a particular number; the two sides simply have to agree.

### Each side keeps an address book

The configuration that makes a network work is two address books:

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="The machine's address book points at the archive, and the archive's address book points back at the machine; both entries must match.">
<defs><marker id="ch04-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="20" y="30" width="250" height="110" rx="4" class="box"/>
<text x="145" y="58" text-anchor="middle">Ultrasound machine</text>
<text x="145" y="82" text-anchor="middle" class="small">Own AE title: US_ROOM3</text>
<text x="145" y="102" text-anchor="middle" class="small">Address: 10.20.30.41</text>
<rect x="450" y="30" width="250" height="110" rx="4" class="box"/>
<text x="575" y="58" text-anchor="middle">Archive (PACS)</text>
<text x="575" y="82" text-anchor="middle" class="small">Own AE title: PACS_MAIN</text>
<text x="575" y="102" text-anchor="middle" class="small">Listens on: 10.20.30.10 : 104</text>
<rect x="20" y="180" width="250" height="90" rx="4" class="box accent"/>
<text x="145" y="206" text-anchor="middle" class="small">Machine's destinations</text>
<text x="145" y="230" text-anchor="middle">PACS_MAIN</text>
<text x="145" y="252" text-anchor="middle" class="small">10.20.30.10 : 104</text>
<rect x="450" y="180" width="250" height="90" rx="4" class="box accent"/>
<text x="575" y="206" text-anchor="middle" class="small">Archive's known devices</text>
<text x="575" y="230" text-anchor="middle">US_ROOM3</text>
<text x="575" y="252" text-anchor="middle" class="small">10.20.30.41 (port only for C-MOVE)</text>
<line x1="270" y1="215" x2="450" y2="95" marker-end="url(#ch04-arrow)"/>
<text x="420" y="152" text-anchor="middle" class="small">points at</text>
<line x1="450" y1="240" x2="270" y2="110" marker-end="url(#ch04-arrow)" class="dashed"/>
<text x="305" y="164" text-anchor="middle" class="small">points back at</text>
</svg>
<figcaption>Figure 4.1 — Two address books. The machine needs the archive's title, host and port to send; the archive needs the machine's title (and often its host) to accept it, and its port as well if it will ever send back.</figcaption>
</figure>

- The **sender** must know the receiver's title, host and port, because it opens the connection.
- The **receiver** must know the sender's title if it checks calling titles, and may also check that the connection comes from the listed host.
- If the receiver ever has to **send back**, it needs the sender's port too. This happens with C-MOVE (Chapter 7): a viewer asks the archive to send a study to a named AE title, and the archive looks that title up in its own address book to find where to connect. An archive cannot send to a title it has no entry for.

### What Orthanc's configuration looks like

Orthanc keeps these settings in a JSON configuration file. The ones that matter here, with their defaults from Orthanc's own configuration file:

| Option | Default | What it controls |
|---|---|---|
| `DicomAet` | `ORTHANC` | Orthanc's own AE title (16 characters maximum) |
| `DicomPort` | `4242` | The port Orthanc's DICOM server listens on |
| `DicomCheckCalledAet` | `false` | Reject callers whose called title is not `DicomAet` |
| `DicomModalities` | empty | The address book: `"name": ["AET", "host", port]` |
| `DicomAlwaysAllowEcho` | `true` | Accept C-ECHO even from callers not in the address book |
| `DicomAlwaysAllowStore` | `true` | Accept C-STORE even from callers not in the address book |
| `DicomCheckModalityHost` | `false` | Also check that a known caller connects from its listed host |

Read the defaults carefully: out of the box, Orthanc accepts images from anyone who can reach its port, whatever title they use. That is convenient for a lab and wrong for anything holding patient data. The `orthancteam/orthanc` Docker image lets you set any option with an environment variable: insert an underscore before each capitalized word, capitalize, and prefix with `ORTHANC__`. So `DicomCheckCalledAet` becomes `ORTHANC__DICOM_CHECK_CALLED_AET`.

## Lab

You'll run an archive on your laptop, verify it from a terminal, then break the configuration three ways and read each error. Everything here is local and synthetic; no images are involved yet.

**1. Install the tools.** Docker Desktop, and DCMTK, the reference command-line DICOM toolkit:

```bash
brew install dcmtk          # macOS;  on Debian/Ubuntu: sudo apt install dcmtk
echoscu --version
```

The output below was captured with DCMTK 3.6.7; other versions print very similar lines.

**2. Start Orthanc with its own AE title and a called-title check.** The ports are bound to `127.0.0.1` so nothing outside your laptop can reach them. Authentication is turned off for the web interface only because this is a local lab.

```bash
docker run -d --name dicom-lab \
  -p 127.0.0.1:4242:4242 -p 127.0.0.1:8042:8042 \
  -e ORTHANC__AUTHENTICATION_ENABLED=false \
  -e ORTHANC__DICOM_AET=LUMEN_LAB \
  -e ORTHANC__DICOM_CHECK_CALLED_AET=true \
  orthancteam/orthanc:24.10.1
```

**3. Press "Verify" from the terminal.** `-aet` is your calling title, `-aec` the called title, then host and port:

```bash
echoscu -v -aet LAB_SCU -aec LUMEN_LAB localhost 4242
```

```text
I: Requesting Association
I: Association Accepted (Max Send PDV: 16372)
I: Sending Echo Request (MsgID 1)
I: Received Echo Response (Success)
I: Releasing Association
```

That is the green check. Now break it.

**4. Wrong called title.** Dial the right host and port but ask for the wrong application:

```bash
echoscu -v -aet LAB_SCU -aec PACS_MAIN localhost 4242
```

```text
I: Requesting Association
F: Association Rejected:
F: Result: Rejected Permanent, Source: Service User
F: Reason: Called AE Title Not Recognized
```

The TCP connection worked; the receiver read the request and refused it. "Rejected Permanent" means retrying won't help until someone changes a configuration.

**5. Wrong port.** Right title, wrong door:

```bash
echoscu -v -aet LAB_SCU -aec LUMEN_LAB localhost 4243
```

```text
I: Requesting Association
F: Association Request Failed: 0006:031c TCP Initialization Error: Connection refused
```

No DICOM happened at all. "Connection refused" means the host answered but nothing listens on that port. Against a host that doesn't answer (a wrong IP, or a firewall that drops packets) the same command hangs until a timeout; add `-to 5` to give up after five seconds, and you'll see `(Timeout)` instead.

**6. Unknown caller.** Now make Orthanc keep a real address book: accept echoes and stores only from devices it knows. Replace the container:

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
  orthancteam/orthanc:24.10.1

echoscu -v -aet LAB_SCU  -aec LUMEN_LAB localhost 4242    # rejected
echoscu -v -aet US_ROOM3 -aec LUMEN_LAB localhost 4242    # accepted
```

The first prints `Reason: Calling AE Title Not Recognized`. The second succeeds, because `US_ROOM3` is in the address book. Run `docker logs dicom-lab` and you'll see Orthanc's side of the story: `Rejected association for remote AET LAB_SCU on IP ...`.

Notice what just happened: you became `US_ROOM3` by typing it. Keep that in mind for Chapter 14.

**7. Clean up** when you're done with this part of the book (Chapter 5 reuses the same container):

```bash
docker rm -f dicom-lab
```

## In Lumen

Today Lumen has no AE at all: images arrive by browser upload, so there is nothing for a machine to call. The planned design (Parts IV and VI) adds an AE, but not in Lumen's cloud services. It lives in a **gateway** inside each facility, typically Orthanc, and that gateway is the entry in each machine's address book. The facility's machines send to it exactly as they send to their archive, and the gateway forwards to Lumen over HTTPS.

That decision means the address-book work in this chapter happens at the facility, with the facility's PACS team, using the same green-check routine they already know. It also means an AE title never reaches Lumen as a way of deciding which organization an image belongs to; Chapter 17 explains why.

## How it fails

- **Typo on one side.** The most common failure, and the errors point at it: `Called AE Title Not Recognized` means the caller has the receiver's title wrong (or the receiver checks a title it was never given); `Calling AE Title Not Recognized` means the receiver's address book is missing or misspells the caller.
- **The silently shortened title.** A title longer than 16 characters cannot fit in the association request. In this book's tests, DCMTK quietly cut `LAB_SCU_WITH_A_LONG_NAME` to `LAB_SCU_WITH_A_L`, and Orthanc then rejected the shortened name as unknown. A long title can look correct on both screens and still never match.
- **Right title, wrong door.** A port typo gives `Connection refused`; a host typo or a firewall gives a timeout. Both happen before any AE title is read, so they look like "the archive is down".
- **The forgotten return address.** C-ECHO and C-STORE work, but a viewer's C-MOVE fails, because the archive has no address-book entry (or an outdated port) for the destination title.
- **The open door.** A receiver left on permissive defaults accepts images from any device that can reach the port. Nothing fails, which is exactly the problem.

## Evidence

You understand this chapter when you can take any failed Verify, read the error line, and say whether the problem is the network (refused or timed out), the caller's configuration (called title), or the receiver's address book (calling title), and then show the two address-book entries that must match.

## Workbook

1. A machine's Verify against a new archive fails with `Calling AE Title Not Recognized`. Whose configuration needs to change, and what entry is missing?
2. Why does a wrong port produce a TCP error instead of a DICOM rejection?
3. C-STORE from the archive to a viewer works when the viewer pulls with C-MOVE on Monday, then fails on Tuesday after the viewer was moved to a new port. Which address book is now stale?
4. Orthanc's defaults accept C-STORE from devices not in `DicomModalities`. Which two options would you change before it held real patient images, and what does each change?
5. Two engineers argue whether `US_ROOM3` and `US_ROOM3  ` (with trailing spaces) are different AE titles. Who is right, and where is that defined?

## Answers

1. The receiver's. The caller's title was read and not found, so the archive's address book needs an entry for the machine's AE title (and its host, if host checking is on). The "Calling and called" section and step 6 of the lab show this exact error.
2. Host and port are needed to open the TCP connection, and AE titles are checked only inside the association request that travels over that connection. With the wrong port there is no listener, so the connection is refused before any DICOM message exists. See "Three values, three different jobs" and lab step 5.
3. The archive's. For C-MOVE the archive opens a new connection to the destination title, using the host and port from its own address book, so that entry still has the old port. Figure 4.1 shows why the receiver needs the sender's port only when it has to send back.
4. Set `DicomAlwaysAllowStore` (and `DicomAlwaysAllowEcho`) to `false`, so only devices listed in `DicomModalities` are accepted, and set `DicomCheckModalityHost` to `true`, so a known title is accepted only from its listed host. Neither change makes the title trustworthy on its own (Chapter 14), but they close the open door described under "How it fails".
5. They are the same title. PS3.5 §6.2 defines the AE value representation with leading and trailing spaces as not significant, and forbids a title made only of spaces. See "The rules for an AE title".

<p class="sources">Sources: DICOM PS3.5 §6.2, Table 6.2-1 (AE value representation: 16 bytes maximum, no backslash or control characters, leading and trailing spaces not significant); PS3.8 §9.1.1 (port 104 and registered port 11112); PS3.8 §9.3.4, Table 9-21 (A-ASSOCIATE-RJ results, sources and reasons); PS3.4 Annex C (C-MOVE move destination). Orthanc default <code>Configuration.json</code> (DicomAet, DicomPort, DicomCheckCalledAet, DicomModalities, DicomAlwaysAllowEcho, DicomAlwaysAllowStore, DicomCheckModalityHost) and the Orthanc Book page on the orthancteam Docker images (environment-variable naming). Lab output captured with DCMTK 3.6.7 against <code>orthancteam/orthanc:24.10.1</code>.</p>
