import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Printer, Phone, Mail, MapPin, FileText, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Edit, Trash2, Pencil } from "lucide-react";

interface Props {
  onNavigate: (page: string) => void;
}

interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  cpf?: string;
  endereco?: string;
  notas?: string;
}

interface VendaItem {
  nome_produto: string;
  marca: string;
  quantidade: number;
  preco_unit: number;
}

interface Venda {
  id: number;
  total: string;
  forma_pagamento: string;
  status: string;
  created_at: string;
  asaas_invoice_url?: string;
  valor_pago?: string;
  itens: VendaItem[];
}

interface Stats {
  totalVendas: number;
  totalGasto: number;
  totalEmAberto: number;
}

interface Haver {
  id: number;
  valor: string;
  saldo_restante: string;
  descricao: string;
  created_at: string;
}

const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDateShort = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const statusLabel: Record<string, { label: string; cls: string }> = {
  confirmada: { label: "Pago", cls: "bg-emerald-100 text-emerald-700" },
  fiado: { label: "Fiado", cls: "bg-amber-100 text-amber-700" },
  fiado_atrasado: { label: "Atrasado", cls: "bg-red-100 text-red-600" },
  estornada: { label: "Estornado", cls: "bg-slate-100 text-slate-500" },
};

const pagLabel: Record<string, string> = {
  dinheiro: "Dinheiro", pix: "PIX", cartao: "Cartão", a_prazo: "A Prazo",
};

