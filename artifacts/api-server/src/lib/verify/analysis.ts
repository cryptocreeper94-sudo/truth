import { logger } from "../logger";
import { searchCorpus } from "./knowledge";
import { FAILURES, VerifyPipelineError } from "./errors";
import type { TranscriptSegment } from "./media";

/**
 * LLM-backed analysis: transcript → summary + discrete claims → evidence
 * labels with real (never fabricated) sources.
 *
 * Uses the Axiom OpenAI integration already wired for Compose.
 */

export type ClaimLabel =
  | "documented"
  | "contested"
  | "speculative"
  | "refuted"
  | "unverifiable";

export interface VerifiedClaim {
  number: number;
  text: string;
  label: ClaimLabel;
  rationale: string;
  established: string | null;
  not_established: string | null;
  sources: { title: string; url: string }[];
}

function getOpenAIConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  if (!baseUrl || !apiKey) {
    throw new VerifyPipelineError(FAILURES.notConfigured);
  }
  return { baseUrl, apiKey };
}

async function chatJSON(
  system: string,
  user: string,
  maxTokens = 4096,
): Promise<unknown> {
  const { baseUrl, apiKey } = getOpenAIConfig();
  const { default: OpenAI } = (await import("openai")) as {
    default: typeof import("openai").default;
  };
  const openai = new OpenAI({ apiKey, baseURL: baseUrl });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    max_tokens: maxTokens,
    temperature: 0.1,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No text returned by the model");
  return JSON.parse(text);
}

/** Render transcript segments as timestamped plain text, capped by length. */
export function transcriptToText(
  segments: TranscriptSegment[],
  maxChars = 60_000,
): string {
  const lines: string[] = [];
  let total = 0;
  for (const s of segments) {
    const m = Math.floor(s.start / 60);
    const sec = String(Math.floor(s.start % 60)).padStart(2, "0");
    const line = `[${m}:${sec}] ${s.text}`;
    total += line.length + 1;
    if (total > maxChars) break;
    lines.push(line);
  }
  return lines.join("\n");
}

const EXTRACT_SYSTEM = `You are the claim-extraction stage of a verification engine. You receive the transcript of a video. Your job:
1. Write ONE plain-English sentence summarizing what the video is about overall.
2. Extract every discrete, testable FACTUAL claim the video makes. A factual claim is a statement about the world that could in principle be checked (events, dates, numbers, scientific assertions, historical assertions, attributions).
   - Rephrase each claim as a clear, standalone, plain-English statement understandable without the video.
   - Skip pure opinions, rhetorical questions, jokes, and value judgments.
   - Merge duplicates. Order claims by when they appear.
   - Extract at most 12 of the most substantive claims.
Respond in JSON: {"summary": "...", "claims": ["claim 1", "claim 2", ...]}
If the transcript contains no checkable factual claims, return {"summary": "...", "claims": []}.`;

export async function extractClaims(
  segments: TranscriptSegment[],
): Promise<{ summary: string; claims: string[] }> {
  const transcript = transcriptToText(segments);
  if (transcript.trim().length < 20) {
    throw new VerifyPipelineError(FAILURES.emptyTranscript);
  }

  let parsed: unknown;
  try {
    parsed = await chatJSON(EXTRACT_SYSTEM, `TRANSCRIPT:\n\n${transcript}`);
  } catch (err) {
    if (err instanceof VerifyPipelineError) throw err;
    logger.error({ err }, "Claim extraction LLM call failed");
    throw new VerifyPipelineError(FAILURES.analysisFailed);
  }

  const obj = parsed as { summary?: unknown; claims?: unknown };
  const summary =
    typeof obj.summary === "string" && obj.summary.trim()
      ? obj.summary.trim()
      : "This video could not be summarized.";
  const claims = Array.isArray(obj.claims)
    ? obj.claims
        .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
        .slice(0, 12)
    : [];

  return { summary, claims };
}

const LABELS: ClaimLabel[] = [
  "documented",
  "contested",
  "speculative",
  "refuted",
  "unverifiable",
];

