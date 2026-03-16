import { pgTable, serial, integer, varchar, numeric, timestamp, text } from "drizzle-orm/pg-core";

export const vendasTable = pgTable("vendas", {
  id: serial("id").primaryKey(),
  clienteId: integer("cliente_id"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  formaPagamento: varchar("forma_pagamento", { length: 50 }).notNull(),
  status: varchar("status", { length: 30 }).default("confirmada"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  asaasId: varchar("asaas_id", { length: 50 }),
  asaasInvoiceUrl: text("asaas_invoice_url"),
  asaasStatus: varchar("asaas_status", { length: 30 }),
  valorPago: numeric("valor_pago", { precision: 10, scale: 2 }).default("0"),
  lojaId: integer("loja_id").default(1),
});

export const vendaItensTable = pgTable("venda_itens", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id"),
  produtoId: integer("produto_id"),
  nomeProduto: varchar("nome_produto", { length: 200 }),
  marca: varchar("marca", { length: 100 }),
  precoUnit: numeric("preco_unit", { precision: 10, scale: 2 }),
  quantidade: integer("quantidade").default(1),
});

export type Venda = typeof vendasTable.$inferSelect;
export type VendaItem = typeof vendaItensTable.$inferSelect;
