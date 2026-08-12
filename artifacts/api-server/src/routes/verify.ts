import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db, dveJobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { VerifyClaim, VerifyResult, VerifyStep } from "@workspace/db";

const router = Router();
const execFileAsync = promisify(execFile);

// ── ID / slug generation ────────────────────────────────────────────────────
const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function randomId(len = 12): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => BASE62[b % BASE62.length]).join("");
}

// ── Persist step updates ─────────────────────────────────────────────────────
async function setStep(id: string, step: VerifyStep, error?: string) {
  await db
    .update(dveJobsTable)
    .set({ step, error: error ?? null, updated_at: new Date() })
    .where(eq(dveJobsTable.id, id));
}

async function setResult(id: string, result: VerifyResult) {
  const slug = randomId(10);
  await db
    .update(dveJobsTable)
    .set({ step: "done", result, share_slug: slug, updated_at: new Date() })
    .where(eq(dveJobsTable.id, id));
}

// ── Platform label from URL ──────────────────────────────────────────────────
function detectPlatform(url: string): string {
  if (/youtube\.com|youtu\.be/i.test(url)) return "YouTube";
  if (/facebook\.com|fb\.watch/i.test(url)) return "Facebook";
  if (/rumble\.com/i.test(url)) return "Rumble";
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/twitter\.com|x\.com/i.test(url)) return "X (Twitter)";
  if (/bitchute\.com/i.test(url)) return "BitChute";
  if (/odysee\.com|lbry\.tv/i.test(url)) return "Odysee";
  return "Web";
}

