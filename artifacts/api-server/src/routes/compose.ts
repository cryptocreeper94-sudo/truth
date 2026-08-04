import { Router, type Request, type Response } from "express";
import { z } from "zod";

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

export default router;
