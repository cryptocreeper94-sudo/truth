import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { sql, desc, eq, lt } from "drizzle-orm";
import { db, imageGenUsageTable, generatedImagesTable } from "@workspace/db";
import { randomUUID } from "crypto";

const router = Router();

// ── Daily quota ────────────────────────────────────────────────────────────────
// Usage is tracked in the database, keyed by (ip, usage_date).
// A new row is created each calendar day, so the quota resets automatically
// without any cleanup job. Reserving a slot is an atomic upsert so concurrent
// requests from the same IP both see the incremented count.
const DAILY_LIMIT = 5;

// Maximum number of previously generated images returned in history
const HISTORY_LIMIT = 10;

// Images older than this many days are deleted by the scheduled cleanup job
const IMAGE_MAX_AGE_DAYS = 30;

// ── Image cleanup helpers ──────────────────────────────────────────────────────

/**
 * After inserting a new image for an IP, delete any rows beyond the most recent
 * HISTORY_LIMIT for that IP. This caps per-IP storage regardless of age.
 */
async function pruneImagesForIp(ip: string): Promise<void> {
  try {
    await db.execute(
      sql`DELETE FROM generated_images
          WHERE ip = ${ip}
            AND id NOT IN (
              SELECT id FROM generated_images
              WHERE ip = ${ip}
              ORDER BY created_at DESC
              LIMIT ${HISTORY_LIMIT}
            )`
    );
  } catch (err) {
    console.error("Failed to prune images for IP:", err);
  }
}

/**
 * Delete all generated images older than IMAGE_MAX_AGE_DAYS days.
 * Called on startup and then on a daily interval.
 */
async function pruneOldImages(): Promise<void> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - IMAGE_MAX_AGE_DAYS);

    const result = await db
      .delete(generatedImagesTable)
      .where(lt(generatedImagesTable.created_at, cutoff))
      .returning({ id: generatedImagesTable.id });

    if (result.length > 0) {
      console.log(
        `[image-cleanup] Deleted ${result.length} generated image(s) older than ${IMAGE_MAX_AGE_DAYS} days.`
      );
    }
  } catch (err) {
    console.error("[image-cleanup] Failed to prune old images:", err);
  }
}

// Run once at startup, then every 24 hours
pruneOldImages();
setInterval(pruneOldImages, 24 * 60 * 60 * 1000);

/**
 * Atomically increment the usage counter for (ip, today).
 * Returns the new count after increment.
 */
async function incrementUsage(ip: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const rows = await db
    .insert(imageGenUsageTable)
    .values({ ip, usage_date: today, count: 1 })
    .onConflictDoUpdate({
      target: [imageGenUsageTable.ip, imageGenUsageTable.usage_date],
      set: { count: sql`${imageGenUsageTable.count} + 1` },
    })
    .returning({ count: imageGenUsageTable.count });

  return rows[0]?.count ?? 1;
}

/**
 * Decrement the counter (used when the OpenAI call fails after a reservation).
 */
async function decrementUsage(ip: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  await db
    .insert(imageGenUsageTable)
    .values({ ip, usage_date: today, count: 0 })
    .onConflictDoUpdate({
      target: [imageGenUsageTable.ip, imageGenUsageTable.usage_date],
      set: { count: sql`GREATEST(${imageGenUsageTable.count} - 1, 0)` },
    });
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

// ── DELETE /v1/image/:id ───────────────────────────────────────────────────
// Deletes a single generated image by ID. Only the owning IP may delete it.
router.delete("/v1/image/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const clientIp = req.ip ?? "unknown";

  if (!id) {
    res.status(400).json({ error: "Missing image id" });
    return;
  }

  try {
    const result = await db
      .delete(generatedImagesTable)
      .where(
        sql`${generatedImagesTable.id} = ${id} AND ${generatedImagesTable.ip} = ${clientIp}`
      )
      .returning({ id: generatedImagesTable.id });

    if (result.length === 0) {
      // Either the image doesn't exist or it belongs to a different IP
      res.status(404).json({ error: "Image not found" });
      return;
    }

    res.json({ deleted: true, id });
  } catch (err) {
    console.error("Failed to delete image:", err);
    res.status(503).json({ error: "Could not delete image" });
  }
});

// ── GET /v1/image/history ──────────────────────────────────────────────────
// Returns the most recent generated images for the requesting IP.
router.get("/v1/image/history", async (req: Request, res: Response) => {
  const clientIp = req.ip ?? "unknown";

  try {
    const rows = await db
      .select({
        id: generatedImagesTable.id,
        prompt: generatedImagesTable.prompt,
        size: generatedImagesTable.size,
        image_data_b64: generatedImagesTable.image_data_b64,
        created_at: generatedImagesTable.created_at,
      })
      .from(generatedImagesTable)
      .where(eq(generatedImagesTable.ip, clientIp))
      .orderBy(desc(generatedImagesTable.created_at))
      .limit(HISTORY_LIMIT);

    res.json({ images: rows });
  } catch (err) {
    console.error("Failed to fetch image history:", err);
    res.status(503).json({ error: "Could not load image history", images: [] });
  }
});

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
  // incrementUsage returns the new count *after* the increment, so a count of
  // DAILY_LIMIT means the user just used their last slot; > DAILY_LIMIT means
  // they're over the limit and we must reject.
  let newCount: number;
  try {
    newCount = await incrementUsage(clientIp);
  } catch (err) {
    console.error("Failed to check image generation quota:", err);
    res.status(503).json({
      error: "Quota check failed",
      detail: "Could not verify your daily quota. Please try again.",
    });
    return;
  }

  if (newCount > DAILY_LIMIT) {
    // Already over limit — undo the phantom increment so the count stays accurate
    await decrementUsage(clientIp).catch(() => {});
    res.status(429).json({
      error: "Daily limit reached",
      detail: `You have used all ${DAILY_LIMIT} free image generations for today. Your quota resets at midnight UTC.`,
      remaining: 0,
    });
    return;
  }

  // ── check env vars ────────────────────────────────────────────────────────
  const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

  if (!baseUrl || !apiKey) {
    // Release the reserved slot — no AI call was made
    await decrementUsage(clientIp).catch(() => {});
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
    await decrementUsage(clientIp).catch(() => {});
    console.error("Image generation failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Image generation failed", detail: message });
    return;
  }

  // ── persist the generated image ───────────────────────────────────────────
  const imageId = randomUUID();
  try {
    await db.insert(generatedImagesTable).values({
      id: imageId,
      ip: clientIp,
      prompt,
      size,
      image_data_b64: b64Json,
    });
    // Trim rows for this IP to the most recent HISTORY_LIMIT (non-fatal)
    await pruneImagesForIp(clientIp);
  } catch (err) {
    // Non-fatal: generation succeeded, persistence failed — log and continue
    console.error("Failed to persist generated image:", err);
  }

  const remaining = DAILY_LIMIT - newCount;
  res.json({
    b64_json: b64Json,
    size,
    remaining,
    used: newCount,
    limit: DAILY_LIMIT,
    image_id: imageId,
  });
});

export default router;
