---
number: 17
title: Tenancy: taking the organization from the connection, never the tags
objective: Decide which organization and facility an incoming image belongs to from the authenticated connection, treat every tag as a claim, and prove it with negative tests.
status: draft
---

## At the machine

Every ultrasound system has a few setup fields nobody thinks about after installation: the institution name, the department, the station name. Whatever is typed there is stamped into every image the machine produces. When a machine moves from one clinic to another, or a service engineer copies a configuration from a different site, those fields are often wrong for months. Nobody in the department notices, because the local archive files images by patient and accession number, not by what the machine says its hospital is called.

A cloud system that serves many organizations has a harder question to answer than a local archive: *whose* image is this? This chapter is about answering it from something the sender cannot simply type.

## On the wire

### Tags are claims

Chapter 10 showed that a DICOM object is a header of tags plus pixel data. Every one of those tags was written by software you do not control: the modality, a gateway, sometimes a person at a keyboard. Some of them look like they identify an organization:

| Tag | Name | Who wrote it |
|---|---|---|
| (0008,0080) | Institution Name | Typed into the machine's setup |
| (0008,1040) | Institutional Department Name | Typed into the machine's setup |
| (0008,1010) | Station Name | Typed into the machine's setup |
| (0010,0021) | Issuer of Patient ID | Copied from the worklist, if present |
| (0002,0016) | Source Application Entity Title | Set by the software that wrote the file |

All of them are claims. They are useful for display and troubleshooting, and some are useful for consistency checks, as you will see. None of them may decide which organization's data an image joins.

### The two ways to resolve a tenant

In a multi-tenant system, the **tenant** is the organization whose data this is; in Lumen, an organization with one or more facilities. Figure 17.1 contrasts the two designs.

<figure class="diagram">
<svg viewBox="0 0 720 330" role="img" aria-label="Left: wrong design, the ingest service reads Institution Name from the image and writes into whichever organization matches. Right: correct design, the ingest service maps the gateway's verified certificate to an organization and facility, then checks tags against it and holds mismatches.">
<defs><marker id="ch17-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
<text x="175" y="22" text-anchor="middle">Wrong: tenant from tags</text>
<text x="545" y="22" text-anchor="middle">Right: tenant from connection</text>
<line x1="360" y1="10" x2="360" y2="320" class="dashed"/>
<rect x="95" y="40" width="160" height="50" rx="4" class="box"/>
<text x="175" y="62" text-anchor="middle">Image</text>
<text x="175" y="80" text-anchor="middle" class="small">Institution: NORTH</text>
<line x1="175" y1="90" x2="175" y2="140" marker-end="url(#ch17-arrow)"/>
<text x="185" y="120" class="small">read tag</text>
<rect x="95" y="140" width="160" height="50" rx="4" class="box"/>
<text x="175" y="170" text-anchor="middle">Ingest</text>
<line x1="175" y1="190" x2="175" y2="240" marker-end="url(#ch17-arrow)"/>
<text x="185" y="220" class="small">write</text>
<rect x="95" y="240" width="160" height="50" rx="4" class="box accent"/>
<text x="175" y="262" text-anchor="middle">North's data</text>
<text x="175" y="280" text-anchor="middle" class="small">sent by South</text>
<rect x="390" y="40" width="150" height="50" rx="4" class="box"/>
<text x="465" y="62" text-anchor="middle">South gateway</text>
<text x="465" y="80" text-anchor="middle" class="small">client cert</text>
<rect x="560" y="40" width="150" height="50" rx="4" class="box"/>
<text x="635" y="62" text-anchor="middle">Image</text>
<text x="635" y="80" text-anchor="middle" class="small">Institution: NORTH</text>
<line x1="465" y1="90" x2="510" y2="140" marker-end="url(#ch17-arrow)"/>
<text x="440" y="122" class="small">verify</text>
<line x1="635" y1="90" x2="590" y2="140" class="dashed" marker-end="url(#ch17-arrow)"/>
<text x="640" y="122" class="small">check only</text>
<rect x="470" y="140" width="160" height="50" rx="4" class="box"/>
<text x="550" y="162" text-anchor="middle">Ingest</text>
<text x="550" y="180" text-anchor="middle" class="small">org = South</text>
<line x1="550" y1="190" x2="550" y2="240" marker-end="url(#ch17-arrow)"/>
<text x="560" y="220" class="small">mismatch</text>
<rect x="470" y="240" width="160" height="50" rx="4" class="box accent"/>
<text x="550" y="262" text-anchor="middle">South's hold queue</text>
<text x="550" y="280" text-anchor="middle" class="small">for a person</text>
</svg>
<figcaption>Figure 17.1 — The same mislabeled image. Routed by tags, it is written into another organization's records. Routed by the connection, it stays in the sender's organization and is held because its label disagrees.</figcaption>
</figure>

