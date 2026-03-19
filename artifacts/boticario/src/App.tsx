import { useState, useEffect } from "react";
import { getToken, clearToken, apiFetch } from "@/lib/api";
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
import ImportarVendasPage from "@/pages/ImportarVendasPage";
import NotaClientePage from "@/pages/NotaClientePage";
import LoginPage from "@/pages/LoginPage";
import ConfigAcessoPage from "@/pages/ConfigAcessoPage";
import SuperAdminPage from "@/pages/SuperAdminPage";

type Page = "home" | "perfumaria" | "produto" | "carrinho" | "confirmacao" | "profile" | "cadastro"
  | "fiados" | "cobranca" | "financeiro" | "clientes" | "cliente_detalhe"
  | "importar_vendas" | "nota_cliente" | "config_acesso" | "superadmin";

type Role = "admin" | "colaborador";
type Permissions = Record<string, boolean>;

const mainNavPages: Page[] = ["home", "carrinho", "fiados", "clientes", "financeiro", "profile"];

const pageParentMap: Partial<Record<Page, Page>> = {
  perfumaria: "carrinho",
  produto: "carrinho",
  confirmacao: "carrinho",
  cadastro: "profile",
  config_acesso: "profile",
  cobranca: "fiados",
  nota_cliente: "fiados",
  cliente_detalhe: "clientes",
};

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function can(role: Role, permissions: Permissions | null, key: string): boolean {
  if (role === "admin") return true;
  if (!permissions) return true;
  return permissions[key] !== false;
}

