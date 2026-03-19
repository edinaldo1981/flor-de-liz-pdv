import { Router } from "express";
import { pool } from "@workspace/db";
import { authMiddleware, signToken } from "../middleware/auth";

const router = Router();

router.get("/auth/config", async (req, res) => {
  const slug = req.query["slug"] as string | undefined;
  try {
    let lojaId = 1;
    if (slug) {
      const lr = await pool.query("SELECT id FROM lojas WHERE slug = $1 AND status = 'ativo'", [slug]);
      if (lr.rows.length === 0) return res.status(404).json({ error: "Loja não encontrada" });
      lojaId = lr.rows[0].id;
    }
    const r = await pool.query("SELECT value FROM config WHERE key = 'auth_config' AND loja_id = $1", [lojaId]);
    if (r.rows.length === 0) return res.json({ configured: false });
    const cfg = JSON.parse(r.rows[0].value);
    res.json({
      configured: !!(cfg.admin_password || cfg.colaborador_password),
      has_admin: !!cfg.admin_password,
      has_colaborador: !!cfg.colaborador_password,
      colaborador_permissions: cfg.colaborador_permissions || {},
    });
  } catch {
    res.status(500).json({ error: "Erro ao buscar config" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { password, slug } = req.body;
  if (!password) return res.status(400).json({ error: "Informe a senha" });
  try {
    let lojaId = 1;
    let lojaSlug = "flordeliz";
    let lojaNome = "Minha Loja";
    if (slug) {
      const lr = await pool.query("SELECT id, slug, nome FROM lojas WHERE slug = $1 AND status = 'ativo'", [slug]);
      if (lr.rows.length === 0) return res.status(404).json({ error: "Loja não encontrada ou inativa" });
      lojaId = lr.rows[0].id;
      lojaSlug = lr.rows[0].slug;
      lojaNome = lr.rows[0].nome;
    }
    const r = await pool.query("SELECT value FROM config WHERE key = 'auth_config' AND loja_id = $1", [lojaId]);
    if (r.rows.length === 0) {
      const token = signToken({ lojaId, lojaSlug, role: "admin", permissions: null });
      return res.json({ role: "admin", permissions: null, token, lojaNome });
    }
    const cfg = JSON.parse(r.rows[0].value);
    if (cfg.admin_password && password === cfg.admin_password) {
      const token = signToken({ lojaId, lojaSlug, role: "admin", permissions: null });
      return res.json({ role: "admin", permissions: null, token, lojaNome });
    }
    if (cfg.colaborador_password && password === cfg.colaborador_password) {
      const perms = cfg.colaborador_permissions || {};
      const token = signToken({ lojaId, lojaSlug, role: "colaborador", permissions: perms });
      return res.json({ role: "colaborador", permissions: perms, token, lojaNome });
    }
    return res.status(401).json({ error: "Senha incorreta" });
  } catch {
    res.status(500).json({ error: "Erro ao verificar senha" });
  }
});

router.post("/auth/config", authMiddleware, async (req, res) => {
  const { admin_password, colaborador_password, colaborador_permissions } = req.body;
  const lojaId = req.auth!.lojaId;
  try {
    const r = await pool.query("SELECT value FROM config WHERE key = 'auth_config' AND loja_id = $1", [lojaId]);
    const existing = r.rows.length > 0 ? JSON.parse(r.rows[0].value) : {};
    const newCfg = {
      admin_password: admin_password !== undefined ? admin_password : existing.admin_password,
      colaborador_password: colaborador_password !== undefined ? colaborador_password : existing.colaborador_password,
      colaborador_permissions: colaborador_permissions !== undefined ? colaborador_permissions : (existing.colaborador_permissions || {}),
    };
    await pool.query(
      `INSERT INTO config (key, value, loja_id) VALUES ('auth_config', $1, $2)
       ON CONFLICT (key, loja_id) DO UPDATE SET value = $1`,
      [JSON.stringify(newCfg), lojaId]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao salvar config" });
  }
});

router.get("/config/pix", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  try {
    const r = await pool.query("SELECT value FROM config WHERE key = 'pix_key' AND loja_id = $1", [lojaId]);
    res.json({ pixKey: r.rows.length > 0 ? r.rows[0].value : "" });
  } catch {
    res.status(500).json({ error: "Erro ao buscar chave PIX" });
  }
});

router.post("/config/pix", authMiddleware, async (req, res) => {
  const { pixKey } = req.body;
  const lojaId = req.auth!.lojaId;
  if (pixKey === undefined) return res.status(400).json({ error: "Informe pixKey" });
  try {
    await pool.query(
      `INSERT INTO config (key, value, loja_id) VALUES ('pix_key', $1, $2)
       ON CONFLICT (key, loja_id) DO UPDATE SET value = $1`,
      [String(pixKey), lojaId]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao salvar chave PIX" });
  }
});

router.get("/config/logo", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  try {
    const r = await pool.query("SELECT value FROM config WHERE key = 'logo' AND loja_id = $1", [lojaId]);
    res.json({ logo: r.rows.length > 0 ? r.rows[0].value : null });
  } catch {
    res.status(500).json({ error: "Erro ao buscar logo" });
  }
});

router.post("/config/logo", authMiddleware, async (req, res) => {
  const { logo } = req.body;
  const lojaId = req.auth!.lojaId;
  if (!logo) return res.status(400).json({ error: "Informe logo" });
  try {
    await pool.query(
      `INSERT INTO config (key, value, loja_id) VALUES ('logo', $1, $2)
       ON CONFLICT (key, loja_id) DO UPDATE SET value = $1`,
      [String(logo), lojaId]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao salvar logo" });
  }
});

router.delete("/config/logo", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  try {
    await pool.query("DELETE FROM config WHERE key = 'logo' AND loja_id = $1", [lojaId]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao remover logo" });
  }
});

export default router;
