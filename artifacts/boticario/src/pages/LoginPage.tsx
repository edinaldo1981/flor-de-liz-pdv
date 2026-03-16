import { useState, useEffect } from "react";

interface LoginPageProps {
  onLogin: (role: "admin" | "colaborador", permissions: Record<string, boolean> | null) => void;
}

const API_BASE = "/api";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/auth/config`)
      .then(r => r.json())
      .then(d => {
        if (!d.configured) {
          onLogin("admin", null);
        }
      })
      .catch(() => onLogin("admin", null))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async () => {
    if (!password) { setErro("Informe a senha"); return; }
    setLoading(true);
    setErro("");
    try {
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok) { setErro(data.error || "Senha incorreta"); return; }
      localStorage.setItem("auth_role", data.role);
      localStorage.setItem("auth_permissions", JSON.stringify(data.permissions || {}));
      onLogin(data.role, data.permissions);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f6f7f7] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#4d8063]">refresh</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-[#4d8063] flex items-center justify-center shadow-xl mb-4">
            <span className="material-symbols-outlined text-white text-4xl">spa</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Flor de Liz</h1>
          <p className="text-slate-500 text-sm mt-1">Gestão de Vendas</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-700 mb-1">Bem-vinda de volta!</h2>
          <p className="text-sm text-slate-400 mb-5">Digite sua senha para acessar o app</p>

          <div className="mb-4">
            <label className="text-sm font-medium text-slate-600 block mb-1.5">Senha</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
              <input
                type={show ? "text" : "password"}
                className="w-full h-12 pl-10 pr-12 border border-slate-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#4d8063]/30 focus:border-[#4d8063]"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setErro(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">{show ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            {erro && <p className="text-red-500 text-xs mt-1.5">{erro}</p>}
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-[#4d8063] text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-colors hover:bg-[#3d6e54]"
          >
            {loading
              ? <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
              : <><span className="material-symbols-outlined text-xl">login</span> Entrar</>
            }
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Flor de Liz PDV · Acesso restrito</p>
      </div>
    </div>
  );
}
