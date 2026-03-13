import { ArrowLeft, Trash2, Plus, Minus, Search, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CarrinhoPageProps {
  onNavigate: (page: string) => void;
}

interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
}

interface CartItem {
  id: number;
  brand: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}

const initialItems: CartItem[] = [
  { id: 1, brand: "Lily", name: "Eau de Parfum 75ml", price: 279.90, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD01thmBaw-85fXK4zO2J2FuRdJ4tQF0wtcFwOaxBG2RVGN0f40CNayvwufRTIB_0ALbCjjxzl8d9bQkofM_8BwR9XHsRsNS1yVLv3I1mXYtW7Gfx3kxcg8-MnHS5on2jHeANz7F_zdy44eCoU4DNET-WuTSEQlZXlRnhBVyI4XmKpHXEIX9vMzCjYeKIDqg6kid4TBQaUByuPK5krDCp57KdTLg0XtHw7Ixs_CvJXbUTU8rvvgl9rJnGau-oChr46GEDFmayEczBY" },
  { id: 2, brand: "Malbec", name: "Magnetic 100ml", price: 209.90, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrd-rSVAJULduK2Y2aNqQmHOcBw6FLSm8ede_yuKbqwYn89IdHPwf_SNfDhYkQodC0xIrFTJehi8RD1jIM5V3Oia9vJZBHg9W0vmLgEdVy90X0W7_Lp6DpJnLRX_bHLlefB5G3sVlydLqECvs8bITVlEzv1y7pV2ynAAMEePWMrJUgklG2vL52AJx3XxC9g3Te_fKzoYwMf3RK6HXtGELO9kga6tOdnm8xT0TwMzKdizDHdK6xYE3wLKB2MZe03nohZaSc4JQtYZg" },
];

const formasPagamento = [
  { key: "dinheiro", icon: "payments", label: "Dinheiro" },
  { key: "cartao", icon: "credit_card", label: "Cartão" },
  { key: "pix", icon: "qr_code", label: "Pix" },
  { key: "a_prazo", icon: "receipt_long", label: "A Prazo" },
];

const API_BASE = "/api-server/api";

export default function CarrinhoPage({ onNavigate }: CarrinhoPageProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [busca, setBusca] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [pagamento, setPagamento] = useState("pix");
  const [desconto, setDesconto] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalFinal = Math.max(0, total - desconto);
  const isAPrazo = pagamento === "a_prazo";
  const canFinalize = clienteSelecionado !== null && items.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes(busca);
    }, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    fetchClientes("");
  }, []);

  const fetchClientes = async (q: string) => {
    setLoadingClientes(true);
    try {
      const url = q ? `${API_BASE}/clientes?q=${encodeURIComponent(q)}` : `${API_BASE}/clientes`;
      const resp = await fetch(url);
      if (resp.ok) setClientes(await resp.json());
    } catch {
      // Network error - silently fail
    } finally {
      setLoadingClientes(false);
    }
  };

  const updateQty = (id: number, delta: number) =>
    setItems(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const handleConfirmar = async () => {
    if (!canFinalize) {
      setErro("Selecione um cliente antes de finalizar.");
      return;
    }
    setSubmitting(true);
    setErro("");
    try {
      const resp = await fetch(`${API_BASE}/vendas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteSelecionado!.id,
          items: items.map(i => ({ produto_id: i.id, nome: i.name, marca: i.brand, preco: i.price, qty: i.qty })),
          forma_pagamento: pagamento,
          total: totalFinal,
        }),
      });
      if (!resp.ok) throw new Error("Erro ao registrar venda");
      const venda = await resp.json();
      localStorage.setItem("ultima_venda", JSON.stringify({
        venda,
        cliente: clienteSelecionado,
        items,
        total: totalFinal,
        pagamento,
      }));
      onNavigate("confirmacao");
    } catch {
      setErro("Não foi possível registrar a venda. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f6f7f7] min-h-screen max-w-md mx-auto flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-3">
        <button onClick={() => onNavigate("home")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Nova Venda</h1>
          <p className="text-xs text-slate-500">{items.length} {items.length === 1 ? "produto" : "produtos"}</p>
        </div>
        <button onClick={() => onNavigate("perfumaria")} className="flex items-center gap-1 bg-[#4d8063]/10 text-[#4d8063] px-3 py-2 rounded-xl text-xs font-bold">
          <Plus className="w-3 h-3" /> Produto
        </button>
      </header>

      <main className="flex-1 pb-40 overflow-y-auto">

        {/* ── 1. Cliente ── */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cliente <span className="text-red-500">*</span>
            </h3>
            <button onClick={() => onNavigate("cadastro")} className="text-[#4d8063] text-xs font-bold flex items-center gap-1">
              <Plus className="w-3 h-3" /> Novo
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            <div className={`bg-white rounded-xl border ${clienteSelecionado ? "border-[#4d8063]" : "border-slate-200"} shadow-sm`}>
              {clienteSelecionado ? (
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063] font-bold text-sm shrink-0">
                    {clienteSelecionado.nome[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{clienteSelecionado.nome}</p>
                    {clienteSelecionado.telefone && <p className="text-xs text-slate-500">{clienteSelecionado.telefone}</p>}
                  </div>
                  <button onClick={() => { setClienteSelecionado(null); setBusca(""); setShowDropdown(true); }} className="text-slate-400 p-1">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center px-3 gap-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    className="flex-1 py-3 bg-transparent text-sm outline-none placeholder-slate-400"
                    placeholder="Buscar cliente pelo nome..."
                    value={busca}
                    onChange={e => { setBusca(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {loadingClientes && <span className="material-symbols-outlined text-slate-300 text-sm animate-spin">refresh</span>}
                </div>
              )}
            </div>

            {showDropdown && !clienteSelecionado && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white mt-1 rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                {clientes.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-4">Nenhum cliente encontrado</p>
                ) : (
                  clientes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setClienteSelecionado(c); setShowDropdown(false); setBusca(""); }}
                      className="w-full px-4 py-3 text-left hover:bg-[#4d8063]/5 border-b border-slate-100 last:border-0 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063] text-xs font-bold shrink-0">
                        {c.nome[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.nome}</p>
                        {c.telefone && <p className="text-xs text-slate-400">{c.telefone}</p>}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {!clienteSelecionado && (
            <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Obrigatório selecionar cliente para finalizar
            </p>
          )}
        </div>

        {/* ── 2. Itens ── */}
        <div className="px-4 pt-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Itens da Venda</h3>
          {items.length === 0 ? (
            <button onClick={() => onNavigate("perfumaria")} className="bg-white w-full rounded-xl border-2 border-dashed border-[#4d8063]/30 py-6 flex flex-col items-center gap-2 text-[#4d8063]">
              <span className="material-symbols-outlined text-3xl">add_shopping_cart</span>
              <p className="text-sm font-medium">Adicionar produtos ao catálogo</p>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-[#4d8063]/5 p-3 flex gap-3 shadow-sm">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#4d8063] uppercase">{item.brand}</p>
                    <p className="text-sm font-semibold leading-tight truncate">{item.name}</p>
                    <p className="text-[#4d8063] font-bold text-sm mt-0.5">
                      R$ {(item.price * item.qty).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => removeItem(item.id)} className="text-slate-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-[#4d8063] text-white flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Desconto ── */}
        <div className="px-4 pt-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Desconto (R$)</h3>
          <div className="bg-white rounded-xl border border-slate-200 flex items-center px-3 gap-2">
            <span className="material-symbols-outlined text-[#4d8063]">local_offer</span>
            <input
              type="number"
              min="0"
              max={total}
              className="flex-1 py-3 bg-transparent text-sm outline-none"
              placeholder="0,00"
              value={desconto || ""}
              onChange={e => setDesconto(Math.min(total, parseFloat(e.target.value) || 0))}
            />
          </div>
        </div>

        {/* ── 4. Pagamento ── */}
        <div className="px-4 pt-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Forma de Pagamento</h3>
          <div className="grid grid-cols-4 gap-2">
            {formasPagamento.map(f => (
              <button
                key={f.key}
                onClick={() => setPagamento(f.key)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-colors ${
                  pagamento === f.key ? "bg-[#4d8063] text-white border-[#4d8063]" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
          {isAPrazo && (
            <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
              <p className="text-xs text-orange-700 font-medium">Esta venda será registrada como fiado — aparecerá no controle de cobranças.</p>
            </div>
          )}
        </div>

        {/* ── 5. Resumo ── */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 border border-[#4d8063]/5 shadow-sm space-y-2">
          <h3 className="font-bold text-sm">Resumo</h3>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} itens)</span>
            <span>R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Desconto</span>
              <span className="text-emerald-600 font-medium">− R$ {desconto.toFixed(2).replace(".", ",")}</span>
            </div>
          )}
          <div className="border-t border-slate-100 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[#4d8063] text-lg">R$ {totalFinal.toFixed(2).replace(".", ",")}</span>
          </div>
          {pagamento !== "a_prazo" && (
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <span>Pagamento</span>
              <span className="font-semibold capitalize">{formasPagamento.find(f => f.key === pagamento)?.label}</span>
            </div>
          )}
        </div>

        {erro && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-[#4d8063]/10">
        <button
          onClick={handleConfirmar}
          disabled={!canFinalize || submitting}
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
            canFinalize && !submitting
              ? "bg-[#4d8063] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <><span className="material-symbols-outlined animate-spin">refresh</span> Registrando...</>
          ) : !clienteSelecionado ? (
            <><AlertCircle className="w-5 h-5" /> Selecione um cliente</>
          ) : (
            <><span className="material-symbols-outlined">{isAPrazo ? "receipt_long" : "check_circle"}</span>
              {isAPrazo ? "Registrar como Fiado" : `Confirmar Venda • R$ ${totalFinal.toFixed(2).replace(".", ",")}`}</>
          )}
        </button>
      </div>
    </div>
  );
}
