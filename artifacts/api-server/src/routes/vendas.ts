import { Router } from "express";
import { pool } from "@workspace/db";
import { authMiddleware } from "../middleware/auth";
import { asaasEnabled, findOrCreateAsaasCustomer, createAsaasCharge } from "../lib/asaas";

const router = Router();

router.post("/vendas", authMiddleware, async (req, res) => {
  const { cliente_id, items, forma_pagamento, total } = req.body;
  const lojaId = req.auth!.lojaId;
  if (!cliente_id) return res.status(400).json({ error: "Cliente é obrigatório" });
  if (!items || items.length === 0) return res.status(400).json({ error: "Itens são obrigatórios" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const status = forma_pagamento === "a_prazo" ? "fiado" : "confirmada";
    const venda = await client.query(
      "INSERT INTO vendas (cliente_id, total, forma_pagamento, status, loja_id) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [cliente_id, total, forma_pagamento, status, lojaId]
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
          "SELECT nome, cpf, telefone, whatsapp, email FROM clientes WHERE id = $1 AND loja_id = $2",
          [cliente_id, lojaId]
        );
        const cli = clienteRows.rows[0];
        if (cli) {
          const asaasCustomerId = await findOrCreateAsaasCustomer({ nome: cli.nome, cpf: cli.cpf, telefone: cli.whatsapp || cli.telefone, email: cli.email });
          const charge = await createAsaasCharge({ customerId: asaasCustomerId, vendaId, total: parseFloat(total) });
          await pool.query("UPDATE vendas SET asaas_id=$1, asaas_invoice_url=$2, asaas_status=$3 WHERE id=$4", [charge.id, charge.invoiceUrl, charge.status, vendaId]);
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

router.get("/vendas", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  const { status } = req.query;
  try {
    let query: string;
    let params: unknown[];
    if (status) {
      const statuses = (status as string).split(",").map(s => s.trim());
      const placeholders = statuses.map((_, i) => `$${i + 2}`).join(", ");
      query = `SELECT v.*, c.nome as cliente_nome FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id
               WHERE v.loja_id = $1 AND v.status IN (${placeholders}) ORDER BY v.created_at DESC`;
      params = [lojaId, ...statuses];
    } else {
      query = `SELECT v.*, c.nome as cliente_nome FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id
               WHERE v.loja_id = $1 ORDER BY v.created_at DESC LIMIT 50`;
      params = [lojaId];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Erro ao buscar vendas" });
  }
});

router.get("/vendas/:id", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  try {
    const result = await pool.query(
      `SELECT v.*, c.nome as cliente_nome, c.whatsapp as cliente_whatsapp
       FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.id = $1 AND v.loja_id = $2`,
      [req.params.id, lojaId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao buscar venda" });
  }
});

router.delete("/vendas/:id", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  try {
    const r = await pool.query("DELETE FROM vendas WHERE id = $1 AND loja_id = $2 RETURNING id", [req.params.id, lojaId]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao excluir venda" });
  }
});

router.patch("/vendas/:id", authMiddleware, async (req, res) => {
  const { total } = req.body;
  const lojaId = req.auth!.lojaId;
  try {
    const r = await pool.query(
      "UPDATE vendas SET total = COALESCE($1, total) WHERE id = $2 AND loja_id = $3 RETURNING *",
      [total ?? null, req.params.id, lojaId]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao editar venda" });
  }
});

router.patch("/vendas/:id/baixa", authMiddleware, async (req, res) => {
  const { valor_pago } = req.body;
  const lojaId = req.auth!.lojaId;
  try {
    const venda = await pool.query("SELECT * FROM vendas WHERE id = $1 AND loja_id = $2", [req.params.id, lojaId]);
    if (venda.rows.length === 0) return res.status(404).json({ error: "Venda não encontrada" });
    const v = venda.rows[0];
    const totalPago = parseFloat(v.valor_pago || 0) + parseFloat(valor_pago || v.total);
    const novoStatus = totalPago >= parseFloat(v.total) ? "confirmada" : "fiado";
    const result = await pool.query(
      "UPDATE vendas SET valor_pago=$1, status=$2 WHERE id=$3 RETURNING *",
      [Math.min(totalPago, parseFloat(v.total)), novoStatus, req.params.id]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: "Erro ao dar baixa" });
  }
});

export default router;
