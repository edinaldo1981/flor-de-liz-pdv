import { useState } from "react";
import HomePage from "@/pages/HomePage";
import PerfumariaPage from "@/pages/PerfumariaPage";
import ProdutoPage from "@/pages/ProdutoPage";
import CarrinhoPage from "@/pages/CarrinhoPage";
import ConfirmacaoPage from "@/pages/ConfirmacaoPage";
import ProfilePage from "@/pages/ProfilePage";
import CadastroPage from "@/pages/CadastroPage";
import FiadosPage from "@/pages/FiadosPage";
import CobrancaPage from "@/pages/CobrancaPage";
import FinanceiroPage from "@/pages/FinanceiroPage";
import ClientesPage from "@/pages/ClientesPage";
import ClienteDetalhePage from "@/pages/ClienteDetalhePage";

type Page = "home" | "perfumaria" | "produto" | "carrinho" | "confirmacao" | "profile" | "cadastro" | "fiados" | "cobranca" | "financeiro" | "clientes" | "cliente_detalhe";

const mainNavPages: Page[] = ["home", "fiados", "financeiro", "clientes", "profile"];

const sidebarTabs: { icon: string; label: string; page: Page }[] = [
  { icon: "home", label: "Início", page: "home" },
  { icon: "add_shopping_cart", label: "Venda", page: "carrinho" },
  { icon: "receipt_long", label: "Fiados", page: "fiados" },
  { icon: "group", label: "Clientes", page: "clientes" },
  { icon: "account_balance_wallet", label: "Financeiro", page: "financeiro" },
  { icon: "person", label: "Perfil", page: "profile" },
];

const pageParentMap: Partial<Record<Page, Page>> = {
  perfumaria: "carrinho",
  produto: "carrinho",
  confirmacao: "carrinho",
  cadastro: "profile",
  cobranca: "fiados",
  cliente_detalhe: "clientes",
};

function Sidebar({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  const activePage = pageParentMap[current] ?? current;
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen">
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4d8063] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">spa</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">Flor de Liz</h1>
            <p className="text-[10px] text-slate-400 font-medium">Gestão de Vendas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarTabs.map((tab) => {
          const active = activePage === tab.page;
          return (
            <button
              key={tab.page}
              onClick={() => onNavigate(tab.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-[#4d8063] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${active ? "fill-icon" : ""}`}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <div className="bg-[#4d8063]/5 rounded-xl p-4 border border-[#4d8063]/10">
          <p className="text-xs text-slate-500 font-medium">Vendas Hoje</p>
          <p className="text-lg font-bold text-[#4d8063]">R$ 764,60</p>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  if (!mainNavPages.includes(current)) return null;

  const tabs: { icon: string; label: string; page: Page }[] = [
    { icon: "home", label: "Início", page: "home" },
    { icon: "add_shopping_cart", label: "Venda", page: "carrinho" },
    { icon: "receipt_long", label: "Fiados", page: "fiados" },
    { icon: "group", label: "Clientes", page: "clientes" },
    { icon: "person", label: "Perfil", page: "profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-stretch max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.page}
            onClick={() => onNavigate(tab.page)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 relative ${current === tab.page ? "text-[#4d8063]" : "text-slate-400"}`}
          >
            {tab.page === "carrinho" ? (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg -mt-5 ${current === tab.page ? "bg-[#4d8063]" : "bg-[#4d8063]"}`}>
                <span className="material-symbols-outlined text-white text-2xl">add_shopping_cart</span>
              </div>
            ) : (
              <span className={`material-symbols-outlined ${current === tab.page ? "fill-icon" : ""}`}>{tab.icon}</span>
            )}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const onNavigate = (p: string) => setPage(p as Page);

  return (
    <div className="flex min-h-screen">
      <Sidebar current={page} onNavigate={setPage} />
      <div className="flex-1 min-h-screen relative max-w-md mx-auto lg:max-w-none lg:mx-0">
        {page === "home" && <HomePage onNavigate={onNavigate} />}
        {page === "perfumaria" && <PerfumariaPage onNavigate={onNavigate} />}
        {page === "produto" && <ProdutoPage onNavigate={onNavigate} />}
        {page === "carrinho" && <CarrinhoPage onNavigate={onNavigate} />}
        {page === "confirmacao" && <ConfirmacaoPage onNavigate={onNavigate} />}
        {page === "profile" && <ProfilePage onNavigate={onNavigate} />}
        {page === "cadastro" && <CadastroPage onNavigate={onNavigate} />}
        {page === "fiados" && <FiadosPage onNavigate={onNavigate} />}
        {page === "cobranca" && <CobrancaPage onNavigate={onNavigate} />}
        {page === "financeiro" && <FinanceiroPage onNavigate={onNavigate} />}
        {page === "clientes" && <ClientesPage onNavigate={onNavigate} />}
        {page === "cliente_detalhe" && <ClienteDetalhePage onNavigate={onNavigate} />}
        <BottomNav current={page} onNavigate={setPage} />
      </div>
    </div>
  );
}
