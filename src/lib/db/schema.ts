import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  providerId: text("provider_id").notNull(),
  modelId: text("model_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").references(() => conversations.id).notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const fileEmbeddings = sqliteTable("file_embeddings", {
  id: text("id").primaryKey(),
  filePath: text("file_path").notNull(),
  content: text("content").notNull(),
  embedding: text("embedding", { mode: "json" }).notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type FileEmbedding = typeof fileEmbeddings.$inferSelect;
export type NewFileEmbedding = typeof fileEmbeddings.$inferInsert;
