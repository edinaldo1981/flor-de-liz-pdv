import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/clientes/:id/haveres", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, valor, saldo_restante, descricao, created_at
       FROM haveres WHERE cliente_id = $1 AND saldo_restante > 0
       ORDER BY created_at ASC`,
      [req.params.id]
    );
    const totalHaver = result.rows.reduce((acc, h) => acc + parseFloat(h.saldo_restante), 0);
    res.json({ haveres: result.rows, total: totalHaver });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar haveres" });
  }
});

router.post("/clientes/:id/haveres", async (req, res) => {
  const { valor, descricao } = req.body;
  if (!valor || parseFloat(valor) <= 0) return res.status(400).json({ error: "Valor inválido" });
  try {
    const result = await pool.query(
      `INSERT INTO haveres (cliente_id, valor, saldo_restante, descricao)
       VALUES ($1, $2, $2, $3) RETURNING *`,
      [req.params.id, parseFloat(valor), descricao || "Haver registrado"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar haver" });
  }
});

router.post("/vendas/:id/aplicar-haver", async (req, res) => {
  const { valor } = req.body;
  if (!valor || parseFloat(valor) <= 0) return res.status(400).json({ error: "Valor inválido" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const vendaRes = await client.query("SELECT * FROM vendas WHERE id = $1", [req.params.id]);
    if (vendaRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Venda não encontrada" });
    }
    const venda = vendaRes.rows[0];

    const saldoVenda = parseFloat(venda.total) - parseFloat(venda.valor_pago || 0);
    if (saldoVenda <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Esta nota já está quitada" });
    }

    const valorAplicar = Math.min(parseFloat(valor), saldoVenda);

    const haveresRes = await client.query(
      `SELECT id, saldo_restante FROM haveres
       WHERE cliente_id = $1 AND saldo_restante > 0
       ORDER BY created_at ASC`,
      [venda.cliente_id]
    );

    const totalHaver = haveresRes.rows.reduce((acc: number, h: { saldo_restante: string }) => acc + parseFloat(h.saldo_restante), 0);
    if (totalHaver < valorAplicar) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: `Saldo de haver insuficiente. Disponível: R$ ${totalHaver.toFixed(2)}` });
    }

    let restante = valorAplicar;
    for (const haver of haveresRes.rows) {
      if (restante <= 0) break;
      const saldoH = parseFloat(haver.saldo_restante);
      const usar = Math.min(saldoH, restante);
      const novoSaldo = saldoH - usar;
      await client.query(
        "UPDATE haveres SET saldo_restante = $1 WHERE id = $2",
        [novoSaldo, haver.id]
      );
      restante -= usar;
    }

    const novoPago = parseFloat(venda.valor_pago || 0) + valorAplicar;
    const novoStatus = novoPago >= parseFloat(venda.total) ? "confirmada" : "fiado";

    const updated = await client.query(
      "UPDATE vendas SET valor_pago = $1, status = $2 WHERE id = $3 RETURNING *",
      [Math.min(novoPago, parseFloat(venda.total)), novoStatus, req.params.id]
    );

    await client.query("COMMIT");

    const vendaCompleta = await pool.query(
      `SELECT v.*, c.nome as cliente_nome FROM vendas v
       LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.id = $1`,
      [req.params.id]
    );

    res.json({
      venda: vendaCompleta.rows[0],
      valorAplicado: valorAplicar,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erro ao aplicar haver" });
  } finally {
    client.release();
  }
});

export default router;
