import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/portal/cliente", async (req, res) => {
  const { cpf, telefone, loja } = req.query;

  if (!cpf && !telefone) return res.status(400).json({ error: "Informe CPF ou telefone" });

  try {
    let lojaId = 1;
    if (loja) {
      const lojaRes = await pool.query("SELECT id FROM lojas WHERE slug = $1 AND status = 'ativo'", [loja]);
      if (lojaRes.rows.length === 0) return res.status(404).json({ error: "Loja não encontrada" });
      lojaId = lojaRes.rows[0].id;
    }

    let clienteResult;
    if (cpf) {
      clienteResult = await pool.query(
        "SELECT id, nome, cpf, telefone, whatsapp, email FROM clientes WHERE loja_id = $1 AND cpf = $2 LIMIT 1",
        [lojaId, String(cpf).replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")]
      );
      if (clienteResult.rows.length === 0) {
        clienteResult = await pool.query(
          "SELECT id, nome, cpf, telefone, whatsapp, email FROM clientes WHERE loja_id = $1 AND REPLACE(REPLACE(REPLACE(cpf,'.',''),'-',''),' ','') = $2 LIMIT 1",
          [lojaId, String(cpf).replace(/\D/g, "")]
        );
      }
    } else {
      const tel = String(telefone).replace(/\D/g, "");
      clienteResult = await pool.query(
        `SELECT id, nome, cpf, telefone, whatsapp, email FROM clientes
         WHERE loja_id = $1 AND (
           REPLACE(REPLACE(REPLACE(COALESCE(whatsapp, telefone),'(',''),')',''),' ','') ILIKE $2
           OR REPLACE(REPLACE(REPLACE(telefone,'(',''),')',''),' ','') ILIKE $2
         ) LIMIT 1`,
        [lojaId, `%${tel}%`]
      );
    }

    if (clienteResult.rows.length === 0) return res.status(404).json({ error: "Cliente não encontrado" });

    const cliente = clienteResult.rows[0];

    const vendasResult = await pool.query(
      `SELECT v.id, v.total, v.valor_pago, v.status, v.forma_pagamento,
              v.asaas_invoice_url, v.asaas_status, v.created_at,
              COALESCE(json_agg(
                json_build_object('nome', vi.nome_produto,'marca', vi.marca,'preco', vi.preco_unit,'qty', vi.quantidade)
                ORDER BY vi.id) FILTER (WHERE vi.id IS NOT NULL), '[]') as itens
       FROM vendas v LEFT JOIN venda_itens vi ON vi.venda_id = v.id
       WHERE v.cliente_id = $1 AND v.loja_id = $2
       GROUP BY v.id ORDER BY v.created_at DESC`,
      [cliente.id, lojaId]
    );

    const abertas = vendasResult.rows.filter(v => v.status === "fiado" || v.status === "fiado_atrasado");
    const historico = vendasResult.rows.filter(v => v.status === "confirmada" || v.status === "estornada");

    const haveresResult = await pool.query(
      "SELECT COALESCE(SUM(saldo_restante), 0) as total FROM haveres WHERE cliente_id = $1 AND loja_id = $2 AND saldo_restante > 0",
      [cliente.id, lojaId]
    );
    const haveresListResult = await pool.query(
      "SELECT id, valor, saldo_restante, descricao, created_at FROM haveres WHERE cliente_id = $1 AND loja_id = $2 ORDER BY created_at DESC",
      [cliente.id, lojaId]
    );
    const pixResult = await pool.query("SELECT value FROM config WHERE key = 'pix_key' AND loja_id = $1", [lojaId]);

    res.json({
      cliente: { nome: cliente.nome, cpf: cliente.cpf, telefone: cliente.telefone || cliente.whatsapp, email: cliente.email },
      fiados: abertas,
      historico: historico.slice(0, 10),
      totalEmAberto: abertas.reduce((acc, v) => acc + Math.max(0, parseFloat(v.total) - parseFloat(v.valor_pago || 0)), 0),
      saldoHaver: parseFloat(haveresResult.rows[0].total),
      haveres: haveresListResult.rows,
      pixKey: pixResult.rows.length > 0 ? pixResult.rows[0].value : null,
    });
  } catch (err) {
    console.error("[Portal] Erro:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
