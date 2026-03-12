import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.post("/vendas", async (req, res) => {
  const { cliente_id, items, forma_pagamento, total } = req.body;
  if (!cliente_id) return res.status(400).json({ error: "Cliente é obrigatório" });
  if (!items || items.length === 0) return res.status(400).json({ error: "Itens são obrigatórios" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const status = forma_pagamento === "a_prazo" ? "fiado" : "confirmada";
    const venda = await client.query(
      "INSERT INTO vendas (cliente_id, total, forma_pagamento, status) VALUES ($1,$2,$3,$4) RETURNING *",
      [cliente_id, total, forma_pagamento, status]
    );
    const vendaId = venda.rows[0].id;
    for (const item of items) {
      await client.query(
        "INSERT INTO venda_itens (venda_id, produto_id, nome_produto, marca, preco_unit, quantidade) VALUES ($1,$2,$3,$4,$5,$6)",
        [vendaId, item.produto_id || null, item.nome, item.marca, item.preco, item.qty]
      );
    }
    await client.query("COMMIT");
    const vendaCompleta = await pool.query(
      `SELECT v.*, c.nome as cliente_nome, c.whatsapp as cliente_whatsapp
       FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.id = $1`,
      [vendaId]
    );
    res.status(201).json(vendaCompleta.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar venda" });
  } finally {
    client.release();
  }
});

router.get("/vendas", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, c.nome as cliente_nome
       FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id
       ORDER BY v.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar vendas" });
  }
});

export default router;
