import { Router } from "express";
import { pool } from "@workspace/db";
import { getUncachableGoogleSheetClient } from "../google-sheets";
import { authMiddleware } from "../middleware/auth";

const router = Router();

async function getSpreadsheetId(lojaId: number): Promise<string | null> {
  const r = await pool.query("SELECT value FROM config WHERE key = 'sheets_id' AND loja_id = $1", [lojaId]);
  return r.rows[0]?.value ?? null;
}

async function saveSpreadsheetId(id: string, lojaId: number) {
  await pool.query(
    `INSERT INTO config (key, value, loja_id, updated_at) VALUES ('sheets_id', $1, $2, now())
     ON CONFLICT (key, loja_id) DO UPDATE SET value = $1, updated_at = now()`,
    [id, lojaId]
  );
}

router.get("/sheets/status", authMiddleware, async (req, res) => {
  try {
    const id = await getSpreadsheetId(req.auth!.lojaId);
    res.json({ connected: !!id, spreadsheetId: id });
  } catch {
    res.json({ connected: false, spreadsheetId: null });
  }
});

router.post("/sheets/sync", authMiddleware, async (req, res) => {
  const lojaId = req.auth!.lojaId;
  try {
    const sheets = await getUncachableGoogleSheetClient();
    const lojaRes = await pool.query("SELECT nome FROM lojas WHERE id = $1", [lojaId]);
    const lojaNome = lojaRes.rows[0]?.nome ?? "Loja";

    const [clientesRes, vendasRes, fiadosRes] = await Promise.all([
      pool.query(`SELECT id, nome, cpf, telefone, whatsapp, email, endereco, notas, created_at FROM clientes WHERE loja_id = $1 ORDER BY nome`, [lojaId]),
      pool.query(`
        SELECT v.id, c.nome AS cliente, v.total, v.forma_pagamento, v.status, v.valor_pago,
               to_char(v.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS data
        FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id
        WHERE v.loja_id = $1 ORDER BY v.created_at DESC`, [lojaId]),
      pool.query(`
        SELECT v.id, c.nome AS cliente, v.total, v.valor_pago,
               (CAST(v.total AS numeric) - CAST(v.valor_pago AS numeric)) AS em_aberto,
               to_char(v.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS data
        FROM vendas v LEFT JOIN clientes c ON c.id = v.cliente_id
        WHERE v.loja_id = $1 AND v.status IN ('fiado', 'fiado_atrasado')
        ORDER BY v.created_at ASC`, [lojaId]),
    ]);

    const formaMap: Record<string, string> = {
      dinheiro: "Dinheiro", pix: "PIX", cartao_credito: "Cartão Crédito",
      cartao_debito: "Cartão Débito", a_prazo: "A Prazo",
    };
    const statusMap: Record<string, string> = {
      confirmada: "Pago", fiado: "Fiado", fiado_atrasado: "Atrasado", estornada: "Estornado",
    };

    const clientesSheet: any[][] = [
      ["ID", "Nome", "CPF", "Telefone", "E-mail", "Endereço", "Observações"],
      ...clientesRes.rows.map(c => [c.id, c.nome, c.cpf || "", c.whatsapp || c.telefone || "", c.email || "", c.endereco || "", c.notas || ""]),
    ];
    const vendasSheet: any[][] = [
      ["ID", "Cliente", "Data", "Total (R$)", "Forma Pagamento", "Status", "Valor Pago (R$)"],
      ...vendasRes.rows.map(v => [
        v.id, v.cliente || "Sem cliente", v.data,
        parseFloat(v.total).toFixed(2).replace(".", ","),
        formaMap[v.forma_pagamento] ?? v.forma_pagamento,
        statusMap[v.status] ?? v.status,
        parseFloat(v.valor_pago || "0").toFixed(2).replace(".", ","),
      ]),
    ];
    const fiadosSheet: any[][] = [
      ["ID Venda", "Cliente", "Data", "Total (R$)", "Valor Pago (R$)", "Em Aberto (R$)"],
      ...fiadosRes.rows.map(f => [
        f.id, f.cliente || "Sem cliente", f.data,
        parseFloat(f.total).toFixed(2).replace(".", ","),
        parseFloat(f.valor_pago || "0").toFixed(2).replace(".", ","),
        parseFloat(f.em_aberto || "0").toFixed(2).replace(".", ","),
      ]),
    ];
    const resumo: any[][] = [
      [`📊 Resumo ${lojaNome}`], [],
      ["Atualizado em", new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })], [],
      ["Total de Clientes", clientesRes.rows.length],
      ["Total de Vendas", vendasRes.rows.length],
      ["Fiados em Aberto", fiadosRes.rows.length],
      ["Total em Fiados (R$)", fiadosRes.rows.reduce((s, f) => s + parseFloat(f.em_aberto || "0"), 0).toFixed(2).replace(".", ",")],
      ["Receita Total (R$)", vendasRes.rows.filter(v => v.status === "confirmada").reduce((s, v) => s + parseFloat(v.total), 0).toFixed(2).replace(".", ",")],
    ];

    let spreadsheetId = await getSpreadsheetId(lojaId);
    if (!spreadsheetId) {
      const created = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: `${lojaNome} — Backup de Dados` },
          sheets: [
            { properties: { title: "Resumo", sheetId: 0 } },
            { properties: { title: "Clientes", sheetId: 1 } },
            { properties: { title: "Vendas", sheetId: 2 } },
            { properties: { title: "Fiados em Aberto", sheetId: 3 } },
          ],
        },
      });
      spreadsheetId = created.data.spreadsheetId!;
      await saveSpreadsheetId(spreadsheetId, lojaId);
    }

    await sheets.spreadsheets.values.batchClear({
      spreadsheetId,
      requestBody: { ranges: ["Resumo", "Clientes", "Vendas", "Fiados em Aberto"] },
    });
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: [
          { range: "Resumo!A1", values: resumo },
          { range: "Clientes!A1", values: clientesSheet },
          { range: "Vendas!A1", values: vendasSheet },
          { range: "Fiados em Aberto!A1", values: fiadosSheet },
        ],
      },
    });

    res.json({ ok: true, spreadsheetId, sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` });
  } catch (err: any) {
    console.error("Erro ao sincronizar Google Sheets:", err.message);
    res.status(500).json({ error: "Erro ao sincronizar: " + (err.message || "desconhecido") });
  }
});

export default router;
