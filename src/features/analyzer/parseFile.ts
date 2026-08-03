/**
 * Client-side text extraction for resume / JD uploads.
 *
 * pdfjs-dist and mammoth are heavy, so both are pulled in via dynamic import()
 * from inside this module — and this module itself is dynamically imported by
 * Analyzer.tsx. Nothing here lands in the main bundle until a user picks a file.
 */

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/**
 * Cheap pre-flight check so the caller can reject bad files without paying
 * the cost of loading a parser. Returns an error message, or null if OK.
 */
export function validateFile(file: File): string | null {
  const ext = extensionOf(file.name);

  if (!ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number])) {
    return "Only .pdf, .docx and .txt files are supported.";
  }

  if (file.size > MAX_FILE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `That file is ${mb}MB — the limit is 5MB.`;
  }

  if (file.size === 0) {
    return "That file is empty.";
  }

  return null;
}

async function parseTxt(file: File): Promise<string> {
  return await file.text();
}

async function parsePdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  // Vite resolves this to a hashed asset URL at build time and serves the
  // worker as its own file, so it never enters the main chunk.
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url"))
    .default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;

  try {
    const pages: string[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();

      // pdfjs splits a line into many items; join with spaces and let the
      // consumer treat each page as a block.
      const pageText = content.items
        .map((item: any) => (typeof item?.str === "string" ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (pageText) pages.push(pageText);
      page.cleanup();
    }

    const text = pages.join("\n\n").trim();

    if (!text) {
      throw new Error(
        "No selectable text found. This PDF looks scanned or image-based — paste the text instead."
      );
    }

    return text;
  } finally {
    await doc.destroy();
  }
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser.js");
  const arrayBuffer = await file.arrayBuffer();

  const result = await (mammoth as any).extractRawText({ arrayBuffer });
  const text = (result?.value || "").trim();

  if (!text) {
    throw new Error("That .docx has no readable text in it.");
  }

  return text;
}

/**
 * Extract plain text from a resume or job-description file.
 * Throws with a user-presentable message on any failure.
 */
export async function parseFile(file: File): Promise<string> {
  const invalid = validateFile(file);
  if (invalid) throw new Error(invalid);

  const ext = extensionOf(file.name);

  try {
    if (ext === ".txt") return await parseTxt(file);
    if (ext === ".pdf") return await parsePdf(file);
    return await parseDocx(file);
  } catch (err: any) {
    // Preserve our own messages; replace library internals with something readable.
    const message: string = err?.message || "";
    const isOurs =
      message.includes("scanned") ||
      message.includes("readable text") ||
      message.includes("empty") ||
      message.includes("limit is 5MB") ||
      message.includes("supported");

    throw new Error(
      isOurs
        ? message
        : `Couldn't read ${file.name}. The file may be corrupt or password-protected.`
    );
  }
}
