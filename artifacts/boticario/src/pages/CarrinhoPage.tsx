import { ArrowLeft, Trash2, Plus, Minus, Search, AlertCircle, Package, ShoppingCart, Copy, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface CarrinhoPageProps {
  onNavigate: (page: string) => void;
}

interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
}

interface CartItem {
  id: number;
  brand: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}

interface Produto {
  id: number;
  marca: string;
  nome: string;
  preco: number;
  estoque: number;
  img_url?: string;
}

const formasPagamento = [
  { key: "dinheiro", icon: "payments", label: "Dinheiro" },
  { key: "cartao", icon: "credit_card", label: "Cartão" },
  { key: "pix", icon: "qr_code", label: "Pix" },
  { key: "a_prazo", icon: "receipt_long", label: "A Prazo" },
];

function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildPixPayload(pixKey: string, amount: number, merchantName: string): string {
  const f = (id: string, value: string) => `${id}${value.length.toString().padStart(2, "0")}${value}`;
  const gui = f("00", "br.gov.bcb.pix") + f("01", pixKey);
  const merchantAccountInfo = f("26", gui);
  const name = merchantName.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 25).toUpperCase() || "LOJA";
  const txid = f("05", "***");
  const additionalData = f("62", txid);
  const payload =
    f("00", "01") +
    merchantAccountInfo +
    f("52", "0000") +
    f("53", "986") +
    f("54", amount.toFixed(2)) +
    f("58", "BR") +
    f("59", name) +
    f("60", "BRASIL") +
    additionalData;
  return payload + f("63", crc16(payload + "6304"));
}

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem("carrinho_items");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { }
  return [];
}

