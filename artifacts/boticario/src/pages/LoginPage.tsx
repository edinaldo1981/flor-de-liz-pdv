import { useState, useEffect } from "react";
import { setToken } from "@/lib/api";

interface LoginPageProps {
  onLogin: (role: "admin" | "colaborador", permissions: Record<string, boolean> | null, lojaNome: string) => void;
}

const API_BASE = "/api";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [slug, setSlug] = useState(() => localStorage.getItem("auth_slug") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setChecking(false);
  }, []);

  const handleLogin = async () => {
    if (!slug.trim()) { setErro("Informe o slug da sua loja"); return; }
    if (!password) { setErro("Informe a senha"); return; }
    setLoading(true);
    setErro("");
    try {
      const lojaSlug = slug.trim().toLowerCase();
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, slug: lojaSlug }),
      });
      const data = await r.json();
      if (!r.ok) { setErro(data.error || "Slug ou senha incorretos"); return; }
      if (data.token) setToken(data.token);
      const lojaNome = data.lojaNome || lojaSlug;
      localStorage.setItem("auth_role", data.role);
      localStorage.setItem("auth_permissions", JSON.stringify(data.permissions || {}));
      localStorage.setItem("auth_slug", lojaSlug);
      localStorage.setItem("auth_loja_nome", lojaNome);
      onLogin(data.role, data.permissions, lojaNome);
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
    <div className="min-h-screen bg-gradient-to-br from-[#f0f5f2] to-[#e8f0ec] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-[#4d8063] flex items-center justify-center shadow-xl mb-4">
            <span className="material-symbols-outlined text-white text-4xl">edit_note</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Anota Fácil</h1>
          <p className="text-slate-500 text-sm mt-1">Gestão de Vendas para Revendedoras</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-700 mb-1">Entrar na sua loja</h2>
          <p className="text-sm text-slate-400 mb-5">Digite o slug e senha da sua loja</p>

          <div className="mb-4">
            <label className="text-sm font-medium text-slate-600 block mb-1.5">Slug da loja</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">store</span>
              <input
                type="text"
                className="w-full h-12 pl-10 pr-4 border border-slate-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-[#4d8063]/30 focus:border-[#4d8063]"
                placeholder="ex: flordeliz"
                value={slug}
                onChange={e => { setSlug(e.target.value.toLowerCase().replace(/\s/g, "")); setErro(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>
          </div>

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

        <p className="text-center text-xs text-slate-400 mt-6">Anota Fácil · Acesso restrito</p>
      </div>
    </div>
  );
}
