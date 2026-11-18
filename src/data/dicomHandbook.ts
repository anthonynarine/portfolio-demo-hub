// # Filename: src/data/dicomHandbook.ts

/** The DICOM handbook's source is in handbooks/dicom; `npm run build:dicom` writes the PDF served here. */
export const dicomHandbook = {
  title: "DICOM for Medical Application Developers",
  strapline: "Network · Data · Workflow · Security · Integration",
  edition: "Early draft",
  date: "November 2026",
  pdf: "/DICOM-for-Medical-Application-Developers.pdf",
};

/** The five questions the book promises you can answer by the end. */
export const dicomPromiseQuestions = [
  "Who is calling whom?",
  "What is being sent, and in what form?",
  "How does each image find its patient and exam?",
  "Who is allowed to send, and how do we know?",
  "What evidence proves an image landed where it belongs?",
];

/** The recurring loop every chapter runs the reader through. */
export const dicomChapterLoop = [
  "At the machine",
  "On the wire",
  "Lab",
  "In Lumen",
  "How it fails",
  "Evidence",
];

export type DicomChapter = { title: string; drafted?: boolean };

export type DicomPart = {
  numeral: string;
  title: string;
  chapters: DicomChapter[];
};

/** Keep in step with handbooks/dicom/content/contents.md. */
export const dicomContents: DicomPart[] = [
  {
    numeral: "I",
    title: "From the tech's chair",
    chapters: [
      { title: "What happens when you press End Exam", drafted: true },
      { title: "PACS, modalities, worklists: who's who on an imaging network" },
      { title: "A study's life: order, worklist, scan, send, read, report" },
    ],
  },
  {
    numeral: "II",
    title: "The network",
    chapters: [
      { title: "Application Entities, ports, and the address book" },
      { title: "Associations: the handshake before every image" },
      { title: "SOP classes and transfer syntaxes: agreeing what and how" },
      { title: "C-ECHO, C-STORE, C-FIND, C-MOVE: the four verbs" },
      { title: "Modality Worklist and MPPS: the schedule and the status" },
      { title: "Storage Commitment: “did you really keep it?”" },
    ],
  },
  {
    numeral: "III",
    title: "The data",
    chapters: [
      { title: "Tags, VRs, and the DICOM file" },
      { title: "UIDs: study, series, instance" },
      { title: "Ultrasound images and cine: what a vascular study really contains" },
      { title: "Structured Reports: measurements that travel with the images" },
    ],
  },
  {
    numeral: "IV",
    title: "Security and HIPAA",
    chapters: [
      { title: "Why an AE title is not an identity" },
      { title: "DICOM over TLS and the hospital network" },
      { title: "Gateways: keeping DICOM on the inside" },
      { title: "Tenancy: taking the organization from the connection, never the tags" },
      { title: "De-identification for test data and teaching" },
    ],
  },
  {
    numeral: "V",
    title: "DICOMweb and the cloud",
    chapters: [
      { title: "STOW, WADO, and QIDO: DICOM over HTTPS" },
      { title: "Gateway-to-cloud patterns" },
    ],
  },
  {
    numeral: "VI",
    title: "Case study: Lumen",
    chapters: [
      { title: "Gateway to ingest to storage" },
      { title: "Matching images to exams, and the hold queue" },
      { title: "Testing an imaging integration without a scanner" },
      { title: "Capstone: a study from order to signed report" },
    ],
  },
];

/** Chapters are numbered continuously across parts; precompute each part's first chapter number. */
export const numberedDicomContents = dicomContents.map((part, index) => ({
  ...part,
  firstChapter:
    dicomContents.slice(0, index).reduce((total, previous) => total + previous.chapters.length, 0) + 1,
}));

export const dicomChapterCount = dicomContents.reduce((total, part) => total + part.chapters.length, 0);
export const dicomDraftedCount = dicomContents.reduce(
  (total, part) => total + part.chapters.filter((chapter) => chapter.drafted).length,
  0,
);
