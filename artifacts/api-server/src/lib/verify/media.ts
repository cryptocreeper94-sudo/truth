import { spawn } from "node:child_process";
import { mkdir, rm, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { logger } from "../logger";
import {
  classifyDownloadError,
  FAILURES,
  VerifyPipelineError,
} from "./errors";
import { getEgressProxy } from "./egress-proxy";

/** Hard cap on the videos we accept (Phase 1). */
export const MAX_DURATION_SECONDS = 30 * 60;

const PY_PATH = `${process.env["HOME"] ?? "/home/runner"}/.pythonlibs/bin:${process.env["PATH"] ?? ""}`;

interface RunResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function run(
  cmd: string,
  args: string[],
  opts: { timeoutMs: number; cwd?: string },
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: { ...process.env, PATH: PY_PATH },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    // Cap captured output so a runaway process can't exhaust memory.
    const CAP = 20 * 1024 * 1024;
    child.stdout.on("data", (d: Buffer) => {
      if (stdout.length < CAP) stdout += d.toString();
    });
    child.stderr.on("data", (d: Buffer) => {
      if (stderr.length < CAP) stderr += d.toString();
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Process timed out after ${opts.timeoutMs}ms: ${cmd}`));
    }, opts.timeoutMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

export interface VideoMetadata {
  title: string | null;
  thumbnail: string | null;
  platform: string | null;
  durationSeconds: number | null;
}

/** Fetch video metadata (title, thumbnail, platform, duration) via yt-dlp. */
export async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
  let result: RunResult;
  try {
    // All yt-dlp traffic goes through the local SSRF-guard proxy, which
    // validates every connection (redirect hops and CDN URLs included).
    const proxy = await getEgressProxy();
    result = await run(
      "python3",
      [
        "-m",
        "yt_dlp",
        "--proxy",
        proxy.url,
        "--dump-json",
        "--no-download",
        "--no-playlist",
        url,
      ],
      { timeoutMs: 120_000 },
    );
  } catch (err) {
    logger.error({ err }, "yt-dlp metadata fetch crashed");
    throw new VerifyPipelineError(FAILURES.internal);
  }

  if (result.code !== 0 || !result.stdout.trim()) {
    logger.warn(
      { stderr: result.stderr.slice(-2000) },
      "yt-dlp metadata fetch failed",
    );
    throw new VerifyPipelineError(classifyDownloadError(result.stderr));
  }

  try {
    // yt-dlp may emit one JSON object per line for multi-entry pages; take the first.
    const firstLine = result.stdout.trim().split("\n")[0]!;
    const meta = JSON.parse(firstLine) as Record<string, unknown>;
    return {
      title: typeof meta["title"] === "string" ? meta["title"] : null,
      thumbnail:
        typeof meta["thumbnail"] === "string" ? meta["thumbnail"] : null,
      platform:
        typeof meta["extractor_key"] === "string"
          ? meta["extractor_key"]
          : null,
      durationSeconds:
        typeof meta["duration"] === "number"
          ? Math.round(meta["duration"])
          : null,
    };
  } catch {
    throw new VerifyPipelineError(classifyDownloadError(result.stderr));
  }
}

/**
 * Download the video's audio track as 16 kHz mono WAV into a fresh temp dir.
 * Returns the path to the WAV file. Caller must clean up via cleanupJobDir.
 */
export async function downloadAudio(
  jobId: string,
  url: string,
): Promise<{ wavPath: string; jobDir: string }> {
  const jobDir = path.join(os.tmpdir(), "verify-jobs", jobId);
  await mkdir(jobDir, { recursive: true });

  let result: RunResult;
  try {
    const proxy = await getEgressProxy();
    result = await run(
      "python3",
      [
        "-m",
        "yt_dlp",
        "--proxy",
        proxy.url,
        "-f",
        "bestaudio/best",
        "-x",
        "--audio-format",
        "wav",
        "--postprocessor-args",
        "ffmpeg:-ar 16000 -ac 1",
        "-o",
        "audio.%(ext)s",
        "--no-playlist",
        "--max-filesize",
        "600m",
        url,
      ],
      { timeoutMs: 12 * 60_000, cwd: jobDir },
    );
  } catch (err) {
    logger.error({ err }, "yt-dlp download crashed or timed out");
    throw new VerifyPipelineError({
      code: "download_timeout",
      message:
        "Downloading that video took too long. Try a shorter video or try again later.",
    });
  }

  if (result.code !== 0) {
    logger.warn({ stderr: result.stderr.slice(-2000) }, "yt-dlp download failed");
    throw new VerifyPipelineError(classifyDownloadError(result.stderr));
  }

  const files = await readdir(jobDir);
  const wav = files.find((f) => f.endsWith(".wav"));
  if (!wav) {
    throw new VerifyPipelineError(FAILURES.noAudio);
  }
  return { wavPath: path.join(jobDir, wav), jobDir };
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

const TRANSCRIBE_SCRIPT = `
import json, sys
from faster_whisper import WhisperModel

audio_path = sys.argv[1]
model = WhisperModel("base", device="cpu", compute_type="int8")
segments, info = model.transcribe(audio_path, vad_filter=True)
out = []
for s in segments:
    t = s.text.strip()
    if t:
        out.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": t})
print(json.dumps({"language": info.language, "segments": out}))
`;

/** Transcribe a 16 kHz mono WAV with faster-whisper (timestamped segments). */
export async function transcribeAudio(
  jobDir: string,
  wavPath: string,
): Promise<TranscriptSegment[]> {
  const scriptPath = path.join(jobDir, "transcribe.py");
  await writeFile(scriptPath, TRANSCRIBE_SCRIPT, "utf-8");

  let result: RunResult;
  try {
    result = await run("python3", [scriptPath, wavPath], {
      timeoutMs: 20 * 60_000,
      cwd: jobDir,
    });
  } catch (err) {
    logger.error({ err }, "transcription crashed or timed out");
    throw new VerifyPipelineError(FAILURES.transcriptionFailed);
  }

  if (result.code !== 0) {
    logger.error(
      { stderr: result.stderr.slice(-2000) },
      "faster-whisper transcription failed",
    );
    throw new VerifyPipelineError(FAILURES.transcriptionFailed);
  }

  try {
    const parsed = JSON.parse(result.stdout.trim()) as {
      segments: TranscriptSegment[];
    };
    return parsed.segments;
  } catch {
    throw new VerifyPipelineError(FAILURES.transcriptionFailed);
  }
}

/** Best-effort removal of the per-job temp directory. */
export async function cleanupJobDir(jobDir: string): Promise<void> {
  try {
    await rm(jobDir, { recursive: true, force: true });
  } catch (err) {
    logger.warn({ err, jobDir }, "Failed to clean up verify job dir");
  }
}
