---
number: 15
title: DICOM over TLS and the hospital network
objective: Set up DICOM over TLS with mutual authentication, read what each failure means, and decide where encryption belongs on a real hospital network.
status: draft
---

## At the machine

On most ultrasound systems the network setup screen has a checkbox you may never have touched: something like "TLS" or "Secure connection," next to fields for a certificate. In many departments it stays unchecked. Images go to PACS in plaintext across the hospital network, and nobody notices, because nothing breaks.

What it means is that anyone who can capture traffic on the path between the machine and the archive can read the patient's name, the MRN, and the images themselves. Chapter 14 showed that the receiver cannot tell who is really calling. This chapter fixes both problems at once, because the same mechanism that encrypts the connection can also prove who is on each end.

## On the wire

### DICOM inside a TLS tunnel

DICOM over TLS changes nothing about DICOM itself. The machine opens a TCP connection, the two sides perform a TLS handshake, and then the same association, C-ECHO and C-STORE messages from Chapters 5 and 7 flow inside the encrypted tunnel.

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="Sequence: the TCP connection opens, the TLS handshake exchanges and checks certificates, and only then does the DICOM association and C-STORE flow inside the encrypted tunnel.">
<defs><marker id="ch15-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="60" y="10" width="160" height="40" rx="4" class="box"/>
<text x="140" y="35" text-anchor="middle">Machine (SCU)</text>
<rect x="500" y="10" width="160" height="40" rx="4" class="box"/>
<text x="580" y="35" text-anchor="middle">Receiver (SCP)</text>
<line x1="140" y1="50" x2="140" y2="320" class="dashed"/>
<line x1="580" y1="50" x2="580" y2="320" class="dashed"/>
<line x1="140" y1="80" x2="580" y2="80" marker-end="url(#ch15-arrow)"/>
<text x="360" y="72" text-anchor="middle" class="small">TCP connect to port 2762</text>
<line x1="580" y1="115" x2="140" y2="115" marker-end="url(#ch15-arrow)"/>
<text x="360" y="107" text-anchor="middle" class="small">server certificate</text>
<line x1="140" y1="150" x2="580" y2="150" marker-end="url(#ch15-arrow)"/>
<text x="360" y="142" text-anchor="middle" class="small">client certificate (mutual TLS)</text>
<rect x="150" y="170" width="420" height="140" rx="4" class="box accent"/>
<text x="360" y="190" text-anchor="middle" class="small">encrypted tunnel</text>
<line x1="160" y1="215" x2="560" y2="215" marker-end="url(#ch15-arrow)"/>
<text x="360" y="208" text-anchor="middle" class="small">A-ASSOCIATE-RQ</text>
<line x1="560" y1="245" x2="160" y2="245" marker-end="url(#ch15-arrow)"/>
<text x="360" y="238" text-anchor="middle" class="small">A-ASSOCIATE-AC</text>
<line x1="160" y1="290" x2="560" y2="290" marker-end="url(#ch15-arrow)"/>
<text x="360" y="283" text-anchor="middle" class="small">C-STORE (image)</text>
</svg>
<figcaption>Figure 15.1 — TLS happens first. Certificates are checked before a single DICOM byte is exchanged; the association and the images then travel inside the tunnel.</figcaption>
</figure>

### Server TLS and mutual TLS

<div class="pairs">
<div><span>Server TLS</span><p>Only the receiver shows a certificate. The machine knows it is talking to the real archive, and the traffic is encrypted, but the receiver still does not know who the machine is.</p></div>
<div><span>Mutual TLS</span><p>Both sides show certificates. The receiver accepts the connection only if the machine's certificate chains to a certificate authority (CA) the receiver trusts. Now "Room 3" means "whoever holds Room 3's private key."</p></div>
</div>

Mutual TLS is what turns Chapter 14's weak AE title into something you can rely on. The AE title is still sent, but you no longer have to believe it: you can check that the certificate and the claimed AE title belong together.

### What the standard says

DICOM defines how to do this in **PS3.15 Annex B, Secure Transport Connection Profiles**. Several older profiles there, including the original Basic TLS profile and the first BCP 195 profiles, are now marked retired. The current ones are named after the IETF's TLS guidance (BCP 195 with RFC 8996 and RFC 9325). The **BCP 195 RFC 8996, 9325 TLS Secure Transport Connection Profile** (Annex B.12) requires:

- TLS 1.2 support on both sides, with TLS 1.3 allowed and preferred when both sides offer it;
- servers that **support** mutual authentication (they may be configured not to use it); clients are encouraged, not required, to support it;
- port **2762**, registered as `dicom-tls`, as the recommended port for DICOM over TLS;
- a Conformance Statement that lists the TLS ports used, or how they are chosen.

The practical consequence: a device can claim TLS support and still not do mutual TLS as a client. The Conformance Statement tells you which.

### Certificates on modalities

Certificates expire, and modalities are not web servers with automatic renewal. Plan the whole lifecycle before you turn TLS on:

