import { ShoppingBag, TrendingUp, AlertCircle, Users, Plus, ClipboardList } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const recentes = [
  { client: "Maria Oliveira", produto: "Lily EDP 75ml", valor: "R$ 279,90", hora: "14:32", pago: true },
  { client: "João Silva", produto: "Malbec 100ml", valor: "R$ 209,90", hora: "13:10", pago: false },
  { client: "Ana Costa", produto: "Creme Nativa 400ml", valor: "R$ 89,90", hora: "11:45", pago: true },
  { client: "Ricardo Santos", produto: "Coffee Woman 100ml", valor: "R$ 184,90", hora: "10:20", pago: false },
];

export default function HomePage({ onNavigate }: HomePageProps) {
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

      <main className="max-w-md mx-auto">
        {/* Stats do dia */}
        <div className="px-4 -mt-1 pt-4 grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Vendas Hoje</p>
              <TrendingUp className="w-4 h-4 text-[#4d8063]" />
            </div>
            <p className="text-2xl font-bold text-slate-800">R$ 764,60</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">4 vendas realizadas</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Fiados Abertos</p>
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">R$ 4.820,50</p>
            <p className="text-xs text-orange-500 font-medium mt-1">18 clientes devendo</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Recebido no Mês</p>
              <ShoppingBag className="w-4 h-4 text-[#4d8063]" />
            </div>
            <p className="text-2xl font-bold text-slate-800">R$ 12.450,00</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">+15.4% vs mês anterior</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#4d8063]/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">Clientes Ativos</p>
              <Users className="w-4 h-4 text-[#4d8063]" />
            </div>
            <p className="text-2xl font-bold text-slate-800">47</p>
            <p className="text-xs text-slate-400 font-medium mt-1">+3 este mês</p>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="px-4 mb-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Ações Rápidas</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "add_shopping_cart", label: "Nova Venda", page: "carrinho", color: "bg-[#4d8063] text-white" },
              { icon: "person_add", label: "Novo Cliente", page: "cadastro", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
              { icon: "receipt_long", label: "Registrar Fiado", page: "fiados", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
              { icon: "account_balance_wallet", label: "Financeiro", page: "financeiro", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
              { icon: "chat", label: "Cobrar WhatsApp", page: "cobranca", color: "bg-white text-[#4d8063] border border-[#4d8063]/20" },
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
          <div className="bg-white rounded-xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
            {[
              { name: "Ricardo Santos", valor: "R$ 890,00", dias: "15 dias", urgente: true },
              { name: "João Silva", valor: "R$ 150,00", dias: "3 dias", urgente: false },
              { name: "Maria Oliveira", valor: "R$ 342,80", dias: "7 dias", urgente: false },
            ].map((f, i) => (
              <button
                key={f.name}
                onClick={() => onNavigate("cobranca")}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 ${i < 2 ? "border-b border-slate-100" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${f.urgente ? "bg-red-100 text-red-600" : "bg-[#4d8063]/10 text-[#4d8063]"}`}>
                    {f.name.split(" ")[0][0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{f.name}</p>
                    <p className={`text-xs ${f.urgente ? "text-red-500" : "text-slate-500"}`}>{f.dias} em atraso</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-bold ${f.urgente ? "text-red-600" : "text-slate-700"}`}>{f.valor}</p>
                  <span className="material-symbols-outlined text-[#4d8063] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Últimas vendas */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700">Últimas Vendas</h3>
            <button onClick={() => onNavigate("financeiro")} className="text-[#4d8063] text-xs font-bold">Ver todas</button>
          </div>
          <div className="bg-white rounded-xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
            {recentes.map((v, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < recentes.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-xs font-bold text-[#4d8063]">
                    {v.client.split(" ")[0][0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{v.client}</p>
                    <p className="text-xs text-slate-500">{v.produto} · {v.hora}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-slate-800">{v.valor}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.pago ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                    {v.pago ? "Pago" : "Fiado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
