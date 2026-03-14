import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/clientes", async (req, res) => {
  const { q } = req.query;
  try {
    let query: string;
    let params: string[] = [];
    if (q && typeof q === "string" && q.trim()) {
      query = `SELECT id, nome, telefone, whatsapp, email, cpf,
        (SELECT COUNT(*) FROM vendas WHERE cliente_id = clientes.id AND status IN ('fiado','fiado_atrasado')) as fiados_abertos
        FROM clientes WHERE nome ILIKE $1 OR telefone ILIKE $1 OR cpf ILIKE $1 ORDER BY nome LIMIT 30`;
      params = [`%${q.trim()}%`];
    } else {
      query = `SELECT id, nome, telefone, whatsapp, email, cpf,
        (SELECT COUNT(*) FROM vendas WHERE cliente_id = clientes.id AND status IN ('fiado','fiado_atrasado')) as fiados_abertos
        FROM clientes ORDER BY nome`;
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});

router.get("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const clienteRes = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
    if (clienteRes.rows.length === 0) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(clienteRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});

router.get("/clientes/:id/historico", async (req, res) => {
  const { id } = req.params;
  try {
    const clienteRes = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
    if (clienteRes.rows.length === 0) return res.status(404).json({ error: "Cliente não encontrado" });

    const vendasRes = await pool.query(
      `SELECT v.id, v.total, v.forma_pagamento, v.status, v.created_at,
              v.asaas_invoice_url, v.valor_pago,
              json_agg(json_build_object(
                'nome_produto', vi.nome_produto,
                'marca', vi.marca,
                'quantidade', vi.quantidade,
                'preco_unit', vi.preco_unit
              ) ORDER BY vi.id) as itens
       FROM vendas v
       LEFT JOIN venda_itens vi ON vi.venda_id = v.id
       WHERE v.cliente_id = $1
       GROUP BY v.id
       ORDER BY v.created_at DESC`,
      [id]
    );

    const totalGasto = vendasRes.rows
      .filter(v => v.status === "confirmada")
      .reduce((acc: number, v: { total: string }) => acc + parseFloat(v.total), 0);

    const totalEmAberto = vendasRes.rows
      .filter(v => v.status === "fiado" || v.status === "fiado_atrasado")
      .reduce((acc: number, v: { total: string; valor_pago: string }) =>
        acc + Math.max(0, parseFloat(v.total) - parseFloat(v.valor_pago || "0")), 0);

    res.json({
      cliente: clienteRes.rows[0],
      vendas: vendasRes.rows,
      stats: {
        totalVendas: vendasRes.rows.length,
        totalGasto,
        totalEmAberto,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

router.post("/clientes", async (req, res) => {
  const { nome, telefone, whatsapp, email, cpf, endereco, notas } = req.body;
  if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });
  try {
    const result = await pool.query(
      "INSERT INTO clientes (nome, telefone, whatsapp, email, cpf, endereco, notas) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [nome, telefone || null, whatsapp || null, email || null, cpf || null, endereco || null, notas || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

router.put("/clientes/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, whatsapp, email, cpf, endereco, notas } = req.body;
  if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });
  try {
    const result = await pool.query(
      "UPDATE clientes SET nome=$1, telefone=$2, whatsapp=$3, email=$4, cpf=$5, endereco=$6, notas=$7 WHERE id=$8 RETURNING *",
      [nome, telefone || null, whatsapp || null, email || null, cpf || null, endereco || null, notas || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});

export default router;
