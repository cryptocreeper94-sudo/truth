import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { promises as dns } from "node:dns";

// Alias the native fetch Response to avoid collision with Express's Response type.
type FetchResponse = Awaited<ReturnType<typeof fetch>>;

// ── SSRF-safe fetch ─────────────────────────────────────────────────────────
// Resolves the destination hostname and rejects any IP in private / reserved
// ranges before making the outbound request.  Also enforces a timeout and a
// maximum response-body size so the endpoint cannot be used for resource
// exhaustion.

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_REDIRECTS = 5;

/**
 * Returns true if an IPv4 dotted-quad address falls in any private /
 * reserved / special-purpose range.  Blocks malformed input.
 */
function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255))
    return true; // malformed → block
  const [a, b, c, d] = parts as [number, number, number, number];
  return (
    a === 0 ||                              // 0.0.0.0/8 (this network)
    a === 10 ||                             // 10.0.0.0/8
    a === 127 ||                            // 127.0.0.0/8 (loopback)
    (a === 100 && b >= 64 && b <= 127) ||   // 100.64.0.0/10 (shared / CGNAT)
    (a === 169 && b === 254) ||             // 169.254.0.0/16 (link-local / metadata)
    (a === 172 && b >= 16 && b <= 31) ||    // 172.16.0.0/12
    (a === 192 && b === 0 && c === 0) ||    // 192.0.0.0/24 (IETF protocol)
    (a === 192 && b === 0 && c === 2) ||    // 192.0.2.0/24 (documentation TEST-NET-1)
    (a === 192 && b === 168) ||             // 192.168.0.0/16
    (a === 198 && b >= 18 && b <= 19) ||    // 198.18.0.0/15 (benchmarking)
    (a === 198 && b === 51 && c === 100) || // 198.51.100.0/24 (documentation TEST-NET-2)
    (a === 203 && b === 0 && c === 113) ||  // 203.0.113.0/24 (documentation TEST-NET-3)
    a >= 224 ||                             // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved
    (a === 255 && b === 255 && c === 255 && d === 255) // broadcast
  );
}

/**
 * Fully expand a compressed IPv6 address to 8 × 16-bit groups.
 * Returns null if the input cannot be parsed.
 * Handles:
 *   - `::` compression
 *   - embedded IPv4 dotted notation  (e.g. `::ffff:127.0.0.1`)
 *   - purely hex notation            (e.g. `::ffff:7f00:1`)
 */
