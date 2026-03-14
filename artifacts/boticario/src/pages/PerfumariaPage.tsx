import { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, Pencil, Trash2, X, Save, Package } from "lucide-react";

interface PerfumariaPageProps {
  onNavigate: (page: string) => void;
}

interface Produto {
  id: number;
  marca: string;
  nome: string;
  preco: number;
  estoque: number;
  img_url?: string;
}

const API_BASE = "/api";

export default function PerfumariaPage({ onNavigate }: PerfumariaPageProps) {
  const [search, setSearch] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Produto | null>(null);
  const [form, setForm] = useState({ marca: "", nome: "", preco: "", estoque: "", img_url: "" });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [imgPreview, setImgPreview] = useState<string>("");

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 400;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = url;
    });

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImgPreview(compressed);
    setForm(prev => ({ ...prev, img_url: compressed }));
  };

  useEffect(() => {
    fetchProdutos();
    try {
      const raw = localStorage.getItem("produto_editar");
      if (raw) {
        localStorage.removeItem("produto_editar");
        const p = JSON.parse(raw) as Produto;
        openForm(p);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/produtos`);
      if (resp.ok) setProdutos(await resp.json());
    } catch { /* silently fail */ } finally { setLoading(false); }
  };

  const filtered = produtos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.marca.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelecionado = (id: number) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const irParaVenda = () => {
    const novos = produtos
      .filter(p => selecionados.includes(p.id))
      .map(p => ({
        id: p.id,
        brand: p.marca,
        name: p.nome,
        price: p.preco,
        qty: 1,
        img: p.img_url || "",
      }));
    let cart: typeof novos = [];
    try {
      const raw = localStorage.getItem("carrinho_items");
      if (raw) cart = JSON.parse(raw);
    } catch { /* ignore */ }
    for (const novo of novos) {
      const idx = cart.findIndex(c => c.id === novo.id);
      if (idx >= 0) {
        cart[idx].qty += 1;
      } else {
        cart.push(novo);
      }
    }
    localStorage.setItem("carrinho_items", JSON.stringify(cart));
    onNavigate("carrinho");
  };

  const openForm = (produto?: Produto) => {
    if (produto) {
      setEditando(produto);
      setForm({
        marca: produto.marca,
        nome: produto.nome,
        preco: produto.preco.toString(),
        estoque: produto.estoque.toString(),
        img_url: produto.img_url || "",
      });
      setImgPreview(produto.img_url || "");
    } else {
      setEditando(null);
      setForm({ marca: "", nome: "", preco: "", estoque: "", img_url: "" });
      setImgPreview("");
    }
    setErro("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.marca.trim() || !form.nome.trim() || !form.preco.trim()) {
      setErro("Marca, nome e preço são obrigatórios.");
      return;
    }
    setSaving(true);
    setErro("");
    try {
      const body = {
        marca: form.marca,
        nome: form.nome,
        preco: parseFloat(form.preco),
        estoque: parseInt(form.estoque) || 0,
        img_url: form.img_url || null,
      };
      const url = editando ? `${API_BASE}/produtos/${editando.id}` : `${API_BASE}/produtos`;
      const method = editando ? "PUT" : "POST";
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error();
      setShowForm(false);
      fetchProdutos();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (produto: Produto) => {
    try {
      const resp = await fetch(`${API_BASE}/produtos/${produto.id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error();
      setConfirmDelete(null);
      setSelecionados(prev => prev.filter(id => id !== produto.id));
      fetchProdutos();
    } catch {
      setErro("Erro ao excluir produto.");
    }
  };

  return (
    <div className="bg-[#f6f7f7] min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b border-[#4d8063]/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => onNavigate("home")} className="p-1 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Catálogo de Produtos</h1>
          <button onClick={() => openForm()} className="flex items-center gap-1 bg-[#4d8063] text-white px-3 py-2 rounded-xl text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Novo
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center rounded-xl bg-slate-100 px-3 h-10 gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400"
              placeholder="Buscar produto ou marca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-3 pb-24">
        <p className="text-xs text-slate-500 mb-3 font-medium">
          {loading ? "Carregando..." : `${filtered.length} produto${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-dashed border-[#4d8063]/20 py-10 flex flex-col items-center gap-3 text-[#4d8063]">
            <Package className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium text-slate-500">Nenhum produto cadastrado</p>
            <button onClick={() => openForm()} className="bg-[#4d8063] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Cadastrar Produto
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(p => {
            const selected = selecionados.includes(p.id);
            return (
              <div key={p.id} className={`bg-white rounded-xl border ${selected ? "border-[#4d8063] ring-1 ring-[#4d8063]/30" : "border-[#4d8063]/5"} p-3 shadow-sm`}>
                <button
                  onClick={() => {
                    localStorage.setItem("produto_detalhe", JSON.stringify(p));
                    onNavigate("produto");
                  }}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                    {p.img_url ? (
                      <img src={p.img_url} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#4d8063] uppercase tracking-wider">{p.marca}</p>
                    <p className="text-sm font-semibold leading-tight mt-0.5 truncate">{p.nome}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[#4d8063] font-bold text-sm">R$ {Number(p.preco).toFixed(2).replace(".", ",")}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${p.estoque <= 3 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-700"}`}>
                        {p.estoque} un.
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleSelecionado(p.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      selected ? "bg-[#4d8063] text-white" : "bg-[#4d8063]/10 text-[#4d8063]"
                    }`}
                  >
                    {selected ? (
                      <><span className="material-symbols-outlined text-sm">check</span> Selecionado</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5" /> Adicionar à Venda</>
                    )}
                  </button>
                  <button
                    onClick={() => openForm(p)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selecionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#4d8063]/10 z-10 max-w-md mx-auto lg:max-w-none lg:left-60 lg:mx-0">
          <button
            onClick={irParaVenda}
            className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            Ir para Venda ({selecionados.length} {selecionados.length === 1 ? "item" : "itens"})
          </button>
        </div>
      )}

      {/* ── Modal Criar/Editar ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editando ? "Editar Produto" : "Novo Produto"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>

            {[
              { label: "Marca", key: "marca", placeholder: "Ex: O Boticário", type: "text" },
              { label: "Nome do Produto", key: "nome", placeholder: "Ex: Lily Eau de Parfum 75ml", type: "text" },
              { label: "Preço (R$)", key: "preco", placeholder: "0.00", type: "number" },
              { label: "Estoque (unidades)", key: "estoque", placeholder: "0", type: "number" },
            ].map(f => (
              <label key={f.key} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">{f.label}</span>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="border border-slate-200 rounded-lg h-11 px-3 text-sm outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </label>
            ))}

            {/* Foto — galeria do dispositivo */}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">Foto do Produto (opcional)</span>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImgChange}
                />
                {imgPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-[#4d8063]/20">
                    <img src={imgPreview} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">Trocar foto</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-xl border-2 border-dashed border-[#4d8063]/30 flex flex-col items-center justify-center gap-2 text-[#4d8063]/60 bg-[#4d8063]/5">
                    <Package className="w-7 h-7" />
                    <span className="text-xs font-medium">Toque para escolher da galeria</span>
                  </div>
                )}
              </label>
              {imgPreview && (
                <button
                  type="button"
                  onClick={() => { setImgPreview(""); setForm(prev => ({ ...prev, img_url: "" })); }}
                  className="text-xs text-red-400 text-center mt-1"
                >
                  Remover foto
                </button>
              )}
            </div>

            {erro && <p className="text-red-600 text-xs font-medium">{erro}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#4d8063] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <><span className="material-symbols-outlined animate-spin text-lg">refresh</span> Salvando...</>
              ) : (
                <><Save className="w-5 h-5" /> {editando ? "Salvar Alterações" : "Cadastrar Produto"}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal Confirmar Exclusão ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-bold text-lg">Excluir produto?</h3>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{confirmDelete.marca} — {confirmDelete.nome}</span> será removido permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-sm">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
