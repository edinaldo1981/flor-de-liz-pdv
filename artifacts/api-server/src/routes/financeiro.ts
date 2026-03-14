import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/financeiro", async (_req, res) => {
  try {
    const [totaisRes, marcasRes, transacoesRes] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN v.created_at >= date_trunc('month', now()) AND v.status != 'estornada' THEN v.total ELSE 0 END), 0) AS mes,
          COALESCE(SUM(CASE WHEN v.created_at >= now() - interval '3 months' AND v.status != 'estornada' THEN v.total ELSE 0 END), 0) AS tri,
          COALESCE(SUM(CASE WHEN v.created_at >= now() - interval '6 months' AND v.status != 'estornada' THEN v.total ELSE 0 END), 0) AS sem,
          COALESCE(SUM(CASE WHEN v.created_at >= now() - interval '1 year' AND v.status != 'estornada' THEN v.total ELSE 0 END), 0) AS ano,
          COALESCE(SUM(CASE WHEN v.created_at >= now() - interval '1 month' - interval '1 month' AND v.created_at < date_trunc('month', now()) AND v.status != 'estornada' THEN v.total ELSE 0 END), 0) AS mes_anterior
        FROM vendas v
      `),

      pool.query(`
        SELECT
          COALESCE(vi.marca, 'Sem Marca') AS marca,
          COALESCE(SUM(CASE WHEN v.created_at >= date_trunc('month', now()) THEN vi.preco_unit * vi.quantidade ELSE 0 END), 0) AS total_mes,
          COALESCE(SUM(CASE WHEN v.created_at >= now() - interval '3 months' THEN vi.preco_unit * vi.quantidade ELSE 0 END), 0) AS total_tri,
          COALESCE(SUM(CASE WHEN v.created_at >= now() - interval '6 months' THEN vi.preco_unit * vi.quantidade ELSE 0 END), 0) AS total_sem,
          COALESCE(SUM(CASE WHEN v.created_at >= now() - interval '1 year' THEN vi.preco_unit * vi.quantidade ELSE 0 END), 0) AS total_ano,
          COUNT(DISTINCT CASE WHEN v.created_at >= date_trunc('month', now()) THEN v.id END) AS qtd_mes,
          COUNT(DISTINCT CASE WHEN v.created_at >= now() - interval '3 months' THEN v.id END) AS qtd_tri,
          COUNT(DISTINCT CASE WHEN v.created_at >= now() - interval '6 months' THEN v.id END) AS qtd_sem,
          COUNT(DISTINCT CASE WHEN v.created_at >= now() - interval '1 year' THEN v.id END) AS qtd_ano
        FROM venda_itens vi
        JOIN vendas v ON v.id = vi.venda_id
        WHERE v.status != 'estornada' AND vi.marca IS NOT NULL AND vi.marca != ''
        GROUP BY vi.marca
        ORDER BY total_mes DESC, total_ano DESC
        LIMIT 10
      `),

      pool.query(`
        SELECT
          vi.nome_produto,
          vi.marca,
          (vi.preco_unit * vi.quantidade) AS valor,
          v.created_at
        FROM venda_itens vi
        JOIN vendas v ON v.id = vi.venda_id
        WHERE v.status != 'estornada' AND vi.nome_produto IS NOT NULL
        ORDER BY v.created_at DESC
        LIMIT 15
      `),
    ]);

    const t = totaisRes.rows[0];
    const totalMes = parseFloat(t.mes);
    const mesAnterior = parseFloat(t.mes_anterior);
    const variacaoPercent = mesAnterior > 0
      ? (((totalMes - mesAnterior) / mesAnterior) * 100).toFixed(1)
      : null;

    const totalMesGlobal = parseFloat(t.mes) || 1;
    const marcas = marcasRes.rows.map((m) => ({
      marca: m.marca,
      totais: {
        mes: parseFloat(m.total_mes),
        tri: parseFloat(m.total_tri),
        sem: parseFloat(m.total_sem),
        ano: parseFloat(m.total_ano),
      },
      qtds: {
        mes: parseInt(m.qtd_mes),
        tri: parseInt(m.qtd_tri),
        sem: parseInt(m.qtd_sem),
        ano: parseInt(m.qtd_ano),
      },
      percentMes: totalMesGlobal > 0
        ? Math.round((parseFloat(m.total_mes) / totalMesGlobal) * 100)
        : 0,
    }));

    const transacoes = transacoesRes.rows.map((r) => ({
      produto: r.nome_produto,
      marca: r.marca || "—",
      valor: parseFloat(r.valor),
      data: r.created_at,
    }));

    res.json({
      totais: {
        mes: totalMes,
        tri: parseFloat(t.tri),
        sem: parseFloat(t.sem),
        ano: parseFloat(t.ano),
        variacaoPercent,
      },
      marcas,
      transacoes,
    });
  } catch (err) {
    console.error("[financeiro]", err);
    res.status(500).json({ error: "Erro ao buscar dados financeiros" });
  }
});

export default router;
