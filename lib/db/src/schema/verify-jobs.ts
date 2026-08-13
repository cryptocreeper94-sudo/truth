import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * A Deterministic Verification Engine job: a submitted video URL and every
 * artifact produced while processing it (transcript, claims, evidence tags).
 *
 * status values: queued | downloading | transcribing | extracting | verifying
 *                | done | failed
 */
export const axiomVerifyJobsTable = pgTable("axiom_verify_jobs", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  status: text("status").notNull().default("queued"),
  /** 0-100 coarse progress for the UI progress tracker */
  progress: integer("progress").notNull().default(0),
  /** machine-readable error category (private_video, geo_blocked, ...) */
  error_code: text("error_code"),
  /** plain-English error message safe to show users */
  error_message: text("error_message"),

  // ── video metadata (populated after the download step) ──
  video_title: text("video_title"),
  video_thumbnail: text("video_thumbnail"),
  platform: text("platform"),
  duration_seconds: integer("duration_seconds"),

  // ── pipeline outputs ──
  /** timestamped transcript segments: [{ start, end, text }] */
  transcript: jsonb("transcript"),
  /** one-sentence plain-English summary of the video's subject */
  summary: text("summary"),
  /**
   * verified claims:
   * [{ number, text, label, rationale, established, notEstablished,
   *    sources: [{ title, url }] }]
   */
  claims: jsonb("claims"),

  /** stable share slug once the user shares the report */
  share_slug: text("share_slug").unique(),

  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertVerifyJobSchema = createInsertSchema(
  axiomVerifyJobsTable,
).omit({ created_at: true, updated_at: true });

export type InsertVerifyJob = z.infer<typeof insertVerifyJobSchema>;
export type VerifyJob = typeof axiomVerifyJobsTable.$inferSelect;