export default function CarrinhoPage({ onNavigate }: CarrinhoPageProps) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchProd, setSearchProd] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [busca, setBusca] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [pagamento, setPagamento] = useState("pix");
  const [desconto, setDesconto] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [showPixModal, setShowPixModal] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lojaNome = localStorage.getItem("auth_loja_nome") || "Loja";
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalFinal = Math.max(0, total - desconto);
  const isAPrazo = pagamento === "a_prazo";
  const isPix = pagamento === "pix";
  const canFinalize = clienteSelecionado !== null && items.length > 0;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const filteredProd = produtos.filter(p =>
    p.nome.toLowerCase().includes(searchProd.toLowerCase()) ||
    p.marca.toLowerCase().includes(searchProd.toLowerCase())
  );

  useEffect(() => {
    fetchProdutos();
    fetchClientes("");
    apiFetch("/config/pix")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.pixKey) setPixKey(d.pixKey); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchClientes(busca), 300);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    localStorage.setItem("carrinho_items", JSON.stringify(items));
  }, [items]);

  const fetchProdutos = async () => {
    try {
      const r = await apiFetch(`/produtos?limit=100`);
      if (r.ok) {
        const data = await r.json();
        setProdutos(data.rows ?? data);
      }
    } catch { }
  };

  const fetchClientes = async (q: string) => {
    setLoadingClientes(true);
    try {
      const url = q ? `/clientes?q=${encodeURIComponent(q)}` : `/clientes`;
      const r = await apiFetch(url);
      if (r.ok) setClientes(await r.json());
    } catch { } finally { setLoadingClientes(false); }
  };

  const addToCart = (p: Produto) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === p.id);
      if (idx >= 0) return prev.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, brand: p.marca, name: p.nome, price: Number(p.preco), qty: 1, img: p.img_url || "" }];
    });
  };

  const updateQty = (id: number, delta: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const handleConfirmar = async () => {
    if (!canFinalize) { setErro("Selecione um cliente antes de finalizar."); return; }
    setSubmitting(true);
    setErro("");
    try {
      const resp = await apiFetch(`/vendas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteSelecionado!.id,
          items: items.map(i => ({ produto_id: i.id, nome: i.name, marca: i.brand, preco: i.price, qty: i.qty })),
          forma_pagamento: pagamento,
          total: totalFinal,
        }),
      });
      if (!resp.ok) throw new Error();
      const venda = await resp.json();
      localStorage.setItem("ultima_venda", JSON.stringify({ venda, cliente: clienteSelecionado, items, total: totalFinal, pagamento }));
      localStorage.removeItem("carrinho_items");
      setItems([]);
      setShowPixModal(false);
      onNavigate("confirmacao");
    } catch {
      setErro("Não foi possível registrar a venda. Tente novamente.");
      setShowPixModal(false);
    } finally { setSubmitting(false); }
  };

  const handleClickConfirmar = () => {
    if (!canFinalize) { setErro("Selecione um cliente antes de finalizar."); return; }
    if (isPix && pixKey) {
      setShowPixModal(true);
    } else {
      handleConfirmar();
    }
  };

  const pixPayload = pixKey ? buildPixPayload(pixKey, totalFinal, lojaNome) : "";

  const copiarPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      });
    }
  };

  return (
    <div className="bg-[#f6f7f7] min-h-screen flex flex-col">

      <header className="sticky top-0 z-20 bg-white border-b border-[#4d8063]/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => onNavigate("home")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold flex-1">Nova Venda</h1>
        {totalQty > 0 && (
          <span className="bg-[#4d8063] text-white text-xs font-bold px-2 py-1 rounded-full">
            R$ {totalFinal.toFixed(2).replace(".", ",")}
          </span>
        )}
      </header>

      <div className="flex gap-0 border-b border-slate-200" style={{ height: 300 }}>
        <div className="flex flex-col w-1/2 border-r border-slate-200 bg-white">
          <div className="flex items-center gap-1.5 px-2 py-2 border-b border-slate-100">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              className="flex-1 text-xs outline-none placeholder-slate-400 bg-transparent"
              placeholder="Buscar produto..."
              value={searchProd}
              onChange={e => setSearchProd(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredProd.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-300">
                <Package className="w-8 h-8" />
                <p className="text-xs">Sem produtos</p>
              </div>
            ) : (
              filteredProd.map(p => {
                const inCart = items.find(i => i.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="w-full flex items-center gap-2 px-2 py-2 border-b border-slate-50 hover:bg-[#4d8063]/5 active:bg-[#4d8063]/10 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                      {p.img_url
                        ? <img src={p.img_url} alt={p.nome} className="w-full h-full object-cover" />
                        : <Package className="w-4 h-4 text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-[#4d8063] uppercase leading-none truncate">{p.marca}</p>
                      <p className="text-[11px] font-semibold leading-tight truncate mt-0.5">{p.nome}</p>
                      <p className="text-[11px] text-[#4d8063] font-bold">R$ {Number(p.preco).toFixed(2).replace(".", ",")}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${inCart ? "bg-[#4d8063]" : "bg-[#4d8063]/15"}`}>
                      {inCart
                        ? <span className="text-white text-[10px] font-bold">{inCart.qty}</span>
                        : <Plus className="w-3 h-3 text-[#4d8063]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col w-1/2 bg-white">
          <div className="px-3 py-2 border-b border-slate-100 bg-[#4d8063]/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-[#4d8063]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Carrinho</span>
              </div>
              <span className="text-[10px] text-slate-400">{totalQty} {totalQty === 1 ? "item" : "itens"}</span>
            </div>
            <p className="text-base font-bold text-[#4d8063] mt-0.5">R$ {totalFinal.toFixed(2).replace(".", ",")}</p>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 214 }}>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-1.5 text-slate-300 py-4">
                <ShoppingCart className="w-7 h-7" />
                <p className="text-[10px] text-center leading-tight">Clique nos produtos<br />para adicionar</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-[#4d8063] uppercase truncate leading-none">{item.brand}</p>
                    <p className="text-[10px] font-semibold truncate leading-tight">{item.name}</p>
                    <p className="text-[10px] text-[#4d8063] font-bold">R$ {(item.price * item.qty).toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 rounded-full bg-[#4d8063] text-white flex items-center justify-center">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-5 h-5 flex items-center justify-center text-slate-300 ml-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
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
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063] font-bold text-xs shrink-0">
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
                    className="flex-1 py-2.5 bg-transparent text-sm outline-none placeholder-slate-400"
                    placeholder="Buscar cliente..."
                    value={busca}
                    onChange={e => { setBusca(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {loadingClientes && <span className="material-symbols-outlined text-slate-300 text-sm animate-spin">refresh</span>}
                </div>
              )}
            </div>

            {showDropdown && !clienteSelecionado && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white mt-1 rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-44 overflow-y-auto">
                {clientes.length === 0
                  ? <p className="text-center text-sm text-slate-400 py-4">Nenhum cliente encontrado</p>
                  : clientes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setClienteSelecionado(c); setShowDropdown(false); setBusca(""); }}
                      className="w-full px-4 py-2.5 text-left hover:bg-[#4d8063]/5 border-b border-slate-100 last:border-0 flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063] text-xs font-bold shrink-0">
                        {c.nome[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.nome}</p>
                        {c.telefone && <p className="text-xs text-slate-400">{c.telefone}</p>}
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
          {!clienteSelecionado && (
            <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Obrigatório selecionar cliente para finalizar
            </p>
          )}
        </div>

        <div className="px-4 pt-2">
          <div className="bg-white rounded-xl border border-slate-200 flex items-center px-3 gap-2">
            <span className="material-symbols-outlined text-[#4d8063] text-lg">local_offer</span>
            <input
              type="number"
              min="0"
              max={total}
              className="flex-1 py-2.5 bg-transparent text-sm outline-none"
              placeholder="Desconto (R$)"
              value={desconto || ""}
              onChange={e => setDesconto(Math.min(total, parseFloat(e.target.value) || 0))}
            />
          </div>
        </div>

        <div className="px-4 pt-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Forma de Pagamento</h3>
          <div className="grid grid-cols-4 gap-2">
            {formasPagamento.map(f => (
              <button
                key={f.key}
                onClick={() => setPagamento(f.key)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-bold transition-colors ${pagamento === f.key ? "bg-[#4d8063] text-white border-[#4d8063]" : "bg-white text-slate-600 border-slate-200"
                  }`}
              >
                <span className="material-symbols-outlined text-base">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
          {isAPrazo && (
            <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <p className="text-xs text-orange-700 font-medium">Será registrado como fiado.</p>
            </div>
          )}
        </div>

        {erro && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        )}

        <div className="px-4 pt-4">
          <button
            onClick={handleClickConfirmar}
            disabled={!canFinalize || submitting}
            className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${canFinalize && !submitting
              ? "bg-[#4d8063] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
          >
            {submitting ? (
              <><span className="material-symbols-outlined animate-spin">refresh</span> Registrando...</>
            ) : items.length === 0 ? (
              <><Package className="w-5 h-5" /> Selecione produtos</>
            ) : !clienteSelecionado ? (
              <><AlertCircle className="w-5 h-5" /> Selecione um cliente</>
            ) : (
              <><span className="material-symbols-outlined">{isAPrazo ? "receipt_long" : isPix ? "qr_code" : "check_circle"}</span>
                {isAPrazo ? "Registrar como Fiado" : isPix ? `Gerar QR Code PIX • R$ ${totalFinal.toFixed(2).replace(".", ",")}` : `Confirmar Venda • R$ ${totalFinal.toFixed(2).replace(".", ",")}`}</>
            )}
          </button>
        </div>
      </div>

      {/* Modal PIX QR Code */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center sm:items-center">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 flex flex-col items-center gap-4">
            <div className="w-10 h-1 bg-slate-200 rounded-full mb-1 sm:hidden" />
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4d8063] text-2xl">qr_code</span>
              <h2 className="text-lg font-bold text-slate-800">Pagamento PIX</h2>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-[#4d8063]">R$ {totalFinal.toFixed(2).replace(".", ",")}</p>
              <p className="text-sm text-slate-500 mt-1">para {clienteSelecionado?.nome}</p>
            </div>

            {pixPayload ? (
              <div className="bg-white border-4 border-[#4d8063]/20 rounded-2xl p-3">
                <QRCodeSVG value={pixPayload} size={200} level="M" />
              </div>
            ) : (
              <div className="bg-slate-100 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-400">qr_code</span>
                <p className="text-xs text-slate-400 mt-2">Chave PIX não configurada</p>
              </div>
            )}

            <div className="w-full bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">Chave PIX</p>
                <p className="text-sm font-mono text-slate-700 truncate">{pixKey || "Não configurada"}</p>
              </div>
              {pixKey && (
                <button onClick={copiarPix} className="shrink-0 p-2 rounded-lg bg-[#4d8063]/10 text-[#4d8063]">
                  {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 text-center">Peça ao cliente para escanear o QR Code ou usar o Pix Copia e Cola</p>

            <button
              onClick={handleConfirmar}
              disabled={submitting}
              className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-base"
            >
              {submitting
                ? <><span className="material-symbols-outlined animate-spin">refresh</span> Registrando...</>
                : <><span className="material-symbols-outlined">check_circle</span> Pagamento Recebido — Finalizar</>
              }
            </button>

            <button
              onClick={() => setShowPixModal(false)}
              className="w-full py-3 text-slate-400 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
