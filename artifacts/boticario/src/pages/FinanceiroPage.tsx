import { ArrowLeft, TrendingUp, TrendingDown, Package } from "lucide-react";
import { useState, useEffect } from "react";

interface FinanceiroPageProps {
  onNavigate: (page: string) => void;
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

const API_BASE = "/api";

type Periodo = "mes" | "tri" | "sem" | "ano";

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

export default function FinanceiroPage({ onNavigate }: FinanceiroPageProps) {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/financeiro`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setErro("Erro ao carregar dados financeiros."))
      .finally(() => setLoading(false));
  }, []);

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

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-[#4d8063] text-4xl">refresh</span>
        </div>
      )}

      {erro && (
        <div className="m-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">
          {erro}
        </div>
      )}

      {!loading && data && (
        <main className="flex-1">
          {/* Card Total */}
          <section className="p-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#4d8063] text-white shadow-lg">
              <div className="flex justify-between items-start">
                <p className="text-white/80 text-sm font-medium">
                  {periodos.find(p => p.key === periodo)?.label === "Este mês"
                    ? "Total Este Mês"
                    : `Total — ${periodos.find(p => p.key === periodo)?.label}`}
                </p>
                <span className="material-symbols-outlined text-white/60">account_balance_wallet</span>
              </div>
              <p className="text-white text-3xl font-bold">{fmtBRL(totalPeriodo)}</p>
              {periodo === "mes" && variacao !== null && variacao !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {positivo
                    ? <TrendingUp className="w-4 h-4" />
                    : <TrendingDown className="w-4 h-4" />}
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

          {/* Seletor de Período */}
          <div className="flex gap-2 px-4 mb-4">
            {periodos.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors ${
                  periodo === p.key ? "bg-[#4d8063] text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="lg:flex lg:gap-6 lg:px-4">
            {/* Cards por Marca */}
            <div className="px-4 lg:px-0 space-y-3 lg:flex-1">
              {data.marcas.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-[#4d8063]/20 py-10 flex flex-col items-center gap-3">
                  <Package className="w-10 h-10 text-[#4d8063]/30" />
                  <p className="text-sm text-slate-400 font-medium">Nenhuma venda com marca registrada</p>
                  <p className="text-xs text-slate-400 text-center px-6">
                    As vendas agrupadas por marca vão aparecer aqui conforme você registrar vendas com produtos do catálogo.
                  </p>
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
                          <span className="text-white font-bold text-lg">
                            {m.marca.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{m.marca}</p>
                          <p className="text-xs text-slate-500">
                            {qtd} {qtd === 1 ? "venda" : "vendas"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[#4d8063] font-bold">{fmtBRL(total)}</p>
                          <p className="text-xs text-slate-400">{pct}% do total</p>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${cor} transition-all duration-500`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Transações Recentes */}
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
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-4 py-3 ${i < data.transacoes.length - 1 ? "border-b border-slate-100" : ""}`}
                    >
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
    </div>
  );
}
