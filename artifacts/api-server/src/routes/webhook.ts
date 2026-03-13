import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.post("/webhook/asaas", async (req, res) => {
  try {
    const { event, payment } = req.body;

    if (!payment || !payment.externalReference) {
      return res.status(200).json({ ok: true });
    }

    const vendaId = parseInt(payment.externalReference, 10);
    if (isNaN(vendaId)) return res.status(200).json({ ok: true });

    const asaasStatus: string = payment.status ?? "";
    const valorPago: number = payment.value ?? 0;

    let novoStatus: string | null = null;

    if (["RECEIVED", "CONFIRMED"].includes(asaasStatus)) {
      novoStatus = "confirmada";
    } else if (asaasStatus === "OVERDUE") {
      novoStatus = "fiado_atrasado";
    } else if (asaasStatus === "REFUNDED") {
      novoStatus = "estornada";
    }

    const updates: string[] = ["asaas_status = $2"];
    const params: unknown[] = [vendaId, asaasStatus];

    if (asaasStatus === "RECEIVED" || asaasStatus === "CONFIRMED") {
      updates.push(`valor_pago = $${params.length + 1}`);
      params.push(valorPago);
    }

    if (novoStatus) {
      updates.push(`status = $${params.length + 1}`);
      params.push(novoStatus);
    }

    await pool.query(
      `UPDATE vendas SET ${updates.join(", ")} WHERE id = $1`,
      params
    );

    console.log(`[Asaas webhook] evento=${event} venda=${vendaId} status=${asaasStatus}`);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[Asaas webhook] erro:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