export default function ClienteDetalhePage({ onNavigate }: Props) {
  const [data, setData] = useState<{ cliente: Cliente; vendas: Venda[]; stats: Stats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedVenda, setExpandedVenda] = useState<number | null>(null);
  const [haveres, setHaveres] = useState<Haver[]>([]);
  const [saldoHaver, setSaldoHaver] = useState<number>(0);
  const [clienteId, setClienteId] = useState<string | null>(null);

  const [editHaver, setEditHaver] = useState<Haver | null>(null);
  const [editForm, setEditForm] = useState({ descricao: "", saldo_restante: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editErro, setEditErro] = useState("");

  const [deletingHaver, setDeletingHaver] = useState<Haver | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchHaveres = async (id: string) => {
    const r = await apiFetch(`/clientes/${id}/haveres`);
    if (!r.ok) return;
    const d = await r.json();
    setHaveres(d.haveres || []);
    setSaldoHaver(parseFloat(d.total) || 0);
  };

  useEffect(() => {
    const id = localStorage.getItem("cliente_detalhe_id");
    if (!id) { onNavigate("clientes"); return; }
    setClienteId(id);

    Promise.all([
      apiFetch(`/clientes/${id}/historico`).then(r => r.json()),
      apiFetch(`/clientes/${id}/haveres`).then(r => r.ok ? r.json() : { total: 0, haveres: [] }).catch(() => ({ total: 0, haveres: [] })),
    ])
      .then(([historico, haverData]) => {
        setData(historico);
        setHaveres(haverData.haveres || []);
        setSaldoHaver(parseFloat(haverData.total) || 0);
      })
      .catch(() => onNavigate("clientes"))
      .finally(() => setLoading(false));
  }, []);

  const abrirJanelaImpressao = (html: string, titulo: string) => {
    const win = window.open("", "_blank", "width=420,height=700");
    if (!win) { alert("Permita pop-ups neste site para imprimir."); return; }
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    body { font-family: monospace; font-size: 12px; padding: 16px; margin: 0; background: #fff; }
    p { margin: 2px 0; }
    .right { text-align: right; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .small { font-size: 10px; }
    .sep { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    @media print { body { padding: 4px; } }
  </style>
</head>
<body>
  ${html}
  <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
</body>
</html>`);
    win.document.close();
  };

  const printRecibo = (venda: Venda) => {
    const lojaNome = localStorage.getItem("auth_loja_nome") || "LOJA";
    const itensHtml = (venda.itens || []).filter(i => i.nome_produto).map(item =>
      `<div>
        <p>${item.quantidade}x ${item.nome_produto}</p>
        <p class="right">${item.marca} — ${fmtBRL(item.quantidade * parseFloat(String(item.preco_unit)))}</p>
      </div>`
    ).join("");

    const html = `
      <p class="center bold" style="font-size:14px">${lojaNome.toUpperCase()}</p>
      <p class="center">Nota de Venda #${venda.id}</p>
      <p class="center">${fmtDate(venda.created_at)}</p>
      <hr class="sep"/>
      <p><span class="bold">Cliente:</span> ${cliente.nome}</p>
      ${cliente.cpf ? `<p><span class="bold">CPF:</span> ${cliente.cpf}</p>` : ""}
      <hr class="sep"/>
      ${itensHtml}
      <hr class="sep"/>
      <p class="right bold" style="font-size:14px">TOTAL: ${fmtBRL(parseFloat(venda.total))}</p>
      <p class="right">${pagLabel[venda.forma_pagamento] ?? venda.forma_pagamento} — ${statusLabel[venda.status]?.label ?? venda.status}</p>
      <p class="center small" style="margin-top:12px">Obrigada pela preferência! ♥</p>
    `;
    abrirJanelaImpressao(html, `Recibo #${venda.id}`);
  };

  const printHistorico = () => {
    const lojaNome = localStorage.getItem("auth_loja_nome") || "LOJA";
    const vendasHtml = vendas.map(v =>
      `<div style="margin-bottom:8px">
        <p><span class="bold">#${v.id}</span> ${fmtDate(v.created_at)}</p>
        ${(v.itens || []).filter(i => i.nome_produto).map(item =>
          `<p style="padding-left:8px">${item.quantidade}x ${item.nome_produto} ${fmtBRL(item.quantidade * parseFloat(String(item.preco_unit)))}</p>`
        ).join("")}
        <p class="right">${fmtBRL(parseFloat(v.total))} — ${statusLabel[v.status]?.label ?? v.status}</p>
        <hr class="sep"/>
      </div>`
    ).join("");

    const html = `
      <p class="center bold" style="font-size:14px">${lojaNome.toUpperCase()}</p>
      <p class="center bold">Histórico — ${cliente.nome}</p>
      ${cliente.cpf ? `<p class="center">CPF: ${cliente.cpf}</p>` : ""}
      ${(cliente.whatsapp || cliente.telefone) ? `<p class="center">Tel: ${cliente.whatsapp || cliente.telefone}</p>` : ""}
      <p class="center">${new Date().toLocaleDateString("pt-BR")}</p>
      <hr class="sep"/>
      <p>Total de compras: ${stats.totalVendas}</p>
      <p>Total pago: ${fmtBRL(stats.totalGasto)}</p>
      ${stats.totalEmAberto > 0 ? `<p class="bold">Em aberto: ${fmtBRL(stats.totalEmAberto)}</p>` : ""}
      ${saldoHaver > 0 ? `<p>Haver disponível: ${fmtBRL(saldoHaver)}</p>` : ""}
      <hr class="sep"/>
      ${vendasHtml}
      <p class="center small" style="margin-top:8px">Obrigada pela preferência! ♥</p>
    `;
    abrirJanelaImpressao(html, `Histórico — ${cliente.nome}`);
  };

  const openEdit = (haver: Haver) => {
    setEditHaver(haver);
    setEditForm({ descricao: haver.descricao, saldo_restante: parseFloat(haver.saldo_restante).toFixed(2) });
    setEditErro("");
  };

  const handleSalvarEdit = async () => {
    if (!editHaver || !clienteId) return;
    const saldo = parseFloat(editForm.saldo_restante.replace(",", "."));
    if (isNaN(saldo) || saldo < 0) { setEditErro("Valor inválido"); return; }
    setEditLoading(true); setEditErro("");
    try {
      const r = await apiFetch(`/clientes/${clienteId}/haveres/${editHaver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao: editForm.descricao, saldo_restante: saldo }),
      });
      if (!r.ok) { const d = await r.json(); setEditErro(d.error || "Erro ao salvar"); return; }
      setEditHaver(null);
      fetchHaveres(clienteId);
    } catch { setEditErro("Erro de conexão"); }
    finally { setEditLoading(false); }
  };

  const handleExcluir = async () => {
    if (!deletingHaver || !clienteId) return;
    setDeleteLoading(true);
    try {
      const r = await apiFetch(`/clientes/${clienteId}/haveres/${deletingHaver.id}`, { method: "DELETE" });
      if (!r.ok) return;
      setDeletingHaver(null);
      fetchHaveres(clienteId);
    } catch {}
    finally { setDeleteLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f7]">
        <span className="material-symbols-outlined animate-spin text-[#4d8063] text-3xl">refresh</span>
      </div>
    );
  }

  if (!data) return null;
  const { cliente, vendas, stats } = data;
  const initials = cliente.nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  return (
    <>
      <div className="bg-[#f6f7f7] min-h-screen flex flex-col max-w-md mx-auto lg:max-w-2xl">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#4d8063]/10 no-print">
          <div className="flex items-center gap-3 px-4 py-4">
            <button onClick={() => onNavigate("clientes")} className="p-1 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1 truncate">{cliente.nome}</h1>
            <button onClick={printHistorico} className="p-2 rounded-xl bg-slate-100 text-slate-500" title="Imprimir histórico">
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => { localStorage.setItem("cadastro_editar", JSON.stringify(cliente)); onNavigate("cadastro"); }}
              className="p-2 rounded-xl bg-[#4d8063]/10 text-[#4d8063]"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 pb-24 space-y-4">
          {/* Avatar + dados pessoais */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#4d8063]/10 flex items-center justify-center shrink-0">
                <span className="text-[#4d8063] font-bold text-xl">{initials}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{cliente.nome}</h2>
                {cliente.cpf && <p className="text-xs text-slate-400 mt-0.5">CPF: {cliente.cpf}</p>}
              </div>
            </div>
            <div className="space-y-2.5">
              {(cliente.whatsapp || cliente.telefone) && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-[#4d8063] shrink-0" />
                  <span>{cliente.whatsapp || cliente.telefone}</span>
                </div>
              )}
              {cliente.email && (
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-[#4d8063] shrink-0" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}
              {cliente.endereco && (
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-[#4d8063] shrink-0 mt-0.5" />
                  <span>{cliente.endereco}</span>
                </div>
              )}
              {cliente.notas && (
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <FileText className="w-4 h-4 text-[#4d8063] shrink-0 mt-0.5" />
                  <span className="italic text-slate-500">{cliente.notas}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className={`grid gap-3 ${saldoHaver > 0 ? "grid-cols-2" : "grid-cols-3"}`}>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 text-center">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Compras</p>
              <p className="text-xl font-bold text-slate-700 mt-1">{stats.totalVendas}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 text-center">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Total Pago</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{fmtBRL(stats.totalGasto)}</p>
            </div>
            <div className={`rounded-xl shadow-sm border p-3 text-center ${stats.totalEmAberto > 0 ? "bg-red-50 border-red-100" : "bg-white border-slate-100"}`}>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Em Aberto</p>
              <p className={`text-lg font-bold mt-1 ${stats.totalEmAberto > 0 ? "text-red-600" : "text-slate-400"}`}>
                {fmtBRL(stats.totalEmAberto)}
              </p>
            </div>
            {saldoHaver > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl shadow-sm p-3 text-center">
                <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wide">Haver</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{fmtBRL(saldoHaver)}</p>
              </div>
            )}
          </div>

          {/* Seção de Haveres */}
          {haveres.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-blue-500 text-lg">account_balance_wallet</span>
                <h3 className="text-sm font-bold text-slate-700">Haveres</h3>
                <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                  {fmtBRL(saldoHaver)} disponível
                </span>
              </div>
              <div className="space-y-2">
                {haveres.map(h => {
                  const valor = parseFloat(h.valor);
                  const saldo = parseFloat(h.saldo_restante);
                  const usado = valor - saldo;
                  return (
                    <div key={h.id} className="bg-white rounded-xl border border-blue-100 px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{h.descricao}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{fmtDateShort(h.created_at)}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-blue-600 font-bold">{fmtBRL(saldo)} disponível</span>
                          {usado > 0 && (
                            <span className="text-xs text-slate-400">de {fmtBRL(valor)} · {fmtBRL(usado)} usado</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(h)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          title="Editar haver"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingHaver(h)}
                          className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                          title="Excluir haver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Histórico de compras */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#4d8063]" />
              <h3 className="text-sm font-bold text-slate-700">Histórico de Compras</h3>
            </div>

            {vendas.length === 0 && (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 py-8 flex flex-col items-center gap-2 text-slate-400">
                <AlertCircle className="w-8 h-8 opacity-40" />
                <p className="text-sm">Nenhuma compra registrada</p>
              </div>
            )}

            <div className="space-y-3">
              {vendas.map(v => {
                const expanded = expandedVenda === v.id;
                const st = statusLabel[v.status] ?? { label: v.status, cls: "bg-slate-100 text-slate-500" };
                const restante = parseFloat(v.total) - parseFloat(v.valor_pago || "0");

                return (
                  <div key={v.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => setExpandedVenda(expanded ? null : v.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {pagLabel[v.forma_pagamento] ?? v.forma_pagamento}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">{fmtDate(v.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-800">{fmtBRL(parseFloat(v.total))}</p>
                        {(v.status === "fiado" || v.status === "fiado_atrasado") && restante > 0 && (
                          <p className="text-[10px] text-red-500 font-medium">Falta {fmtBRL(restante)}</p>
                        )}
                      </div>
                      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    {expanded && (
                      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                        <div className="space-y-2 mb-3">
                          {v.itens?.filter(i => i.nome_produto).map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-2 text-sm">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-700 truncate">{item.nome_produto}</p>
                                <p className="text-[10px] text-slate-400">{item.marca}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs text-slate-500">{item.quantidade}× {fmtBRL(parseFloat(String(item.preco_unit)))}</p>
                                <p className="text-xs font-semibold text-slate-700">{fmtBRL(item.quantidade * parseFloat(String(item.preco_unit)))}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                          <button
                            onClick={() => printRecibo(v)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#4d8063] bg-[#4d8063]/10 px-3 py-2 rounded-lg"
                          >
                            <Printer className="w-3.5 h-3.5" /> Imprimir Nota
                          </button>
                          {v.asaas_invoice_url && (
                            <a
                              href={v.asaas_invoice_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg"
                            >
                              <span className="material-symbols-outlined text-sm">open_in_new</span> Link de Pagamento
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Editar Haver */}
      {editHaver && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-slate-800">Editar Haver</h2>
              <button onClick={() => setEditHaver(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Descrição</label>
                <input
                  type="text"
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  value={editForm.descricao}
                  onChange={e => setEditForm(f => ({ ...f, descricao: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 block mb-1">Saldo disponível (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  value={editForm.saldo_restante}
                  onChange={e => setEditForm(f => ({ ...f, saldo_restante: e.target.value }))}
                />
                <p className="text-xs text-slate-400 mt-1">Valor original: {fmtBRL(parseFloat(editHaver.valor))}</p>
              </div>

              {editErro && <p className="text-red-500 text-sm">{editErro}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => setEditHaver(null)}
                  className="flex-1 h-11 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarEdit}
                  disabled={editLoading}
                  className="flex-1 h-11 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-blue-700"
                >
                  {editLoading
                    ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                    : <><span className="material-symbols-outlined text-lg">save</span>Salvar</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deletingHaver && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="font-bold text-base text-slate-800">Excluir Haver?</h2>
              <p className="text-sm text-slate-500">
                Tem certeza que quer excluir o haver <strong>"{deletingHaver.descricao}"</strong> de{" "}
                <strong>{fmtBRL(parseFloat(deletingHaver.saldo_restante))}</strong>?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingHaver(null)}
                className="flex-1 h-11 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                disabled={deleteLoading}
                className="flex-1 h-11 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-red-600"
              >
                {deleteLoading
                  ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                  : <><Trash2 className="w-4 h-4" />Excluir</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
