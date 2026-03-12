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

function BottomNav({ current, onNavigate }: { current: Page; onNavigate: (p: Page) => void }) {
  const tabs: { icon: string; label: string; page: Page }[] = [
    { icon: "home", label: "Início", page: "home" },
    { icon: "search", label: "Busca", page: "perfumaria" },
    { icon: "shopping_bag", label: "Sacola", page: "carrinho" },
    { icon: "person", label: "Perfil", page: "profile" },
  ];

  if (!["home", "perfumaria", "carrinho", "profile"].includes(current)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-6 max-w-md mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 1.5rem)" }}>
      <div className="flex items-center justify-between">
        {tabs.map((tab) => (
          <button
            key={tab.page}
            onClick={() => onNavigate(tab.page)}
            className={`flex flex-col items-center gap-1 relative ${current === tab.page ? "text-[#4d8063]" : "text-slate-400"}`}
          >
            <span className={`material-symbols-outlined ${current === tab.page ? "fill-icon" : ""}`}>{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
            {tab.page === "carrinho" && (
              <span className="absolute -top-1 -right-1 bg-[#4d8063] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
            )}
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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

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
