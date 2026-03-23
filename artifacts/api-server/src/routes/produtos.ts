import { Router } from "express";
import { pool } from "@workspace/db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/produtos", authMiddleware, async (req, res) => {
  const { q, limit, offset } = req.query;
  const lojaId = req.auth!.lojaId;
  const lim = Math.min(parseInt(limit as string) || 24, 100);
  const off = parseInt(offset as string) || 0;
  try {
    let baseWhere: string;
    let params: unknown[];
    if (q && typeof q === "string" && q.trim()) {
      baseWhere = "loja_id = $1 AND (nome ILIKE $2 OR marca ILIKE $2)";
      params = [lojaId, `%${q.trim()}%`];
    } else {
      baseWhere = "loja_id = $1";
      params = [lojaId];
    }
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM produtos WHERE ${baseWhere}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);
    const dataResult = await pool.query(
      `SELECT * FROM produtos WHERE ${baseWhere} ORDER BY marca, nome LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, lim, off]
    );
    res.json({ rows: dataResult.rows, total, limit: lim, offset: off });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

router.post("/produtos", authMiddleware, async (req, res) => {
  const { marca, nome, preco, estoque, img_url } = req.body;
  const lojaId = req.auth!.lojaId;
  if (!marca || !nome || preco == null) return res.status(400).json({ error: "Marca, nome e preço são obrigatórios" });
  try {
    const result = await pool.query(
      "INSERT INTO produtos (marca, nome, preco, estoque, img_url, loja_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [marca, nome, preco, estoque ?? 0, img_url || null, lojaId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

router.put("/produtos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const lojaId = req.auth!.lojaId;
  const { marca, nome, preco, estoque, img_url } = req.body;
  if (!marca || !nome || preco == null) return res.status(400).json({ error: "Marca, nome e preço são obrigatórios" });
  try {
    const result = await pool.query(
      "UPDATE produtos SET marca=$1, nome=$2, preco=$3, estoque=$4, img_url=$5 WHERE id=$6 AND loja_id=$7 RETURNING *",
      [marca, nome, preco, estoque ?? 0, img_url || null, id, lojaId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

router.delete("/produtos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const lojaId = req.auth!.lojaId;
  try {
    const result = await pool.query("DELETE FROM produtos WHERE id=$1 AND loja_id=$2 RETURNING id", [id, lojaId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir produto" });
  }
});

export default router;
