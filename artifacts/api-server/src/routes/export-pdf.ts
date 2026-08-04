import { Router, type Request, type Response } from "express";
import { z } from "zod";

const router = Router();

// ── Request schema ──────────────────────────────────────────────────────────
const exportPdfSchema = z.object({
  text: z.string().min(1, "text is required").max(50_000, "text too long"),
  filename: z.string().max(100).optional(),
});

// ── PDF string literal escaping ─────────────────────────────────────────────
// PDF string literals delimited by ( ) must escape \, (, and )
function escapePdfStr(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

// ── Replace non-latin1 characters so the byte stream stays valid ────────────
function toLatin1Safe(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code <= 0xff) {
      out += s[i];
    } else {
      // Replace with closest ASCII lookalike or question mark
      const replacements: Record<number, string> = {
        0x2018: "'", 0x2019: "'", 0x201c: '"', 0x201d: '"',
        0x2013: "-", 0x2014: "--", 0x2026: "...", 0x00b7: "·",
      };
      out += replacements[code] ?? "?";
    }
  }
  return out;
}

// ── Approximate Helvetica character width (fraction of font size) ───────────
// Based on Adobe AFM data for Helvetica (widths in 1/1000 em units / 1000)
function charWidthFrac(ch: string): number {
  if (ch === " ") return 0.278;
  if ("iIl1|!.,;:'".includes(ch)) return 0.278;
  if ("frtj".includes(ch)) return 0.333;
  if ("sxzaeocvun".includes(ch)) return 0.556;
  if ("bdghkpqy".includes(ch)) return 0.556;
  if ("ABCDEFHIJKLMNOPRSTUVXYZ".includes(ch)) return 0.667;
  if ("mwMW".includes(ch)) return 0.778;
  if ("DGO0".includes(ch)) return 0.722;
  return 0.556; // reasonable default
}

function approxWidth(text: string, fontSize: number): number {
  let w = 0;
  for (const ch of text) w += charWidthFrac(ch);
  return w * fontSize;
}

// ── Word-wrap a single line to fit within maxWidth ──────────────────────────
function wrapLine(line: string, maxWidth: number, fontSize: number): string[] {
  if (approxWidth(line, fontSize) <= maxWidth) return [line];
  const words = line.split(" ");
  const result: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? current + " " + word : word;
    if (approxWidth(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) result.push(current);
      // If a single word is wider than the page, let it overflow rather than loop
      current = word;
    }
  }
  if (current) result.push(current);
  return result.length > 0 ? result : [line];
}

// ── Heading detection heuristic ─────────────────────────────────────────────
// Lines that are ALL-CAPS, ≤60 chars, contain letters, and don't start with
// a bullet character are treated as section headings.
function isHeading(line: string): boolean {
  if (line.length === 0 || line.length > 60) return false;
  if (line.startsWith("·") || line.startsWith("-") || line.startsWith("•")) return false;
  if (!/[A-Z]/.test(line)) return false;
  return line === line.toUpperCase();
}

