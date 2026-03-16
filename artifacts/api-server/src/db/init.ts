import { pool } from "@workspace/db";

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // --- Tabelas base (podem já existir via Drizzle) ---
    await client.query(`
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

      CREATE TABLE IF NOT EXISTS config (
        key        VARCHAR(100) NOT NULL,
        value      TEXT,
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // --- Colunas extras em vendas (Asaas + valor_pago) ---
    await client.query(`
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS asaas_id VARCHAR(50);
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS asaas_invoice_url TEXT;
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS asaas_status VARCHAR(30);
      ALTER TABLE vendas ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(10,2) DEFAULT 0;
    `);

    // --- Tabela de lojas (SaaS) ---
    await client.query(`
      CREATE TABLE IF NOT EXISTS lojas (
        id         SERIAL PRIMARY KEY,
        nome       VARCHAR(100) NOT NULL,
        slug       VARCHAR(50)  NOT NULL,
        status     VARCHAR(20)  DEFAULT 'ativo',
        plano      VARCHAR(20)  DEFAULT 'basico',
        created_at TIMESTAMPTZ  DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS lojas_slug_key ON lojas(slug);
    `);

    // Inserir Flor de Liz como loja_id=1 se não existir
    await client.query(`
      INSERT INTO lojas (id, nome, slug, status, plano)
      VALUES (1, 'Flor de Liz', 'flordeliz', 'ativo', 'basico')
      ON CONFLICT (id) DO NOTHING;
    `);

    // --- Colunas loja_id em todas as tabelas ---
    await client.query(`
      ALTER TABLE clientes  ADD COLUMN IF NOT EXISTS loja_id INTEGER DEFAULT 1;
      ALTER TABLE vendas    ADD COLUMN IF NOT EXISTS loja_id INTEGER DEFAULT 1;
      ALTER TABLE produtos  ADD COLUMN IF NOT EXISTS loja_id INTEGER DEFAULT 1;
      ALTER TABLE haveres   ADD COLUMN IF NOT EXISTS loja_id INTEGER DEFAULT 1;
      ALTER TABLE config    ADD COLUMN IF NOT EXISTS loja_id INTEGER DEFAULT 1;
    `);

    // --- Unique constraint em config(key, loja_id) ---
    // Criar apenas se não existir ainda (como PK ou unique index)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'config_key_loja_unique'
             OR conname = 'config_key_loja_id_pk'
        ) THEN
          ALTER TABLE config ADD CONSTRAINT config_key_loja_unique UNIQUE (key, loja_id);
        END IF;
      END $$;
    `);

    // Corrigir dados existentes: garantir loja_id = 1 onde NULL
    await client.query(`
      UPDATE clientes SET loja_id = 1 WHERE loja_id IS NULL;
      UPDATE vendas   SET loja_id = 1 WHERE loja_id IS NULL;
      UPDATE produtos SET loja_id = 1 WHERE loja_id IS NULL;
      UPDATE haveres  SET loja_id = 1 WHERE loja_id IS NULL;
      UPDATE config   SET loja_id = 1 WHERE loja_id IS NULL;
    `);

    console.log("[DB] Tabelas verificadas/criadas com sucesso.");
  } finally {
    client.release();
  }
}
