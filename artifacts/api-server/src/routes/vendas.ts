import { Router } from "express";
import { pool } from "@workspace/db";
import {
  asaasEnabled,
  findOrCreateAsaasCustomer,
  createAsaasCharge,
} from "../lib/asaas";

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

    if (forma_pagamento === "a_prazo" && asaasEnabled()) {
      try {
        const clienteRows = await pool.query(
          "SELECT nome, cpf, telefone, whatsapp, email FROM clientes WHERE id = $1",
          [cliente_id]
        );
        const cli = clienteRows.rows[0];
        if (cli) {
          const asaasCustomerId = await findOrCreateAsaasCustomer({
            nome: cli.nome,
            cpf: cli.cpf,
            telefone: cli.whatsapp || cli.telefone,
            email: cli.email,
          });
          const charge = await createAsaasCharge({
            customerId: asaasCustomerId,
            vendaId,
            total: parseFloat(total),
          });
          await pool.query(
            "UPDATE vendas SET asaas_id=$1, asaas_invoice_url=$2, asaas_status=$3 WHERE id=$4",
            [charge.id, charge.invoiceUrl, charge.status, vendaId]
          );
        }
      } catch (asaasErr) {
        console.error("[Asaas] Erro ao criar cobrança (venda salva normalmente):", asaasErr);
      }
    }

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

router.get("/vendas/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, c.nome as cliente_nome, c.whatsapp as cliente_whatsapp
       FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id
       WHERE v.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar venda" });
  }
});

router.delete("/vendas/:id", async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM vendas WHERE id = $1 RETURNING id", [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir venda" });
  }
});

router.patch("/vendas/:id", async (req, res) => {
  const { total, descricao } = req.body;
  try {
    const r = await pool.query(
      `UPDATE vendas SET total = COALESCE($1, total)
       WHERE id = $2 RETURNING *`,
      [total ?? null, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar venda" });
  }
});

router.patch("/vendas/:id/baixa", async (req, res) => {
  const { valor_pago } = req.body;
  try {
    const venda = await pool.query("SELECT * FROM vendas WHERE id = $1", [req.params.id]);
    if (venda.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });

    const v = venda.rows[0];
    const totalPago = parseFloat(v.valor_pago || 0) + parseFloat(valor_pago || v.total);
    const novoStatus = totalPago >= parseFloat(v.total) ? "confirmada" : "fiado";

    const result = await pool.query(
      `UPDATE vendas SET valor_pago=$1, status=$2 WHERE id=$3 RETURNING *`,
      [Math.min(totalPago, parseFloat(v.total)), novoStatus, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao dar baixa" });
  }
});

export default router;
