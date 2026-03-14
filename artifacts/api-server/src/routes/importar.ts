import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.post("/importar-vendas", async (req, res) => {
  const { vendas } = req.body as {
    vendas: Array<{
      data: string;
      cliente_nome?: string;
      cliente_id?: number | null;
      forma_pagamento: string;
      itens: Array<{
        nome_produto: string;
        marca?: string;
        preco_unit: number;
        quantidade: number;
      }>;
    }>;
  };

  if (!Array.isArray(vendas) || vendas.length === 0) {
    return res.status(400).json({ error: "Nenhuma venda enviada." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resultados: { id: number; total: number }[] = [];

    for (const venda of vendas) {
      const total = venda.itens.reduce(
        (s, i) => s + i.preco_unit * i.quantidade,
        0
      );

      let clienteId = venda.cliente_id ?? null;

      if (!clienteId && venda.cliente_nome?.trim()) {
        const nome = venda.cliente_nome.trim();
        const existing = await client.query(
          "SELECT id FROM clientes WHERE LOWER(nome) = LOWER($1) LIMIT 1",
          [nome]
        );
        if (existing.rows.length > 0) {
          clienteId = existing.rows[0].id;
        } else {
          const ins = await client.query(
            "INSERT INTO clientes (nome, telefone, endereco) VALUES ($1, '', '') RETURNING id",
            [nome]
          );
          clienteId = ins.rows[0].id;
        }
      }

      const status =
        venda.forma_pagamento === "a_prazo" ? "a_prazo" : "confirmada";
      const valorPago =
        venda.forma_pagamento === "a_prazo" ? 0 : total;

      const vendaRes = await client.query(
        `INSERT INTO vendas (cliente_id, total, forma_pagamento, status, valor_pago, created_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          clienteId,
          total.toFixed(2),
          venda.forma_pagamento,
          status,
          valorPago.toFixed(2),
          venda.data,
        ]
      );

      const vendaId = vendaRes.rows[0].id;

      for (const item of venda.itens) {
        await client.query(
          `INSERT INTO venda_itens (venda_id, nome_produto, marca, preco_unit, quantidade)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            vendaId,
            item.nome_produto,
            item.marca ?? "",
            item.preco_unit.toFixed(2),
            item.quantidade,
          ]
        );
      }

      resultados.push({ id: vendaId, total });
    }

    await client.query("COMMIT");
    res.json({ ok: true, importadas: resultados.length, resultados });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Erro ao importar vendas:", err);
    res.status(500).json({ error: "Erro ao importar: " + err.message });
  } finally {
    client.release();
  }
});

export default router;
