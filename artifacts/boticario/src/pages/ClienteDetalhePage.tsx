import { useState, useEffect } from "react";
import { ArrowLeft, Printer, Phone, Mail, MapPin, FileText, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Edit } from "lucide-react";

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

const API_BASE = "/api";

const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

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
  const [printingVenda, setPrintingVenda] = useState<Venda | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("cliente_detalhe_id");
    if (!id) { onNavigate("clientes"); return; }
    fetch(`${API_BASE}/clientes/${id}/historico`)
      .then(r => r.json())
      .then(setData)
      .catch(() => onNavigate("clientes"))
      .finally(() => setLoading(false));
  }, []);

  const printRecibo = (venda: Venda) => {
    setPrintingVenda(venda);
    setTimeout(() => { window.print(); setPrintingVenda(null); }, 300);
  };

  const printHistorico = () => {
    setPrintingVenda(null);
    setTimeout(() => window.print(), 100);
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
      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: fixed !important; top: 0; left: 0; width: 80mm; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-[#f6f7f7] min-h-screen flex flex-col max-w-md mx-auto lg:max-w-2xl no-print">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#4d8063]/10 no-print">
          <div className="flex items-center gap-3 px-4 py-4">
            <button onClick={() => onNavigate("clientes")} className="p-1 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold flex-1 truncate">{cliente.nome}</h1>
            <button
              onClick={printHistorico}
              className="p-2 rounded-xl bg-slate-100 text-slate-500"
              title="Imprimir histórico completo"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                localStorage.setItem("cadastro_editar", JSON.stringify(cliente));
                onNavigate("cadastro");
              }}
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
          <div className="grid grid-cols-3 gap-3">
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
          </div>

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
                    {/* Cabeçalho da venda */}
                    <button
                      onClick={() => setExpandedVenda(expanded ? null : v.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {pagLabel[v.forma_pagamento] ?? v.forma_pagamento}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{fmtDate(v.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-800">{fmtBRL(parseFloat(v.total))}</p>
                        {(v.status === "fiado" || v.status === "fiado_atrasado") && restante > 0 && (
                          <p className="text-[10px] text-red-500 font-medium">Falta {fmtBRL(restante)}</p>
                        )}
                      </div>
                      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>

                    {/* Itens expandidos */}
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
                              href={v.asaas_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
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

      {/* ── Área de Impressão ── */}
      <div className="print-area" style={{ display: "none" }}>
        {printingVenda ? (
          /* Imprimir nota individual */
          <div style={{ fontFamily: "monospace", fontSize: 12, padding: 8, width: "80mm" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <p style={{ fontWeight: "bold", fontSize: 14 }}>FLOR DE LIZ</p>
              <p>Nota de Venda #{printingVenda.id}</p>
              <p>{fmtDate(printingVenda.created_at)}</p>
              <p>{"─".repeat(32)}</p>
            </div>
            <p><b>Cliente:</b> {cliente.nome}</p>
            {cliente.cpf && <p><b>CPF:</b> {cliente.cpf}</p>}
            <p>{"─".repeat(32)}</p>
            {printingVenda.itens?.filter(i => i.nome_produto).map((item, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                <p>{item.quantidade}x {item.nome_produto}</p>
                <p style={{ textAlign: "right" }}>{item.marca} — {fmtBRL(item.quantidade * parseFloat(String(item.preco_unit)))}</p>
              </div>
            ))}
            <p>{"─".repeat(32)}</p>
            <p style={{ textAlign: "right", fontWeight: "bold", fontSize: 14 }}>
              TOTAL: {fmtBRL(parseFloat(printingVenda.total))}
            </p>
            <p style={{ textAlign: "right" }}>
              {pagLabel[printingVenda.forma_pagamento] ?? printingVenda.forma_pagamento} — {statusLabel[printingVenda.status]?.label ?? printingVenda.status}
            </p>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 10 }}>Obrigada pela preferência! ♥</p>
          </div>
        ) : (
          /* Imprimir histórico completo */
          <div style={{ fontFamily: "monospace", fontSize: 11, padding: 8, width: "80mm" }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <p style={{ fontWeight: "bold", fontSize: 14 }}>FLOR DE LIZ</p>
              <p style={{ fontWeight: "bold" }}>Histórico — {cliente.nome}</p>
              {cliente.cpf && <p>CPF: {cliente.cpf}</p>}
              {(cliente.whatsapp || cliente.telefone) && <p>Tel: {cliente.whatsapp || cliente.telefone}</p>}
              <p>{new Date().toLocaleDateString("pt-BR")}</p>
              <p>{"─".repeat(32)}</p>
            </div>
            <div style={{ marginBottom: 8 }}>
              <p>Total de compras: {stats.totalVendas}</p>
              <p>Total pago: {fmtBRL(stats.totalGasto)}</p>
              {stats.totalEmAberto > 0 && <p><b>Em aberto: {fmtBRL(stats.totalEmAberto)}</b></p>}
            </div>
            <p>{"─".repeat(32)}</p>
            {vendas.map(v => (
              <div key={v.id} style={{ marginBottom: 6 }}>
                <p><b>#{v.id}</b> {fmtDate(v.created_at)}</p>
                {v.itens?.filter(i => i.nome_produto).map((item, idx) => (
                  <p key={idx} style={{ paddingLeft: 8 }}>
                    {item.quantidade}x {item.nome_produto} {fmtBRL(item.quantidade * parseFloat(String(item.preco_unit)))}
                  </p>
                ))}
                <p style={{ textAlign: "right" }}>
                  {fmtBRL(parseFloat(v.total))} — {statusLabel[v.status]?.label ?? v.status}
                </p>
                <p>{"- ".repeat(16)}</p>
              </div>
            ))}
            <p style={{ textAlign: "center", marginTop: 8, fontSize: 10 }}>Obrigada pela preferência! ♥</p>
          </div>
        )}
      </div>
    </>
  );
}
