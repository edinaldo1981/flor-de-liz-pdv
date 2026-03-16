import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/auth/config", async (_req, res) => {
  try {
    const r = await pool.query("SELECT value FROM config WHERE key = 'auth_config'");
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
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Informe a senha" });
  try {
    const r = await pool.query("SELECT value FROM config WHERE key = 'auth_config'");
    if (r.rows.length === 0) return res.json({ role: "admin", permissions: null });
    const cfg = JSON.parse(r.rows[0].value);
    if (cfg.admin_password && password === cfg.admin_password)
      return res.json({ role: "admin", permissions: null });
    if (cfg.colaborador_password && password === cfg.colaborador_password)
      return res.json({ role: "colaborador", permissions: cfg.colaborador_permissions || {} });
    return res.status(401).json({ error: "Senha incorreta" });
  } catch {
    res.status(500).json({ error: "Erro ao verificar senha" });
  }
});

router.post("/auth/config", async (req, res) => {
  const { admin_password, colaborador_password, colaborador_permissions } = req.body;
  try {
    const r = await pool.query("SELECT value FROM config WHERE key = 'auth_config'");
    const existing = r.rows.length > 0 ? JSON.parse(r.rows[0].value) : {};
    const newCfg = {
      admin_password: admin_password !== undefined ? admin_password : existing.admin_password,
      colaborador_password: colaborador_password !== undefined ? colaborador_password : existing.colaborador_password,
      colaborador_permissions: colaborador_permissions !== undefined ? colaborador_permissions : (existing.colaborador_permissions || {}),
    };
    await pool.query(
      `INSERT INTO config (key, value) VALUES ('auth_config', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(newCfg)]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao salvar config" });
  }
});

router.get("/config/pix", async (_req, res) => {
  try {
    const r = await pool.query("SELECT value FROM config WHERE key = 'pix_key'");
    res.json({ pixKey: r.rows.length > 0 ? r.rows[0].value : "" });
  } catch {
    res.status(500).json({ error: "Erro ao buscar chave PIX" });
  }
});

router.post("/config/pix", async (req, res) => {
  const { pixKey } = req.body;
  if (pixKey === undefined) return res.status(400).json({ error: "Informe pixKey" });
  try {
    await pool.query(
      `INSERT INTO config (key, value) VALUES ('pix_key', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [String(pixKey)]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erro ao salvar chave PIX" });
  }
});

export default router;
