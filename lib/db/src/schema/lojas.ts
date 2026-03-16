import { pgTable, serial, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const lojasTable = pgTable("lojas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("ativo"),
  plano: varchar("plano", { length: 20 }).default("basico"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex("lojas_slug_key").on(t.slug),
]);

export type Loja = typeof lojasTable.$inferSelect;
export type InsertLoja = typeof lojasTable.$inferInsert;
