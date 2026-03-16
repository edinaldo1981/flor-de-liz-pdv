import { pgTable, serial, varchar, numeric, integer, text, timestamp } from "drizzle-orm/pg-core";

export const produtosTable = pgTable("produtos", {
  id: serial("id").primaryKey(),
  marca: varchar("marca", { length: 100 }).notNull(),
  nome: varchar("nome", { length: 200 }).notNull(),
  preco: numeric("preco", { precision: 10, scale: 2 }).notNull(),
  estoque: integer("estoque").default(0),
  imgUrl: text("img_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lojaId: integer("loja_id").default(1),
});

export type Produto = typeof produtosTable.$inferSelect;
export type InsertProduto = typeof produtosTable.$inferInsert;
