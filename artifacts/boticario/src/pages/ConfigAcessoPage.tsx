import { useState, useEffect } from "react";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";

interface ConfigAcessoPageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = "/api";

const PERMISSOES = [
  { key: "ver_fiados", label: "Ver Fiados", icon: "receipt_long", desc: "Acessar a lista de fiados e notas de clientes" },
  { key: "ver_financeiro", label: "Ver Financeiro", icon: "account_balance_wallet", desc: "Ver relatórios financeiros e histórico de vendas" },
  { key: "ver_clientes", label: "Ver Clientes", icon: "group", desc: "Acessar cadastro e histórico de clientes" },
  { key: "editar_excluir_vendas", label: "Editar e Excluir Vendas", icon: "edit", desc: "Editar valor e excluir vendas registradas" },
  { key: "registrar_haver", label: "Registrar Haver", icon: "savings", desc: "Adicionar créditos de haver para clientes" },
  { key: "importar_vendas", label: "Importar do Caderno", icon: "upload_file", desc: "Importar vendas históricas em lote" },
  { key: "ver_perfil", label: "Ver Perfil e Configurações", icon: "person", desc: "Acessar o perfil e configurações do app" },
];

export default function ConfigAcessoPage({ onNavigate }: ConfigAcessoPageProps) {
  const [adminPass, setAdminPass] = useState("");
  const [adminPassAtual, setAdminPassAtual] = useState("");
  const [colaborPass, setColabPass] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showColab, setShowColab] = useState(false);
  const [showAtual, setShowAtual] = useState(false);

  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    ver_fiados: true,
    ver_financeiro: false,
    ver_clientes: true,
    editar_excluir_vendas: false,
    registrar_haver: true,
    importar_vendas: false,
    ver_perfil: false,
  });

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/auth/config`)
      .then(r => r.json())
      .then(d => {
        if (d.colaborador_permissions && Object.keys(d.colaborador_permissions).length > 0) {
          setPermissions(prev => ({ ...prev, ...d.colaborador_permissions }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSalvar = async () => {
    setErro("");
    setSucesso(false);
    setSalvando(true);
    try {
      const body: Record<string, unknown> = { colaborador_permissions: permissions };
      if (adminPass) body.admin_password = adminPass;
      if (colaborPass) body.colaborador_password = colaborPass;

      const r = await fetch(`${API_BASE}/auth/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.error || "Erro ao salvar."); return; }
      setSucesso(true);
      setAdminPass("");
      setColabPass("");
      setTimeout(() => setSucesso(false), 3000);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const toggle = (key: string) => setPermissions(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-[#f6f7f7] flex flex-col max-w-md lg:max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 bg-white border-b border-[#4d8063]/10">
        <div className="flex items-center px-4 py-3 gap-3">
          <button onClick={() => onNavigate("profile")} className="size-10 rounded-full hover:bg-[#4d8063]/10 text-[#4d8063] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">Controle de Acesso</h1>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-5 pb-32">

        {/* Senha Admin */}
        <div className="bg-white rounded-2xl border border-[#4d8063]/10 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-[#4d8063] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="font-bold text-sm">Senha da Administradora</h2>
              <p className="text-xs text-slate-500">Acesso total ao app</p>
            </div>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input
              type={showAdmin ? "text" : "password"}
              className="w-full h-11 pl-10 pr-10 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4d8063]/30"
              placeholder="Nova senha admin (deixe em branco para não alterar)"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
            />
            <button type="button" onClick={() => setShowAdmin(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showAdmin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Senha Colaboradora */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">badge</span>
            </div>
            <div>
              <h2 className="font-bold text-sm">Senha da Colaboradora</h2>
              <p className="text-xs text-slate-500">Acesso limitado conforme permissões abaixo</p>
            </div>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input
              type={showColab ? "text" : "password"}
              className="w-full h-11 pl-10 pr-10 border border-orange-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Nova senha colaboradora (deixe em branco para não alterar)"
              value={colaborPass}
              onChange={e => setColabPass(e.target.value)}
            />
            <button type="button" onClick={() => setShowColab(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showColab ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Permissões */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-orange-500 text-xl">tune</span>
            <h2 className="font-bold text-sm">O que a colaboradora pode acessar</h2>
          </div>
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-4">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {PERMISSOES.map(p => (
                <label key={p.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${permissions[p.key] ? "bg-[#4d8063]/10" : "bg-slate-100"}`}>
                    <span className={`material-symbols-outlined text-lg ${permissions[p.key] ? "text-[#4d8063]" : "text-slate-400"}`}>{p.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${permissions[p.key] ? "text-slate-800" : "text-slate-400"}`}>{p.label}</p>
                    <p className="text-xs text-slate-400 truncate">{p.desc}</p>
                  </div>
                  <div
                    onClick={() => toggle(p.key)}
                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${permissions[p.key] ? "bg-[#4d8063]" : "bg-slate-200"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${permissions[p.key] ? "translate-x-6" : "translate-x-0.5"}`} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Erro / Sucesso */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{erro}</div>
        )}
        {sucesso && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> Configurações salvas com sucesso!
          </div>
        )}

        {/* Botão Salvar */}
        <button
          onClick={handleSalvar}
          disabled={salvando}
          className="w-full h-12 bg-[#4d8063] text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {salvando
            ? <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
            : <><span className="material-symbols-outlined text-xl">save</span> Salvar Configurações</>
          }
        </button>

        <p className="text-center text-xs text-slate-400">
          As senhas ficam salvas de forma segura no banco de dados do app.
        </p>
      </main>
    </div>
  );
}
