import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

interface FiadosPageProps {
  onNavigate: (page: string) => void;
}


interface Venda {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  total: string;
  valor_pago: string;
  status: string;
  forma_pagamento: string;
  asaas_id: string | null;
  asaas_invoice_url: string | null;
  asaas_status: string | null;
  created_at: string;
}

interface GrupoCliente {
  cliente_id: number;
  cliente_nome: string;
  fiados: Venda[];
  totalSaldo: number;
}

function saldo(v: Venda) {
  return Math.max(0, parseFloat(v.total) - parseFloat(v.valor_pago || "0"));
}

function diasAtras(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "hoje";
  if (d === 1) return "1 dia";
  return `${d} dias`;
}

function isAtrasado(v: Venda): boolean {
  if (v.status === "fiado_atrasado") return true;
  if (v.status === "fiado") {
    const dias = Math.floor((Date.now() - new Date(v.created_at).getTime()) / 86400000);
    return dias > 30;
  }
  return false;
}

export default function FiadosPage({ onNavigate }: FiadosPageProps) {
  const [busca, setBusca] = useState("");
  const [fiados, setFiados] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    apiFetch(`/vendas`)
      .then(r => r.json())
      .then((data: Venda[]) => {
        setFiados(data.filter(v => v.status === "fiado" || v.status === "fiado_atrasado"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAReceber = fiados.reduce((acc, v) => acc + saldo(v), 0);

  const grupos: GrupoCliente[] = [];
  fiados.forEach(v => {
    const g = grupos.find(g => g.cliente_id === v.cliente_id);
    if (g) {
      g.fiados.push(v);
      g.totalSaldo += saldo(v);
    } else {
      grupos.push({ cliente_id: v.cliente_id, cliente_nome: v.cliente_nome ?? "Cliente", fiados: [v], totalSaldo: saldo(v) });
    }
  });
  grupos.sort((a, b) => b.totalSaldo - a.totalSaldo);

  const filtrados = grupos.filter(g =>
    g.cliente_nome.toLowerCase().includes(busca.toLowerCase())
  );

  function handleAbrirNota(g: GrupoCliente) {
    localStorage.setItem("nota_cliente", JSON.stringify({ cliente_id: g.cliente_id, cliente_nome: g.cliente_nome }));
    onNavigate("nota_cliente");
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white shadow-xl overflow-x-hidden">
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-[#4d8063]/10">
        <button onClick={() => onNavigate("home")} className="text-[#4d8063] flex size-12 shrink-0 items-center">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Controle de Fiados</h2>
        <div className="w-12" />
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-5 border border-[#4d8063]/20 bg-[#4d8063]/5">
            <p className="text-slate-600 text-sm font-medium">Total a Receber</p>
            <p className="text-[#4d8063] text-2xl font-bold">
              {loading ? "..." : `R$ ${totalAReceber.toFixed(2).replace(".", ",")}`}
            </p>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-5 border border-[#4d8063]/20 bg-[#4d8063]/5">
            <p className="text-slate-600 text-sm font-medium">Clientes com Fiado</p>
            <p className="text-2xl font-bold">
              {loading ? "..." : grupos.length}
            </p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#f6f7f7] border border-slate-200 rounded-xl px-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              className="flex-1 py-3 bg-transparent text-sm outline-none placeholder-slate-400"
              placeholder="Buscar cliente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="text-lg font-bold">Notas em Aberto</h3>
          <span className="text-[#4d8063] text-sm font-semibold">{filtrados.length} cliente{filtrados.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex flex-col gap-2 px-3 pb-32 lg:pb-8">
          {loading ? (
            <p className="text-center text-slate-400 text-sm py-8">Carregando...</p>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12 px-6">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">receipt_long</span>
              <p className="text-slate-400 text-sm">Nenhum fiado em aberto</p>
            </div>
          ) : (
            filtrados.map(g => {
              const isExp = expandido === g.cliente_id;
              const temAtrasado = g.fiados.some(v => isAtrasado(v));
              return (
                <div key={g.cliente_id} className="bg-white rounded-2xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
                  {/* Cabeçalho do cliente */}
                  <button
                    className="flex items-center gap-3 w-full p-4 text-left hover:bg-[#4d8063]/5 transition-colors"
                    onClick={() => setExpandido(isExp ? null : g.cliente_id)}
                  >
                    <div className={`size-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 border-2 ${temAtrasado ? "bg-red-100 text-red-600 border-red-200" : "bg-[#4d8063]/10 text-[#4d8063] border-[#4d8063]/20"}`}>
                      {g.cliente_nome[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate">{g.cliente_nome}</p>
                      <p className="text-slate-500 text-xs">
                        {g.fiados.length} compra{g.fiados.length !== 1 ? "s" : ""} em aberto
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-base font-bold ${temAtrasado ? "text-rose-600" : "text-[#4d8063]"}`}>
                        R$ {g.totalSaldo.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 shrink-0 transition-transform ${isExp ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>

                  {/* Lista de fiados expandida */}
                  {isExp && (
                    <div className="border-t border-[#4d8063]/10">
                      {g.fiados.map(v => {
                        const s = saldo(v);
                        return (
                          <div key={v.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-b-0">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold">Fiado #{v.id}</p>
                              <p className="text-xs text-slate-400">{diasAtras(v.created_at)}</p>
                            </div>
                            <p className="text-sm font-bold text-[#4d8063] shrink-0 mr-3">
                              R$ {s.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                        );
                      })}
                      {/* Botão ver nota completa */}
                      <div className="p-3 bg-[#4d8063]/5">
                        <button
                          onClick={() => handleAbrirNota(g)}
                          className="w-full bg-[#4d8063] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">receipt_long</span>
                          Ver Nota Completa · Pagar / Editar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
