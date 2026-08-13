/**
 * Maps raw pipeline failures (yt-dlp stderr, ffmpeg, whisper, LLM) to a
 * machine-readable error code plus a plain-English message that is safe to
 * show users. No stack traces or internal codes ever leave the server.
 */

export interface VerifyFailure {
  code: string;
  message: string;
}

/** Error type carried through the pipeline; message is user-safe. */
export class VerifyPipelineError extends Error {
  failure: VerifyFailure;
  constructor(failure: VerifyFailure) {
    super(failure.message);
    this.failure = failure;
  }
}

/** Classify a yt-dlp stderr dump into a specific, human-readable failure. */
export function classifyDownloadError(stderr: string): VerifyFailure {
  const s = stderr.toLowerCase();

  if (
    s.includes("private video") ||
    s.includes("this video is private") ||
    s.includes("login required") ||
    s.includes("requested content is not available") ||
    s.includes("members-only")
  ) {
    return {
      code: "private_video",
      message:
        "This video appears to be private or requires a login. Make sure the URL is public and try again.",
    };
  }

  if (
    s.includes("sign in to confirm") ||
    s.includes("confirm you're not a bot") ||
    s.includes("confirm you\u2019re not a bot") ||
    s.includes("429") ||
    s.includes("too many requests")
  ) {
    return {
      code: "platform_blocked",
      message:
        "This platform is currently blocking automated access from our servers. Try a video from another platform, or try again later.",
    };
  }

  if (
    s.includes("geo restricted") ||
    s.includes("geo-restricted") ||
    s.includes("not available in your country") ||
    s.includes("blocked it in your country") ||
    s.includes("this video is not available from your location")
  ) {
    return {
      code: "geo_blocked",
      message:
        "This video is geo-blocked and can't be reached from our servers' region.",
    };
  }

  if (
    s.includes("video unavailable") ||
    s.includes("404") ||
    s.includes("not found") ||
    s.includes("has been removed") ||
    s.includes("no longer available") ||
    s.includes("doesn't exist")
  ) {
    return {
      code: "video_unavailable",
      message:
        "We couldn't find a video at that URL. It may have been removed, or the link may be incorrect.",
    };
  }

  if (
    s.includes("unsupported url") ||
    s.includes("no suitable extractor") ||
    s.includes("is not a valid url")
  ) {
    return {
      code: "unsupported_platform",
      message:
        "We don't recognize that link as a video. Paste a direct link to a video page (YouTube, Facebook, Rumble, and most other platforms work).",
    };
  }

  if (s.includes("403") || s.includes("forbidden")) {
    return {
      code: "access_denied",
      message:
        "The platform refused our request for this video. It may be restricted or protected.",
    };
  }

  if (
    s.includes("timed out") ||
    s.includes("timeout") ||
    s.includes("connection refused") ||
    s.includes("network is unreachable") ||
    s.includes("temporary failure in name resolution")
  ) {
    return {
      code: "network_error",
      message:
        "We couldn't reach that video. Make sure the URL is public and try again in a moment.",
    };
  }

  return {
    code: "download_failed",
    message:
      "We couldn't download that video. Make sure the URL is public and points to a single video.",
  };
}

export const FAILURES = {
  invalidUrl: {
    code: "invalid_url",
    message: "That doesn't look like a valid link. Paste a full video URL, starting with https://.",
  },
  tooLong: {
    code: "video_too_long",
    message:
      "That video is longer than 30 minutes. For now we can only verify videos up to 30 minutes long.",
  },
  noAudio: {
    code: "no_audio",
    message:
      "We couldn't extract any audio from that video, so there is nothing to transcribe.",
  },
  transcriptionFailed: {
    code: "transcription_failed",
    message:
      "We downloaded the video but couldn't transcribe the audio. The audio may be silent, music-only, or corrupted.",
  },
  emptyTranscript: {
    code: "empty_transcript",
    message:
      "The video's audio doesn't contain any recognizable speech, so there are no claims to verify.",
  },
  noClaims: {
    code: "no_claims",
    message:
      "We transcribed the video but couldn't find any discrete factual claims to verify in it.",
  },
  analysisFailed: {
    code: "analysis_failed",
    message:
      "We transcribed the video but the analysis step failed. Please try again in a few minutes.",
  },
  notConfigured: {
    code: "not_configured",
    message:
      "The verification engine's analysis layer isn't configured on this server yet.",
  },
  internal: {
    code: "internal_error",
    message: "Something went wrong on our side while processing this video. Please try again.",
  },
} as const;