function expandIPv6(raw: string): number[] | null {
  let addr = raw.replace(/^\[|\]$/g, "").toLowerCase();

  // Handle embedded dotted-decimal IPv4 tail: e.g. "::ffff:127.0.0.1"
  const ipv4Tail = addr.match(/^((?:[0-9a-f]*:)*:?)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (ipv4Tail) {
    const v4Parts = ipv4Tail[2]!.split(".").map(Number);
    if (v4Parts.some((p) => p < 0 || p > 255)) return null;
    const hi = (v4Parts[0]! << 8) | v4Parts[1]!;
    const lo = (v4Parts[2]! << 8) | v4Parts[3]!;
    addr = ipv4Tail[1] + hi.toString(16) + ":" + lo.toString(16);
    // Remove trailing colon left by the substitution if present
    addr = addr.replace(/:$/, "");
  }

  const halves = addr.split("::");
  if (halves.length > 2) return null;

  const parseGroups = (s: string): number[] | null => {
    if (s === "") return [];
    const gs = s.split(":").map((g) => parseInt(g, 16));
    if (gs.some((g) => isNaN(g) || g < 0 || g > 0xffff)) return null;
    return gs;
  };

  const left = parseGroups(halves[0] ?? "") ?? [];
  const right = halves[1] !== undefined ? (parseGroups(halves[1]) ?? []) : [];

  if (halves[0] !== undefined && parseGroups(halves[0]) === null) return null;
  if (halves[1] !== undefined && parseGroups(halves[1]) === null) return null;

  const zeros = 8 - left.length - right.length;
  if (zeros < 0) return null;

  return [...left, ...Array<number>(zeros).fill(0), ...right];
}

/**
 * Returns true if an IPv6 address (any notation) is private, loopback,
 * link-local, ULA, multicast, or maps to a private IPv4 address.
 * Blocks anything that cannot be parsed.
 */
function isPrivateIpv6(ip: string): boolean {
  const groups = expandIPv6(ip);
  if (!groups || groups.length !== 8) return true; // unparseable → block

  const [g0, g1, g2, g3, g4, g5, g6, g7] = groups as [
    number, number, number, number, number, number, number, number,
  ];

  // Unspecified :: (all zeros)
  if (groups.every((g) => g === 0)) return true;

  // Loopback ::1
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 &&
      g4 === 0 && g5 === 0 && g6 === 0 && g7 === 1) return true;

  // IPv4-mapped  ::ffff:x:x  (groups 0–4 = 0, group 5 = 0xffff)
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0xffff) {
    const v4 = [g6 >> 8, g6 & 0xff, g7 >> 8, g7 & 0xff].join(".");
    return isPrivateIpv4(v4);
  }

  // IPv4-compatible (deprecated) ::x:x where groups 0–5 = 0
  if (g0 === 0 && g1 === 0 && g2 === 0 && g3 === 0 && g4 === 0 && g5 === 0) {
    const v4 = [g6 >> 8, g6 & 0xff, g7 >> 8, g7 & 0xff].join(".");
    if (isPrivateIpv4(v4)) return true;
  }

  // Link-local fe80::/10 (top 10 bits = 1111 1110 10)
  if ((g0 & 0xffc0) === 0xfe80) return true;

  // ULA fc00::/7 (top 7 bits = 1111 110)
  if ((g0 & 0xfe00) === 0xfc00) return true;

  // Multicast ff00::/8
  if ((g0 & 0xff00) === 0xff00) return true;

  // Documentation 2001:db8::/32
  if (g0 === 0x2001 && g1 === 0x0db8) return true;

  return false;
}

/**
 * Resolves `hostname` via DNS and throws if any resolved address is private /
 * reserved (SSRF guard).  Checked on every redirect hop.
 */
async function assertPublicHost(hostname: string): Promise<void> {
  // Numeric IPv4 literal in the URL — validate directly.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    if (isPrivateIpv4(hostname))
      throw new Error(`Requests to private IP addresses are not allowed (${hostname}).`);
    return;
  }

  // IPv6 literal in the URL (may be bracketted) — expand and validate.
  const bare = hostname.replace(/^\[|\]$/g, "");
  if (bare.includes(":")) {
    if (isPrivateIpv6(bare))
      throw new Error(`Requests to private or reserved IPv6 addresses are not allowed.`);
    return;
  }

  // Hostname: resolve A + AAAA, reject if any resolved address is private.
  const [v4, v6] = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname),
  ]);

  const allAddresses: string[] = [
    ...(v4.status === "fulfilled" ? v4.value : []),
    ...(v6.status === "fulfilled" ? v6.value : []),
  ];

  if (allAddresses.length === 0)
    throw new Error(`Could not resolve hostname: ${hostname}`);

  for (const addr of allAddresses) {
    const blocked = addr.includes(":")
      ? isPrivateIpv6(addr)
      : isPrivateIpv4(addr);
    if (blocked)
      throw new Error(
        `Requests to private or reserved addresses are not allowed (${hostname} → ${addr}).`,
      );
  }
}

/**
 * Fetch a URL with SSRF protection, timeout, response-size cap, and limited
 * redirects.  Each redirect target is validated before following.
 */
async function safeFetch(urlStr: string): Promise<FetchResponse> {
  let current = urlStr;
  let hops = 0;

  while (hops <= MAX_REDIRECTS) {
    let parsed: URL;
    try {
      parsed = new URL(current);
    } catch {
      throw new Error(`Invalid URL: ${current}`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      throw new Error("Only http and https URLs are supported.");

    await assertPublicHost(parsed.hostname);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let res: FetchResponse;
    try {
      res = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "AxiomBot/1.0 (+text-extraction)" },
      });
    } finally {
      clearTimeout(timer);
    }

    // Follow redirects manually so we can validate each hop.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect with no Location header.");
      // Resolve relative redirects.
      current = new URL(location, current).toString();
      hops++;
      continue;
    }

    return res;
  }

  throw new Error("Too many redirects.");
}

