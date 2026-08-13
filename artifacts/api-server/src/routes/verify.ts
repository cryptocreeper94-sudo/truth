import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db, axiomVerifyJobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { FAILURES } from "../lib/verify/errors";
import {
  isAllowedPlatformHost,
  resolvesToPublicAddresses,
  SUPPORTED_PLATFORMS_HINT,
} from "../lib/verify/url-policy";
import { enqueueJob, findInFlightJob } from "../lib/verify/pipeline";
import type { VerifiedClaim } from "../lib/verify/analysis";

const router = Router();

// ── plain-English step labels ───────────────────────────────────────────────
const STEP_LABELS: Record<string, string> = {
  queued: "Waiting in line",
  downloading: "Downloading the video",
  transcribing: "Transcribing the audio",
  extracting: "Extracting claims",
  verifying: "Verifying claims against sources",
  done: "Done",
  failed: "Failed",
};

// ── serialization ───────────────────────────────────────────────────────────
type JobRow = typeof axiomVerifyJobsTable.$inferSelect;

function serializeJob(job: JobRow) {
  return {
    job_id: job.id,
    status: job.status,
    progress: job.progress,
    step_label: STEP_LABELS[job.status] ?? job.status,
    error_message: job.status === "failed" ? job.error_message : null,
    video_title: job.video_title,
    video_thumbnail: job.video_thumbnail,
    platform: job.platform,
    duration_seconds: job.duration_seconds,
    summary: job.status === "done" ? job.summary : null,
    claims: job.status === "done" ? (job.claims as VerifiedClaim[]) : null,
    share_slug: job.share_slug,
    created_at: job.created_at?.toISOString() ?? null,
  };
}

async function loadJob(jobId: string): Promise<JobRow | null> {
  const rows = await db
    .select()
    .from(axiomVerifyJobsTable)
    .where(eq(axiomVerifyJobsTable.id, jobId))
    .limit(1);
  return rows[0] ?? null;
}

// ── URL validation ──────────────────────────────────────────────────────────
const submitSchema = z.object({
  url: z.string().min(1).max(2000),
});

/**
 * Normalize and vet a submitted URL before it ever reaches yt-dlp.
 *
 * SSRF policy (yt-dlp is a server-side network client, so this is strict):
 * 1. https/http only, no credentials, no ports other than default.
 * 2. Hostname MUST be on the explicit video-platform allowlist — arbitrary
 *    hosts are rejected, so redirects from attacker-controlled servers are
 *    impossible (yt-dlp never contacts a non-allowlisted origin server).
 * 3. Defense in depth: the hostname must resolve exclusively to public
 *    addresses at submission time.
 *
 * Returns the normalized URL, or a plain-English rejection reason.
 */
async function normalizeUrl(
  raw: string,
): Promise<{ url: string } | { reject: string }> {
  const invalid = { reject: FAILURES.invalidUrl.message };
  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return invalid;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
    return invalid;
  if (parsed.username || parsed.password) return invalid;
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443")
    return invalid;

  const host = parsed.hostname;
  if (!isAllowedPlatformHost(host)) {
    return {
      reject: `We can only verify videos from known platforms right now (${SUPPORTED_PLATFORMS_HINT}). That link's site isn't supported yet.`,
    };
  }

  // Defense in depth: even an allowlisted domain must resolve publicly.
  if (!(await resolvesToPublicAddresses(host))) {
    return {
      reject:
        "We couldn't reach that video. Make sure the URL is public and try again.",
    };
  }

  return { url: parsed.toString() };
}

// ── simple per-IP rate limit (Phase 1) ──────────────────────────────────────
const RATE_LIMIT = 5; // submissions
const RATE_WINDOW_MS = 10 * 60_000; // per 10 minutes
const submissions = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT) {
    submissions.set(ip, recent);
    return true;
  }
  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

// Periodically drop stale entries so the map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of submissions) {
    const recent = times.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length === 0) submissions.delete(ip);
    else submissions.set(ip, recent);
  }
}, RATE_WINDOW_MS).unref();

