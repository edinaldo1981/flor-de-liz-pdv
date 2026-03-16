import { Router } from "express";
import { pool } from "@workspace/db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/dashboard", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  try {
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const [vendasHoje, fiadosAbertos, recebidoMes, totalClientes, ultimasVendas, topFiados] = await Promise.all([
      pool.query(
        "SELECT COUNT(*) as qtd, COALESCE(SUM(total), 0) as soma FROM vendas WHERE loja_id = $1 AND created_at >= $2",
        [lojaId, inicioDia]
      ),
      pool.query(
        "SELECT COUNT(DISTINCT cliente_id) as clientes, COALESCE(SUM(total - COALESCE(valor_pago, 0)), 0) as soma FROM vendas WHERE loja_id = $1 AND status IN ('fiado', 'fiado_atrasado')",
        [lojaId]
      ),
      pool.query(
        "SELECT COALESCE(SUM(total), 0) as soma FROM vendas WHERE loja_id = $1 AND status = 'confirmada' AND created_at >= $2",
        [lojaId, inicioMes]
      ),
      pool.query("SELECT COUNT(*) as qtd FROM clientes WHERE loja_id = $1", [lojaId]),
      pool.query(
        `SELECT v.id, v.total, v.status, v.forma_pagamento, v.created_at,
                c.nome as cliente_nome,
                (SELECT nome_produto FROM venda_itens WHERE venda_id = v.id LIMIT 1) as primeiro_item
         FROM vendas v JOIN clientes c ON c.id = v.cliente_id
         WHERE v.loja_id = $1 ORDER BY v.created_at DESC LIMIT 5`,
        [lojaId]
      ),
      pool.query(
        `SELECT c.nome, SUM(v.total - COALESCE(v.valor_pago, 0)) as em_aberto, MIN(v.created_at) as primeira_data
         FROM vendas v JOIN clientes c ON c.id = v.cliente_id
         WHERE v.loja_id = $1 AND v.status IN ('fiado', 'fiado_atrasado')
         GROUP BY c.id, c.nome ORDER BY em_aberto DESC LIMIT 5`,
        [lojaId]
      ),
    ]);

    res.json({
      vendasHoje: { qtd: parseInt(vendasHoje.rows[0].qtd), soma: parseFloat(vendasHoje.rows[0].soma) },
      fiadosAbertos: { clientes: parseInt(fiadosAbertos.rows[0].clientes), soma: parseFloat(fiadosAbertos.rows[0].soma) },
      recebidoMes: parseFloat(recebidoMes.rows[0].soma),
      totalClientes: parseInt(totalClientes.rows[0].qtd),
      ultimasVendas: ultimasVendas.rows,
      topFiados: topFiados.rows.map(f => ({
        nome: f.nome,
        em_aberto: parseFloat(f.em_aberto),
        dias: Math.floor((Date.now() - new Date(f.primeira_data).getTime()) / 86400000),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dashboard" });
  }
});

export default router;
