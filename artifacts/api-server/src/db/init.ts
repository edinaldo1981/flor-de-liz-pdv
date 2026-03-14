import { pool } from "@workspace/db";

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id         SERIAL PRIMARY KEY,
      marca      VARCHAR(100) NOT NULL,
      nome       VARCHAR(200) NOT NULL,
      preco      NUMERIC(10,2) NOT NULL,
      estoque    INTEGER DEFAULT 0,
      img_url    TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS haveres (
      id              SERIAL PRIMARY KEY,
      cliente_id      INTEGER REFERENCES clientes(id),
      valor           NUMERIC(10,2) NOT NULL,
      saldo_restante  NUMERIC(10,2) NOT NULL,
      descricao       TEXT,
      created_at      TIMESTAMPTZ DEFAULT now()
    );
  `);

  console.log("[DB] Tabelas verificadas/criadas com sucesso.");
}
