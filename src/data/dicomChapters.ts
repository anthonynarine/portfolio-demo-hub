// # Filename: src/data/dicomChapters.ts

// The DICOM handbook's chapters are the Markdown files in handbooks/dicom/content/chapters, the same files the
// PDF is built from. Each one becomes its own lazily loaded chunk, so the /dicom page only knows which numbers exist.
const loaders = import.meta.glob<string>("../../handbooks/dicom/content/chapters/*.md", {
  query: "?raw",
  import: "default",
});

const loaderByNumber = new Map<number, () => Promise<string>>(
  Object.entries(loaders).map(([path, load]) => [Number(path.match(/\/(\d+)-[^/]+\.md$/)?.[1]), load]),
);

/** Chapter numbers that have been written, ascending. */
export const writtenChapterNumbers = [...loaderByNumber.keys()].filter(Number.isFinite).sort((a, b) => a - b);

export const isChapterWritten = (number: number) => loaderByNumber.has(number);

export const chapterPath = (number: number) => `/dicom/${number}`;

export type LoadedChapter = {
  number: number;
  title: string;
  objective: string;
  draft: boolean;
  markdown: string;
};

/** `---` frontmatter (flat key: value lines) and the Markdown body; same format as the PDF build. */
function parseChapter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("A chapter must start with --- frontmatter ---");
  const meta = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const at = line.indexOf(":");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
    }),
  );
  return { meta, body: match[2] };
}

export async function loadChapter(number: number): Promise<LoadedChapter | null> {
  const load = loaderByNumber.get(number);
  if (!load) return null;
  const { meta, body } = parseChapter(await load());
  return {
    number,
    title: meta.title ?? "",
    objective: meta.objective ?? "",
    draft: meta.status === "draft",
    markdown: body,
  };
}
