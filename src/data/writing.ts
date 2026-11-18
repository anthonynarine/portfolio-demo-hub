// # Filename: src/data/writing.ts

import { dicomChapterCount, dicomHandbook } from "./dicomHandbook";
import { contents as hipaaContents, handbook as hipaaHandbook } from "./handbook";
import { profileLinks } from "./projects";

export type WritingLink = { label: string; href: string; download?: boolean; external?: boolean };

export type WritingEntry = {
  kicker: string;
  title: string;
  summary: string;
  detail: string;
  links: WritingLink[];
};

const hipaaChapterCount = hipaaContents.reduce((total, part) => total + part.chapters.length, 0);

/** Everything on the /writing page, newest first. */
export const writing: WritingEntry[] = [
  {
    kicker: "Handbook · New",
    title: dicomHandbook.title,
    summary:
      "What happens on the network when a technologist presses End Exam, and how to build a system that receives those images safely: associations and tags, worklists, security, gateways, DICOMweb and quality assurance.",
    detail: `${dicomChapterCount} chapters · diagrams, labs and workbook answers · ${dicomHandbook.edition.toLowerCase()}`,
    links: [
      { label: "Read online", href: profileLinks.dicomHandbook },
      { label: "PDF", href: dicomHandbook.pdf, download: true },
    ],
  },
  {
    kicker: "Handbook",
    title: hipaaHandbook.title,
    summary:
      "Building regulated medical software: trust boundaries, minimum-necessary APIs, audit controls, HL7 and DICOM interfaces, and the evidence that proves a control actually works.",
    detail: `${hipaaChapterCount} chapters · engineering handbook and workbook · ${hipaaHandbook.date}`,
    links: [
      { label: "Contents", href: profileLinks.handbook },
      { label: "PDF", href: hipaaHandbook.pdf, download: true },
    ],
  },
  {
    kicker: "Reference",
    title: "Engineering Handbook",
    summary:
      "My working reference for building production Django and React systems: layered architecture, authentication, tenant isolation, deployment, operations, and how I build with Foundry.",
    detail: "A living site, updated as my projects change",
    links: [{ label: "Open the handbook", href: profileLinks.engineeringHandbook, external: true }],
  },
];
