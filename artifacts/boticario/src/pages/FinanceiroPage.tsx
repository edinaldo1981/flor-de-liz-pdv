import { ArrowLeft, TrendingUp } from "lucide-react";
import { useState } from "react";

interface FinanceiroPageProps {
  onNavigate: (page: string) => void;
}

const brands = [
  {
    name: "O Boticário",
    totals: { mes: "R$ 5.840,00", tri: "R$ 15.200,00", sem: "R$ 28.400,00", ano: "R$ 52.000,00" },
    qtys: { mes: 24, tri: 62, sem: 118, ano: 210 },
    percent: 47,
    change: "+12.5%",
    positive: true,
    color: "bg-[#4d8063]",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTLgKgPeh5Muy5SoAiioWysgGivI66NssAH2Fb5hm8PwCBoQsQTyM7kGS_A4T8obg1Jtg97_uMghtdUM-1675SK9x4vAURlZL7flOVPaHbG8qpHC6dBcCKhwdEzLu8Vie4dBJskIIXI7I_t_TTo3C6sPw9pNXJFpyWXzqTzai6rm-Dfqfe6q8AOVwV7Dbt81x5zLubzMwaYEiaVTSsXtTEY77ZMEXt7zwsjmStW-riSJ4pnHOA-4_KPLcpzJbcBxUkJ75g6qy2GWs",
  },
  {
    name: "Natura",
    totals: { mes: "R$ 3.210,00", tri: "R$ 8.400,00", sem: "R$ 16.800,00", ano: "R$ 30.000,00" },
    qtys: { mes: 18, tri: 48, sem: 96, ano: 175 },
    percent: 26,
    change: "+8.1%",
    positive: true,
    color: "bg-emerald-500",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH9KPymNoqT-i5RhXayqRzgX72w38CViFnD_5VVXYFziTjCpP54RmHhDsWn0mP4N-IJJqWanPNyyoktMI8t8_tX2ssDQn5Y8kiuS9T3RQG3OERqVH9oJ4nDC0DQsUu-9g7Ko4IWH2pVnGcc8tMENgTxKXVvQMbxmlew2hRvEa4G3v6oF7N7uVMhJLGNXpPJDeFKNpx4zcOmKKgv8C76e5c6bJHpZGnZiDYNTBQGXMZA5FpWVn0AiwQZufReBfh2VgeeLWwlLiJGpI",
  },
  {
    name: "Rommanel",
    totals: { mes: "R$ 2.100,00", tri: "R$ 5.800,00", sem: "R$ 10.200,00", ano: "R$ 19.000,00" },
    qtys: { mes: 9, tri: 25, sem: 46, ano: 88 },
    percent: 17,
    change: "-2.3%",
    positive: false,
    color: "bg-yellow-500",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIZzkJ3e9KJs-KmbJva-mcuThacR-5kjTgFlruZ88kXbiR2y0TuhQI5RNz27ebLoIsP1cGTTECLE51OaHWT-gc91wBhlD2mYZUVgjKD5Gjp7W4vY6bDYE2kWrniSw7_R8rqVayzGh3DE6PpZaqSbc7m5GnW69ci6Z8bE9zE39Sqfxoghg70ArtpbLuPLhwkajvCkqmWm7nXqDRPO-AGxKYcbo1TMOFSH4e3dKnrfhS2E3q2GzoCkKFqRDp4yggRt8Dosih0-h1pvw",
  },
  {
    name: "Avon",
    totals: { mes: "R$ 1.300,00", tri: "R$ 3.200,00", sem: "R$ 6.100,00", ano: "R$ 11.500,00" },
    qtys: { mes: 7, tri: 18, sem: 34, ano: 65 },
    percent: 10,
    change: "+5.0%",
    positive: true,
    color: "bg-pink-500",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9_byuTsq9dx9jWOqrb31ESq_YS3SJVcqH7BftBBvw0gnBFFR6KKibC8OqqK_fTWWxuK51d4jwuCLYJKmOxzZfQP-7zR-2DF8TVNBdPW4-1rCHQxBpK8X-JAVSMIfSh5mfC1cebgNBLMYt_NFdTWNm0HGb5MbGs9USnCT5yjqjc0diZXhAgg8QCsBS9pOZE222VUsSK0KxrKrZQbpGH3Y5zR9erkxcvmHsqupFuAaNF50w6VGzP4Ny37Ef760jDcasqo6vKHTN3ZA",
  },
];

