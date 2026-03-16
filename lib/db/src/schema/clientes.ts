import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

export const clientesTable = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  telefone: varchar("telefone", { length: 30 }),
  whatsapp: varchar("whatsapp", { length: 30 }),
  email: varchar("email", { length: 200 }),
  cpf: varchar("cpf", { length: 20 }),
  endereco: text("endereco"),
  notas: text("notas"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lojaId: integer("loja_id").default(1),
});

export type Cliente = typeof clientesTable.$inferSelect;
export type InsertCliente = typeof clientesTable.$inferInsert;
