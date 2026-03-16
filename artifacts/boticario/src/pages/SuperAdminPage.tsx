import { useState, useEffect } from "react";

const API_BASE = "/api";

interface Loja {
  id: number;
  nome: string;
  slug: string;
  status: string;
  plano: string;
  created_at: string;
  total_clientes: string;
  total_vendas: string;
  tem_senha: boolean;
  google_email: string | null;
  sheets_id: string | null;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function SuperAdminPage({ onExit }: { onExit: () => void }) {
  const [token, setToken] = useState(() => localStorage.getItem("superadmin_token") || "");
  const [password, setPassword] = useState("");
  const [loginErro, setLoginErro] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [modal, setModal] = useState<"criar" | "editar" | null>(null);
  const [editLoja, setEditLoja] = useState<Loja | null>(null);
  const [form, setForm] = useState({
    nome: "", slug: "", admin_password: "", colaborador_password: "", plano: "basico", google_email: "",
  });
  const [saving, setSaving] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [criandoPlanilha, setCriandoPlanilha] = useState<number | null>(null);
  const [planilhaMsgs, setPlanilhaMsgs] = useState<Record<number, { ok: boolean; texto: string; url?: string }>>({});

  useEffect(() => {
    if (token) fetchLojas();
  }, [token]);

  const fetchLojas = async () => {
    setLoadingLojas(true);
    try {
      const r = await fetch(`${API_BASE}/superadmin/lojas`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.status === 401) { setToken(""); localStorage.removeItem("superadmin_token"); return; }
      const d = await r.json();
      setLojas(d.lojas || []);
    } catch {} finally { setLoadingLojas(false); }
  };

  const handleLogin = async () => {
    if (!password) { setLoginErro("Informe a senha"); return; }
    setLoginLoading(true); setLoginErro("");
    try {
      const r = await fetch(`${API_BASE}/superadmin/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (!r.ok) { setLoginErro(d.error || "Senha incorreta"); return; }
      localStorage.setItem("superadmin_token", d.token);
      setToken(d.token);
    } catch { setLoginErro("Erro de conexão"); } finally { setLoginLoading(false); }
  };

  const handleCriar = async () => {
    if (!form.nome || !form.slug || !form.admin_password) { setErroForm("Preencha nome, slug e senha admin"); return; }
    setSaving(true); setErroForm("");
    try {
      const r = await fetch(`${API_BASE}/superadmin/lojas`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setErroForm(d.error || "Erro ao criar loja"); return; }
      setSuccessMsg(`Loja "${form.nome}" criada com sucesso!`);
      setModal(null);
      setForm({ nome: "", slug: "", admin_password: "", colaborador_password: "", plano: "basico", google_email: "" });
      fetchLojas();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch { setErroForm("Erro de conexão"); } finally { setSaving(false); }
  };

  const handleAtualizar = async () => {
    if (!editLoja) return;
    setSaving(true); setErroForm("");
    try {
      const body: any = { nome: form.nome, plano: form.plano, google_email: form.google_email };
      if (form.admin_password) body.admin_password = form.admin_password;
      const r = await fetch(`${API_BASE}/superadmin/lojas/${editLoja.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { setErroForm(d.error || "Erro ao atualizar"); return; }
      setSuccessMsg("Loja atualizada!");
      setModal(null); setEditLoja(null);
      fetchLojas();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch { setErroForm("Erro de conexão"); } finally { setSaving(false); }
  };

  const handleToggleStatus = async (loja: Loja) => {
    const novoStatus = loja.status === "ativo" ? "inativo" : "ativo";
    try {
      await fetch(`${API_BASE}/superadmin/lojas/${loja.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: novoStatus }),
      });
      fetchLojas();
    } catch {}
  };

  const handleCriarPlanilha = async (loja: Loja) => {
    if (!loja.google_email) {
      setPlanilhaMsgs(m => ({ ...m, [loja.id]: { ok: false, texto: "Adicione o e-mail Google da loja antes de criar a planilha." } }));
      return;
    }
    setCriandoPlanilha(loja.id);
    setPlanilhaMsgs(m => ({ ...m, [loja.id]: { ok: true, texto: "Criando planilha..." } }));
    try {
      const r = await fetch(`${API_BASE}/superadmin/lojas/${loja.id}/criar-planilha`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) {
        setPlanilhaMsgs(m => ({ ...m, [loja.id]: { ok: false, texto: d.error || "Erro ao criar planilha" } }));
        return;
      }
      const texto = d.compartilhado
        ? `Planilha criada e compartilhada com ${d.googleEmail}!`
        : `Planilha criada! ${d.erroCompartilhamento ? "Não foi possível compartilhar automaticamente — abra o link e compartilhe manualmente com " + d.googleEmail + "." : ""}`;
      setPlanilhaMsgs(m => ({ ...m, [loja.id]: { ok: true, texto, url: d.sheetUrl } }));
      fetchLojas();
    } catch {
      setPlanilhaMsgs(m => ({ ...m, [loja.id]: { ok: false, texto: "Erro de conexão" } }));
    } finally {
      setCriandoPlanilha(null);
    }
  };

  const openEditar = (loja: Loja) => {
    setEditLoja(loja);
    setForm({ nome: loja.nome, slug: loja.slug, admin_password: "", colaborador_password: "", plano: loja.plano, google_email: loja.google_email || "" });
    setErroForm("");
    setModal("editar");
  };

  const handleLogout = () => {
    localStorage.removeItem("superadmin_token");
    setToken("");
    setLojas([]);
    onExit();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg mb-4">
              <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
            </div>
            <h1 className="text-xl font-bold text-white">Super Admin</h1>
            <p className="text-slate-400 text-sm mt-1">Gestão de lojas</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Senha Master</label>
              <input
                type="password"
                className="w-full h-12 px-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-base outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setLoginErro(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                autoFocus
              />
              {loginErro && <p className="text-red-400 text-xs mt-1.5">{loginErro}</p>}
            </div>
            <button
              onClick={handleLogin} disabled={loginLoading}
              className="w-full h-12 bg-violet-600 text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors"
            >
              {loginLoading ? <span className="material-symbols-outlined animate-spin text-xl">refresh</span> : <><span className="material-symbols-outlined text-xl">login</span>Entrar</>}
            </button>
          </div>

          <button onClick={onExit} className="mt-4 w-full text-center text-slate-500 text-sm hover:text-slate-300">
            ← Voltar ao app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="font-bold text-base">Super Admin</h1>
            <p className="text-xs text-slate-400">Plataforma Anota Fácil</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setForm({ nome: "", slug: "", admin_password: "", colaborador_password: "", plano: "basico", google_email: "" }); setErroForm(""); setModal("criar"); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Nova Loja
          </button>
          <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      {successMsg && (
        <div className="mx-6 mt-4 bg-emerald-900/60 border border-emerald-700 text-emerald-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {successMsg}
        </div>
      )}

      <div className="px-6 py-4 grid grid-cols-3 gap-3">
        {[
          { icon: "store", label: "Total de Lojas", value: lojas.length },
          { icon: "check_circle", label: "Ativas", value: lojas.filter(l => l.status === "ativo").length },
          { icon: "table_chart", label: "Com Planilha", value: lojas.filter(l => !!l.sheets_id).length },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <span className="material-symbols-outlined text-violet-400 text-xl mb-2 block">{s.icon}</span>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-6 pb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base text-slate-200">Lojas Cadastradas</h2>
          <button onClick={fetchLojas} className="text-slate-400 hover:text-white p-1">
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </div>

        {loadingLojas ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-3xl text-violet-400">refresh</span>
          </div>
        ) : lojas.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-2 block">store</span>
            <p className="text-slate-400">Nenhuma loja cadastrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lojas.map(loja => (
              <div key={loja.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base">{loja.nome}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${loja.status === "ativo" ? "bg-emerald-900/60 text-emerald-400" : "bg-red-900/60 text-red-400"}`}>
                        {loja.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300">
                        {loja.plano}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5 font-mono">@{loja.slug}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                      <span><span className="material-symbols-outlined text-sm align-middle mr-0.5">group</span>{loja.total_clientes} clientes</span>
                      <span><span className="material-symbols-outlined text-sm align-middle mr-0.5">shopping_bag</span>{loja.total_vendas} vendas</span>
                      <span>Criada {fmtDate(loja.created_at)}</span>
                    </div>

                    {loja.google_email && (
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">mail</span>
                        {loja.google_email}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {loja.sheets_id ? (
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${loja.sheets_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <span className="material-symbols-outlined text-sm">table_chart</span>
                          Planilha conectada
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">table_chart</span>
                          Sem planilha
                        </span>
                      )}
                    </div>

                    {planilhaMsgs[loja.id] && (
                      <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${planilhaMsgs[loja.id].ok ? "bg-emerald-900/40 text-emerald-300" : "bg-red-900/40 text-red-400"}`}>
                        {planilhaMsgs[loja.id].texto}
                        {planilhaMsgs[loja.id].url && (
                          <a href={planilhaMsgs[loja.id].url} target="_blank" rel="noreferrer" className="ml-2 underline">
                            Abrir planilha
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditar(loja)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 rounded-lg text-xs font-medium hover:bg-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>Editar
                    </button>
                    <button
                      onClick={() => handleCriarPlanilha(loja)}
                      disabled={criandoPlanilha === loja.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/50 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-900/80 transition-colors disabled:opacity-50"
                    >
                      {criandoPlanilha === loja.id
                        ? <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                        : <span className="material-symbols-outlined text-sm">table_chart</span>
                      }
                      {loja.sheets_id ? "Recriar" : "Criar"} Planilha
                    </button>
                    <button
                      onClick={() => handleToggleStatus(loja)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        loja.status === "ativo"
                          ? "bg-red-900/40 text-red-400 hover:bg-red-900/70"
                          : "bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/70"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{loja.status === "ativo" ? "block" : "check_circle"}</span>
                      {loja.status === "ativo" ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">{modal === "criar" ? "Nova Loja" : "Editar Loja"}</h2>
              <button onClick={() => { setModal(null); setEditLoja(null); }} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Nome da loja</label>
                <input
                  type="text" placeholder="Ex: Perfumaria Bella"
                  className="w-full h-11 px-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                  value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                />
              </div>

              {modal === "criar" && (
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Slug (identificador único)</label>
                  <input
                    type="text" placeholder="Ex: bella"
                    className="w-full h-11 px-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm font-mono outline-none focus:ring-2 focus:ring-violet-500/50"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                  />
                  <p className="text-xs text-slate-500 mt-1">Login: slug + senha · Ex: bella / senha123</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Plano</label>
                <select
                  className="w-full h-11 px-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                  value={form.plano} onChange={e => setForm(f => ({ ...f, plano: e.target.value }))}
                >
                  <option value="basico">Básico</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">
                  {modal === "criar" ? "Senha Admin" : "Nova Senha Admin (deixe em branco para manter)"}
                </label>
                <input
                  type="password" placeholder="••••••••"
                  className="w-full h-11 px-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                  value={form.admin_password} onChange={e => setForm(f => ({ ...f, admin_password: e.target.value }))}
                />
              </div>

              {modal === "criar" && (
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Senha Colaboradora (opcional)</label>
                  <input
                    type="password" placeholder="••••••••"
                    className="w-full h-11 px-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/50"
                    value={form.colaborador_password} onChange={e => setForm(f => ({ ...f, colaborador_password: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">
                  <span className="material-symbols-outlined text-sm align-middle mr-1 text-emerald-400">table_chart</span>
                  E-mail Google (para criar/compartilhar planilha)
                </label>
                <input
                  type="email" placeholder="donadaloja@gmail.com"
                  className="w-full h-11 px-4 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  value={form.google_email} onChange={e => setForm(f => ({ ...f, google_email: e.target.value }))}
                />
                <p className="text-xs text-slate-500 mt-1">
                  A planilha será criada e compartilhada com este e-mail. Pode alterar depois.
                </p>
              </div>

              {erroForm && <p className="text-red-400 text-sm bg-red-900/30 rounded-lg px-3 py-2">{erroForm}</p>}

              <button
                onClick={modal === "criar" ? handleCriar : handleAtualizar}
                disabled={saving}
                className="w-full h-12 bg-violet-600 text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors"
              >
                {saving
                  ? <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
                  : <><span className="material-symbols-outlined text-xl">{modal === "criar" ? "add" : "save"}</span>{modal === "criar" ? "Criar Loja" : "Salvar"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