const VERIFY_SYSTEM = `You are the evidence-tagging stage of a verification engine. You receive a batch of factual claims extracted from a video, plus (for some claims) excerpts from a local reference corpus.

For EACH claim assign exactly one label:
- "documented": well-established, supported by mainstream evidence and reliable published sources.
- "refuted": contradicted by well-established evidence.
- "contested": genuinely disputed among credible sources; note what each side holds.
- "speculative": a hypothesis or prediction that goes beyond established evidence.
- "unverifiable": cannot be checked (too vague, private knowledge, or no reliable source exists).

For each claim also provide:
- "rationale": ONE plain-English sentence explaining the label. No jargon.
- "established" and "not_established": for contested/speculative claims only, one short sentence each on what IS established vs what is NOT; null otherwise.
- "sources": 0-3 REAL, stable reference URLs a reader can click to check the claim.

SOURCE RULES — ABSOLUTE:
- NEVER invent, guess, or approximate a URL. Only cite pages you are certain exist at that exact address.
- Prefer stable, canonical pages: Wikipedia articles (https://en.wikipedia.org/wiki/Exact_Article_Title), major agency pages (nasa.gov, noaa.gov, usgs.gov, cdc.gov, who.int) ONLY at their well-known top-level or long-standing URLs, Encyclopedia Britannica article pages.
- If you are not fully certain a URL is real and live, OMIT it and rely on the rationale.
- Documented and refuted claims should include at least one source when a certain-to-exist page covers the topic; if you cannot cite one with certainty, downgrade to "unverifiable" and say why honestly.
- A provided corpus excerpt supports the claim's context but is NOT a clickable source; do not turn corpus excerpts into URLs.

Respond in JSON:
{"claims": [{"number": 1, "label": "...", "rationale": "...", "established": "... or null", "not_established": "... or null", "sources": [{"title": "...", "url": "..."}]}]}`;

/** Verify all claims (batched into one LLM call, corpus context attached). */
export async function verifyClaims(
  claims: string[],
): Promise<VerifiedClaim[]> {
  if (claims.length === 0) return [];

  // Attach corpus snippets per claim.
  const corpusBlocks: string[] = [];
  for (let i = 0; i < claims.length; i++) {
    const snippets = await searchCorpus(claims[i]!, 2);
    if (snippets.length > 0) {
      const rendered = snippets
        .map(
          (s) =>
            `  [corpus: ${s.pack} — ${s.heading}]\n  ${s.excerpt.replace(/\n+/g, " ").slice(0, 800)}`,
        )
        .join("\n");
      corpusBlocks.push(`Claim ${i + 1} corpus context:\n${rendered}`);
    }
  }

  const userMsg = [
    "CLAIMS TO VERIFY:",
    ...claims.map((c, i) => `${i + 1}. ${c}`),
    ...(corpusBlocks.length > 0
      ? ["", "REFERENCE CORPUS EXCERPTS:", ...corpusBlocks]
      : []),
  ].join("\n");

  let parsed: unknown;
  try {
    parsed = await chatJSON(VERIFY_SYSTEM, userMsg, 8192);
  } catch (err) {
    if (err instanceof VerifyPipelineError) throw err;
    logger.error({ err }, "Claim verification LLM call failed");
    throw new VerifyPipelineError(FAILURES.analysisFailed);
  }

  const obj = parsed as { claims?: unknown };
  const raw = Array.isArray(obj.claims) ? obj.claims : [];

  const byNumber = new Map<number, Record<string, unknown>>();
  for (const item of raw) {
    if (item && typeof item === "object") {
      const rec = item as Record<string, unknown>;
      const n = typeof rec["number"] === "number" ? rec["number"] : NaN;
      if (Number.isInteger(n)) byNumber.set(n, rec);
    }
  }

  return claims.map((text, i) => {
    const rec = byNumber.get(i + 1) ?? {};
    const labelRaw = String(rec["label"] ?? "").toLowerCase();
    const label: ClaimLabel = (LABELS as string[]).includes(labelRaw)
      ? (labelRaw as ClaimLabel)
      : "unverifiable";

    const sourcesRaw = Array.isArray(rec["sources"]) ? rec["sources"] : [];
    const sources = sourcesRaw
      .filter(
        (s): s is { title?: unknown; url?: unknown } =>
          !!s && typeof s === "object",
      )
      .map((s) => ({
        title: typeof s.title === "string" ? s.title : "Source",
        url: typeof s.url === "string" ? s.url : "",
      }))
      .filter(
        (s) =>
          /^https:\/\/[^\s]+$/.test(s.url) &&
          !s.url.includes(" ") &&
          s.url.length < 500,
      )
      .slice(0, 3);

    const rationale =
      typeof rec["rationale"] === "string" && rec["rationale"].trim()
        ? rec["rationale"].trim()
        : "We could not evaluate this claim against reliable sources.";

    return {
      number: i + 1,
      text,
      label,
      rationale,
      established:
        typeof rec["established"] === "string" && rec["established"].trim()
          ? rec["established"].trim()
          : null,
      not_established:
        typeof rec["not_established"] === "string" &&
        rec["not_established"].trim()
          ? rec["not_established"].trim()
          : null,
      sources,
    };
  });
}
