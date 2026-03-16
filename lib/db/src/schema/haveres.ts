import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";

export const haveresTable = pgTable("haveres", {
  id: serial("id").primaryKey(),
  clienteId: integer("cliente_id"),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull(),
  saldoRestante: numeric("saldo_restante", { precision: 10, scale: 2 }).notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lojaId: integer("loja_id").default(1),
});

export type Haver = typeof haveresTable.$inferSelect;
export type InsertHaver = typeof haveresTable.$inferInsert;
