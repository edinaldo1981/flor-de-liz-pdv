import { Router } from "express";
import { pool } from "@workspace/db";
import { signSuperAdminToken, signToken, superAdminMiddleware } from "../middleware/auth";

const router = Router();

const SUPER_ADMIN_PASSWORD = process.env["SUPER_ADMIN_PASSWORD"];

router.post("/superadmin/login", async (req, res) => {
  const { password } = req.body;
  if (!password || !SUPER_ADMIN_PASSWORD) return res.status(400).json({ error: "Senha não configurada" });
  if (password !== SUPER_ADMIN_PASSWORD) return res.status(401).json({ error: "Senha incorreta" });
  const token = signSuperAdminToken();
  res.json({ token });
});

router.get("/superadmin/lojas", superAdminMiddleware, async (_req, res) => {
  try {
    const r = await pool.query(`
      SELECT l.*,
        (SELECT COUNT(*) FROM clientes WHERE loja_id = l.id) AS total_clientes,
        (SELECT COUNT(*) FROM vendas WHERE loja_id = l.id) AS total_vendas,
        (SELECT value FROM config WHERE loja_id = l.id AND key = 'auth_config') AS auth_config_raw
      FROM lojas l ORDER BY l.created_at DESC
    `);
    const lojas = r.rows.map(row => ({
      ...row,
      tem_senha: !!row.auth_config_raw,
      auth_config_raw: undefined,
    }));
    res.json({ lojas });
  } catch (err) {
    console.error("[SuperAdmin] Erro ao listar lojas:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/superadmin/lojas", superAdminMiddleware, async (req, res) => {
  const { nome, slug, admin_password, colaborador_password, plano = "basico" } = req.body;
  if (!nome || !slug || !admin_password) {
    return res.status(400).json({ error: "Nome, slug e senha do admin são obrigatórios" });
  }
  const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 50);
  try {
    const existing = await pool.query("SELECT id FROM lojas WHERE slug = $1", [slugClean]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Slug já utilizado" });

    const lojaResult = await pool.query(
      "INSERT INTO lojas (nome, slug, status, plano) VALUES ($1, $2, 'ativo', $3) RETURNING *",
      [nome, slugClean, plano]
    );
    const loja = lojaResult.rows[0];

    const authConfig = JSON.stringify({
      admin_password,
      colaborador_password: colaborador_password || "",
      colaborador_permissions: {
        ver_fiados: true,
        ver_financeiro: false,
        ver_clientes: true,
        editar_excluir_vendas: false,
        registrar_haver: true,
        importar_vendas: false,
        ver_perfil: false,
      },
    });

    await pool.query(
      "INSERT INTO config (key, value, loja_id) VALUES ('auth_config', $1, $2)",
      [authConfig, loja.id]
    );

    res.json({ ok: true, loja });
  } catch (err) {
    console.error("[SuperAdmin] Erro ao criar loja:", err);
    res.status(500).json({ error: "Erro ao criar loja" });
  }
});

router.patch("/superadmin/lojas/:id", superAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, plano, nome, admin_password } = req.body;
  try {
    if (status || plano || nome) {
      const fields: string[] = [];
      const vals: unknown[] = [];
      let idx = 1;
      if (status) { fields.push(`status = $${idx++}`); vals.push(status); }
      if (plano) { fields.push(`plano = $${idx++}`); vals.push(plano); }
      if (nome) { fields.push(`nome = $${idx++}`); vals.push(nome); }
      vals.push(Number(id));
      await pool.query(`UPDATE lojas SET ${fields.join(", ")} WHERE id = $${idx}`, vals);
    }

    if (admin_password) {
      const r = await pool.query("SELECT value FROM config WHERE key='auth_config' AND loja_id=$1", [Number(id)]);
      const existing = r.rows.length > 0 ? JSON.parse(r.rows[0].value) : {};
      existing.admin_password = admin_password;
      await pool.query(
        `INSERT INTO config (key, value, loja_id) VALUES ('auth_config', $1, $2)
         ON CONFLICT (key, loja_id) DO UPDATE SET value = $1`,
        [JSON.stringify(existing), Number(id)]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[SuperAdmin] Erro ao atualizar loja:", err);
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});

router.post("/superadmin/loja-token", superAdminMiddleware, async (req, res) => {
  const { lojaId } = req.body;
  if (!lojaId) return res.status(400).json({ error: "lojaId obrigatório" });
  try {
    const r = await pool.query("SELECT id, nome, slug FROM lojas WHERE id = $1", [lojaId]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Loja não encontrada" });
    const loja = r.rows[0];
    const token = signToken({ lojaId: loja.id, lojaSlug: loja.slug, role: "admin", permissions: null });
    res.json({ token });
  } catch {
    res.status(500).json({ error: "Erro ao gerar token" });
  }
});

export default router;
