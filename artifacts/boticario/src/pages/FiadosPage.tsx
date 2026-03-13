import { Search } from "lucide-react";
import { useState } from "react";

interface FiadosPageProps {
  onNavigate: (page: string) => void;
}

const devedores = [
  { name: "João Silva", last: "12/10/2023", debt: "R$ 150,00", highlight: false, dias: "3 dias" },
  { name: "Maria Oliveira", last: "05/11/2023", debt: "R$ 342,80", highlight: false, dias: "7 dias" },
  { name: "Ricardo Santos", last: "28/10/2023", debt: "R$ 890,00", highlight: true, dias: "15 dias" },
  { name: "Ana Costa", last: "02/11/2023", debt: "R$ 45,20", highlight: false, dias: "1 dia" },
];

export default function FiadosPage({ onNavigate }: FiadosPageProps) {
  const [busca, setBusca] = useState("");

  const filtrados = devedores.filter(d =>
    d.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white shadow-xl overflow-x-hidden">
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-[#4d8063]/10">
        <button onClick={() => onNavigate("home")} className="text-[#4d8063] flex size-12 shrink-0 items-center">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Controle de Fiados</h2>
        <div className="w-12" />
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Stats */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#4d8063]/20 bg-[#4d8063]/5">
            <p className="text-slate-600 text-sm font-medium">Total a Receber</p>
            <p className="text-[#4d8063] text-2xl font-bold">R$ 4.820,50</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-sm">trending_up</span>
              <p className="text-emerald-600 text-xs font-medium">+8.2% este mês</p>
            </div>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#4d8063]/20 bg-[#4d8063]/5">
            <p className="text-slate-600 text-sm font-medium">Devedores Ativos</p>
            <p className="text-2xl font-bold">18</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-rose-600 text-sm">trending_up</span>
              <p className="text-rose-600 text-xs font-medium">+3 novos</p>
            </div>
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

        {/* Busca */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#f6f7f7] border border-slate-200 rounded-xl px-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              className="flex-1 py-3 bg-transparent text-sm outline-none placeholder-slate-400"
              placeholder="Buscar devedor..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="text-lg font-bold">Lista de Devedores</h3>
          <span className="text-[#4d8063] text-sm font-semibold">{filtrados.length} clientes</span>
        </div>

        <div className="flex flex-col gap-1 px-2 pb-24">
          {filtrados.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">Nenhum resultado encontrado</p>
          ) : (
            filtrados.map((d) => (
              <button
                key={d.name}
                onClick={() => onNavigate("cobranca")}
                className="flex items-center gap-4 bg-white hover:bg-[#4d8063]/5 p-3 rounded-xl transition-colors border-b border-[#4d8063]/5 w-full text-left"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 border-2 ${d.highlight ? "bg-red-100 text-red-600 border-red-200" : "bg-[#4d8063]/10 text-[#4d8063] border-[#4d8063]/20"}`}>
                  {d.name[0]}
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-base font-bold">{d.name}</p>
                  <p className="text-slate-500 text-xs">Última compra: {d.last}</p>
                  <p className={`text-sm font-bold mt-0.5 ${d.highlight ? "text-rose-600" : "text-[#4d8063]"}`}>
                    {d.dias} em atraso · {d.debt}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[#4d8063]">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-[#4d8063]/10 bg-white px-4 pb-4 pt-2 flex justify-between items-end z-20">
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
