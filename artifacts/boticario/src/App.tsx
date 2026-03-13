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

type Page = "home" | "perfumaria" | "produto" | "carrinho" | "confirmacao" | "profile" | "cadastro" | "fiados" | "cobranca" | "financeiro";

const mainNavPages: Page[] = ["home", "fiados", "financeiro", "profile"];

function BottomNav({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  if (!mainNavPages.includes(current)) return null;

  const tabs: { icon: string; label: string; page: Page }[] = [
    { icon: "home", label: "Início", page: "home" },
    { icon: "add_shopping_cart", label: "Venda", page: "carrinho" },
    { icon: "receipt_long", label: "Fiados", page: "fiados" },
    { icon: "account_balance_wallet", label: "Financeiro", page: "financeiro" },
    { icon: "person", label: "Perfil", page: "profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 max-w-md mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-stretch">
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
    <div className="max-w-md mx-auto min-h-screen relative">
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
      <BottomNav current={page} onNavigate={setPage} />
    </div>
  );
}