1. **Issue.** Use a private CA run by the organization (not a public web CA) for device certificates. One certificate per device, with a name you can map to that device.
2. **Install.** Usually by a service engineer, through the vendor's setup screen or tools.
3. **Track.** Keep an inventory of every device certificate and its expiry date. An expired certificate on the scanner means a morning of failed sends.
4. **Renew** before expiry, on a schedule, with the vendor if needed.
5. **Revoke** when a device is retired, stolen or replaced, and make sure the receiver checks revocation.

### The hospital network

TLS protects a link. It does not replace network design. A typical department looks like Figure 15.2:

<figure class="diagram">
<svg viewBox="0 0 720 300" role="img" aria-label="Three network zones: modalities and a gateway on a modality VLAN with a short plaintext link; mutual TLS from the gateway across the hospital network to the archive; and HTTPS with mutual TLS out to a cloud system.">
<defs><marker id="ch15-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<rect x="10" y="30" width="250" height="250" rx="6" class="box"/>
<text x="135" y="52" text-anchor="middle">Modality VLAN</text>
<rect x="30" y="80" width="120" height="44" rx="4" class="box"/>
<text x="90" y="107" text-anchor="middle">US Room 3</text>
<rect x="30" y="200" width="120" height="44" rx="4" class="box"/>
<text x="90" y="227" text-anchor="middle">Old scanner</text>
<rect x="170" y="140" width="80" height="44" rx="4" class="box accent"/>
<text x="210" y="167" text-anchor="middle">Gateway</text>
<line x1="150" y1="102" x2="185" y2="140" marker-end="url(#ch15-arrow2)"/>
<text x="185" y="112" class="small">TLS</text>
<line x1="150" y1="222" x2="185" y2="184" class="dashed" marker-end="url(#ch15-arrow2)"/>
<text x="30" y="272" class="small">plaintext, same segment</text>
<rect x="300" y="30" width="200" height="250" rx="6" class="box"/>
<text x="400" y="52" text-anchor="middle">Hospital network</text>
<rect x="340" y="140" width="120" height="44" rx="4" class="box"/>
<text x="400" y="167" text-anchor="middle">Archive</text>
<line x1="250" y1="162" x2="340" y2="162" marker-end="url(#ch15-arrow2)"/>
<text x="295" y="154" text-anchor="middle" class="small">mTLS</text>
<rect x="540" y="30" width="170" height="250" rx="6" class="box"/>
<text x="625" y="52" text-anchor="middle">Internet / cloud</text>
<rect x="565" y="140" width="120" height="44" rx="4" class="box"/>
<text x="625" y="167" text-anchor="middle">Cloud app</text>
<path d="M210,184 L210,260 L625,260 L625,184" class="dashed" marker-end="url(#ch15-arrow2)"/>
<text x="400" y="252" text-anchor="middle" class="small">HTTPS with mTLS, outbound only</text>
</svg>
<figcaption>Figure 15.2 — Plaintext is tolerated only on the short hop inside the modality VLAN; every link that leaves the segment is TLS, and only the gateway leaves it.</figcaption>
</figure>

### When the device cannot do TLS

Many modalities in service today either cannot do TLS or cannot do it in the profile you need. You cannot fix the device, so you shorten the plaintext path instead:

- put the device and a TLS-capable gateway on the same small VLAN, so plaintext never crosses a shared network;
- let only that device's address reach the gateway's plaintext port;
- have the gateway speak TLS (or HTTPS with mutual TLS) for every hop after that.

This is the pattern Chapter 16 builds out.

## Lab

You will make a tiny private CA, give one certificate to a receiver and one to a "machine," and watch mutual TLS accept the right client and reject three wrong ones. You need DCMTK (`brew install dcmtk` on macOS, `apt install dcmtk` on Debian or Ubuntu) and OpenSSL. The commands below were checked with DCMTK 3.6.9. Everything is synthetic and local.

**Make a lab CA and two certificates.**

```bash
mkdir pki && cd pki
openssl req -x509 -newkey rsa:2048 -nodes -days 30 \
  -subj "/CN=Lab DICOM CA" -keyout ca.key -out ca.crt
for name in gateway room3; do
  openssl req -newkey rsa:2048 -nodes -subj "/CN=$name" -keyout $name.key -out $name.csr
  openssl x509 -req -in $name.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 30 -out $name.crt
done
```

`-nodes` leaves the private keys unencrypted so the tools do not prompt for a password. That is fine for a lab and wrong for a real device.

**Start a TLS receiver** on port 2762 that requires a client certificate signed by your CA. In DCMTK, `+tls key cert` turns TLS on, `+cf` adds a trusted CA certificate, and `-rc` (`--require-peer-cert`) means "verify the peer's certificate, fail if absent."

```bash
storescp -aet GATEWAY +tls gateway.key gateway.crt +cf ca.crt -rc -od /tmp 2762 &
```

**Run four C-ECHOs** from a second terminal in the same directory:

```bash
# 1. The real machine: certificate from our CA
echoscu -v -aet US_ROOM3 -aec GATEWAY +tls room3.key room3.crt +cf ca.crt localhost 2762

# 2. TLS, but no client certificate
echoscu -aet US_ROOM3 -aec GATEWAY +tla +cf ca.crt localhost 2762

# 3. Plaintext DICOM to the TLS port
echoscu -aet US_ROOM3 -aec GATEWAY localhost 2762

# 4. A self-signed certificate nobody issued
openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj "/CN=rogue" -keyout rogue.key -out rogue.crt
echoscu -aet US_ROOM3 -aec GATEWAY +tls rogue.key rogue.crt +cf ca.crt localhost 2762
```

