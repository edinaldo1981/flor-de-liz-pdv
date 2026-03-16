import { pgTable, varchar, text, timestamp, integer, unique, primaryKey } from "drizzle-orm/pg-core";

export const configTable = pgTable("config", {
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  lojaId: integer("loja_id").notNull().default(1),
}, (t) => [
  primaryKey({ columns: [t.key, t.lojaId] }),
]);

export type Config = typeof configTable.$inferSelect;