**From tags (wrong).** The ingest service reads Institution Name and looks it up. Any device can be mislabeled, copied, or deliberately set to another organization's name, and its images become part of that organization's records. This is a **cross-tenant write**: one customer's device changes another customer's patient data. It is among the worst failures a multi-tenant system can have, because the receiving organization did nothing wrong and cannot see it happen.

**From the connection (right).** The ingest service first establishes *who is calling*: the gateway's client certificate, verified during the TLS handshake (Chapter 15), or another service credential issued by the system. The system's own records map that credential to exactly one organization and facility. Only then does it read the image.

### Mapping credentials to tenants

The mapping is data the system owns, created when a facility's gateway is enrolled:

<div class="pairs">
<div><span>Credential</span><p>The gateway's certificate (identified by its fingerprint, or its subject issued by your CA), or a service account.</p></div>
<div><span>Organization</span><p>Exactly one. A credential that maps to two organizations is a configuration error, not a feature.</p></div>
<div><span>Facility</span><p>The site the gateway serves, so images join that facility's worklist and permissions.</p></div>
<div><span>Status</span><p>Active, suspended or revoked. A revoked credential is refused even if its certificate has not expired.</p></div>
</div>

### Tags as a consistency check

Tags are not useless. Once the tenant is known, you can compare what the image says with what you expect from that facility:

- Institution Name or Station Name that does not match the facility on record;
- an Accession Number that exists, but in a different organization;
- an Issuer of Patient ID that belongs to another organization.

Each mismatch means "something is misconfigured or wrong," never "move it to the organization the tag names." The safe action is to **keep the image inside the sending tenant and hold it** for a person in that organization to review. Chapter 22 builds that hold queue.

### Fail closed

Every unclear case must end in refusal or a hold, never in a guess:

| Situation | Action |
|---|---|
| No client certificate or credential | Reject |
| Credential unknown, suspended or revoked | Reject |
| Credential valid, tags consistent | Store in that tenant |
| Credential valid, tags inconsistent | Hold in that tenant |
| Credential valid, but the image names another tenant's accession | Hold in the sending tenant; never look the accession up in the other tenant |

## Lab

You will write both routers and prove with tests that one of them makes cross-tenant writes and the other cannot. You need Python 3.10 or later and pydicom (`pip install pydicom==3.0.1`). The organizations and certificates are invented.

Save this as `tenancy_lab.py`:

```python
"""Two ways to decide which organization an incoming image belongs to. One of them is wrong."""
from dataclasses import dataclass

from pydicom import Dataset

# What the ingest service knows from its own records, never from the image.
GATEWAYS = {
    # client certificate fingerprint -> (organization, facility)
    "sha256:aa11": ("north-clinic", "north-main"),
    "sha256:bb22": ("south-vascular", "south-satellite"),
}
FACILITY_NAMES = {"north-main": "NORTH CLINIC", "south-satellite": "SOUTH VASCULAR"}


@dataclass
class Decision:
    organization: str | None
    facility: str | None
    action: str  # "store", "hold" or "reject"
    reason: str


def route_by_tags(ds: Dataset) -> Decision:
    """WRONG: trusts what the device wrote into the image."""
    for facility, name in FACILITY_NAMES.items():
        if ds.get("InstitutionName", "").upper() == name:
            org = next(o for o, f in GATEWAYS.values() if f == facility)
            return Decision(org, facility, "store", "matched InstitutionName")
    return Decision(None, None, "reject", "unknown institution")


def route_by_connection(cert_fingerprint: str | None, ds: Dataset) -> Decision:
    """RIGHT: the tenant comes from the authenticated connection; tags are only checked against it."""
    if cert_fingerprint not in GATEWAYS:
        return Decision(None, None, "reject", "unknown or missing client certificate")
    org, facility = GATEWAYS[cert_fingerprint]
    claimed = ds.get("InstitutionName", "").upper()
    if claimed and claimed != FACILITY_NAMES[facility]:
        return Decision(org, facility, "hold", f"InstitutionName {claimed!r} does not match the sending facility")
    return Decision(org, facility, "store", "tenant from client certificate")


def image(institution: str) -> Dataset:
    ds = Dataset()
    ds.PatientID = "DEMO-0001"
    ds.AccessionNumber = "ACC-0001"
    ds.InstitutionName = institution
    return ds


if __name__ == "__main__":
    # South's gateway sends an image whose device was mislabeled (or spoofed) as North.
    mislabeled = image("NORTH CLINIC")
    print("by tags:      ", route_by_tags(mislabeled))
    print("by connection:", route_by_connection("sha256:bb22", mislabeled))

    # Negative tests: each must fail closed.
    assert route_by_connection(None, image("NORTH CLINIC")).action == "reject"
    assert route_by_connection("sha256:zz99", image("NORTH CLINIC")).action == "reject"
    assert route_by_connection("sha256:bb22", image("NORTH CLINIC")).organization == "south-vascular"
    assert route_by_connection("sha256:bb22", image("NORTH CLINIC")).action == "hold"
    assert route_by_connection("sha256:bb22", image("SOUTH VASCULAR")).action == "store"
    assert route_by_connection("sha256:bb22", image("")).action == "store"
    print("all negative tests passed")
```