What you should see:

| Try | echoscu | storescp says |
|---|---|---|
| 1 | `Received Echo Response (Success)` | nothing wrong |
| 2 | `Association Request Failed` | `TLS error: peer did not return a certificate` |
| 3 | `Association Request Failed` | `TLS error: wrong version number` (it got DICOM, expected TLS) |
| 4 | `Association Request Failed` | `TLS error: certificate verify failed` |

The detail after `Association Request Failed` (a TCP I/O error or "Peer aborted Association") varies with the platform and OpenSSL version; the receiver's log line is the reliable part. All three are refused in the TLS handshake, before any association is accepted: the same AE title, `US_ROOM3`, is used every time, and it no longer matters. Stop the receiver with `kill %1`.

Finally, try `storescp` with `-ic` (`--ignore-peer-cert`) instead of `-rc` and repeat try 4. It now succeeds: encryption without authentication. Note it, because it is a common misconfiguration.

## In Lumen

Lumen today talks only HTTPS to browsers. It has no DICOM port, so it has no plaintext DICOM to protect.

In the planned design, Lumen never speaks DIMSE to a machine. The plaintext or TLS DIMSE hop stays inside the facility, between the machine and the facility's gateway. The one link that leaves the facility, gateway to Lumen, is HTTPS (STOW-RS, Chapter 19) with mutual TLS, opened outbound by the gateway. The gateway's client certificate is its device identity: Lumen maps it to one organization and facility (Chapter 17) and rejects any connection without a certificate it issued.

## How it fails

- **Encrypted but not authenticated.** The receiver uses TLS but ignores client certificates (`-ic` in the lab). Traffic is private, and anyone can still connect.
- **Expired certificate.** The scanner's certificate expires on a weekend. Every send fails with a TLS error the technologist sees as "network error."
- **Wrong trust store.** The receiver trusts a public CA bundle, so any certificate from any website owner passes.
- **Plaintext on the wrong side.** TLS is terminated at the edge, then images cross a shared hospital network in plaintext to the archive.
- **Profile mismatch.** The device only supports a retired profile or cipher suite; the receiver rejects it; someone "fixes" it by turning TLS off.

## Evidence

You can show the four lab results with the receiver's matching log lines; an inventory row for one device certificate (subject, issuer, expiry, renewal owner); and a network diagram of one department that marks every link plaintext or TLS, with a reason for each plaintext link.

## Workbook

1. In try 2 the client used TLS but sent no certificate. Why did the receiver end the connection, and which `storescp` option made it do so?
2. Server TLS protects confidentiality. What extra property does mutual TLS add, and why does it matter for Chapter 14's problem?
3. A modality cannot do TLS at all. Describe the smallest network arrangement that keeps its plaintext off the shared hospital network.
4. Why is "the device supports TLS" not enough information? Name two things to look up in its Conformance Statement.
5. What should happen to a device's certificate when the device is retired, and what must the receiver do for that to have any effect?

## Answers

1. The receiver was started with `-rc` (`--require-peer-cert`), which tells it to verify the client's certificate and fail if there is none. With no certificate there is nothing to verify, so the TLS handshake fails before any DICOM is exchanged (see the lab table).
2. Mutual TLS adds authentication of the client: the receiver accepts only a sender that holds a private key whose certificate chains to a CA it trusts. That replaces the self-declared AE title with something that takes a secret to fake (see "Server TLS and mutual TLS").
3. Put the device and a TLS-capable gateway on the same small VLAN, allow only the device's address to reach the gateway's plaintext port, and make every hop beyond the gateway TLS. Plaintext then exists only on that one short segment (see "When the device cannot do TLS" and Figure 15.2).
4. Supporting TLS says nothing about which profile, TLS version or cipher suites it uses, whether it can present a client certificate (mutual TLS as a client is optional in the current profile), or which ports it uses. Look up the supported Secure Transport Connection Profiles and whether it acts as a TLS client with its own certificate (PS3.15 Annex B.12).
5. Revoke it, so it can no longer be used to connect, and remove it from the inventory. Revocation only works if the receiver checks it, for example through a certificate revocation list (DCMTK's `+crl`), or if the receiver's trust is narrowed some other way (see "Certificates on modalities").

<p class="sources">Sources: DICOM PS3.15 Annex B (Secure Transport Connection Profiles; B.1 and B.9 retired; B.12 BCP 195 RFC 8996, 9325 TLS profile: TLS 1.2 required, TLS 1.3 preferred, servers support mutual authentication, port 2762 "dicom-tls" recommended); PS3.8 (DICOM Upper Layer over TCP); DCMTK 3.6.9 storescp and echoscu documentation (TLS options +tls, +tla, +cf, -rc, -ic, +crl), lab verified with DCMTK 3.6.9 and OpenSSL.</p>