const periodos = [
  { key: "mes", label: "Este mês" },
  { key: "tri", label: "3 meses" },
  { key: "sem", label: "6 meses" },
  { key: "ano", label: "1 ano" },
] as const;

type Periodo = typeof periodos[number]["key"];

const totaisGerais: Record<Periodo, string> = {
  mes: "R$ 12.450,00",
  tri: "R$ 32.600,00",
  sem: "R$ 61.500,00",
  ano: "R$ 112.500,00",
};

const transacoes = [
  { brand: "O Boticário", product: "Lily Eau de Parfum", date: "Hoje 14:30", value: "+ R$ 279,90" },
  { brand: "Natura", product: "Creme Ekos", date: "Hoje 11:15", value: "+ R$ 89,30" },
  { brand: "Rommanel", product: "Anel Ouro Rose", date: "Ontem 16:20", value: "+ R$ 210,00" },
  { brand: "Avon", product: "Batom Matte", date: "Ontem 09:00", value: "+ R$ 45,00" },
  { brand: "O Boticário", product: "Malbec 100ml", date: "13/03 13:10", value: "+ R$ 209,90" },
];

export default function FinanceiroPage({ onNavigate }: FinanceiroPageProps) {
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  return (
    <div className="bg-[#f6f7f7] min-h-screen flex flex-col pb-24 lg:pb-8">
      <header className="flex items-center bg-white p-4 border-b border-[#4d8063]/10 sticky top-0 z-10">
        <button onClick={() => onNavigate("home")} className="text-[#4d8063] flex size-10 items-center justify-center rounded-lg bg-[#4d8063]/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Financeiro por Marca</h2>
        <div className="size-10" />
      </header>

      <main className="flex-1">
        {/* Total Balance */}
        <section className="p-4">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#4d8063] text-white shadow-lg">
            <div className="flex justify-between items-start">
              <p className="text-white/80 text-sm font-medium">Saldo Total Acumulado</p>
              <span className="material-symbols-outlined text-white/60">account_balance_wallet</span>
            </div>
            <p className="text-white text-3xl font-bold">{totaisGerais[periodo]}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4" />
              <p className="text-white/90 text-sm font-medium">+15.4% vs período anterior</p>
            </div>
          </div>
        </section>

        {/* Period Selector */}
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

        {/* Brand Cards + Transactions — side by side on lg */}
        <div className="lg:flex lg:gap-6 lg:px-4">
        <div className="px-4 lg:px-0 space-y-3 lg:flex-1">
          {brands.map((b) => (
            <div key={b.name} className="bg-white rounded-xl p-4 border border-[#4d8063]/5 shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="size-12 rounded-xl border border-slate-100 bg-center bg-cover"
                  style={{ backgroundImage: `url('${b.img}')` }}
                />
                <div className="flex-1">
                  <p className="font-bold">{b.name}</p>
                  <p className="text-xs text-slate-500">{b.qtys[periodo]} vendas</p>
                </div>
                <div className="text-right">
                  <p className="text-[#4d8063] font-bold">{b.totals[periodo]}</p>
                  <p className={`text-xs font-medium ${b.positive ? "text-emerald-600" : "text-rose-600"}`}>{b.change}</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div className={`h-2 rounded-full ${b.color}`} style={{ width: `${b.percent}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{b.percent}% do total</p>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="mt-6 lg:mt-0 px-4 lg:px-0 lg:w-96 lg:shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Transações Recentes</h3>
            <span className="text-[#4d8063] text-sm font-semibold">{transacoes.length} registros</span>
          </div>
          <div className="bg-white rounded-xl overflow-hidden border border-[#4d8063]/5 shadow-sm">
            {transacoes.map((t, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3 ${i < transacoes.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div className="size-10 rounded-full bg-[#4d8063]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4d8063] text-sm">sell</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.product}</p>
                  <p className="text-xs text-slate-500">{t.brand} • {t.date}</p>
                </div>
                <p className="text-emerald-600 text-sm font-bold">{t.value}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#4d8063]/10 px-4 pb-6 pt-2 flex justify-around items-center max-w-md mx-auto lg:hidden">
        {[
          { icon: "home", label: "Início", page: "home" },
          { icon: "receipt_long", label: "Fiados", page: "fiados" },
          { icon: "account_balance_wallet", label: "Financeiro", page: "financeiro", active: true },
          { icon: "person", label: "Perfil", page: "profile" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className={`flex flex-col items-center gap-1 ${item.active ? "text-[#4d8063]" : "text-slate-400"}`}
          >
            <span className={`material-symbols-outlined ${item.active ? "fill-icon" : ""}`}>{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
