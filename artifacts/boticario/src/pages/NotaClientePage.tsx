import { useEffect, useState } from "react";
import { ArrowLeft, Check, Plus, Trash2, Pencil, X } from "lucide-react";

interface NotaClientePageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = "/api";

interface Item {
  nome_produto: string;
  marca: string;
  quantidade: number;
  preco_unit: string;
}

interface Venda {
  id: number;
  cliente_id: number;
  total: string;
  valor_pago: string;
  status: string;
  forma_pagamento: string;
  asaas_invoice_url: string | null;
  created_at: string;
  itens: Item[];
}

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  whatsapp: string;
}

interface Haver {
  id: number;
  valor: string;
  saldo_restante: string;
  descricao: string;
}

function fmtBRL(v: number) {
  return v.toFixed(2).replace(".", ",");
}

function fmtData(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR");
}

function saldoVenda(v: Venda) {
  return Math.max(0, parseFloat(v.total) - parseFloat(v.valor_pago || "0"));
}

export default function NotaClientePage({ onNavigate }: NotaClientePageProps) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [haveres, setHaveres] = useState<Haver[]>([]);
  const [totalHaver, setTotalHaver] = useState(0);
  const [loading, setLoading] = useState(true);

  const [pagandoId, setPagandoId] = useState<number | null>(null);
  const [pagValor, setPagValor] = useState<Record<number, string>>({});
  const [pagando, setPagando] = useState(false);
  const [pagSucesso, setPagSucesso] = useState<number | null>(null);

  const [haverModal, setHaverModal] = useState(false);
  const [novoHaverValor, setNovoHaverValor] = useState("");
  const [novoHaverDesc, setNovoHaverDesc] = useState("");
  const [salvandoHaver, setSalvandoHaver] = useState(false);

  const [aplicandoHaverId, setAplicandoHaverId] = useState<number | null>(null);
  const [haverValor, setHaverValor] = useState<Record<number, string>>({});
  const [aplicandoHaver, setAplicandoHaver] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editTotal, setEditTotal] = useState("");
  const [salvandoEdit, setSalvandoEdit] = useState(false);

  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [erro, setErro] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("nota_cliente");
    if (!raw) return;
    const { cliente_id } = JSON.parse(raw);
    setLoading(true);
    fetch(`${API_BASE}/clientes/${cliente_id}/historico`)
      .then(r => r.json())
      .then(data => {
        setCliente(data.cliente);
        setVendas(data.vendas.filter((v: Venda) => v.status === "fiado" || v.status === "fiado_atrasado"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    fetchHaveres(cliente_id);
  }, []);

  const fetchHaveres = async (clienteId: number) => {
    try {
      const r = await fetch(`${API_BASE}/clientes/${clienteId}/haveres`);
      if (r.ok) {
        const d = await r.json();
        setHaveres(d.haveres);
        setTotalHaver(d.total);
      }
    } catch {}
  };

  const totalAberto = vendas.reduce((a, v) => a + saldoVenda(v), 0);

  const handlePagar = async (v: Venda) => {
    const valor = parseFloat((pagValor[v.id] || "0").replace(",", "."));
    if (isNaN(valor) || valor <= 0) { setErro("Informe um valor válido."); return; }
    setPagando(true);
    setErro("");
    try {
      const r = await fetch(`${API_BASE}/vendas/${v.id}/baixa`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor_pago: valor }),
      });
      if (!r.ok) throw new Error();
      const atualizada = await r.json();
      setVendas(prev => {
        if (atualizada.status === "confirmada") return prev.filter(x => x.id !== v.id);
        return prev.map(x => x.id === v.id ? { ...x, ...atualizada } : x);
      });
      setPagValor(prev => ({ ...prev, [v.id]: "" }));
      setPagSucesso(v.id);
      setPagandoId(null);
      setTimeout(() => setPagSucesso(null), 2000);
    } catch {
      setErro("Erro ao registrar pagamento.");
    } finally {
      setPagando(false);
    }
  };

  const handleAplicarHaver = async (v: Venda) => {
    const valor = parseFloat((haverValor[v.id] || "0").replace(",", "."));
    if (isNaN(valor) || valor <= 0) { setErro("Informe um valor de haver."); return; }
    if (valor > totalHaver) { setErro("Saldo de haver insuficiente."); return; }
    setAplicandoHaver(true);
    setErro("");
    try {
      const r = await fetch(`${API_BASE}/vendas/${v.id}/aplicar-haver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor }),
      });
      const data = await r.json();
      if (!r.ok) { setErro(data.error || "Erro ao aplicar haver."); return; }
      setVendas(prev => {
        if (data.venda.status === "confirmada") return prev.filter(x => x.id !== v.id);
        return prev.map(x => x.id === v.id ? { ...x, ...data.venda } : x);
      });
      setHaverValor(prev => ({ ...prev, [v.id]: "" }));
      setAplicandoHaverId(null);
      if (cliente) fetchHaveres(cliente.id);
    } catch {
      setErro("Erro ao aplicar haver.");
    } finally {
      setAplicandoHaver(false);
    }
  };

  const handleRegistrarHaver = async () => {
    const valor = parseFloat(novoHaverValor.replace(",", "."));
    if (isNaN(valor) || valor <= 0 || !cliente) return;
    setSalvandoHaver(true);
    try {
      const r = await fetch(`${API_BASE}/clientes/${cliente.id}/haveres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, descricao: novoHaverDesc || "Haver registrado" }),
      });
      if (!r.ok) throw new Error();
      setHaverModal(false);
      setNovoHaverValor("");
      setNovoHaverDesc("");
      fetchHaveres(cliente.id);
    } catch {
      setErro("Erro ao registrar haver.");
    } finally {
      setSalvandoHaver(false);
    }
  };

  const handleEditar = async (v: Venda) => {
    const novoTotal = parseFloat(editTotal.replace(",", "."));
    if (isNaN(novoTotal) || novoTotal <= 0) { setErro("Valor inválido."); return; }
    setSalvandoEdit(true);
    setErro("");
    try {
      const r = await fetch(`${API_BASE}/vendas/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: novoTotal }),
      });
      if (!r.ok) throw new Error();
      const atualizada = await r.json();
      setVendas(prev => prev.map(x => x.id === v.id ? { ...x, ...atualizada } : x));
      setEditandoId(null);
      setEditTotal("");
    } catch {
      setErro("Erro ao editar.");
    } finally {
      setSalvandoEdit(false);
    }
  };

  const handleExcluir = async (id: number) => {
    setExcluindoId(id);
    try {
      const r = await fetch(`${API_BASE}/vendas/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      setVendas(prev => prev.filter(x => x.id !== id));
      setConfirmDelete(null);
    } catch {
      setErro("Erro ao excluir venda.");
    } finally {
      setExcluindoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-[#4d8063]">refresh</span>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <p className="text-slate-500">Nenhum cliente selecionado.</p>
        <button onClick={() => onNavigate("fiados")} className="text-[#4d8063] font-bold">Voltar</button>
      </div>
    );
  }

  return (
    <div className="font-sans bg-[#f6f7f7] min-h-screen flex flex-col max-w-md lg:max-w-2xl mx-auto relative">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#4d8063]/10">
        <div className="flex items-center px-4 py-3 gap-3">
          <button onClick={() => onNavigate("fiados")} className="size-10 rounded-full hover:bg-[#4d8063]/10 text-[#4d8063] flex items-center justify-center shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold truncate">Nota de {cliente.nome}</h1>
            <p className="text-xs text-slate-500">{vendas.length} fiado{vendas.length !== 1 ? "s" : ""} em aberto</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">

        {/* Resumo */}
        <div className="p-4 pb-0">
          <div className="bg-[#4d8063] text-white rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">Total em aberto</p>
              <p className="text-3xl font-bold">R$ {fmtBRL(totalAberto)}</p>
            </div>
            <div className="size-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {cliente.nome[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Haver */}
        <div className="p-4 pb-0">
          <div className={`rounded-xl border p-4 shadow-sm ${totalHaver > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">account_balance_wallet</span>
                <div>
                  <p className="text-xs font-medium text-slate-600">Saldo de Haver</p>
                  <p className={`text-lg font-bold ${totalHaver > 0 ? "text-amber-700" : "text-slate-400"}`}>
                    R$ {fmtBRL(totalHaver)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHaverModal(true)}
                className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Registrar Haver
              </button>
            </div>
            {totalHaver > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-200 space-y-1">
                {haveres.map(h => (
                  <div key={h.id} className="flex justify-between text-xs text-amber-700">
                    <span className="truncate">{h.descricao}</span>
                    <span className="font-bold ml-2 shrink-0">R$ {fmtBRL(parseFloat(h.saldo_restante))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Erro global */}
        {erro && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl flex items-center justify-between">
            <span>{erro}</span>
            <button onClick={() => setErro("")}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Lista de Fiados */}
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Compras em Aberto</h3>

          {vendas.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">receipt_long</span>
              <p className="text-slate-400 text-sm">Nenhum fiado em aberto para {cliente.nome}</p>
            </div>
          ) : (
            vendas.map(v => {
              const saldo = saldoVenda(v);
              const pago = parseFloat(v.valor_pago || "0");
              const isAberto = pagandoId === v.id;
              const isHaver = aplicandoHaverId === v.id;
              const isEdit = editandoId === v.id;
              const isConfirmDel = confirmDelete === v.id;

              return (
                <div key={v.id} className="bg-white rounded-2xl border border-[#4d8063]/10 shadow-sm overflow-hidden">
                  {/* Header da venda */}
                  <div className="p-4 pb-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold bg-[#4d8063]/10 text-[#4d8063] px-2 py-0.5 rounded-full">
                          #{v.id}
                        </span>
                        <span className="text-xs text-slate-500">{fmtData(v.created_at)}</span>
                        {pago > 0 && (
                          <span className="text-xs text-emerald-600 font-medium">Pago R$ {fmtBRL(pago)}</span>
                        )}
                      </div>
                      {/* Produtos */}
                      <div className="mt-2 space-y-0.5">
                        {v.itens && v.itens.filter(i => i.nome_produto).map((item, idx) => (
                          <p key={idx} className="text-sm text-slate-700">
                            {item.quantidade}x {item.nome_produto}
                            {item.marca ? ` · ${item.marca}` : ""}
                            <span className="text-slate-400 ml-1">R$ {fmtBRL(parseFloat(item.preco_unit))}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-[#4d8063]">R$ {fmtBRL(saldo)}</p>
                      {pago > 0 && <p className="text-xs text-slate-400">de R$ {fmtBRL(parseFloat(v.total))}</p>}
                    </div>
                  </div>

                  {/* Ação de editar total */}
                  {isEdit && (
                    <div className="px-4 pb-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">Editar valor total</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                          <input
                            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                            placeholder={fmtBRL(parseFloat(v.total))}
                            value={editTotal}
                            onChange={e => setEditTotal(e.target.value.replace(/[^0-9,]/g, ""))}
                            inputMode="decimal"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => handleEditar(v)}
                          disabled={salvandoEdit}
                          className="bg-[#4d8063] text-white px-3 rounded-lg text-sm font-bold disabled:opacity-60"
                        >
                          {salvandoEdit ? "..." : "Salvar"}
                        </button>
                        <button onClick={() => { setEditandoId(null); setEditTotal(""); }} className="px-3 rounded-lg border border-slate-200 text-slate-500 text-sm">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pagar em dinheiro/PIX */}
                  {isAberto && (
                    <div className="px-4 pb-3 bg-[#4d8063]/5 border-t border-[#4d8063]/10">
                      <p className="text-xs font-medium text-slate-500 my-2">Pagamento em Dinheiro / PIX</p>
                      {pagSucesso === v.id ? (
                        <div className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-lg text-sm">
                          <Check className="w-4 h-4" /> Baixa registrada!
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                            <input
                              className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#4d8063]/30 text-sm outline-none focus:ring-2 focus:ring-[#4d8063]/30 bg-white"
                              placeholder={fmtBRL(saldo)}
                              value={pagValor[v.id] || ""}
                              onChange={e => setPagValor(prev => ({ ...prev, [v.id]: e.target.value.replace(/[^0-9,]/g, "") }))}
                              inputMode="decimal"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={() => handlePagar(v)}
                            disabled={pagando}
                            className="bg-[#4d8063] text-white px-3 rounded-lg text-sm font-bold flex items-center gap-1 disabled:opacity-60"
                          >
                            {pagando ? <span className="material-symbols-outlined animate-spin text-base">refresh</span> : <><Check className="w-4 h-4" />OK</>}
                          </button>
                          <button onClick={() => setPagandoId(null)} className="px-3 rounded-lg border border-slate-200 text-slate-500 text-sm">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aplicar haver */}
                  {isHaver && totalHaver > 0 && (
                    <div className="px-4 pb-3 bg-amber-50 border-t border-amber-100">
                      <p className="text-xs font-medium text-amber-700 my-2">Aplicar Haver (disponível: R$ {fmtBRL(totalHaver)})</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-sm">R$</span>
                          <input
                            className="w-full h-10 pl-9 pr-3 rounded-lg border border-amber-200 text-sm outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                            placeholder={fmtBRL(Math.min(totalHaver, saldo))}
                            value={haverValor[v.id] || ""}
                            onChange={e => setHaverValor(prev => ({ ...prev, [v.id]: e.target.value.replace(/[^0-9,]/g, "") }))}
                            inputMode="decimal"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => handleAplicarHaver(v)}
                          disabled={aplicandoHaver}
                          className="bg-amber-500 text-white px-3 rounded-lg text-sm font-bold flex items-center gap-1 disabled:opacity-60"
                        >
                          {aplicandoHaver ? <span className="material-symbols-outlined animate-spin text-base">refresh</span> : <><Check className="w-4 h-4" />Usar</>}
                        </button>
                        <button onClick={() => setAplicandoHaverId(null)} className="px-3 rounded-lg border border-slate-200 text-slate-500 text-sm">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirmar exclusão */}
                  {isConfirmDel && (
                    <div className="px-4 pb-3 bg-red-50 border-t border-red-100">
                      <p className="text-sm font-medium text-red-700 my-2">Excluir este fiado?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExcluir(v.id)}
                          disabled={excluindoId === v.id}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-60"
                        >
                          {excluindoId === v.id ? "Excluindo..." : "Sim, excluir"}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-bold">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Botões de ação */}
                  <div className="border-t border-slate-100 px-4 py-2 flex gap-1">
                    <button
                      onClick={() => { setPagandoId(isAberto ? null : v.id); setAplicandoHaverId(null); setEditandoId(null); setConfirmDelete(null); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-colors ${isAberto ? "bg-[#4d8063] text-white" : "bg-[#4d8063]/10 text-[#4d8063]"}`}
                    >
                      <span className="material-symbols-outlined text-base">payments</span>
                      Pagar
                    </button>
                    {totalHaver > 0 && (
                      <button
                        onClick={() => { setAplicandoHaverId(isHaver ? null : v.id); setPagandoId(null); setEditandoId(null); setConfirmDelete(null); }}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-colors ${isHaver ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700"}`}
                      >
                        <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                        Haver
                      </button>
                    )}
                    <button
                      onClick={() => { setEditandoId(isEdit ? null : v.id); setEditTotal(fmtBRL(parseFloat(v.total))); setPagandoId(null); setAplicandoHaverId(null); setConfirmDelete(null); }}
                      className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${isEdit ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setConfirmDelete(isConfirmDel ? null : v.id); setPagandoId(null); setAplicandoHaverId(null); setEditandoId(null); }}
                      className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${isConfirmDel ? "bg-red-500 text-white" : "bg-red-50 text-red-500"}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {vendas.length > 0 && cliente.whatsapp && (
          <div className="px-4 pb-4">
            <a
              href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${cliente.nome}! Passando para lembrar que você tem R$ ${fmtBRL(totalAberto)} em aberto comigo. Quando puder, me avise! 😊`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              Cobrar por WhatsApp
            </a>
          </div>
        )}
      </main>

      {/* Modal Registrar Haver */}
      {haverModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setHaverModal(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-xl">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-bold text-base">Registrar Haver</h3>
                <p className="text-xs text-slate-500">Crédito para {cliente.nome}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Motivo</label>
                <input
                  className="w-full border border-slate-200 rounded-xl h-11 px-4 text-base outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="Ex: Devolução de produto, Troco a favor..."
                  value={novoHaverDesc}
                  onChange={e => setNovoHaverDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Valor do Crédito</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                  <input
                    className="w-full border border-slate-200 rounded-xl h-11 pl-9 pr-4 text-base outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="0,00"
                    value={novoHaverValor}
                    onChange={e => setNovoHaverValor(e.target.value.replace(/[^0-9,]/g, ""))}
                    inputMode="decimal"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setHaverModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">
                Cancelar
              </button>
              <button
                onClick={handleRegistrarHaver}
                disabled={salvandoHaver || !novoHaverValor}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm disabled:opacity-60"
              >
                {salvandoHaver ? "Salvando..." : "Registrar Haver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
