import { Router } from "express";
import { pool } from "@workspace/db";
import { getUncachableGoogleSheetClient } from "../google-sheets";

const router = Router();

// Salva/recupera o ID da planilha no banco
async function getSpreadsheetId(): Promise<string | null> {
  const r = await pool.query("SELECT value FROM config WHERE key = 'sheets_id'");
  return r.rows[0]?.value ?? null;
}

async function saveSpreadsheetId(id: string) {
  await pool.query(
    `INSERT INTO config (key, value, updated_at) VALUES ('sheets_id', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [id]
  );
}

// GET /api/sheets/status
router.get("/sheets/status", async (_req, res) => {
  try {
    const id = await getSpreadsheetId();
    res.json({ connected: !!id, spreadsheetId: id });
  } catch {
    res.json({ connected: false, spreadsheetId: null });
  }
});

// POST /api/sheets/sync — cria ou atualiza a planilha com todos os dados
router.post("/sheets/sync", async (_req, res) => {
  try {
    const sheets = await getUncachableGoogleSheetClient();

    // Busca dados do banco
    const [clientesRes, vendasRes, fiadosRes] = await Promise.all([
      pool.query(`SELECT id, nome, cpf, telefone, whatsapp, email, endereco, notas, created_at FROM clientes ORDER BY nome`),
      pool.query(`
        SELECT v.id, c.nome AS cliente, v.total, v.forma_pagamento, v.status, v.valor_pago,
               to_char(v.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS data
        FROM vendas v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        ORDER BY v.created_at DESC
      `),
      pool.query(`
        SELECT v.id, c.nome AS cliente, v.total, v.valor_pago,
               (CAST(v.total AS numeric) - CAST(v.valor_pago AS numeric)) AS em_aberto,
               to_char(v.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS data
        FROM vendas v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        WHERE v.status IN ('fiado', 'fiado_atrasado')
        ORDER BY v.created_at ASC
      `),
    ]);

    const clientesData = clientesRes.rows;
    const vendasData = vendasRes.rows;
    const fiadosData = fiadosRes.rows;

    // Monta os dados de cada aba
    const clientesSheet: any[][] = [
      ["ID", "Nome", "CPF", "Telefone", "E-mail", "Endereço", "Observações"],
      ...clientesData.map(c => [
        c.id, c.nome, c.cpf || "", c.whatsapp || c.telefone || "",
        c.email || "", c.endereco || "", c.notas || "",
      ]),
    ];

    const formaMap: Record<string, string> = {
      dinheiro: "Dinheiro", pix: "PIX", cartao_credito: "Cartão Crédito",
      cartao_debito: "Cartão Débito", a_prazo: "A Prazo",
    };
    const statusMap: Record<string, string> = {
      confirmada: "Pago", fiado: "Fiado", fiado_atrasado: "Atrasado", estornada: "Estornado",
    };

    const vendasSheet: any[][] = [
      ["ID", "Cliente", "Data", "Total (R$)", "Forma Pagamento", "Status", "Valor Pago (R$)"],
      ...vendasData.map(v => [
        v.id, v.cliente || "Sem cliente", v.data,
        parseFloat(v.total).toFixed(2).replace(".", ","),
        formaMap[v.forma_pagamento] ?? v.forma_pagamento,
        statusMap[v.status] ?? v.status,
        parseFloat(v.valor_pago || "0").toFixed(2).replace(".", ","),
      ]),
    ];

    const fiadosSheet: any[][] = [
      ["ID Venda", "Cliente", "Data", "Total (R$)", "Valor Pago (R$)", "Em Aberto (R$)"],
      ...fiadosData.map(f => [
        f.id, f.cliente || "Sem cliente", f.data,
        parseFloat(f.total).toFixed(2).replace(".", ","),
        parseFloat(f.valor_pago || "0").toFixed(2).replace(".", ","),
        parseFloat(f.em_aberto || "0").toFixed(2).replace(".", ","),
      ]),
    ];

    const resumo: any[][] = [
      ["📊 Resumo Flor de Liz"],
      [],
      ["Atualizado em", new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })],
      [],
      ["Total de Clientes", clientesData.length],
      ["Total de Vendas", vendasData.length],
      ["Fiados em Aberto", fiadosData.length],
      ["Total em Fiados (R$)", fiadosData.reduce((s, f) => s + parseFloat(f.em_aberto || "0"), 0).toFixed(2).replace(".", ",")],
      ["Receita Total (R$)", vendasData.filter(v => v.status === "confirmada").reduce((s, v) => s + parseFloat(v.total), 0).toFixed(2).replace(".", ",")],
    ];

    let spreadsheetId = await getSpreadsheetId();

    if (!spreadsheetId) {
      // Cria nova planilha
      const created = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: "Flor de Liz — Backup de Dados" },
          sheets: [
            { properties: { title: "Resumo", sheetId: 0 } },
            { properties: { title: "Clientes", sheetId: 1 } },
            { properties: { title: "Vendas", sheetId: 2 } },
            { properties: { title: "Fiados em Aberto", sheetId: 3 } },
          ],
        },
      });
      spreadsheetId = created.data.spreadsheetId!;
      await saveSpreadsheetId(spreadsheetId);
    }

    // Limpa e escreve cada aba
    const abas = [
      { range: "Resumo!A1", values: resumo },
      { range: "Clientes!A1", values: clientesSheet },
      { range: "Vendas!A1", values: vendasSheet },
      { range: "Fiados em Aberto!A1", values: fiadosSheet },
    ];

    // Limpa todas as abas primeiro
    await sheets.spreadsheets.values.batchClear({
      spreadsheetId,
      requestBody: {
        ranges: ["Resumo", "Clientes", "Vendas", "Fiados em Aberto"],
      },
    });

    // Escreve todos os dados
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "RAW",
        data: abas,
      },
    });

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    res.json({ ok: true, spreadsheetId, sheetUrl });
  } catch (err: any) {
    console.error("Erro ao sincronizar Google Sheets:", err.message);
    res.status(500).json({ error: "Erro ao sincronizar: " + (err.message || "desconhecido") });
  }
});

export default router;
