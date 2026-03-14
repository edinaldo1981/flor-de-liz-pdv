import { ArrowLeft, Pencil, Trash2, Plus, Package } from "lucide-react";
import { useEffect, useState } from "react";

interface ProdutoPageProps {
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

export default function ProdutoPage({ onNavigate }: ProdutoPageProps) {
  const [produto, setProduto] = useState<Produto | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("produto_detalhe");
      if (raw) setProduto(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const addToCart = () => {
    if (!produto) return;
    const item = [{
      id: produto.id,
      brand: produto.marca,
      name: produto.nome,
      price: produto.preco,
      qty: 1,
      img: produto.img_url || "",
    }];
    const existing = localStorage.getItem("carrinho_items");
    let cart = existing ? JSON.parse(existing) : [];
    const idx = cart.findIndex((c: { id: number }) => c.id === produto.id);
    if (idx >= 0) {
      cart[idx].qty += 1;
    } else {
      cart = [...cart, ...item];
    }
    localStorage.setItem("carrinho_items", JSON.stringify(cart));
    onNavigate("carrinho");
  };

  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    if (!produto) return;
    if (!window.confirm(`Excluir "${produto.marca} — ${produto.nome}"?`)) return;
    setDeleteError("");
    try {
      const resp = await fetch(`${API_BASE}/produtos/${produto.id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error();
      onNavigate("perfumaria");
    } catch {
      setDeleteError("Erro ao excluir produto. Tente novamente.");
    }
  };

  if (!produto) {
    return (
      <div className="bg-[#f6f7f7] min-h-screen max-w-md lg:max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 text-slate-400">
        <Package className="w-12 h-12" />
        <p className="text-sm">Nenhum produto selecionado</p>
        <button onClick={() => onNavigate("perfumaria")} className="bg-[#4d8063] text-white px-4 py-2 rounded-xl text-sm font-bold">
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f7f7] min-h-screen max-w-md lg:max-w-2xl mx-auto flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-3">
        <button onClick={() => onNavigate("perfumaria")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{produto.nome}</h1>
      </header>

      <main className="flex-1 pb-24">
        {/* Imagem */}
        <div className="bg-white">
          {produto.img_url ? (
            <div className="aspect-square w-full bg-slate-100">
              <img src={produto.img_url} alt={produto.nome} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-square w-full bg-slate-100 flex items-center justify-center">
              <Package className="w-20 h-20 text-slate-200" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="bg-white p-5 space-y-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-bold text-[#4d8063] uppercase tracking-widest">{produto.marca}</p>
            <h2 className="text-xl font-bold mt-1">{produto.nome}</h2>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-[#4d8063]">R$ {Number(produto.preco).toFixed(2).replace(".", ",")}</p>
          </div>
        </div>

        {/* Estoque */}
        <div className="bg-white mx-4 mt-4 rounded-xl p-4 border border-[#4d8063]/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${produto.estoque <= 3 ? "bg-orange-100" : "bg-emerald-100"}`}>
              <span className={`material-symbols-outlined text-xl ${produto.estoque <= 3 ? "text-orange-600" : "text-emerald-600"}`}>inventory_2</span>
            </div>
            <div>
              <p className="text-sm font-bold">Estoque Atual</p>
              <p className={`text-lg font-bold ${produto.estoque <= 3 ? "text-orange-600" : "text-emerald-600"}`}>
                {produto.estoque} unidade{produto.estoque !== 1 ? "s" : ""}
              </p>
            </div>
            {produto.estoque <= 3 && (
              <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full">ESTOQUE BAIXO</span>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="px-4 mt-4 space-y-3">
          <button
            onClick={addToCart}
            className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Adicionar à Venda
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                localStorage.setItem("produto_editar", JSON.stringify(produto));
                onNavigate("perfumaria");
              }}
              className="flex items-center justify-center gap-2 bg-white border border-[#4d8063]/20 rounded-xl py-3 text-[#4d8063] font-bold text-sm"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 bg-white border border-red-200 rounded-xl py-3 text-red-500 font-bold text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          </div>

          {deleteError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700 font-medium">{deleteError}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
