import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Persists AI-generated images (base64) keyed by the requesting IP.
 * Allows the compose page to restore images after a page refresh.
 * History is capped server-side to the most recent entries per IP.
 */
export const generatedImagesTable = pgTable("generated_images", {
  id: text("id").primaryKey(),
  ip: text("ip").notNull(),
  prompt: text("prompt").notNull(),
  size: text("size").notNull(), // "square" | "wide" | "tall"
  image_data_b64: text("image_data_b64").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type GeneratedImage = typeof generatedImagesTable.$inferSelect;
