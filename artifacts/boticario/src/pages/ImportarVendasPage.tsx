import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  onNavigate: (page: string) => void;
}

const FORMAS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "a_prazo", label: "Fiado (a prazo)" },
];

const MARCAS = ["", "Avon", "Natura", "O Boticário", "Eudora", "Jequiti", "Rommanel", "Outra"];

interface Item {
  nome_produto: string;
  marca: string;
  preco_unit: string;
  quantidade: string;
}

interface Venda {
  data: string;
  cliente_nome: string;
  forma_pagamento: string;
  itens: Item[];
}

const newItem = (): Item => ({ nome_produto: "", marca: "", preco_unit: "", quantidade: "1" });
const newVenda = (): Venda => ({
  data: new Date().toISOString().slice(0, 10),
  cliente_nome: "",
  forma_pagamento: "dinheiro",
  itens: [newItem()],
});

const fmtBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function calcTotal(itens: Item[]) {
  return itens.reduce((s, i) => {
    const p = parseFloat(i.preco_unit.replace(",", ".")) || 0;
    const q = parseInt(i.quantidade) || 0;
    return s + p * q;
  }, 0);
}

export default function ImportarVendasPage({ onNavigate }: Props) {
  const [vendas, setVendas] = useState<Venda[]>([newVenda()]);
  const [clientes, setClientes] = useState<{ id: number; nome: string }[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null);
  const [expandido, setExpandido] = useState<number[]>([0]);

  useEffect(() => {
    fetch("/api/clientes")
      .then(r => r.ok ? r.json() : [])
      .then(d => setClientes(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const toggleExpand = (i: number) => {
    setExpandido(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const updateVenda = (i: number, field: keyof Venda, value: string) => {
    setVendas(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  };

  const updateItem = (vi: number, ii: number, field: keyof Item, value: string) => {
    setVendas(prev => prev.map((v, vi2) => {
      if (vi2 !== vi) return v;
      return {
        ...v,
        itens: v.itens.map((it, ii2) => ii2 === ii ? { ...it, [field]: value } : it),
      };
    }));
  };

  const addItem = (vi: number) => {
    setVendas(prev => prev.map((v, i) => i !== vi ? v : { ...v, itens: [...v.itens, newItem()] }));
  };

  const removeItem = (vi: number, ii: number) => {
    setVendas(prev => prev.map((v, i) => {
      if (i !== vi || v.itens.length <= 1) return v;
      return { ...v, itens: v.itens.filter((_, j) => j !== ii) };
    }));
  };

  const addVenda = () => {
    const nova = newVenda();
    setVendas(prev => [...prev, nova]);
    setExpandido(prev => [...prev, vendas.length]);
  };

  const removeVenda = (i: number) => {
    if (vendas.length === 1) return;
    setVendas(prev => prev.filter((_, j) => j !== i));
    setExpandido(prev => prev.filter(x => x !== i).map(x => x > i ? x - 1 : x));
  };

  const enviar = async () => {
    const validas = vendas.filter(v =>
      v.itens.some(i => i.nome_produto.trim() && parseFloat(i.preco_unit.replace(",", ".")) > 0)
    );
    if (validas.length === 0) {
      setResultado({ ok: false, msg: "Preencha pelo menos um produto com nome e valor." });
      return;
    }

    setEnviando(true);
    setResultado(null);

    const payload = validas.map(v => ({
      data: v.data + "T12:00:00.000Z",
      cliente_nome: v.cliente_nome.trim() || undefined,
      forma_pagamento: v.forma_pagamento,
      itens: v.itens
        .filter(i => i.nome_produto.trim() && parseFloat(i.preco_unit.replace(",", ".")) > 0)
        .map(i => ({
          nome_produto: i.nome_produto.trim(),
          marca: i.marca || "",
          preco_unit: parseFloat(i.preco_unit.replace(",", ".")),
          quantidade: parseInt(i.quantidade) || 1,
        })),
    }));

    try {
      const res = await apiFetch("/importar-vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendas: payload }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResultado({ ok: true, msg: `${data.importadas} venda(s) importada(s) com sucesso!` });
        setVendas([newVenda()]);
        setExpandido([0]);
      } else {
        setResultado({ ok: false, msg: data.error || "Erro ao importar." });
      }
    } catch {
      setResultado({ ok: false, msg: "Erro de conexão." });
    } finally {
      setEnviando(false);
    }
  };

  const totalGeral = vendas.reduce((s, v) => s + calcTotal(v.itens), 0);

  return (
    <div className="bg-[#f6f7f7] min-h-screen pb-28 max-w-md lg:max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => onNavigate("profile")} className="p-1 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Importar Vendas</h1>
          <p className="text-xs text-slate-500">Do caderno para o sistema</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Total</p>
          <p className="text-sm font-bold text-[#4d8063]">{fmtBRL(totalGeral)}</p>
        </div>
      </header>

      {/* Instrução */}
      <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3 items-start">
        <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">menu_book</span>
        <p className="text-xs text-blue-700 leading-relaxed">
          Adicione as vendas do seu caderno uma por uma. Informe a data, o cliente (opcional), a forma de pagamento e os produtos.
        </p>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className={`mx-4 mt-3 rounded-xl px-4 py-3 flex items-center gap-3 ${resultado.ok ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
          {resultado.ok
            ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          }
          <p className={`text-sm font-medium ${resultado.ok ? "text-emerald-700" : "text-red-700"}`}>{resultado.msg}</p>
        </div>
      )}

      {/* Lista de vendas */}
      <div className="px-4 mt-4 space-y-3">
        {vendas.map((venda, vi) => {
          const aberto = expandido.includes(vi);
          const total = calcTotal(venda.itens);
          return (
            <div key={vi} className="bg-white rounded-2xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
              {/* Cabeçalho da venda */}
              <button
                onClick={() => toggleExpand(vi)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#4d8063]/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#4d8063]">{vi + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {venda.cliente_nome.trim() || "Sem cliente"}
                    {" — "}
                    {venda.data ? new Date(venda.data + "T12:00:00").toLocaleDateString("pt-BR") : "Sem data"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {venda.itens.length} item(s) • {fmtBRL(total)} • {FORMAS.find(f => f.value === venda.forma_pagamento)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {vendas.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); removeVenda(vi); }}
                      className="p-1.5 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${aberto ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Conteúdo expandido */}
              {aberto && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
                  {/* Data + Cliente */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Data</label>
                      <input
                        type="date"
                        value={venda.data}
                        onChange={e => updateVenda(vi, "data", e.target.value)}
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4d8063]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Forma de Pagamento</label>
                      <select
                        value={venda.forma_pagamento}
                        onChange={e => updateVenda(vi, "forma_pagamento", e.target.value)}
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4d8063] bg-white"
                      >
                        {FORMAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Cliente (opcional)</label>
                    <input
                      type="text"
                      value={venda.cliente_nome}
                      onChange={e => updateVenda(vi, "cliente_nome", e.target.value)}
                      placeholder="Nome do cliente"
                      list={`clientes-list-${vi}`}
                      className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4d8063]"
                    />
                    <datalist id={`clientes-list-${vi}`}>
                      {clientes.map(c => <option key={c.id} value={c.nome} />)}
                    </datalist>
                  </div>

                  {/* Itens */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Produtos</label>
                    <div className="mt-2 space-y-3">
                      {venda.itens.map((item, ii) => (
                        <div key={ii} className="bg-slate-50 rounded-xl p-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={item.nome_produto}
                              onChange={e => updateItem(vi, ii, "nome_produto", e.target.value)}
                              placeholder="Nome do produto *"
                              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4d8063] bg-white"
                            />
                            {venda.itens.length > 1 && (
                              <button onClick={() => removeItem(vi, ii)} className="p-2 text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={item.marca}
                              onChange={e => updateItem(vi, ii, "marca", e.target.value)}
                              className="border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#4d8063] bg-white col-span-1"
                            >
                              {MARCAS.map(m => <option key={m} value={m}>{m || "Marca..."}</option>)}
                            </select>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={item.preco_unit}
                              onChange={e => updateItem(vi, ii, "preco_unit", e.target.value)}
                              placeholder="R$ 0,00 *"
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4d8063] bg-white"
                            />
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={e => updateItem(vi, ii, "quantidade", e.target.value)}
                              className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4d8063] bg-white text-center"
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 text-right">
                            Subtotal: {fmtBRL((parseFloat(item.preco_unit.replace(",", ".")) || 0) * (parseInt(item.quantidade) || 0))}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addItem(vi)}
                      className="mt-2 flex items-center gap-1.5 text-[#4d8063] text-sm font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Adicionar produto
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-sm font-semibold text-slate-600">Total desta venda</span>
                    <span className="text-base font-bold text-[#4d8063]">{fmtBRL(total)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão adicionar venda */}
      <div className="px-4 mt-3">
        <button
          onClick={addVenda}
          className="w-full border-2 border-dashed border-[#4d8063]/30 rounded-2xl py-4 flex items-center justify-center gap-2 text-[#4d8063] font-semibold text-sm hover:border-[#4d8063]/60 transition-colors"
        >
          <Plus className="w-5 h-5" /> Adicionar outra venda
        </button>
      </div>

      {/* Footer fixo com botão enviar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 max-w-md lg:max-w-2xl mx-auto" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">{vendas.length} venda(s) prontas</span>
          <span className="text-sm font-bold text-[#4d8063]">{fmtBRL(totalGeral)} total</span>
        </div>
        <button
          onClick={enviar}
          disabled={enviando}
          className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-2xl text-base shadow-lg disabled:opacity-60"
        >
          {enviando ? "Importando..." : `Salvar ${vendas.length} venda(s) no sistema`}
        </button>
      </div>
    </div>
  );
}
