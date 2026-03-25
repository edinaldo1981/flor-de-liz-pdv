import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
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

const PAGE_SIZE = 24;

export default function PerfumariaPage({ onNavigate }: PerfumariaPageProps) {
  const [search, setSearch] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selecionados, setSelecionados] = useState<Record<number, Produto>>({});
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Produto | null>(null);
  const [form, setForm] = useState({ marca: "", nome: "", preco: "", estoque: "", img_url: "" });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [imgPreview, setImgPreview] = useState<string>("");
  const [comprimindo, setComprimindo] = useState(false);

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      const cleanup = () => URL.revokeObjectURL(url);
      img.onload = () => {
        try {
          const MAX = 1200;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) { cleanup(); reject(new Error("Canvas não disponível")); return; }
          ctx.drawImage(img, 0, 0, w, h);
          cleanup();
          const supportsWebP = canvas.toDataURL("image/webp").startsWith("data:image/webp");
          const result = supportsWebP
            ? canvas.toDataURL("image/webp", 0.88)
            : canvas.toDataURL("image/jpeg", 0.88);
          resolve(result);
        } catch (e) { cleanup(); reject(e); }
      };
      img.onerror = () => { cleanup(); reject(new Error("Não foi possível carregar a imagem. Tente converter para JPG ou PNG.")); };
      img.src = url;
    });

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComprimindo(true);
    setErro("");
    try {
      const compressed = await compressImage(file);
      setImgPreview(compressed);
      setForm(prev => ({ ...prev, img_url: compressed }));
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao processar imagem.");
    } finally {
      setComprimindo(false);
    }
  };

  const fetchProdutos = useCallback(async (searchTerm: string, off: number, append = false) => {
    if (off === 0) setLoading(true); else setLoadingMore(true);
    try {
      const qs = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(off) });
      if (searchTerm.trim()) qs.set("q", searchTerm.trim());
      const resp = await apiFetch(`/produtos?${qs}`);
      if (resp.ok) {
        const data = await resp.json();
        const rows: Produto[] = data.rows ?? data;
        const tot: number = data.total ?? rows.length;
        setTotal(tot);
        setProdutos(prev => append ? [...prev, ...rows] : rows);
        setOffset(off + rows.length);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProdutos("", 0, false);
    try {
      const raw = localStorage.getItem("produto_editar");
      if (raw) {
        localStorage.removeItem("produto_editar");
        const p = JSON.parse(raw) as Produto;
        openForm(p);
      }
    } catch { /* ignore */ }
  }, [fetchProdutos]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProdutos(search, 0, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchProdutos]);

  const handleVerMais = () => {
    fetchProdutos(search, offset, true);
  };

  const temMais = produtos.length < total;

  const toggleSelecionado = (produto: Produto) => {
    setSelecionados(prev => {
      if (prev[produto.id]) {
        const { [produto.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [produto.id]: produto };
    });
  };

  const irParaVenda = () => {
    const novos = Object.values(selecionados).map(p => ({
      id: p.id, brand: p.marca, name: p.nome, price: p.preco, qty: 1, img: p.img_url || ""
    }));
    let cart: typeof novos = [];
    try {
      const raw = localStorage.getItem("carrinho_items");
      if (raw) cart = JSON.parse(raw);
    } catch { /* ignore */ }
    for (const novo of novos) {
      const idx = cart.findIndex(c => c.id === novo.id);
      if (idx >= 0) cart[idx].qty += 1;
      else cart.push(novo);
    }
    localStorage.setItem("carrinho_items", JSON.stringify(cart));
    onNavigate("carrinho");
  };

  const closeForm = () => {
    setShowForm(false);
    setSaving(false);
    setComprimindo(false);
    setErro("");
    setImgPreview("");
  };

  const openForm = (produto?: Produto) => {
    if (produto) {
      setEditando(produto);
      setForm({ marca: produto.marca, nome: produto.nome, preco: produto.preco.toString(), estoque: produto.estoque.toString(), img_url: produto.img_url || "" });
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
      const body = { marca: form.marca, nome: form.nome, preco: parseFloat(form.preco), estoque: parseInt(form.estoque) || 0, img_url: form.img_url || null };
      const url = editando ? `/produtos/${editando.id}` : `/produtos`;
      const method = editando ? "PUT" : "POST";
      const resp = await apiFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao salvar produto.");
      }
      closeForm();
      fetchProdutos(search, 0, false);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (produto: Produto) => {
    try {
      const resp = await apiFetch(`/produtos/${produto.id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error();
      setConfirmDelete(null);
      setSelecionados(prev => prev.filter(id => id !== produto.id));
      fetchProdutos(search, 0, false);
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
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-3 pb-24">
        <p className="text-xs text-slate-500 mb-3 font-medium">
          {loading ? "Carregando..." : `${total} produto${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
        </p>

        {!loading && produtos.length === 0 && (
          <div className="bg-white rounded-xl border-2 border-dashed border-[#4d8063]/20 py-10 flex flex-col items-center gap-3 text-[#4d8063]">
            <Package className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium text-slate-500">Nenhum produto cadastrado</p>
            <button onClick={() => openForm()} className="bg-[#4d8063] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Cadastrar Produto
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {produtos.map(p => {
                const selected = !!selecionados[p.id];
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
                          <img src={p.img_url} alt={p.nome} className="w-full h-full object-cover" loading="lazy" />
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
                        onClick={() => toggleSelecionado(p)}
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
                      <button onClick={() => openForm(p)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(p)} className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {temMais && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleVerMais}
                  disabled={loadingMore}
                  className="bg-white border border-[#4d8063]/30 text-[#4d8063] font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {loadingMore ? (
                    <><span className="material-symbols-outlined animate-spin text-base">refresh</span> Carregando...</>
                  ) : (
                    <>Ver mais {Math.min(PAGE_SIZE, total - produtos.length)} produtos</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {Object.keys(selecionados).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#4d8063]/10 z-10 max-w-md mx-auto lg:max-w-none lg:left-60 lg:mx-0">
          <button
            onClick={irParaVenda}
            className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {(() => { const n = Object.keys(selecionados).length; return `Ir para Venda (${n} ${n === 1 ? "item" : "itens"})`; })()}
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editando ? "Editar Produto" : "Novo Produto"}</h2>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
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

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-700">Foto do Produto (opcional)</span>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
                {comprimindo ? (
                  <div className="w-full h-24 rounded-xl border border-[#4d8063]/20 bg-[#4d8063]/5 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[#4d8063]">refresh</span>
                    <span className="text-xs font-medium text-[#4d8063]">Processando imagem...</span>
                  </div>
                ) : imgPreview ? (
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
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP — alta qualidade aceita</span>
                  </div>
                )}
              </label>
              {imgPreview && (
                <button type="button" onClick={() => { setImgPreview(""); setForm(prev => ({ ...prev, img_url: "" })); }} className="text-xs text-red-400 text-center mt-1">
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
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-sm">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