// ── Claim extraction + verification via OpenAI ───────────────────────────────
async function extractAndVerifyClaims(
  transcript: string,
  videoTitle: string
): Promise<{ summary: string; claims: VerifyClaim[] }> {
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  if (!baseUrl || !apiKey) throw new Error("AI integration not configured");

  const { default: OpenAI } = (await import("openai")) as {
    default: typeof import("openai").default;
  };
  const openai = new OpenAI({ apiKey, baseURL: baseUrl });

  const systemPrompt = `You are a deterministic evidence analyst. Your job is to:
1. Extract every discrete, testable factual claim from the provided transcript
2. Assign each claim one of exactly five labels:
   - DOCUMENTED: The claim is supported by peer-reviewed research, primary data, or official institutional records that can be cited
   - CONTESTED: The claim is disputed between credible sources — real scientific or institutional disagreement exists
   - SPECULATIVE: The claim goes beyond what current evidence supports, but is not definitively refuted
   - REFUTED: The claim is contradicted by strong, documented evidence
   - UNVERIFIABLE: The claim cannot be checked against any retrievable source
3. Write a one-sentence plain-English rationale for each label — no jargon, no hedging
4. Provide up to 3 real source URLs for DOCUMENTED and REFUTED claims only (leave empty array for others)
5. Write a one-sentence plain-English summary of what the video is about overall

CRITICAL RULES:
- Do NOT fabricate source URLs. Only include URLs you are confident are real and retrievable
- If you cannot find a real source, mark the claim UNVERIFIABLE rather than inventing one
- Keep claim statements neutral — do not editorialize or take sides
- Each claim must be a complete, standalone statement
- The timecode field should reflect roughly when in the video the claim appears based on transcript position

Respond with valid JSON in exactly this format:
{
  "summary": "One sentence describing what this video is about.",
  "claims": [
    {
      "id": 1,
      "text": "Plain-English statement of the claim",
      "label": "DOCUMENTED",
      "rationale": "One sentence explaining why this label applies.",
      "timecode": "1:23",
      "sources": [{"title": "Source title", "url": "https://..."}]
    }
  ]
}`;

  const userPrompt = `Video title: "${videoTitle}"\n\nTranscript:\n${transcript.slice(0, 12000)}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { summary?: string; claims?: VerifyClaim[] };
  return {
    summary: parsed.summary ?? "No summary available.",
    claims: parsed.claims ?? [],
  };
}

// ── Background pipeline ──────────────────────────────────────────────────────
async function runPipeline(jobId: string, url: string) {
  const workDir = await mkdtemp(path.join(tmpdir(), "dve-"));
  try {
    // ── Step 1: Download audio via yt-dlp ───────────────────────────────────
    await setStep(jobId, "downloading");
    const audioPath = path.join(workDir, "audio.wav");

    let videoTitle = "Unknown video";
    let thumbnailUrl: string | undefined;

    try {
      // Get metadata first
      const { stdout: metaJson } = await execFileAsync("yt-dlp", [
        "--dump-json",
        "--no-playlist",
        url,
      ], { timeout: 60_000 });
      const meta = JSON.parse(metaJson.trim()) as {
        title?: string;
        thumbnail?: string;
      };
      videoTitle = meta.title ?? videoTitle;
      thumbnailUrl = meta.thumbnail;
    } catch {
      // metadata fetch failed — continue without it
    }

    // Download audio only
    await execFileAsync("yt-dlp", [
      "--no-playlist",
      "--extract-audio",
      "--audio-format", "wav",
      "--audio-quality", "5",
      "--postprocessor-args", "ffmpeg:-ar 16000 -ac 1",
      "--output", audioPath,
      url,
    ], { timeout: 300_000 });

    // ── Step 2: Transcribe via faster-whisper ────────────────────────────────
    await setStep(jobId, "transcribing");
    const transcriptPath = path.join(workDir, "transcript.json");

    const transcribeScript = `
import json, sys
from faster_whisper import WhisperModel

model = WhisperModel("base", device="cpu", compute_type="int8")
segments, _ = model.transcribe(sys.argv[1], beam_size=5)
result = []
for seg in segments:
    result.append({"start": seg.start, "end": seg.end, "text": seg.text.strip()})
with open(sys.argv[2], "w") as f:
    json.dump(result, f)
print("done")
`;
    const scriptPath = path.join(workDir, "transcribe.py");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(scriptPath, transcribeScript);

    await execFileAsync("python3", [scriptPath, audioPath, transcriptPath], {
      timeout: 600_000,
    });

    const { readFile } = await import("node:fs/promises");
    const transcriptRaw = JSON.parse(await readFile(transcriptPath, "utf8")) as Array<{
      start: number;
      end: number;
      text: string;
    }>;

    // Build full transcript text with approximate timecodes
    const transcript = transcriptRaw
      .map((s) => {
        const mins = Math.floor(s.start / 60);
        const secs = Math.floor(s.start % 60).toString().padStart(2, "0");
        return `[${mins}:${secs}] ${s.text}`;
      })
      .join("\n");

    // ── Step 3: Extract claims ───────────────────────────────────────────────
    await setStep(jobId, "extracting");

    // ── Step 4: Verify claims ────────────────────────────────────────────────
    await setStep(jobId, "verifying");
    const { summary, claims } = await extractAndVerifyClaims(transcript, videoTitle);

    // ── Step 5: Persist result ───────────────────────────────────────────────
    const result: VerifyResult = {
      videoTitle,
      videoPlatform: detectPlatform(url),
      thumbnailUrl,
      summary,
      claims,
    };
    await setResult(jobId, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Produce a user-friendly error
    let userMessage = "Something went wrong while processing this video.";
    if (message.includes("unsupported URL") || message.includes("No supported")) {
      userMessage = "We couldn't reach that video. Make sure the URL is public and from a supported platform.";
    } else if (message.includes("private") || message.includes("login")) {
      userMessage = "This video is private or requires sign-in. We can only verify publicly accessible videos.";
    } else if (message.includes("geo") || message.includes("not available in your country")) {
      userMessage = "This video is geo-restricted and couldn't be accessed from our servers.";
    } else if (message.includes("AI integration")) {
      userMessage = "The verification engine is not yet fully configured. Please try again later.";
    }
    await setStep(jobId, "error", userMessage);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ── POST /api/v1/verify ──────────────────────────────────────────────────────
const verifySchema = z.object({
  url: z.string().url("A valid video URL is required"),
});

router.post("/v1/verify", async (req: Request, res: Response) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid URL", detail: "Please provide a valid video URL." });
    return;
  }

  const { url } = parsed.data;
  const jobId = randomId(16);

  // Insert job record
  await db.insert(dveJobsTable).values({
    id: jobId,
    url,
    step: "queued",
  });

  // Fire pipeline in background — do NOT await
  runPipeline(jobId, url).catch(console.error);

  res.status(202).json({ jobId });
});

// ── GET /api/v1/verify/:jobId ────────────────────────────────────────────────
router.get("/v1/verify/:jobId", async (req: Request, res: Response) => {
  const jobId = String(req.params["jobId"] ?? "");
  if (!jobId) {
    res.status(400).json({ error: "Missing job ID" });
    return;
  }

  const rows = await db
    .select()
    .from(dveJobsTable)
    .where(eq(dveJobsTable.id, jobId))
    .limit(1);

  const job = rows[0];
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  // Step → display label + progress %
  const stepMeta: Record<string, { label: string; pct: number }> = {
    queued:       { label: "Queued",              pct: 0  },
    downloading:  { label: "Downloading video",   pct: 15 },
    transcribing: { label: "Transcribing audio",  pct: 40 },
    extracting:   { label: "Reading claims",      pct: 65 },
    verifying:    { label: "Checking sources",    pct: 85 },
    done:         { label: "Done",                pct: 100 },
    error:        { label: "Error",               pct: 0  },
  };

  const meta = stepMeta[job.step] ?? { label: "Processing", pct: 50 };

  res.json({
    jobId: job.id,
    step: job.step,
    stepLabel: meta.label,
    progress: meta.pct,
    error: job.error ?? null,
    shareSlug: job.share_slug ?? null,
    result: job.result ?? null,
  });
});

// ── GET /api/verify/share/:slug ──────────────────────────────────────────────
router.get("/verify/share/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params["slug"] ?? "");
  if (!slug) {
    res.status(400).json({ error: "Missing slug" });
    return;
  }

  const rows = await db
    .select()
    .from(dveJobsTable)
    .where(eq(dveJobsTable.share_slug, slug))
    .limit(1);

  const job = rows[0];
  if (!job || job.step !== "done" || !job.result) {
    res.status(404).json({ error: "Report not found or not yet complete." });
    return;
  }

  res.json({ shareSlug: slug, result: job.result });
});

export default router;