// ── Main PDF builder ─────────────────────────────────────────────────────────
function buildPdf(rawText: string): Buffer {
  // ── Page geometry ──────────────────────────────────────────────────────────
  const PAGE_W = 612;   // Letter width in points
  const PAGE_H = 792;   // Letter height in points
  const MARGIN_X = 72;  // 1-inch left/right margin
  const MARGIN_TOP = 72;
  const MARGIN_BOT = 72;
  const USABLE_W = PAGE_W - 2 * MARGIN_X;  // 468 pts
  const USABLE_H = PAGE_H - MARGIN_TOP - MARGIN_BOT;  // 648 pts

  // ── Typography ─────────────────────────────────────────────────────────────
  const BODY_SIZE = 11;
  const HEAD_SIZE = 13;
  const BODY_LINE_H = Math.round(BODY_SIZE * 1.45 * 10) / 10;  // ~16
  const HEAD_LINE_H = Math.round(HEAD_SIZE * 1.6 * 10) / 10;   // ~21
  const BLANK_LINE_H = Math.round(BODY_SIZE * 0.65 * 10) / 10; // ~7 (paragraph gap)

  // ── Expand raw text into typed display lines ───────────────────────────────
  interface DisplayLine {
    text: string;
    fontName: "F1" | "F2"; // F1=Helvetica, F2=Helvetica-Bold
    fontSize: number;
    lineH: number;
  }

  const displayLines: DisplayLine[] = [];

  for (const raw of rawText.split("\n")) {
    const trimmed = toLatin1Safe(raw.trim());

    if (trimmed === "") {
      // Blank line — just vertical space
      displayLines.push({ text: "", fontName: "F1", fontSize: BODY_SIZE, lineH: BLANK_LINE_H });
      continue;
    }

    if (isHeading(trimmed)) {
      for (const w of wrapLine(trimmed, USABLE_W, HEAD_SIZE)) {
        displayLines.push({ text: w, fontName: "F2", fontSize: HEAD_SIZE, lineH: HEAD_LINE_H });
      }
    } else {
      for (const w of wrapLine(trimmed, USABLE_W, BODY_SIZE)) {
        displayLines.push({ text: w, fontName: "F1", fontSize: BODY_SIZE, lineH: BODY_LINE_H });
      }
    }
  }

  if (displayLines.length === 0) {
    displayLines.push({ text: "(empty)", fontName: "F1", fontSize: BODY_SIZE, lineH: BODY_LINE_H });
  }

  // ── Paginate display lines ─────────────────────────────────────────────────
  const pages: DisplayLine[][] = [];
  let pageBuf: DisplayLine[] = [];
  let yUsed = 0;

  for (const dl of displayLines) {
    if (yUsed + dl.lineH > USABLE_H && pageBuf.length > 0) {
      pages.push(pageBuf);
      pageBuf = [];
      yUsed = 0;
    }
    pageBuf.push(dl);
    yUsed += dl.lineH;
  }
  if (pageBuf.length > 0) pages.push(pageBuf);
  if (pages.length === 0) pages.push([]);

  // ── Build PDF content streams ───────────────────────────────────────────────
  const streamStrings: string[] = pages.map((pageLines) => {
    if (pageLines.length === 0) return "BT\nET";

    const chunks: string[] = ["BT"];
    let prevLineH = 0;
    let firstLine = true;

    for (const dl of pageLines) {
      chunks.push(`/${dl.fontName} ${dl.fontSize} Tf`);

      if (firstLine) {
        // Absolute position: X = left margin, Y = top of content area
        chunks.push(`${MARGIN_X} ${PAGE_H - MARGIN_TOP} Td`);
        firstLine = false;
      } else {
        // Relative: move down by the previous line's height
        chunks.push(`0 ${-prevLineH} Td`);
      }

      if (dl.text !== "") {
        chunks.push(`(${escapePdfStr(dl.text)}) Tj`);
      }

      prevLineH = dl.lineH;
    }

    chunks.push("ET");
    return chunks.join("\n");
  });

  // ── Assign object IDs ────────────────────────────────────────────────────────
  // Layout:  1=Catalog, 2=Pages, 3..3+N-1=Page objects,
  //          3+N..3+2N-1=Content streams, 3+2N=Font/F1, 3+2N+1=Font/F2
  const N = pages.length;
  const catalogId = 1;
  const pagesId = 2;
  const pageIds = Array.from({ length: N }, (_, i) => 3 + i);
  const contentIds = Array.from({ length: N }, (_, i) => 3 + N + i);
  const fontF1Id = 3 + 2 * N;
  const fontF2Id = 3 + 2 * N + 1;
  const totalObjects = fontF2Id + 1; // object IDs are 1-based; total xref entries = fontF2Id + 1

  // ── Assemble all PDF objects as strings ────────────────────────────────────
  interface PdfObject { id: number; body: string }
  const pdfObjects: PdfObject[] = [];

  // Catalog
  pdfObjects.push({ id: catalogId, body: `<< /Type /Catalog /Pages ${pagesId} 0 R >>` });

  // Pages dictionary
  const kidsArr = pageIds.map((id) => `${id} 0 R`).join(" ");
  pdfObjects.push({ id: pagesId, body: `<< /Type /Pages /Kids [${kidsArr}] /Count ${N} >>` });

  // Individual page objects
  for (let i = 0; i < N; i++) {
    pdfObjects.push({
      id: pageIds[i]!,
      body:
        `<< /Type /Page /Parent ${pagesId} 0 R ` +
        `/MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
        `/Contents ${contentIds[i]} 0 R ` +
        `/Resources << /Font << /F1 ${fontF1Id} 0 R /F2 ${fontF2Id} 0 R >> >> >>`,
    });
  }

  // Content stream objects
  for (let i = 0; i < N; i++) {
    const streamStr = streamStrings[i]!;
    const streamBytes = Buffer.from(streamStr, "latin1");
    pdfObjects.push({
      id: contentIds[i]!,
      body: `<< /Length ${streamBytes.length} >>\nstream\n${streamStr}\nendstream`,
    });
  }

  // Font descriptors (built-in Type1 fonts — no embedding needed)
  pdfObjects.push({
    id: fontF1Id,
    body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
  });
  pdfObjects.push({
    id: fontF2Id,
    body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
  });

  // Sort by id for correct xref ordering
  pdfObjects.sort((a, b) => a.id - b.id);

  // ── Render to bytes and build xref table ────────────────────────────────────
  const pdfHeader = "%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n"; // binary comment marks the file as binary
  const parts: string[] = [pdfHeader];
  const byteOffsets: number[] = new Array(totalObjects).fill(0);
  let offset = Buffer.byteLength(pdfHeader, "latin1");

  for (const obj of pdfObjects) {
    const objStr = `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
    byteOffsets[obj.id] = offset;
    parts.push(objStr);
    offset += Buffer.byteLength(objStr, "latin1");
  }

  // xref section
  const xrefStart = offset;
  const xrefLines: string[] = [`xref\n0 ${totalObjects}`];
  xrefLines.push("0000000000 65535 f "); // object 0 (always free)
  for (let id = 1; id < totalObjects; id++) {
    xrefLines.push(String(byteOffsets[id]).padStart(10, "0") + " 00000 n ");
  }
  const xrefStr = xrefLines.join("\n") + "\n";

  const trailerStr =
    `trailer\n<< /Size ${totalObjects} /Root ${catalogId} 0 R >>\n` +
    `startxref\n${xrefStart}\n%%EOF\n`;

  parts.push(xrefStr + trailerStr);

  return Buffer.concat(parts.map((p) => Buffer.from(p, "latin1")));
}

// ── POST /v1/export-pdf ────────────────────────────────────────────────────────
router.post("/v1/export-pdf", (req: Request, res: Response) => {
  const parsed = exportPdfSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { text, filename } = parsed.data;
  const safeFilename =
    (filename ?? "axiom-document")
      .replace(/[^a-zA-Z0-9_\-]/g, "-")
      .replace(/-{2,}/g, "-")
      .slice(0, 80) + ".pdf";

  try {
    const pdfBytes = buildPdf(text);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    res.setHeader("Content-Length", pdfBytes.length);
    res.setHeader("Cache-Control", "no-store");
    res.send(pdfBytes);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed", detail: message });
  }
});

export default router;