function Sidebar({ current, onNavigate, role, permissions, onLogout, lojaNome }: {
  current: Page; onNavigate: (p: Page) => void;
  role: Role; permissions: Permissions | null; onLogout: () => void; lojaNome: string;
}) {
  const activePage = pageParentMap[current] ?? current;
  const [vendasHoje, setVendasHoje] = useState<number | null>(null);
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem("loja_logo") || null);

  useEffect(() => {
    apiFetch("/dashboard")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setVendasHoje(parseFloat(d.vendasHoje?.soma ?? d.vendasHoje ?? 0)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onLogoUpdate = () => setLogo(localStorage.getItem("loja_logo") || null);
    window.addEventListener("logo_atualizado", onLogoUpdate);
    return () => window.removeEventListener("logo_atualizado", onLogoUpdate);
  }, []);

  const allTabs: { icon: string; label: string; page: Page; permKey?: string }[] = [
    { icon: "home", label: "Início", page: "home" },
    { icon: "add_shopping_cart", label: "Venda", page: "carrinho" },
    { icon: "receipt_long", label: "Fiados", page: "fiados", permKey: "ver_fiados" },
    { icon: "group", label: "Clientes", page: "clientes", permKey: "ver_clientes" },
    { icon: "account_balance_wallet", label: "Financeiro", page: "financeiro", permKey: "ver_financeiro" },
    { icon: "person", label: "Perfil", page: "profile", permKey: "ver_perfil" },
  ];

  const tabs = allTabs.filter(t => !t.permKey || can(role, permissions, t.permKey));

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen">
      <div className="px-5 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4d8063] flex items-center justify-center overflow-hidden shrink-0">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white text-xl">spa</span>
            )}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">{lojaNome}</h1>
            <p className="text-[10px] text-slate-400 font-medium">Gestão de Vendas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map((tab) => {
          const active = activePage === tab.page;
          return (
            <button
              key={tab.page}
              onClick={() => onNavigate(tab.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-[#4d8063] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${active ? "fill-icon" : ""}`}>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-2">
        <div className="bg-[#4d8063]/5 rounded-xl p-4 border border-[#4d8063]/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Vendas Hoje</p>
              <p className="text-lg font-bold text-[#4d8063]">
                {vendasHoje === null ? "—" : fmtBRL(vendasHoje)}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role === "admin" ? "bg-[#4d8063]/20 text-[#4d8063]" : "bg-orange-100 text-orange-600"}`}>
                {role === "admin" ? "Admin" : "Colaboradora"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sair
        </button>
      </div>
    </aside>
  );
}

function BottomNav({ current, onNavigate, role, permissions }: {
  current: Page; onNavigate: (p: Page) => void;
  role: Role; permissions: Permissions | null;
}) {
  if (!mainNavPages.includes(current)) return null;
  const activePage = pageParentMap[current] ?? current;

  const allTabs: { icon: string; label: string; page: Page; fab?: boolean; permKey?: string }[] = [
    { icon: "home", label: "Início", page: "home" },
    { icon: "receipt_long", label: "Fiados", page: "fiados", permKey: "ver_fiados" },
    { icon: "add_shopping_cart", label: "Venda", page: "carrinho", fab: true },
    { icon: "group", label: "Clientes", page: "clientes", permKey: "ver_clientes" },
    { icon: "account_balance_wallet", label: "Financeiro", page: "financeiro", permKey: "ver_financeiro" },
  ];

  const tabs = allTabs.filter(t => !t.permKey || can(role, permissions, t.permKey));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-stretch max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = activePage === tab.page;
          return (
            <button
              key={tab.page}
              onClick={() => onNavigate(tab.page)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 relative ${active ? "text-[#4d8063]" : "text-slate-400"}`}
            >
              {tab.fab ? (
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg -mt-5 bg-[#4d8063]">
                  <span className="material-symbols-outlined text-white text-2xl">{tab.icon}</span>
                </div>
              ) : (
                <span className={`material-symbols-outlined ${active ? "fill-icon" : ""}`}>{tab.icon}</span>
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [lojaNome, setLojaNome] = useState<string>(() => localStorage.getItem("auth_loja_nome") || "Minha Loja");
  const [authChecking, setAuthChecking] = useState(true);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("auth_role") as Role | null;
    const savedPerms = localStorage.getItem("auth_permissions");
    const savedNome = localStorage.getItem("auth_loja_nome");
    const token = getToken();
    if (savedRole && token) {
      setRole(savedRole);
      setPermissions(savedPerms ? JSON.parse(savedPerms) : null);
      if (savedNome) setLojaNome(savedNome);
    }
    setAuthChecking(false);
  }, []);

  const handleLogin = (r: Role, p: Permissions | null, nome: string) => {
    setRole(r);
    setPermissions(p);
    setLojaNome(nome);
  };

  const handleLogout = () => {
    clearToken();
    setRole(null);
    setPermissions(null);
    setLojaNome("Minha Loja");
    setPage("home");
  };

  const onNavigate = (p: string) => {
    const target = p as Page;
    if (role === "colaborador" && permissions) {
      const blocked: Record<Page, string> = {
        fiados: "ver_fiados",
        nota_cliente: "ver_fiados",
        cobranca: "ver_fiados",
        financeiro: "ver_financeiro",
        clientes: "ver_clientes",
        cliente_detalhe: "ver_clientes",
        importar_vendas: "importar_vendas",
        profile: "ver_perfil",
        config_acesso: "ver_perfil",
      } as Record<Page, string>;
      if (blocked[target] && !can(role, permissions, blocked[target])) return;
    }
    setPage(target);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f6f7f7] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#4d8063]">refresh</span>
      </div>
    );
  }

  if (showSuperAdmin) {
    return <SuperAdminPage onExit={() => setShowSuperAdmin(false)} />;
  }

  if (!role) {
    return (
      <div className="relative">
        <LoginPage onLogin={handleLogin} />
        <button
          onClick={() => setShowSuperAdmin(true)}
          className="fixed bottom-5 right-5 w-9 h-9 rounded-full bg-slate-200/60 hover:bg-slate-300/80 flex items-center justify-center transition-colors"
          title="Super Admin"
        >
          <span className="material-symbols-outlined text-slate-500 text-lg">admin_panel_settings</span>
        </button>
      </div>
    );
  }


  const canEditVendas = can(role, permissions, "editar_excluir_vendas");
  const canImportar = can(role, permissions, "importar_vendas");
  const canRegistrarHaver = can(role, permissions, "registrar_haver");

  return (
    <div className="flex min-h-screen">
      <Sidebar current={page} onNavigate={p => setPage(p)} role={role} permissions={permissions} onLogout={handleLogout} lojaNome={lojaNome} />
      <div className="flex-1 min-h-screen relative max-w-md mx-auto lg:max-w-none lg:mx-0">
        {page === "home" && <HomePage onNavigate={onNavigate} lojaNome={lojaNome} />}
        {page === "perfumaria" && <PerfumariaPage onNavigate={onNavigate} />}
        {page === "produto" && <ProdutoPage onNavigate={onNavigate} />}
        {page === "carrinho" && <CarrinhoPage onNavigate={onNavigate} />}
        {page === "confirmacao" && <ConfirmacaoPage onNavigate={onNavigate} />}
        {page === "profile" && <ProfilePage onNavigate={onNavigate} role={role} onLogout={handleLogout} />}
        {page === "cadastro" && <CadastroPage onNavigate={onNavigate} />}
        {page === "fiados" && <FiadosPage onNavigate={onNavigate} />}
        {page === "cobranca" && <CobrancaPage onNavigate={onNavigate} />}
        {page === "financeiro" && <FinanceiroPage onNavigate={onNavigate} canEdit={canEditVendas} />}
        {page === "clientes" && <ClientesPage onNavigate={onNavigate} />}
        {page === "cliente_detalhe" && <ClienteDetalhePage onNavigate={onNavigate} />}
        {page === "importar_vendas" && canImportar && <ImportarVendasPage onNavigate={onNavigate} />}
        {page === "nota_cliente" && <NotaClientePage onNavigate={onNavigate} />}
        {page === "config_acesso" && role === "admin" && <ConfigAcessoPage onNavigate={onNavigate} />}
        <BottomNav current={page} onNavigate={onNavigate} role={role} permissions={permissions} />
      </div>
    </div>
  );
}