// ── URL text extraction helpers ─────────────────────────────────────────────

/** Convert a Google Docs viewer/edit URL to its plain-text export URL. */
function toGoogleDocsExportUrl(url: string): string | null {
  const match = url.match(
    /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
  );
  if (!match) return null;
  return `https://docs.google.com/document/d/${match[1]}/export?format=txt`;
}

/** Strip HTML tags and collapse whitespace. */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Consume at most MAX_RESPONSE_BYTES from a Response body, returning a Buffer.
 * Throws if the body exceeds the cap.
 */
async function readBodyCapped(res: FetchResponse): Promise<Buffer> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Response has no body.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Response body exceeds the 5 MB limit.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

async function extractTextFromUrl(rawUrl: string): Promise<string> {
  // ── Google Docs ────────────────────────────────────────────────────────────
  // Google Docs export always hits docs.google.com — a known safe public host.
  const exportUrl = toGoogleDocsExportUrl(rawUrl);
  if (exportUrl) {
    const res = await safeFetch(exportUrl);
    if (!res.ok) {
      // A redirect to accounts.google.com means the doc is private.
      throw new Error(
        `Google Docs export failed (HTTP ${res.status}). Make sure the document is shared as "Anyone with the link can view".`,
      );
    }
    const body = await readBodyCapped(res);
    const text = body.toString("utf-8").trim();
    if (text.includes("accounts.google.com") || text.startsWith("<!DOCTYPE")) {
      throw new Error(
        'This Google Doc appears to be private. Share it as "Anyone with the link can view" and try again.',
      );
    }
    return text;
  }

  // ── Generic fetch ──────────────────────────────────────────────────────────
  const res = await safeFetch(rawUrl);
  if (!res.ok)
    throw new Error(`Failed to fetch URL (HTTP ${res.status}).`);

  const contentType = res.headers.get("content-type") ?? "";
  const body = await readBodyCapped(res);

  // ── PDF ────────────────────────────────────────────────────────────────────
  if (contentType.includes("application/pdf") || /\.pdf(\?|$)/i.test(rawUrl)) {
    const { PDFParse } = (await import("pdf-parse")) as {
      PDFParse: new (opts: { data: Buffer }) => { getText(): Promise<{ text: string }> };
    };
    const parser = new PDFParse({ data: body });
    const result = await parser.getText();
    return result.text.trim();
  }

  // ── HTML / plain text ──────────────────────────────────────────────────────
  const text = body.toString("utf-8");
  if (contentType.includes("text/plain")) return text.trim();
  return stripHtml(text);
}

const router = Router();

// ── Per-IP rate limiter ─────────────────────────────────────────────────────
// Same pattern as image-gen: reserve the slot *before* calling OpenAI so two
// concurrent requests from the same IP both see the incremented count.
const SESSION_LIMIT = 20;
const ipUsage = new Map<string, number>();

function reserveSlot(ip: string): { ok: boolean; used: number } {
  const used = ipUsage.get(ip) ?? 0;
  if (used >= SESSION_LIMIT) return { ok: false, used };
  ipUsage.set(ip, used + 1);
  return { ok: true, used };
}

function releaseSlot(ip: string): void {
  const used = ipUsage.get(ip) ?? 0;
  if (used > 0) ipUsage.set(ip, used - 1);
}

// ── Request validation ──────────────────────────────────────────────────────
const composeSchema = z.object({
  intent: z
    .enum(["tailor", "apply", "follow_up", "network", "referral"])
    .default("tailor"),
  document: z.string().min(1, "document is required").max(20_000, "document too long"),
  context: z.string().min(1, "context is required").max(10_000, "context too long"),
  missingKeywords: z.array(z.string().max(100)).max(50).optional().default([]),
});

