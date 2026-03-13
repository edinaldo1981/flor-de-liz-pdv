import { ArrowLeft, ChevronRight } from "lucide-react";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  return (
    <div className="bg-[#f6f7f7] min-h-screen pb-8 max-w-md mx-auto">
      <header className="bg-white border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-4">
        <button onClick={() => onNavigate("home")}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Meu Perfil</h1>
      </header>

      {/* Profile Hero */}
      <div className="bg-[#4d8063] text-white px-6 py-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40">
          <span className="material-symbols-outlined text-5xl">person</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Ana Clara Souza</h2>
          <p className="text-white/70 text-sm">Revendedora • Flor de Liz</p>
          <p className="text-white/60 text-xs mt-0.5">ana.souza@email.com</p>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Vendas no Mês", value: "47", page: "financeiro" },
          { label: "Clientes", value: "23", page: "cadastro" },
          { label: "Fiados", value: "18", page: "fiados" },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => onNavigate(s.page)}
            className="bg-white rounded-xl p-3 text-center border border-[#4d8063]/10 shadow-sm"
          >
            <p className="text-xl font-bold text-[#4d8063]">{s.value}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        {[
          { icon: "add_shopping_cart", label: "Nova Venda", sub: "Registrar uma venda", page: "carrinho" },
          { icon: "person_add", label: "Cadastrar Cliente", sub: "Novo cliente ou devedor", page: "cadastro" },
          { icon: "receipt_long", label: "Controle de Fiados", sub: "18 devedores ativos", page: "fiados" },
          { icon: "account_balance_wallet", label: "Financeiro por Marca", sub: "R$ 12.450,00 acumulado", page: "financeiro" },
          { icon: "task_alt", label: "Cobranças", sub: "Registrar e acompanhar cobranças", page: "cobranca" },
          { icon: "inventory_2", label: "Catálogo de Produtos", sub: "Ver todos os produtos", page: "perfumaria" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className="bg-white w-full rounded-xl p-4 flex items-center gap-4 shadow-sm border border-[#4d8063]/5 text-left"
          >
            <div className="bg-[#4d8063]/10 p-2.5 rounded-xl">
              <span className="material-symbols-outlined text-[#4d8063]">{item.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-slate-500">{item.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        ))}

        <button
          onClick={() => onNavigate("home")}
          className="w-full mt-2 py-4 border border-red-200 text-red-500 font-bold rounded-xl text-sm bg-white"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
