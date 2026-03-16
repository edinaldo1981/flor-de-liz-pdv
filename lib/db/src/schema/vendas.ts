import { pgTable, serial, integer, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { clientesTable } from "./clientes";

export const vendasTable = pgTable("vendas", {
  id: serial("id").primaryKey(),
  clienteId: integer("cliente_id").references(() => clientesTable.id),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  formaPagamento: varchar("forma_pagamento", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("confirmada"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const vendaItensTable = pgTable("venda_itens", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").references(() => vendasTable.id),
  produtoId: integer("produto_id"),
  nomeProduto: varchar("nome_produto", { length: 200 }),
  marca: varchar("marca", { length: 100 }),
  precoUnit: numeric("preco_unit", { precision: 10, scale: 2 }),
  quantidade: integer("quantidade").default(1),
});

export type Venda = typeof vendasTable.$inferSelect;
export type VendaItem = typeof vendaItensTable.$inferSelect;
