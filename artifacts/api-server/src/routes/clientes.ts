import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/clientes", async (req, res) => {
  const { q } = req.query;
  try {
    let query: string;
    let params: string[] = [];
    if (q && typeof q === "string" && q.trim()) {
      query = "SELECT id, nome, telefone, whatsapp, email FROM clientes WHERE nome ILIKE $1 OR telefone ILIKE $1 ORDER BY nome LIMIT 20";
      params = [`%${q.trim()}%`];
    } else {
      query = "SELECT id, nome, telefone, whatsapp, email FROM clientes ORDER BY nome";
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar clientes" });
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

export default router;
