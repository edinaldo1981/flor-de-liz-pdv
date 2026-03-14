import { ArrowLeft, ChevronRight, Pencil, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = "/api";

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [nome, setNome] = useState(() => localStorage.getItem("perfil_nome") || "Minha Loja");
  const [cargo, setCargo] = useState(() => localStorage.getItem("perfil_cargo") || "Revendedora • Flor de Liz");
  const [editando, setEditando] = useState(false);
  const [nomeTemp, setNomeTemp] = useState(nome);
  const [cargoTemp, setCargoTemp] = useState(cargo);

  const [stats, setStats] = useState({ vendas: 0, clientes: 0, fiados: 0, recebidoMes: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

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
            <p className="text-white/50 text-[11px] mt-1">Toque no lápis para editar</p>
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
      </div>
    </div>
  );
}
