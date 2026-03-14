import { useState, useEffect } from "react";
import { ArrowLeft, Search, UserPlus, Users } from "lucide-react";

interface ClientesPageProps {
  onNavigate: (page: string) => void;
}

interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  cpf?: string;
  fiados_abertos: number;
}

const API_BASE = "/api-server/api";

export default function ClientesPage({ onNavigate }: ClientesPageProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async (q = "") => {
    setLoading(true);
    try {
      const url = q ? `${API_BASE}/clientes?q=${encodeURIComponent(q)}` : `${API_BASE}/clientes`;
      const res = await fetch(url);
      if (res.ok) setClientes(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchClientes(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const initials = (nome: string) =>
    nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const phone = (c: Cliente) => c.whatsapp || c.telefone || "";

  return (
    <div className="bg-[#f6f7f7] min-h-screen flex flex-col max-w-md mx-auto lg:max-w-none">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#4d8063]/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => onNavigate("home")} className="p-1 text-slate-700 lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Clientes</h1>
          <button
            onClick={() => onNavigate("cadastro")}
            className="flex items-center gap-1.5 bg-[#4d8063] text-white px-3 py-2 rounded-xl text-xs font-bold"
          >
            <UserPlus className="w-3.5 h-3.5" /> Novo
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center rounded-xl bg-slate-100 px-3 h-10 gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400"
              placeholder="Buscar por nome, telefone ou CPF..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-3 pb-24">
        <p className="text-xs text-slate-500 mb-3 font-medium">
          {loading ? "Carregando..." : `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} cadastrado${clientes.length !== 1 ? "s" : ""}`}
        </p>

        {!loading && clientes.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-dashed border-[#4d8063]/20 py-12 flex flex-col items-center gap-3 text-[#4d8063]">
            <Users className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium text-slate-500">Nenhum cliente cadastrado</p>
            <button
              onClick={() => onNavigate("cadastro")}
              className="bg-[#4d8063] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" /> Cadastrar Cliente
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 xl:grid-cols-3">
          {clientes.map(c => (
            <button
              key={c.id}
              onClick={() => {
                localStorage.setItem("cliente_detalhe_id", String(c.id));
                onNavigate("cliente_detalhe");
              }}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 text-left hover:border-[#4d8063]/30 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-[#4d8063]/10 flex items-center justify-center shrink-0">
                <span className="text-[#4d8063] font-bold text-sm">{initials(c.nome)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{c.nome}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{phone(c) || c.email || c.cpf || "—"}</p>
              </div>
              <div className="shrink-0 text-right">
                {Number(c.fiados_abertos) > 0 ? (
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full">
                    {c.fiados_abertos} fiado{Number(c.fiados_abertos) !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-slate-300">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
