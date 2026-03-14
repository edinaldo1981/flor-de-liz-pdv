import { useEffect, useState } from "react";
import { ShoppingBag, TrendingUp, AlertCircle, Users } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = "/api-server/api";
const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusLabel: Record<string, { label: string; cls: string }> = {
  confirmada: { label: "Pago", cls: "bg-emerald-100 text-emerald-700" },
  fiado: { label: "Fiado", cls: "bg-orange-100 text-orange-700" },
  fiado_atrasado: { label: "Atrasado", cls: "bg-red-100 text-red-600" },
  estornada: { label: "Estornado", cls: "bg-slate-100 text-slate-500" },
};

interface DashboardData {
  vendasHoje: { qtd: number; soma: number };
  fiadosAbertos: { clientes: number; soma: number };
  recebidoMes: number;
  totalClientes: number;
  ultimasVendas: {
    id: number; total: string; status: string; forma_pagamento: string;
    created_at: string; cliente_nome: string; primeiro_item?: string;
  }[];
  topFiados: { nome: string; em_aberto: number; dias: number }[];
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/dashboard`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeletonCls = "animate-pulse bg-slate-200 rounded";

  return (
    <div className="bg-[#f6f7f7] min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-[#4d8063] px-4 pt-5 pb-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white/70 text-xs font-medium">Bem-vinda de volta,</p>
            <h1 className="text-white text-xl font-bold">Flor de Liz</h1>
          </div>
          <button onClick={() => onNavigate("profile")} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
            <span className="material-symbols-outlined text-white">person</span>
          </button>
        </div>
        <p className="text-white/60 text-xs mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </header>

      <main className="max-w-md mx-auto lg:max-w-none">
        {/* Stats do dia */}
        <div className="px-4 -mt-1 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <button onClick={() => onNavigate("financeiro")} className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Vendas Hoje</p>
              <TrendingUp className="w-4 h-4 text-[#4d8063]" />
            </div>
            {loading ? (
              <><div className={`h-7 w-24 mb-1 ${skeletonCls}`} /><div className={`h-3 w-20 ${skeletonCls}`} /></>
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{fmtBRL(data?.vendasHoje.soma ?? 0)}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  {data?.vendasHoje.qtd ?? 0} {data?.vendasHoje.qtd === 1 ? "venda realizada" : "vendas realizadas"}
                </p>
              </>
            )}
          </button>

          <button onClick={() => onNavigate("fiados")} className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Fiados Abertos</p>
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </div>
            {loading ? (
              <><div className={`h-7 w-24 mb-1 ${skeletonCls}`} /><div className={`h-3 w-20 ${skeletonCls}`} /></>
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{fmtBRL(data?.fiadosAbertos.soma ?? 0)}</p>
                <p className={`text-xs font-medium mt-1 ${(data?.fiadosAbertos.clientes ?? 0) > 0 ? "text-orange-500" : "text-slate-400"}`}>
                  {data?.fiadosAbertos.clientes ?? 0} {data?.fiadosAbertos.clientes === 1 ? "cliente devendo" : "clientes devendo"}
                </p>
              </>
            )}
          </button>

          <button onClick={() => onNavigate("financeiro")} className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Recebido no Mês</p>
              <ShoppingBag className="w-4 h-4 text-[#4d8063]" />
            </div>
            {loading ? (
              <><div className={`h-7 w-24 mb-1 ${skeletonCls}`} /><div className={`h-3 w-16 ${skeletonCls}`} /></>
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{fmtBRL(data?.recebidoMes ?? 0)}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">este mês</p>
              </>
            )}
          </button>

          <button onClick={() => onNavigate("clientes")} className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Clientes Ativos</p>
              <Users className="w-4 h-4 text-[#4d8063]" />
            </div>
            {loading ? (
              <><div className={`h-7 w-10 mb-1 ${skeletonCls}`} /><div className={`h-3 w-16 ${skeletonCls}`} /></>
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-800">{data?.totalClientes ?? 0}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">cadastrados</p>
              </>
            )}
          </button>
        </div>

        {/* Ações rápidas */}
        <div className="px-4 mb-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Ações Rápidas</h3>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: "add_shopping_cart", label: "Nova Venda", page: "carrinho", color: "bg-[#4d8063] text-white" },
              { icon: "person_add", label: "Novo Cliente", page: "cadastro", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
              { icon: "receipt_long", label: "Fiados", page: "fiados", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
              { icon: "group", label: "Clientes", page: "clientes", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
              { icon: "task_alt", label: "Cobranças", page: "cobranca", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
              { icon: "inventory_2", label: "Catálogo", page: "perfumaria", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => onNavigate(a.page)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl shadow-sm ${a.color}`}
              >
                <span className="material-symbols-outlined text-2xl">{a.icon}</span>
                <span className="text-[10px] font-bold text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fiados em destaque */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">Fiados Pendentes</h3>
            <button onClick={() => onNavigate("fiados")} className="text-[#4d8063] text-xs font-bold">Ver todos</button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-[#4d8063]/10 shadow-sm overflow-hidden divide-y divide-slate-100">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-full ${skeletonCls}`} />
                  <div className="flex-1">
                    <div className={`h-3.5 w-28 mb-1.5 ${skeletonCls}`} />
                    <div className={`h-3 w-20 ${skeletonCls}`} />
                  </div>
                  <div className={`h-4 w-16 ${skeletonCls}`} />
                </div>
              ))}
            </div>
          ) : (data?.topFiados ?? []).length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#4d8063]/20 py-8 flex flex-col items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-3xl opacity-30">thumb_up</span>
              <p className="text-sm font-medium">Nenhum fiado em aberto</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
              {data!.topFiados.map((f, i) => (
                <button
                  key={f.nome}
                  onClick={() => onNavigate("fiados")}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 ${i < data!.topFiados.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${f.dias > 7 ? "bg-red-100 text-red-600" : "bg-[#4d8063]/10 text-[#4d8063]"}`}>
                      {f.nome.split(" ")[0][0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{f.nome}</p>
                      <p className={`text-xs ${f.dias > 7 ? "text-red-500" : "text-slate-500"}`}>
                        {f.dias === 0 ? "hoje" : `${f.dias} dia${f.dias !== 1 ? "s" : ""} em atraso`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${f.dias > 7 ? "text-red-600" : "text-slate-700"}`}>{fmtBRL(f.em_aberto)}</p>
                    <span className="material-symbols-outlined text-[#4d8063] text-lg">chevron_right</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Últimas vendas */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">Últimas Vendas</h3>
            <button onClick={() => onNavigate("financeiro")} className="text-[#4d8063] text-xs font-bold">Ver todas</button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-[#4d8063]/10 shadow-sm overflow-hidden divide-y divide-slate-100">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-full ${skeletonCls}`} />
                  <div className="flex-1">
                    <div className={`h-3.5 w-24 mb-1.5 ${skeletonCls}`} />
                    <div className={`h-3 w-32 ${skeletonCls}`} />
                  </div>
                  <div className={`h-4 w-16 ${skeletonCls}`} />
                </div>
              ))}
            </div>
          ) : (data?.ultimasVendas ?? []).length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#4d8063]/20 py-8 flex flex-col items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-3xl opacity-30">shopping_bag</span>
              <p className="text-sm font-medium">Nenhuma venda registrada ainda</p>
              <button
                onClick={() => onNavigate("carrinho")}
                className="mt-1 bg-[#4d8063] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Registrar Venda
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
              {data!.ultimasVendas.map((v, i) => {
                const st = statusLabel[v.status] ?? { label: v.status, cls: "bg-slate-100 text-slate-500" };
                const hora = new Date(v.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <button
                    key={v.id}
                    onClick={() => onNavigate("financeiro")}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 ${i < data!.ultimasVendas.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-xs font-bold text-[#4d8063]">
                        {v.cliente_nome.split(" ")[0][0]}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{v.cliente_nome}</p>
                        <p className="text-xs text-slate-500">{v.primeiro_item ? `${v.primeiro_item} · ` : ""}{hora}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-bold text-slate-800">{fmtBRL(parseFloat(v.total))}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
