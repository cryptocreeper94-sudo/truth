import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── DVE verification job states ──────────────────────────────────────────────
export type VerifyStep =
  | "queued"
  | "downloading"
  | "transcribing"
  | "extracting"
  | "verifying"
  | "done"
  | "error";

export type ClaimLabel =
  | "DOCUMENTED"
  | "CONTESTED"
  | "SPECULATIVE"
  | "REFUTED"
  | "UNVERIFIABLE";

export interface VerifyClaim {
  id: number;
  text: string;           // plain-English claim statement
  label: ClaimLabel;
  rationale: string;      // one-sentence plain-English explanation
  timecode?: string;      // e.g. "1:23" where in the video this was said
  sources: Array<{ title: string; url: string }>;
}

export interface VerifyResult {
  videoTitle: string;
  videoPlatform: string;
  thumbnailUrl?: string;
  summary: string;        // one-sentence plain-English summary of video subject
  claims: VerifyClaim[];
}

export const dveJobsTable = pgTable("dve_jobs", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  step: text("step").notNull().default("queued"),
  error: text("error"),
  result: jsonb("result"),
  share_slug: text("share_slug"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertDveJobSchema = createInsertSchema(dveJobsTable).omit({
  created_at: true,
  updated_at: true,
});

export type InsertDveJob = z.infer<typeof insertDveJobSchema>;
export type DveJob = typeof dveJobsTable.$inferSelect;
