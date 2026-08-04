import { integer, pgTable, text, date, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Tracks per-IP image generation usage, keyed by (ip, usage_date).
 * A new row is created each calendar day, so the count resets automatically
 * without any cleanup job.
 */
export const imageGenUsageTable = pgTable(
  "image_gen_usage",
  {
    ip: text("ip").notNull(),
    usage_date: date("usage_date").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [uniqueIndex("image_gen_usage_ip_date_idx").on(t.ip, t.usage_date)],
);

export type ImageGenUsage = typeof imageGenUsageTable.$inferSelect;
