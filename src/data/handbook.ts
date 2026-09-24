// # Filename: src/data/handbook.ts

export const handbook = {
  title: "HIPAA for Medical Application Developers",
  strapline: "Architecture · Code · Evidence · Clinical Integrations · Secure Delivery",
  edition: "Developer learning edition",
  date: "September 2026",
  pages: 92,
  pdf: "/HIPAA-for-Medical-Application-Developers.pdf",
};

/** The five questions the book promises you can answer by the end. */
export const promiseQuestions = [
  "What regulated data exists?",
  "Where does it move?",
  "Who is allowed to act on it?",
  "What can go wrong?",
  "What evidence proves the control actually works?",
];

/** The recurring loop every chapter runs the reader through. */
export const engineeringLoop = [
  "Rule",
  "Developer question",
  "Architecture",
  "Code enforcement point",
  "Negative test",
  "Evidence",
  "Gap / residual risk",
];

export type HandbookPart = {
  numeral: string;
  title: string;
  chapters: string[];
};

export const contents: HandbookPart[] = [
  {
    numeral: "I",
    title: "Understand the law before the code",
    chapters: [
      "What HIPAA is — and is not",
      "Covered entities, business associates, and the BAA perimeter",
      "PHI, ePHI, identifiers, and context",
      "Privacy Rule vs Security Rule vs Breach Notification Rule",
      "How to read HIPAA like an engineer",
    ],
  },
  {
    numeral: "II",
    title: "Control the data",
    chapters: [
      "Minimum necessary as API and query design",
      "De-identification: the boundary where PHI can stop being PHI",
      "Safe Harbor in practice",
      "Expert Determination and the Limited Data Set",
      "Free text, analytics, research, and AI model boundaries",
    ],
  },
  {
    numeral: "III",
    title: "Build the Security Rule into architecture",
    chapters: [
      "Risk analysis and risk management",
      "Administrative and physical safeguards developers still need to understand",
      "Access control and emergency access",
      "Authentication, sessions, and identity proof",
      "Audit controls: security telemetry vs ePHI activity",
      "Integrity and clinical meaning",
      "Transmission security and encryption decisions",
      "Availability, backups, and downtime",
      "Documentation, evidence, retention, and review",
    ],
  },
  {
    numeral: "IV",
    title: "Clinical systems and cloud boundaries",
    chapters: [
      "HL7, MLLP, TCP, and interface security",
      "DICOM and medical image security",
      "Cloud vendors, BAAs, secrets, and object storage",
      "Multi-tenancy, facilities, support access, and break-glass",
    ],
  },
  {
    numeral: "V",
    title: "Secure software engineering",
    chapters: [
      "OWASP Top 10:2025 for medical applications",
      "OWASP ASVS 5.0 as a verification backbone",
      "Threat modeling and secure design",
      "Secure development lifecycle and supply-chain assurance",
      "Testing controls, exceptional conditions, and fail-safe behavior",
      "Incident response, breach readiness, and evidence preservation",
    ],
  },
  {
    numeral: "VI",
    title: "Capstone",
    chapters: ["Perform a HIPAA engineering review of Lumen — then your own system"],
  },
];

/** Drawn from the book's closing self-assessment. */
export const outcomes = [
  "Draw the BAA perimeter and say who is regulated in a software relationship",
  "Design minimum-necessary APIs and query projections",
  "Review AI and model data flows for PHI, contracts, minimization, retention, and logging",
  "Review tenant and facility authorization, emergency access, and break-glass",
  "Design audit events without copying excessive PHI into logs",
  "Explain HL7 over MLLP over TCP, and where transport protection belongs",
  "Define RPO/RTO and prove restoration and reconciliation",
  "Assemble evidence instead of merely claiming compliance",
];

/** Chapters are numbered continuously across parts; precompute each part's first chapter number. */
export const numberedContents = contents.map((part, index) => ({
  ...part,
  firstChapter:
    contents.slice(0, index).reduce((total, previous) => total + previous.chapters.length, 0) + 1,
}));