// ── POST /v1/verify ─────────────────────────────────────────────────────────
router.post("/v1/verify", async (req: Request, res: Response) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: FAILURES.invalidUrl.message });
    return;
  }

  const vetted = await normalizeUrl(parsed.data.url);
  if ("reject" in vetted) {
    res.status(400).json({ error: vetted.reject });
    return;
  }
  const url = vetted.url;

  if (
    !process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ||
    !process.env["AI_INTEGRATIONS_OPENAI_API_KEY"]
  ) {
    res.status(503).json({ error: FAILURES.notConfigured.message });
    return;
  }

  // Reuse an in-flight job for the same URL instead of duplicating work.
  const existing = findInFlightJob(url);
  if (existing) {
    res.status(202).json({ job_id: existing });
    return;
  }

  const ip = req.ip ?? "unknown";
  if (rateLimited(ip)) {
    res.status(429).json({
      error:
        "You've submitted several videos in a short time. Please wait a few minutes and try again.",
    });
    return;
  }

  const jobId = crypto.randomUUID();
  try {
    await db.insert(axiomVerifyJobsTable).values({
      id: jobId,
      url,
      status: "queued",
      progress: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to insert verify job");
    res.status(500).json({ error: FAILURES.internal.message });
    return;
  }

  enqueueJob(jobId, url);
  res.status(202).json({ job_id: jobId });
});

// ── GET /v1/verify/share/:slug ──────────────────────────────────────────────
// NOTE: must be registered before /v1/verify/:jobId so "share" isn't
// swallowed by the :jobId param.
router.get("/v1/verify/share/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params["slug"] ?? "");
  if (!/^[A-Za-z0-9]{1,32}$/.test(slug)) {
    res.status(404).json({ error: "Share link not found." });
    return;
  }

  let rows: JobRow[];
  try {
    rows = await db
      .select()
      .from(axiomVerifyJobsTable)
      .where(eq(axiomVerifyJobsTable.share_slug, slug))
      .limit(1);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch shared verify report");
    res.status(500).json({ error: FAILURES.internal.message });
    return;
  }

  const job = rows[0];
  if (!job || job.status !== "done") {
    res.status(404).json({
      error: "This share link doesn't exist or the report is no longer available.",
    });
    return;
  }

  res.json(serializeJob(job));
});

// ── GET /v1/verify/:jobId ───────────────────────────────────────────────────
router.get("/v1/verify/:jobId", async (req: Request, res: Response) => {
  const jobId = String(req.params["jobId"] ?? "");
  if (!/^[0-9a-f-]{36}$/.test(jobId)) {
    res.status(404).json({ error: "We couldn't find that verification job." });
    return;
  }

  let job: JobRow | null;
  try {
    job = await loadJob(jobId);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch verify job");
    res.status(500).json({ error: FAILURES.internal.message });
    return;
  }

  if (!job) {
    res.status(404).json({ error: "We couldn't find that verification job." });
    return;
  }

  res.json(serializeJob(job));
});

// ── POST /v1/verify/:jobId/share ────────────────────────────────────────────
const BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateSlug(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => BASE62[b % BASE62.length])
    .join("");
}

router.post("/v1/verify/:jobId/share", async (req: Request, res: Response) => {
  const jobId = String(req.params["jobId"] ?? "");
  if (!/^[0-9a-f-]{36}$/.test(jobId)) {
    res.status(404).json({ error: "We couldn't find that verification job." });
    return;
  }

  let job: JobRow | null;
  try {
    job = await loadJob(jobId);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch verify job for sharing");
    res.status(500).json({ error: FAILURES.internal.message });
    return;
  }

  if (!job) {
    res.status(404).json({ error: "We couldn't find that verification job." });
    return;
  }
  if (job.status !== "done") {
    res.status(409).json({
      error: "This report isn't finished yet. Wait for verification to complete before sharing.",
    });
    return;
  }

  // Idempotent: reuse the existing slug.
  let slug = job.share_slug;
  if (!slug) {
    slug = generateSlug();
    for (let attempt = 0; attempt < 3; attempt++) {
      const clash = await db
        .select({ id: axiomVerifyJobsTable.id })
        .from(axiomVerifyJobsTable)
        .where(eq(axiomVerifyJobsTable.share_slug, slug))
        .limit(1);
      if (clash.length === 0) break;
      slug = generateSlug();
    }
    try {
      await db
        .update(axiomVerifyJobsTable)
        .set({ share_slug: slug })
        .where(eq(axiomVerifyJobsTable.id, jobId));
    } catch (err) {
      req.log.error({ err }, "Failed to persist verify share slug");
      res.status(500).json({ error: FAILURES.internal.message });
      return;
    }
  }

  // The share viewer is the SPA route /verify/share/:slug on the web app.
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? req.protocol;
  const host =
    (req.headers["x-forwarded-host"] as string | undefined) ??
    req.get("host") ??
    "localhost";
  const url = `${proto}://${host}/verify/share/${slug}`;

  res.status(201).json({ slug, url });
});

export default router;
