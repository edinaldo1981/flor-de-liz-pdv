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
      <div className="bg-[#4d8063] text-white px-6 py-8 flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40">
          <span className="material-symbols-outlined text-5xl">person</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Ana Clara Souza</h2>
          <p className="text-white/80 text-sm">ana.souza@email.com</p>
        </div>
        <div className="bg-white/20 rounded-xl px-6 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-white">redeem</span>
          <div>
            <p className="text-xs text-white/70 font-medium">Pontos Viva O Boticário</p>
            <p className="text-xl font-bold">1.250 pts</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-4 space-y-2">
        {[
          { icon: "shopping_bag", label: "Meus Pedidos", sub: "3 pedidos ativos", page: "confirmacao" },
          { icon: "favorite", label: "Favoritos", sub: "12 produtos salvos", page: "perfumaria" },
          { icon: "location_on", label: "Meus Endereços", sub: "2 endereços cadastrados", page: "cadastro" },
          { icon: "credit_card", label: "Formas de Pagamento", sub: "Cartão terminado em 4589", page: "" },
          { icon: "notifications", label: "Notificações", sub: "Todas ativas", page: "" },
          { icon: "person_add", label: "Cadastrar Cliente/Devedor", sub: "Gerenciar fiados", page: "cadastro" },
          { icon: "receipt_long", label: "Controle de Fiados", sub: "18 devedores ativos", page: "fiados" },
          { icon: "account_balance_wallet", label: "Financeiro por Marca", sub: "R$ 12.450,00 acumulado", page: "financeiro" },
          { icon: "settings", label: "Configurações", sub: "Conta e preferências", page: "" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => item.page && onNavigate(item.page)}
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

        <button className="w-full mt-4 py-4 border border-red-200 text-red-500 font-bold rounded-xl text-sm bg-white">
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
