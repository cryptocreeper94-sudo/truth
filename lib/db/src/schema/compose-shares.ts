import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const axiomComposeSharesTable = pgTable("axiom_compose_shares", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  result_text: text("result_text").notNull(),
  doc_type: text("doc_type").notNull().default(""),
  intent: text("intent").notNull().default(""),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const insertComposeShareSchema = createInsertSchema(
  axiomComposeSharesTable,
).omit({ created_at: true });

export type InsertComposeShare = z.infer<typeof insertComposeShareSchema>;
export type ComposeShare = typeof axiomComposeSharesTable.$inferSelect;