// ── POST /v1/compose ────────────────────────────────────────────────────────
// Rewrites/tailors a document (e.g. resume) using the job context and an
// optional list of ATS keywords to inject.  Requires the OpenAI AI
// integration to be configured; returns 503 otherwise.
router.post("/v1/compose", async (req: Request, res: Response) => {
  const parsed = composeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { intent, document, context, missingKeywords } = parsed.data;
  const clientIp = req.ip ?? "unknown";

  // ── atomically reserve a session slot ────────────────────────────────────
  const { ok, used } = reserveSlot(clientIp);
  if (!ok) {
    res.status(429).json({
      error: "Rate limit reached",
      detail: `You have used all ${SESSION_LIMIT} free compose operations for this session.`,
      remaining: 0,
    });
    return;
  }

  // ── check AI configuration ────────────────────────────────────────────────
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (!baseUrl || !apiKey) {
    // Release the reserved slot — no AI call was made
    releaseSlot(clientIp);
    res.status(503).json({
      error: "Compose not configured",
      detail:
        "AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY must be set. " +
        "Set up the OpenAI AI integration to enable this feature.",
    });
    return;
  }

  // ── build the system + user prompt ───────────────────────────────────────
  const keywordHint =
    missingKeywords.length > 0
      ? `\n\nMissing ATS keywords to naturally incorporate: ${missingKeywords.map((k) => `"${k}"`).join(", ")}.`
      : "";

  const systemPrompt =
    intent === "tailor"
      ? "You are an expert resume writer. Your task is to tailor the provided resume for the given job description, naturally weaving in any missing keywords without fabricating experience. Preserve the candidate's voice and all real achievements. Return only the rewritten resume text — no commentary."
      : "You are an expert career document writer. Rewrite the provided document to better match the job context. Return only the rewritten document — no commentary.";

  const userPrompt = `JOB DESCRIPTION:\n${context}${keywordHint}\n\nDOCUMENT TO REWRITE:\n${document}`;

  // ── call OpenAI ───────────────────────────────────────────────────────────
  let resultText: string;
  try {
    const { default: OpenAI } = (await import("openai")) as {
      default: typeof import("openai").default;
    };
    const openai = new OpenAI({ apiKey, baseURL: baseUrl });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    resultText = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!resultText) throw new Error("No text returned by the model");
  } catch (err) {
    // Release the slot so the user can retry without losing their quota
    releaseSlot(clientIp);
    console.error("Compose failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Compose failed", detail: message });
    return;
  }

  const remaining = SESSION_LIMIT - (used + 1);
  res.json({ result_text: resultText, intent, remaining });
});

// ── POST /v1/compose/extract ─────────────────────────────────────────────────
// Fetches a URL (Google Doc, PDF, or generic page) and returns extracted text.
// Rate-limited to 10 extractions per IP per hour (sliding window, not permanent).
const EXTRACT_LIMIT = 10;
const EXTRACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface ExtractQuota {
  count: number;
  resetAt: number; // epoch ms when the current window expires
}
const extractQuota = new Map<string, ExtractQuota>();

function reserveExtractSlot(ip: string): boolean {
  const now = Date.now();
  const entry = extractQuota.get(ip);
  if (!entry || now >= entry.resetAt) {
    // First call in a new window
    extractQuota.set(ip, { count: 1, resetAt: now + EXTRACT_WINDOW_MS });
    return true;
  }
  if (entry.count >= EXTRACT_LIMIT) return false;
  entry.count++;
  return true;
}

const extractSchema = z.object({
  url: z.string().url("A valid URL is required"),
});

router.post("/v1/compose/extract", async (req: Request, res: Response) => {
  const parsed = extractSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const clientIp = req.ip ?? "unknown";
  if (!reserveExtractSlot(clientIp)) {
    res.status(429).json({
      error: "Rate limit reached",
      detail: `You have used all ${EXTRACT_LIMIT} URL extractions for this session.`,
    });
    return;
  }

  const { url } = parsed.data;

  try {
    const text = await extractTextFromUrl(url);
    if (!text) {
      res.status(422).json({
        error: "No text found",
        detail: "The URL was fetched successfully but no readable text was extracted.",
      });
      return;
    }
    // Truncate to a reasonable resume length
    res.json({ text: text.slice(0, 15_000) });
  } catch (err) {
    console.error("Extract failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(422).json({ error: "Extraction failed", detail: message });
  }
});

export default router;
