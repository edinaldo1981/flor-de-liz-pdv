import { ArrowLeft, ChevronRight, Pencil, Check, X, RefreshCw, ExternalLink, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  role?: "admin" | "colaborador";
  onLogout?: () => void;
}

const API_BASE = "/api";

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ProfilePage({ onNavigate, role = "admin", onLogout }: ProfilePageProps) {
  const [nome, setNome] = useState(() => localStorage.getItem("perfil_nome") || "Minha Loja");
  const [cargo, setCargo] = useState(() => localStorage.getItem("perfil_cargo") || "Revendedora • Flor de Liz");
  const [editando, setEditando] = useState(false);
  const [nomeTemp, setNomeTemp] = useState(nome);
  const [cargoTemp, setCargoTemp] = useState(cargo);

  const [stats, setStats] = useState({ vendas: 0, clientes: 0, fiados: 0, recebidoMes: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/sheets/status`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.spreadsheetId) setSheetUrl(`https://docs.google.com/spreadsheets/d/${d.spreadsheetId}`); })
      .catch(() => {});
  }, []);

  const sincronizarSheets = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const r = await fetch(`${API_BASE}/sheets/sync`, { method: "POST" });
      const d = await r.json();
      if (r.ok && d.ok) {
        setSheetUrl(d.sheetUrl);
        setSyncMsg({ ok: true, text: "Sincronizado com sucesso!" });
      } else {
        setSyncMsg({ ok: false, text: d.error || "Erro ao sincronizar." });
      }
    } catch {
      setSyncMsg({ ok: false, text: "Erro de conexão." });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/dashboard`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setStats({
          vendas: d.vendasHoje?.qtd ?? 0,
          clientes: d.totalClientes ?? 0,
          fiados: d.fiadosAbertos?.clientes ?? 0,
          recebidoMes: parseFloat(d.recebidoMes ?? 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const salvarPerfil = () => {
    const n = nomeTemp.trim() || "Minha Loja";
    const c = cargoTemp.trim() || "Revendedora • Flor de Liz";
    setNome(n);
    setCargo(c);
    localStorage.setItem("perfil_nome", n);
    localStorage.setItem("perfil_cargo", c);
    setEditando(false);
  };

  const cancelarEdicao = () => {
    setNomeTemp(nome);
    setCargoTemp(cargo);
    setEditando(false);
  };

  const initials = nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  return (
    <div className="bg-[#f6f7f7] min-h-screen pb-8 max-w-md lg:max-w-2xl mx-auto">
      <header className="bg-white border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-4">
        <button onClick={() => onNavigate("home")} className="p-1 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Meu Perfil</h1>
        <button
          onClick={() => { setNomeTemp(nome); setCargoTemp(cargo); setEditando(true); }}
          className="p-2 rounded-xl bg-[#4d8063]/10 text-[#4d8063]"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </header>

      {/* Hero */}
      <div className="bg-[#4d8063] text-white px-6 py-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40">
          {nome === "Minha Loja" ? (
            <span className="material-symbols-outlined text-5xl">spa</span>
          ) : (
            <span className="text-3xl font-bold">{initials}</span>
          )}
        </div>

        {editando ? (
          <div className="w-full max-w-xs flex flex-col gap-2">
            <input
              className="w-full rounded-xl px-3 py-2 text-slate-800 text-sm font-semibold text-center outline-none"
              value={nomeTemp}
              onChange={e => setNomeTemp(e.target.value)}
              placeholder="Seu nome"
              maxLength={50}
            />
            <input
              className="w-full rounded-xl px-3 py-2 text-slate-600 text-xs text-center outline-none"
              value={cargoTemp}
              onChange={e => setCargoTemp(e.target.value)}
              placeholder="Cargo ou função"
              maxLength={60}
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={cancelarEdicao}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button
                onClick={salvarPerfil}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-[#4d8063] text-sm font-semibold"
              >
                <Check className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold">{nome}</h2>
            <p className="text-white/70 text-sm mt-0.5">{cargo}</p>
            <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full mt-2 ${role === "admin" ? "bg-white/30 text-white" : "bg-orange-400/60 text-white"}`}>
              {role === "admin" ? "Administradora" : "Colaboradora"}
            </span>
          </div>
        )}
      </div>

      {/* Stats reais */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => onNavigate("financeiro")}
          className="bg-white rounded-xl p-3 text-center border border-[#4d8063]/10 shadow-sm"
        >
          <p className="text-xl font-bold text-[#4d8063]">
            {loadingStats ? "—" : stats.vendas}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Vendas Hoje</p>
        </button>
        <button
          onClick={() => onNavigate("clientes")}
          className="bg-white rounded-xl p-3 text-center border border-[#4d8063]/10 shadow-sm"
        >
          <p className="text-xl font-bold text-[#4d8063]">
            {loadingStats ? "—" : stats.clientes}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Clientes</p>
        </button>
        <button
          onClick={() => onNavigate("fiados")}
          className="bg-white rounded-xl p-3 text-center border border-[#4d8063]/10 shadow-sm"
        >
          <p className={`text-xl font-bold ${stats.fiados > 0 ? "text-red-500" : "text-[#4d8063]"}`}>
            {loadingStats ? "—" : stats.fiados}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Fiados</p>
        </button>
      </div>

      {/* Recebido no mês */}
      {!loadingStats && stats.recebidoMes > 0 && (
        <div className="mx-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium">Recebido este mês</p>
            <p className="text-lg font-bold text-emerald-700">{fmtBRL(stats.recebidoMes)}</p>
          </div>
          <span className="material-symbols-outlined text-emerald-500 text-3xl">trending_up</span>
        </div>
      )}

      {/* Menu de Navegação */}
      <div className="px-4 space-y-2">
        {[
          { icon: "add_shopping_cart", label: "Nova Venda", sub: "Registrar uma venda", page: "carrinho" },
          { icon: "menu_book", label: "Importar do Caderno", sub: "Registrar vendas passadas em lote", page: "importar_vendas" },
          { icon: "person_add", label: "Cadastrar Cliente", sub: "Novo cliente ou devedor", page: "cadastro" },
          { icon: "receipt_long", label: "Controle de Fiados", sub: "Ver e registrar fiados em aberto", page: "fiados" },
          { icon: "account_balance_wallet", label: "Financeiro", sub: "Resumo por marca e período", page: "financeiro" },
          { icon: "task_alt", label: "Cobranças", sub: "Registrar e acompanhar cobranças", page: "cobranca" },
          { icon: "inventory_2", label: "Catálogo de Produtos", sub: "Ver e gerenciar produtos", page: "perfumaria" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className="bg-white w-full rounded-xl p-4 flex items-center gap-4 shadow-sm border border-[#4d8063]/5 text-left"
          >
            <div className="bg-[#4d8063]/10 p-2.5 rounded-xl shrink-0">
              <span className="material-symbols-outlined text-[#4d8063]">{item.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-slate-500 truncate">{item.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        ))}

        {/* Controle de Acesso — apenas admin */}
        {role === "admin" && (
          <button
            onClick={() => onNavigate("config_acesso")}
            className="bg-white w-full rounded-xl p-4 flex items-center gap-4 shadow-sm border border-[#4d8063]/5 text-left"
          >
            <div className="bg-orange-100 p-2.5 rounded-xl shrink-0">
              <span className="material-symbols-outlined text-orange-500">admin_panel_settings</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Controle de Acesso</p>
              <p className="text-xs text-slate-500 truncate">Senhas e permissões de colaboradora</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        )}

        {/* Google Sheets Backup */}
        <div className="mt-2 bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <rect width="24" height="24" rx="4" fill="#0F9D58"/>
                <rect x="5" y="4" width="14" height="16" rx="1" fill="white"/>
                <rect x="7" y="7" width="10" height="1.5" rx="0.5" fill="#0F9D58"/>
                <rect x="7" y="10" width="10" height="1.5" rx="0.5" fill="#0F9D58"/>
                <rect x="7" y="13" width="7" height="1.5" rx="0.5" fill="#0F9D58"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">Backup Google Sheets</p>
              <p className="text-[11px] text-emerald-600">Clientes, vendas e fiados na sua planilha</p>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2.5">
            {syncMsg && (
              <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${syncMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                <span className="material-symbols-outlined text-base">{syncMsg.ok ? "check_circle" : "error"}</span>
                {syncMsg.text}
              </div>
            )}

            <button
              onClick={sincronizarSheets}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando..." : sheetUrl ? "Sincronizar Agora" : "Criar Planilha e Sincronizar"}
            </button>

            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-emerald-200 text-emerald-700 font-semibold py-2.5 rounded-xl text-sm bg-emerald-50"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Planilha no Google Sheets
              </a>
            )}
          </div>
        </div>
        {/* Botão Sair */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            Sair do App
          </button>
        )}
      </div>
    </div>
  );
}