Run it with `python tenancy_lab.py`. The first line shows the tag router writing South's image into `north-clinic`. The second shows the connection router keeping it in `south-vascular` and holding it, with the reason. Then try to break the connection router: add an assertion for something you think it gets wrong, and see whether it does. Notice that no test has to ask "what if the tag is spoofed?", because the tag never chooses the tenant.

In a real service the certificate fingerprint comes from the TLS layer (often a reverse proxy that verified the client certificate and passes its identity to the application on a trusted internal hop), never from a request header the client can set.

## In Lumen

Lumen already applies this rule to people. Every request names an organization, and the backend checks the signed-in user's active membership in it before any clinical data is read or written; facility access is checked the same way, and cross-tenant access returns "not found." The organization is never taken from what a request body says about itself.

The planned machine path uses the same rule with a device in place of a person. Each facility's gateway gets its own credential, enrolled in Lumen and mapped to one organization and one facility. The ingest endpoint takes the tenant only from that verified credential. Tags are read after that, used to match images to exams within the tenant (Chapter 22), and compared with the facility on record; mismatches go to that tenant's hold queue. Tests will include the negative cases from the lab: missing credential, revoked credential, and an image labeled with another organization.

## How it fails

- **Routing by Institution Name.** The classic mistake. Works perfectly in testing, where every device is labeled correctly.
- **Trusting a header.** The application reads the tenant from an `X-Organization` header that the gateway sets, and anyone who can reach the endpoint can set it too.
- **Global lookups.** The service finds the exam by Accession Number across all tenants, then writes into whichever tenant owns it. Accession numbers are not unique across organizations.
- **Shared credentials.** Two facilities' gateways share one certificate, so their images cannot be told apart and revoking one stops both.
- **"Fixing" a mismatch by moving it.** A mismatched image is moved to the organization its tag names, which is the cross-tenant write by a different route.

## Evidence

You can show the lab output with both routers' decisions for the same image; a test suite for your ingest service that includes, at minimum, missing credential, unknown credential, revoked credential, and image labeled for another tenant; and the enrollment record that maps one real gateway credential to one organization and facility.

## Workbook

1. Name three tags that look like they identify an organization, and say who writes each one.
2. Why is a cross-tenant write worse than an image going missing?
3. A valid gateway credential sends an image whose Institution Name belongs to a different customer. What should happen, and why not move it?
4. Why must the exam lookup by Accession Number be limited to the sending tenant?
5. What is wrong with having the gateway send the organization in an HTTP header?

## Answers

1. Institution Name (0008,0080), Station Name (0008,1010), and Institutional Department Name (0008,1040) are typed into the machine's setup. Issuer of Patient ID (0010,0021) is copied from the worklist, and Source Application Entity Title (0002,0016) is set by the software that wrote the file. All are claims by software you do not control (see "Tags are claims").
2. A missing image is visible to the people who expect it, and they can ask for it again. A cross-tenant write silently changes another organization's patient records. That organization did nothing wrong, cannot see it happen, and may make clinical decisions on someone else's images (see "The two ways to resolve a tenant").
3. Keep it in the sending tenant and put it in that tenant's hold queue with the reason, so a person there can review it. Moving it to the organization the tag names would let a label decide the tenant, which is exactly the cross-tenant write the design prevents (see "Tags as a consistency check" and Figure 17.1).
4. Accession numbers are issued by each organization's own systems and can repeat across organizations. A global lookup could find another tenant's exam and write into it. Scoping the lookup to the tenant from the credential makes that impossible (see "How it fails" and the fail-closed table).
5. Anyone who can reach the endpoint can set any header, so the header is just another claim. The tenant must come from something verified on the connection itself, such as the client certificate checked in the TLS handshake (see the note at the end of the lab).

<p class="sources">Sources: DICOM PS3.6 (data dictionary: Institution Name (0008,0080), Station Name (0008,1010), Institutional Department Name (0008,1040), Issuer of Patient ID (0010,0021), Source Application Entity Title (0002,0016)); PS3.15 Annex B.12 (mutual authentication in the secure transport profile); PS3.18 §10.5 (STOW-RS Store Transaction). Lab verified with pydicom 3.0.1 on Python 3.11.</p>
