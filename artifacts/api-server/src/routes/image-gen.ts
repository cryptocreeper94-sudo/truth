import { Router, type Request, type Response } from "express";
import { z } from "zod";

const router = Router();

// ── IP-based rate limiter ──────────────────────────────────────────────────
// The quota key is req.ip, which — with `app.set("trust proxy", 1)` — is
// the real client IP from X-Forwarded-For's first entry set by the edge
// proxy.  Clients cannot forge req.ip without controlling the proxy layer.
//
// The slot is reserved *before* calling OpenAI so two concurrent requests
// from the same IP both see the incremented count and one is blocked.
// If the OpenAI call subsequently fails, the reservation is released.
const SESSION_LIMIT = 5;
const ipUsage = new Map<string, number>();

function reserveSlot(ip: string): { ok: boolean; used: number } {
  const used = ipUsage.get(ip) ?? 0;
  if (used >= SESSION_LIMIT) return { ok: false, used };
  ipUsage.set(ip, used + 1);   // atomic reservation before the API call
  return { ok: true, used };
}

function releaseSlot(ip: string): void {
  const used = ipUsage.get(ip) ?? 0;
  if (used > 0) ipUsage.set(ip, used - 1);
}

// ── Request validation ──────────────────────────────────────────────────────
const IMAGE_SIZES = ["square", "wide", "tall"] as const;
type ImageSize = (typeof IMAGE_SIZES)[number];

const generateImageSchema = z.object({
  prompt: z.string().min(1, "prompt is required").max(1000, "prompt too long"),
  size: z.enum(IMAGE_SIZES).default("square"),
});

// ── Size mapping: UI label → gpt-image-1 supported dimensions ──────────────
const SIZE_MAP: Record<ImageSize, "1024x1024" | "1536x1024" | "1024x1536"> = {
  square: "1024x1024",
  wide: "1536x1024",
  tall: "1024x1536",
};

// ── POST /v1/image/generate ────────────────────────────────────────────────
router.post("/v1/image/generate", async (req: Request, res: Response) => {
  // ── validate body first (cheap, before quota check) ───────────────────────
  const parsed = generateImageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { prompt, size } = parsed.data;
  const clientIp = req.ip ?? "unknown";

  // ── atomically reserve a generation slot before calling OpenAI ─────────────
  const { ok, used } = reserveSlot(clientIp);
  if (!ok) {
    res.status(429).json({
      error: "Rate limit reached",
      detail: `You have used all ${SESSION_LIMIT} free image generations for this session.`,
      remaining: 0,
    });
    return;
  }

  // ── check env vars ────────────────────────────────────────────────────────
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (!baseUrl || !apiKey) {
    // Release the reserved slot — no AI call was made
    releaseSlot(clientIp);
    res.status(503).json({
      error: "Image generation not configured",
      detail:
        "AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY must be set. " +
        "Set up the OpenAI AI integration to enable this feature.",
    });
    return;
  }

  // ── call OpenAI images API ────────────────────────────────────────────────
  let b64Json: string;
  try {
    const { default: OpenAI } = (await import("openai")) as {
      default: typeof import("openai").default;
    };
    const openai = new OpenAI({ apiKey, baseURL: baseUrl });

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: SIZE_MAP[size],
    });

    b64Json = response.data?.[0]?.b64_json ?? "";
    if (!b64Json) {
      throw new Error("No image data returned by the model");
    }
  } catch (err) {
    // Release the slot so the user can retry without losing their quota
    releaseSlot(clientIp);
    console.error("Image generation failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Image generation failed", detail: message });
    return;
  }

  const remaining = SESSION_LIMIT - (used + 1);
  res.json({ b64_json: b64Json, size, remaining });
});

export default router;
