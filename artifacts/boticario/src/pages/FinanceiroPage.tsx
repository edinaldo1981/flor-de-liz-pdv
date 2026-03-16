import { ArrowLeft, TrendingUp, TrendingDown, Package, Pencil, Trash2, X, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface FinanceiroPageProps {
  onNavigate: (page: string) => void;
  canEdit?: boolean;
}

interface MarcaData {
  marca: string;
  totais: { mes: number; tri: number; sem: number; ano: number };
  qtds: { mes: number; tri: number; sem: number; ano: number };
  percentMes: number;
}

interface Transacao {
  produto: string;
  marca: string;
  valor: number;
  data: string;
}

interface FinanceiroData {
  totais: {
    mes: number;
    tri: number;
    sem: number;
    ano: number;
    variacaoPercent: string | null;
  };
  marcas: MarcaData[];
  transacoes: Transacao[];
}

interface VendaConfirmada {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  total: string;
  forma_pagamento: string;
  status: string;
  created_at: string;
}

const API_BASE = "/api";

type Periodo = "mes" | "tri" | "sem" | "ano";
type Aba = "resumo" | "vendas";

const periodos: { key: Periodo; label: string }[] = [
  { key: "mes", label: "Este mês" },
  { key: "tri", label: "3 meses" },
  { key: "sem", label: "6 meses" },
  { key: "ano", label: "1 ano" },
];

const BRAND_COLORS = [
  "bg-[#4d8063]", "bg-emerald-500", "bg-teal-500", "bg-cyan-500",
  "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500",
  "bg-pink-500", "bg-rose-500",
];

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtData = (d: string) => {
  const dt = new Date(d);
  const agora = new Date();
  const diff = agora.getTime() - dt.getTime();
  const horas = Math.floor(diff / 3600000);
  if (horas < 24) return `Hoje ${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (horas < 48) return `Ontem ${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
    " " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const formaIcon: Record<string, string> = {
  dinheiro: "payments",
  cartao: "credit_card",
  pix: "pix",
  a_prazo: "receipt_long",
};
const formaLabel: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  pix: "PIX",
  a_prazo: "Fiado",
};

export default function FinanceiroPage({ onNavigate, canEdit = true }: FinanceiroPageProps) {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [aba, setAba] = useState<Aba>("resumo");
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [vendas, setVendas] = useState<VendaConfirmada[]>([]);
  const [loadingVendas, setLoadingVendas] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editTotal, setEditTotal] = useState("");
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [erroOp, setErroOp] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/financeiro`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setErro("Erro ao carregar dados financeiros."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (aba === "vendas" && vendas.length === 0) {
      fetchVendas();
    }
  }, [aba]);

  const fetchVendas = () => {
    setLoadingVendas(true);
    fetch(`${API_BASE}/vendas`)
      .then(r => r.json())
      .then((all: VendaConfirmada[]) => {
        setVendas(all.filter(v => v.status === "confirmada"));
      })
      .catch(() => {})
      .finally(() => setLoadingVendas(false));
  };

  const handleEditar = async (v: VendaConfirmada) => {
    const novoTotal = parseFloat(editTotal.replace(",", "."));
    if (isNaN(novoTotal) || novoTotal <= 0) { setErroOp("Valor inválido."); return; }
    setSalvandoEdit(true);
    setErroOp("");
    try {
      const r = await fetch(`${API_BASE}/vendas/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: novoTotal }),
      });
      if (!r.ok) throw new Error();
      const atualizada = await r.json();
      setVendas(prev => prev.map(x => x.id === v.id ? { ...x, ...atualizada } : x));
      setEditandoId(null);
      setEditTotal("");
    } catch {
      setErroOp("Erro ao editar.");
    } finally {
      setSalvandoEdit(false);
    }
  };

  const handleExcluir = async (id: number) => {
    setExcluindoId(id);
    try {
      const r = await fetch(`${API_BASE}/vendas/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      setVendas(prev => prev.filter(x => x.id !== id));
      setConfirmDel(null);
    } catch {
      setErroOp("Erro ao excluir.");
    } finally {
      setExcluindoId(null);
    }
  };

  const totalPeriodo = data ? data.totais[periodo] : 0;
  const variacao = data?.totais.variacaoPercent;
  const positivo = variacao !== null && variacao !== undefined && parseFloat(variacao) >= 0;

  return (
    <div className="bg-[#f6f7f7] min-h-screen flex flex-col pb-24 lg:pb-8">
      <header className="flex items-center bg-white p-4 border-b border-[#4d8063]/10 sticky top-0 z-10">
        <button onClick={() => onNavigate("home")} className="text-[#4d8063] flex size-10 items-center justify-center rounded-lg bg-[#4d8063]/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Financeiro</h2>
        <div className="size-10" />
      </header>

      {/* Abas */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        {(["resumo", "vendas"] as Aba[]).map(a => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${aba === a ? "bg-[#4d8063] text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            {a === "resumo" ? "Resumo" : "Vendas à Vista"}
          </button>
        ))}
      </div>

      {loading && aba === "resumo" && (
        <div className="flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-[#4d8063] text-4xl">refresh</span>
        </div>
      )}

      {erro && (
        <div className="m-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">{erro}</div>
      )}

      {/* ABA RESUMO */}
      {aba === "resumo" && !loading && data && (
        <main className="flex-1">
          <section className="p-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#4d8063] text-white shadow-lg">
              <div className="flex justify-between items-start">
                <p className="text-white/80 text-sm font-medium">
                  {periodos.find(p => p.key === periodo)?.label === "Este mês" ? "Total Este Mês" : `Total — ${periodos.find(p => p.key === periodo)?.label}`}
                </p>
                <span className="material-symbols-outlined text-white/60">account_balance_wallet</span>
              </div>
              <p className="text-white text-3xl font-bold">{fmtBRL(totalPeriodo)}</p>
              {periodo === "mes" && variacao !== null && variacao !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {positivo ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <p className="text-white/90 text-sm font-medium">
                    {positivo ? "+" : ""}{variacao}% vs mês anterior
                  </p>
                </div>
              )}
              {totalPeriodo === 0 && (
                <p className="text-white/70 text-xs mt-1">Nenhuma venda registrada neste período</p>
              )}
            </div>
          </section>

          <div className="flex gap-2 px-4 mb-4">
            {periodos.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors ${periodo === p.key ? "bg-[#4d8063] text-white" : "bg-white text-slate-600 border border-slate-200"}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="lg:flex lg:gap-6 lg:px-4">
            <div className="px-4 lg:px-0 space-y-3 lg:flex-1">
              {data.marcas.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-[#4d8063]/20 py-10 flex flex-col items-center gap-3">
                  <Package className="w-10 h-10 text-[#4d8063]/30" />
                  <p className="text-sm text-slate-400 font-medium">Nenhuma venda com marca registrada</p>
                </div>
              ) : (
                data.marcas.map((m, i) => {
                  const total = m.totais[periodo];
                  const qtd = m.qtds[periodo];
                  const cor = BRAND_COLORS[i % BRAND_COLORS.length];
                  const pct = totalPeriodo > 0 ? Math.round((total / totalPeriodo) * 100) : 0;
                  return (
                    <div key={m.marca} className="bg-white rounded-xl p-4 border border-[#4d8063]/5 shadow-sm">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`size-12 rounded-xl ${cor} flex items-center justify-center shrink-0`}>
                          <span className="text-white font-bold text-lg">{m.marca.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{m.marca}</p>
                          <p className="text-xs text-slate-500">{qtd} {qtd === 1 ? "venda" : "vendas"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[#4d8063] font-bold">{fmtBRL(total)}</p>
                          <p className="text-xs text-slate-400">{pct}% do total</p>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full ${cor} transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 lg:mt-0 px-4 lg:px-0 lg:w-96 lg:shrink-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Transações Recentes</h3>
                <span className="text-[#4d8063] text-sm font-semibold">{data.transacoes.length} registros</span>
              </div>
              {data.transacoes.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-200 py-8 flex flex-col items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-3xl opacity-40">receipt_long</span>
                  <p className="text-sm">Nenhuma transação ainda</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden border border-[#4d8063]/5 shadow-sm">
                  {data.transacoes.map((t, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < data.transacoes.length - 1 ? "border-b border-slate-100" : ""}`}>
                      <div className="size-9 rounded-full bg-[#4d8063]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#4d8063] text-sm">sell</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{t.produto}</p>
                        <p className="text-xs text-slate-500 truncate">{t.marca} • {fmtData(t.data)}</p>
                      </div>
                      <p className="text-emerald-600 text-sm font-bold shrink-0">+ {fmtBRL(t.valor)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ABA VENDAS À VISTA */}
      {aba === "vendas" && (
        <main className="flex-1 px-4 pt-2">
          {erroOp && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-red-600 text-sm flex items-center justify-between">
              <span>{erroOp}</span>
              <button onClick={() => setErroOp("")}><X className="w-4 h-4" /></button>
            </div>
          )}

          {loadingVendas ? (
            <div className="flex items-center justify-center py-16">
              <span className="material-symbols-outlined animate-spin text-[#4d8063] text-4xl">refresh</span>
            </div>
          ) : vendas.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">receipt_long</span>
              <p className="text-slate-400 text-sm">Nenhuma venda à vista registrada</p>
            </div>
          ) : (
            <div className="space-y-3 pb-8">
              {vendas.map(v => {
                const isEdit = editandoId === v.id;
                const isDel = confirmDel === v.id;
                return (
                  <div key={v.id} className="bg-white rounded-2xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-start gap-3">
                      <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-600 text-lg">
                          {formaIcon[v.forma_pagamento] || "payments"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm truncate">{v.cliente_nome || "Sem cliente"}</p>
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                            {formaLabel[v.forma_pagamento] || v.forma_pagamento}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{fmtData(v.created_at)} · Venda #{v.id}</p>
                      </div>
                      <p className="text-emerald-600 font-bold text-base shrink-0">
                        R$ {parseFloat(v.total).toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    {/* Editar */}
                    {isEdit && (
                      <div className="px-4 pb-3 bg-[#4d8063]/5 border-t border-[#4d8063]/10">
                        <p className="text-xs font-medium text-slate-500 my-2">Editar valor total</p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                            <input
                              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#4d8063]/30 bg-white"
                              placeholder={parseFloat(v.total).toFixed(2).replace(".", ",")}
                              value={editTotal}
                              onChange={e => setEditTotal(e.target.value.replace(/[^0-9,]/g, ""))}
                              inputMode="decimal"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => handleEditar(v)}
                            disabled={salvandoEdit}
                            className="bg-[#4d8063] text-white px-3 rounded-lg text-sm font-bold disabled:opacity-60 flex items-center gap-1"
                          >
                            {salvandoEdit ? "..." : <><Check className="w-4 h-4" />OK</>}
                          </button>
                          <button onClick={() => { setEditandoId(null); setEditTotal(""); }} className="px-3 rounded-lg border text-slate-500 text-sm">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirmar exclusão */}
                    {isDel && (
                      <div className="px-4 pb-3 bg-red-50 border-t border-red-100">
                        <p className="text-sm font-medium text-red-700 my-2">Excluir esta venda?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleExcluir(v.id)}
                            disabled={excluindoId === v.id}
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-60"
                          >
                            {excluindoId === v.id ? "Excluindo..." : "Sim, excluir"}
                          </button>
                          <button onClick={() => setConfirmDel(null)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-bold">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Botões de ação */}
                    {canEdit && (
                      <div className="border-t border-slate-100 px-4 py-2 flex gap-2">
                        <button
                          onClick={() => {
                            setEditandoId(isEdit ? null : v.id);
                            setEditTotal(parseFloat(v.total).toFixed(2).replace(".", ","));
                            setConfirmDel(null);
                          }}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-colors ${isEdit ? "bg-[#4d8063] text-white" : "bg-[#4d8063]/10 text-[#4d8063]"}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={() => { setConfirmDel(isDel ? null : v.id); setEditandoId(null); }}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-colors ${isDel ? "bg-red-500 text-white" : "bg-red-50 text-red-500"}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
