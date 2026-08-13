import { db, axiomVerifyJobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../logger";
import { FAILURES, VerifyPipelineError } from "./errors";
import {
  MAX_DURATION_SECONDS,
  cleanupJobDir,
  downloadAudio,
  fetchVideoMetadata,
  transcribeAudio,
} from "./media";
import { extractClaims, verifyClaims } from "./analysis";

/**
 * In-process job runner for Phase 1. Jobs are persisted in PostgreSQL so
 * results survive restarts; the run loop itself is in-memory with a small
 * concurrency cap (queued jobs beyond the cap wait their turn).
 */

const MAX_CONCURRENT_JOBS = 2;
let activeJobs = 0;
const waiting: string[] = [];
// URLs of jobs currently queued or running, to reuse duplicate submissions.
const inFlightByUrl = new Map<string, string>();

async function setJob(
  jobId: string,
  values: Partial<typeof axiomVerifyJobsTable.$inferInsert>,
): Promise<void> {
  await db
    .update(axiomVerifyJobsTable)
    .set(values)
    .where(eq(axiomVerifyJobsTable.id, jobId));
}

/** Returns an existing in-flight job for this URL, if one exists. */
export function findInFlightJob(url: string): string | undefined {
  return inFlightByUrl.get(url);
}

/** Queue a job. Persists nothing itself — the route inserts the row first. */
export function enqueueJob(jobId: string, url: string): void {
  inFlightByUrl.set(url, jobId);
  if (activeJobs < MAX_CONCURRENT_JOBS) {
    void runJob(jobId, url);
  } else {
    waiting.push(jobId + "\u0000" + url);
  }
}

function drainQueue(): void {
  while (activeJobs < MAX_CONCURRENT_JOBS && waiting.length > 0) {
    const item = waiting.shift()!;
    const sep = item.indexOf("\u0000");
    void runJob(item.slice(0, sep), item.slice(sep + 1));
  }
}

async function runJob(jobId: string, url: string): Promise<void> {
  activeJobs++;
  let jobDir: string | null = null;
  const log = logger.child({ verifyJobId: jobId });

  try {
    // ── Step 1: metadata + download ─────────────────────────────────────
    await setJob(jobId, { status: "downloading", progress: 5 });

    const meta = await fetchVideoMetadata(url);
    if (
      meta.durationSeconds !== null &&
      meta.durationSeconds > MAX_DURATION_SECONDS
    ) {
      throw new VerifyPipelineError(FAILURES.tooLong);
    }
    await setJob(jobId, {
      video_title: meta.title,
      video_thumbnail: meta.thumbnail,
      platform: meta.platform,
      duration_seconds: meta.durationSeconds,
      progress: 10,
    });

    const dl = await downloadAudio(jobId, url);
    jobDir = dl.jobDir;
    await setJob(jobId, { status: "transcribing", progress: 30 });

    // ── Step 2: transcription ───────────────────────────────────────────
    const segments = await transcribeAudio(dl.jobDir, dl.wavPath);
    if (segments.length === 0) {
      throw new VerifyPipelineError(FAILURES.emptyTranscript);
    }
    await setJob(jobId, {
      transcript: segments,
      status: "extracting",
      progress: 60,
    });

    // ── Step 3: claim extraction ────────────────────────────────────────
    const { summary, claims } = await extractClaims(segments);
    if (claims.length === 0) {
      throw new VerifyPipelineError(FAILURES.noClaims);
    }
    await setJob(jobId, { summary, status: "verifying", progress: 75 });

    // ── Step 4: evidence tagging ────────────────────────────────────────
    const verified = await verifyClaims(claims);
    await setJob(jobId, {
      claims: verified,
      status: "done",
      progress: 100,
    });
    log.info({ claims: verified.length }, "Verification job completed");
  } catch (err) {
    const failure =
      err instanceof VerifyPipelineError ? err.failure : FAILURES.internal;
    if (!(err instanceof VerifyPipelineError)) {
      log.error({ err }, "Verification job crashed unexpectedly");
    } else {
      log.warn({ code: failure.code }, "Verification job failed");
    }
    try {
      await setJob(jobId, {
        status: "failed",
        error_code: failure.code,
        error_message: failure.message,
      });
    } catch (dbErr) {
      log.error({ err: dbErr }, "Failed to persist job failure state");
    }
  } finally {
    activeJobs--;
    if (inFlightByUrl.get(url) === jobId) inFlightByUrl.delete(url);
    if (jobDir) await cleanupJobDir(jobDir);
    drainQueue();
  }
}
