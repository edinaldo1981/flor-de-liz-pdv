import { useState, useEffect } from "react";
import { Search, Pencil, Trash2, Users } from "lucide-react";

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

const API_BASE = "/api";

export default function ClientesPage({ onNavigate }: ClientesPageProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletando, setDeletando] = useState<number | null>(null);
  const [confirmarDel, setConfirmarDel] = useState<Cliente | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async (q = "") => {
    setLoading(true);
    try {
      const url = q ? `${API_BASE}/clientes?q=${encodeURIComponent(q)}` : `${API_BASE}/clientes`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setClientes(data);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchClientes(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleEditar = (c: Cliente) => {
    localStorage.setItem("cadastro_editar", JSON.stringify({
      id: c.id,
      nome: c.nome,
      telefone: c.telefone || "",
      whatsapp: c.whatsapp || "",
      email: c.email || "",
      cpf: c.cpf || "",
    }));
    onNavigate("cadastro");
  };

  const handleDeletar = async (c: Cliente) => {
    setDeletando(c.id);
    try {
      const res = await fetch(`${API_BASE}/clientes/${c.id}`, { method: "DELETE" });
      if (res.ok) {
        setClientes(prev => prev.filter(cl => cl.id !== c.id));
      }
    } catch { /* ignore */ } finally {
      setDeletando(null);
      setConfirmarDel(null);
    }
  };

  const initials = (nome: string) =>
    nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const phone = (c: Cliente) => c.whatsapp || c.telefone || "";

  return (
    <div className="bg-[#f6f7f7] min-h-screen flex flex-col max-w-md mx-auto lg:max-w-none">
      {/* Modal de confirmação */}
      {confirmarDel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir cliente?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Tem certeza que deseja excluir <strong>{confirmarDel.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarDel(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletar(confirmarDel)}
                disabled={deletando === confirmarDel.id}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm disabled:opacity-60"
              >
                {deletando === confirmarDel.id ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#4d8063]/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <h1 className="text-lg font-bold flex-1">Clientes</h1>
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
            <p className="text-sm font-medium text-slate-500">
              {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 xl:grid-cols-3">
          {clientes.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
            >
              {/* Avatar clicável para ver detalhes */}
              <button
                onClick={() => {
                  localStorage.setItem("cliente_detalhe_id", String(c.id));
                  onNavigate("cliente_detalhe");
                }}
                className="w-11 h-11 rounded-full bg-[#4d8063]/10 flex items-center justify-center shrink-0"
              >
                <span className="text-[#4d8063] font-bold text-sm">{initials(c.nome)}</span>
              </button>

              {/* Info clicável */}
              <button
                onClick={() => {
                  localStorage.setItem("cliente_detalhe_id", String(c.id));
                  onNavigate("cliente_detalhe");
                }}
                className="flex-1 min-w-0 text-left"
              >
                <p className="font-semibold text-slate-800 truncate">{c.nome}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {phone(c) || c.email || c.cpf || "—"}
                </p>
                {Number(c.fiados_abertos) > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">
                    {c.fiados_abertos} fiado{Number(c.fiados_abertos) !== 1 ? "s" : ""}
                  </span>
                )}
              </button>

              {/* Botões */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEditar(c)}
                  className="w-9 h-9 rounded-xl bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063]"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmarDel(c)}
                  className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
