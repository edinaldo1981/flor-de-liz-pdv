import { ArrowLeft, ChevronRight, Pencil, Check, X, LogOut, ImagePlus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useState, useEffect, useRef } from "react";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  role?: "admin" | "colaborador";
  onLogout?: () => void;
}

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ProfilePage({ onNavigate, role = "admin", onLogout }: ProfilePageProps) {
  const [nome, setNome] = useState(() => localStorage.getItem("perfil_nome") || "Minha Loja");
  const [cargo, setCargo] = useState(() => localStorage.getItem("perfil_cargo") || ("Revendedora • " + (localStorage.getItem("auth_loja_nome") || "Minha Loja")));
  const [editando, setEditando] = useState(false);
  const [nomeTemp, setNomeTemp] = useState(nome);
  const [cargoTemp, setCargoTemp] = useState(cargo);

  const [stats, setStats] = useState({ vendas: 0, clientes: 0, fiados: 0, recebidoMes: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const [pixKey, setPixKey] = useState("");
  const [pixTemp, setPixTemp] = useState("");
  const [editandoPix, setEditandoPix] = useState(false);
  const [savingPix, setSavingPix] = useState(false);
  const [pixMsg, setPixMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem("loja_logo") || null);
  const [savingLogo, setSavingLogo] = useState(false);
  const [logoMsg, setLogoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch(`/config/pix`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.pixKey) { setPixKey(d.pixKey); setPixTemp(d.pixKey); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch(`/config/logo`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.logo) {
          setLogo(d.logo);
          localStorage.setItem("loja_logo", d.logo);
        }
      })
      .catch(() => {});
  }, []);

  const salvarPix = async () => {
    setSavingPix(true);
    setPixMsg(null);
    try {
      const r = await apiFetch(`/config/pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey: pixTemp.trim() }),
      });
      if (r.ok) {
        setPixKey(pixTemp.trim());
        setPixMsg({ ok: true, text: "Chave PIX salva!" });
        setEditandoPix(false);
      } else {
        setPixMsg({ ok: false, text: "Erro ao salvar." });
      }
    } catch {
      setPixMsg({ ok: false, text: "Erro de conexão." });
    } finally {
      setSavingPix(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setLogoMsg({ ok: false, text: "Imagem muito grande. Use até 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setSavingLogo(true);
      setLogoMsg(null);
      try {
        const r = await apiFetch(`/config/logo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logo: base64 }),
        });
        if (r.ok) {
          setLogo(base64);
          localStorage.setItem("loja_logo", base64);
          setLogoMsg({ ok: true, text: "Logo salvo com sucesso!" });
          window.dispatchEvent(new Event("logo_atualizado"));
        } else {
          setLogoMsg({ ok: false, text: "Erro ao salvar logo." });
        }
      } catch {
        setLogoMsg({ ok: false, text: "Erro de conexão." });
      } finally {
        setSavingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverLogo = async () => {
    setSavingLogo(true);
    setLogoMsg(null);
    try {
      const r = await apiFetch(`/config/logo`, { method: "DELETE" });
      if (r.ok) {
        setLogo(null);
        localStorage.removeItem("loja_logo");
        setLogoMsg({ ok: true, text: "Logo removido." });
        window.dispatchEvent(new Event("logo_atualizado"));
      }
    } catch {
      setLogoMsg({ ok: false, text: "Erro ao remover logo." });
    } finally {
      setSavingLogo(false);
    }
  };

  useEffect(() => {
    apiFetch(`/dashboard`)
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
    const c = cargoTemp.trim() || ("Revendedora • " + (localStorage.getItem("auth_loja_nome") || "Minha Loja"));
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
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40 overflow-hidden">
          {logo ? (
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          ) : nome === "Minha Loja" ? (
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

      {!loadingStats && stats.recebidoMes > 0 && (
        <div className="mx-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium">Recebido este mês</p>
            <p className="text-lg font-bold text-emerald-700">{fmtBRL(stats.recebidoMes)}</p>
          </div>
          <span className="material-symbols-outlined text-emerald-500 text-3xl">trending_up</span>
        </div>
      )}

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

        {/* Logo da Loja — apenas admin */}
        {role === "admin" && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border-b border-purple-100">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <ImagePlus className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-purple-800">Logo da Loja</p>
                <p className="text-[11px] text-purple-600">Aparece na sidebar e no perfil</p>
              </div>
            </div>
            <div className="px-4 py-3 space-y-3">
              {logoMsg && (
                <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${logoMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  <span className="material-symbols-outlined text-base">{logoMsg.ok ? "check_circle" : "error"}</span>
                  {logoMsg.text}
                </div>
              )}
              {logo && (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-purple-100 shrink-0">
                    <img src={logo} alt="Logo atual" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-2">Logo atual</p>
                    <button
                      onClick={handleRemoverLogo}
                      disabled={savingLogo}
                      className="flex items-center gap-1.5 text-xs text-red-500 font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover logo
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={savingLogo}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-600 font-bold py-3 rounded-xl text-sm hover:bg-purple-50 disabled:opacity-60 transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
                {savingLogo ? "Salvando..." : logo ? "Trocar imagem" : "Enviar logo"}
              </button>
              <p className="text-[10px] text-slate-400 text-center">PNG, JPG ou WEBP até 2MB</p>
            </div>
          </div>
        )}

        {/* Chave PIX — apenas admin */}
        {role === "admin" && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-b border-blue-100">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-blue-600 text-xl">qr_code</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-800">Chave PIX para Pagamento</p>
                <p className="text-[11px] text-blue-600">Exibida no portal do cliente e no checkout</p>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {pixMsg && (
                <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${pixMsg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  <span className="material-symbols-outlined text-base">{pixMsg.ok ? "check_circle" : "error"}</span>
                  {pixMsg.text}
                </div>
              )}
              {editandoPix ? (
                <>
                  <input
                    className="w-full border border-slate-200 rounded-xl h-11 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="CPF, telefone, e-mail ou chave aleatória"
                    value={pixTemp}
                    onChange={e => setPixTemp(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditandoPix(false); setPixTemp(pixKey); }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={salvarPix}
                      disabled={savingPix}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-60"
                    >
                      {savingPix ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {pixKey ? (
                    <div className="bg-slate-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <span className="flex-1 text-sm font-mono text-slate-700 break-all">{pixKey}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-1">Nenhuma chave configurada</p>
                  )}
                  <button
                    onClick={() => { setEditandoPix(true); setPixMsg(null); }}
                    className="w-full py-2.5 rounded-xl border border-blue-200 text-blue-600 font-bold text-sm bg-blue-50"
                  >
                    {pixKey ? "Alterar Chave PIX" : "Configurar Chave PIX"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

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
