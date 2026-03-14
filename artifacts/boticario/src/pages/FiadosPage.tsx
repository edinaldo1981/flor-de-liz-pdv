import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface FiadosPageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = "/api-server/api";

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

function diasAtras(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "hoje";
  if (d === 1) return "1 dia";
  return `${d} dias`;
}

function saldo(v: Venda) {
  return Math.max(0, parseFloat(v.total) - parseFloat(v.valor_pago || "0"));
}

export default function FiadosPage({ onNavigate }: FiadosPageProps) {
  const [busca, setBusca] = useState("");
  const [fiados, setFiados] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/vendas`)
      .then(r => r.json())
      .then((data: Venda[]) => {
        setFiados(data.filter(v => v.status === "fiado" || v.status === "fiado_atrasado"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtrados = fiados.filter(v =>
    (v.cliente_nome ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  const totalAReceber = fiados.reduce((acc, v) => acc + saldo(v), 0);

  function handleClick(v: Venda) {
    localStorage.setItem("fiado_selecionado", JSON.stringify(v));
    onNavigate("cobranca");
  }

  function asaasLabel(status: string | null) {
    if (!status) return null;
    if (status === "RECEIVED" || status === "CONFIRMED") return { label: "Pago", color: "text-emerald-600 bg-emerald-50" };
    if (status === "OVERDUE") return { label: "Vencido", color: "text-red-600 bg-red-50" };
    if (status === "PENDING") return { label: "Aguardando", color: "text-orange-600 bg-orange-50" };
    return { label: status, color: "text-slate-500 bg-slate-100" };
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
            <p className="text-slate-600 text-sm font-medium">Fiados Ativos</p>
            <p className="text-2xl font-bold">
              {loading ? "..." : fiados.length}
            </p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <button
            onClick={() => onNavigate("cadastro")}
            className="w-full flex items-center justify-center gap-2 bg-[#4d8063] text-white py-3 px-4 rounded-xl font-bold shadow-sm"
          >
            <span className="material-symbols-outlined">person_add</span>
            Cadastrar Novo Cliente
          </button>
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
          <h3 className="text-lg font-bold">Lista de Fiados</h3>
          <span className="text-[#4d8063] text-sm font-semibold">{filtrados.length} cliente{filtrados.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-1 lg:gap-3 px-2 lg:px-4 pb-24 lg:pb-8">
          {loading ? (
            <p className="text-center text-slate-400 text-sm py-8">Carregando...</p>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12 px-6">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">receipt_long</span>
              <p className="text-slate-400 text-sm">Nenhum fiado em aberto</p>
            </div>
          ) : (
            filtrados.map((v) => {
              const saldoV = saldo(v);
              const dias = diasAtras(v.created_at);
              const atrasado = v.status === "fiado_atrasado";
              const badge = asaasLabel(v.asaas_status);
              return (
                <button
                  key={v.id}
                  onClick={() => handleClick(v)}
                  className="flex items-center gap-4 bg-white hover:bg-[#4d8063]/5 p-3 rounded-xl transition-colors border-b border-[#4d8063]/5 w-full text-left"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 border-2 ${atrasado ? "bg-red-100 text-red-600 border-red-200" : "bg-[#4d8063]/10 text-[#4d8063] border-[#4d8063]/20"}`}>
                    {(v.cliente_nome ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold truncate">{v.cliente_nome ?? "Cliente"}</p>
                      {v.asaas_invoice_url && (
                        <span className="material-symbols-outlined text-[#4d8063] text-base shrink-0" title="Link de pagamento gerado">link</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs">Fiado #{v.id} · {dias}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-sm font-bold ${atrasado ? "text-rose-600" : "text-[#4d8063]"}`}>
                        R$ {saldoV.toFixed(2).replace(".", ",")} em aberto
                      </p>
                      {badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 shrink-0">chevron_right</span>
                </button>
              );
            })
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-[#4d8063]/10 bg-white px-4 pb-4 pt-2 flex justify-between items-end z-20 lg:hidden">
        <button onClick={() => onNavigate("home")} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-2xl">home</span>
          <p className="text-[10px] font-medium uppercase tracking-wider">Início</p>
        </button>
        <button onClick={() => onNavigate("fiados")} className="flex flex-1 flex-col items-center justify-center gap-1 text-[#4d8063]">
          <span className="material-symbols-outlined text-2xl fill-icon">receipt_long</span>
          <p className="text-[10px] font-bold uppercase tracking-wider">Fiados</p>
        </button>
        <div className="flex-1 flex justify-center -translate-y-4">
          <button onClick={() => onNavigate("carrinho")} className="bg-[#4d8063] text-white p-3 rounded-full shadow-lg shadow-[#4d8063]/40">
            <span className="material-symbols-outlined text-3xl">add_shopping_cart</span>
          </button>
        </div>
        <button onClick={() => onNavigate("financeiro")} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          <p className="text-[10px] font-medium uppercase tracking-wider">Financeiro</p>
        </button>
        <button onClick={() => onNavigate("profile")} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-2xl">person</span>
          <p className="text-[10px] font-medium uppercase tracking-wider">Perfil</p>
        </button>
      </nav>
    </div>
  );
}
