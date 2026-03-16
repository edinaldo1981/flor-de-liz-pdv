import { useState } from "react";

const API_BASE = "/api";

interface Haver {
  id: number;
  valor: string;
  saldo_restante: string;
  descricao: string | null;
  created_at: string;
}

interface ClienteData {
  cliente: { nome: string; cpf: string | null; telefone: string | null; email: string | null };
  fiados: Fiado[];
  historico: Venda[];
  totalEmAberto: number;
  saldoHaver: number;
  haveres: Haver[];
  pixKey: string | null;
}

interface Fiado {
  id: number;
  total: string;
  valor_pago: string;
  status: string;
  asaas_invoice_url: string | null;
  asaas_status: string | null;
  created_at: string;
  itens: Item[];
}

interface Venda {
  id: number;
  total: string;
  status: string;
  forma_pagamento: string;
  created_at: string;
  itens: Item[];
}

interface Item {
  nome: string;
  marca: string;
  preco: number;
  qty: number;
}

function fmtBRL(val: string | number) {
  return `R$ ${parseFloat(String(val)).toFixed(2).replace(".", ",")}`;
}

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function asaasLabel(status: string | null) {
  if (status === "RECEIVED" || status === "CONFIRMED") return { label: "Pago", cls: "bg-emerald-100 text-emerald-700" };
  if (status === "OVERDUE") return { label: "Vencido", cls: "bg-red-100 text-red-700" };
  if (status === "PENDING") return { label: "Aguardando pagamento", cls: "bg-orange-100 text-orange-700" };
  return null;
}

function LoginScreen({ onLogin }: { onLogin: (data: ClienteData) => void }) {
  const [tipo, setTipo] = useState<"cpf" | "telefone">("cpf");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleBuscar = async () => {
    if (!valor.trim()) { setErro("Preencha o campo."); return; }
    setLoading(true);
    setErro("");
    try {
      const params = new URLSearchParams({ [tipo]: valor });
      const resp = await fetch(`${API_BASE}/portal/cliente?${params}`);
      if (resp.status === 404) { setErro("Cliente não encontrado. Verifique os dados e tente novamente."); return; }
      if (!resp.ok) throw new Error();
      const data: ClienteData = await resp.json();
      onLogin(data);
    } catch {
      setErro("Erro ao buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatInput = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (tipo === "cpf") {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
      return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11)}`;
    } else {
      if (digits.length <= 2) return digits;
      if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#4d8063]/10 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#4d8063] flex items-center justify-center shadow-lg shadow-[#4d8063]/30 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#4d8063]">Flor de Liz</h1>
          <p className="text-slate-500 text-sm mt-1">Portal do Cliente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#4d8063]/10 p-6">
          <h2 className="text-lg font-bold mb-1">Acesse sua conta</h2>
          <p className="text-sm text-slate-500 mb-5">Veja seus pedidos e pagamentos</p>

          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
            {(["cpf", "telefone"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTipo(t); setValor(""); setErro(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tipo === t ? "bg-white text-[#4d8063] shadow-sm" : "text-slate-500"}`}
              >
                {t === "cpf" ? "CPF" : "Telefone"}
              </button>
            ))}
          </div>

          <input
            className="w-full border border-slate-200 rounded-xl h-12 px-4 text-base outline-none focus:ring-2 focus:ring-[#4d8063]/30 mb-3"
            placeholder={tipo === "cpf" ? "000.000.000-00" : "(00) 00000-0000"}
            value={valor}
            inputMode="numeric"
            maxLength={tipo === "cpf" ? 14 : 15}
            onChange={e => setValor(formatInput(e.target.value))}
            onKeyDown={e => e.key === "Enter" && handleBuscar()}
          />

          {erro && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">{erro}</p>
          )}

          <button
            onClick={handleBuscar}
            disabled={loading}
            className="w-full bg-[#4d8063] text-white font-bold py-3.5 rounded-xl shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : "Entrar"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Flor de Liz · Sistema exclusivo para clientes</p>
      </div>
    </div>
  );
}

function PortalScreen({ data, onSair }: { data: ClienteData; onSair: () => void }) {
  const [expandido, setExpandido] = useState<number | null>(null);
  const [copiado, setCopiado] = useState<number | null>(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [aba, setAba] = useState<"fiados" | "historico" | "haver">("fiados");

  const copiarLink = (id: number, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    });
  };

  const copiarPix = (pix: string) => {
    navigator.clipboard.writeText(pix).then(() => {
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2500);
    });
  };

  const temHaver = data.saldoHaver > 0;

  return (
    <div className="min-h-screen bg-[#f6f7f7] max-w-md mx-auto">
      {/* Header */}
      <div className="bg-[#4d8063] px-5 pt-10 pb-8 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest font-medium">Olá,</p>
            <h1 className="text-white text-xl font-bold leading-tight">{data.cliente.nome}</h1>
          </div>
          <button
            onClick={onSair}
            className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-white/15 rounded-2xl p-4 border border-white/20">
            <p className="text-white/80 text-xs font-medium mb-1">Total em aberto</p>
            <p className="text-white text-2xl font-bold">{fmtBRL(data.totalEmAberto)}</p>
            <p className="text-white/70 text-xs mt-1">{data.fiados.length} pedido{data.fiados.length !== 1 ? "s" : ""} pendente{data.fiados.length !== 1 ? "s" : ""}</p>
          </div>
          {temHaver && (
            <div className="flex-1 bg-amber-400/30 rounded-2xl p-4 border border-amber-300/30">
              <p className="text-white/80 text-xs font-medium mb-1">Seu Haver</p>
              <p className="text-white text-2xl font-bold">{fmtBRL(data.saldoHaver)}</p>
              <p className="text-white/70 text-xs mt-1">crédito disponível</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-100 px-4">
        <button
          onClick={() => setAba("fiados")}
          className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${aba === "fiados" ? "border-[#4d8063] text-[#4d8063]" : "border-transparent text-slate-400"}`}
        >
          Pendentes ({data.fiados.length})
        </button>
        <button
          onClick={() => setAba("historico")}
          className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${aba === "historico" ? "border-[#4d8063] text-[#4d8063]" : "border-transparent text-slate-400"}`}
        >
          Histórico ({data.historico.length})
        </button>
        {data.haveres.length > 0 && (
          <button
            onClick={() => setAba("haver")}
            className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${aba === "haver" ? "border-amber-500] text-amber-600" : "border-transparent text-slate-400"}`}
          >
            Haver ({data.haveres.length})
          </button>
        )}
      </div>

      <div className="p-4 space-y-3 pb-10">

        {/* ===== ABA FIADOS ===== */}
        {aba === "fiados" && (
          data.fiados.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-600 font-bold">Você não tem pendências!</p>
              <p className="text-slate-400 text-sm mt-1">Seus pedidos estão em dia</p>
            </div>
          ) : (
            data.fiados.map(f => {
              const totalFloat = parseFloat(f.total);
              const pago = parseFloat(f.valor_pago || "0");
              const saldoBruto = Math.max(0, totalFloat - pago);
              const haverAplicavel = Math.min(data.saldoHaver, saldoBruto);
              const apagarComHaver = Math.max(0, saldoBruto - haverAplicavel);
              const pct = Math.min(100, Math.round((pago / totalFloat) * 100));
              const badge = asaasLabel(f.asaas_status);
              const aberto = expandido === f.id;

              return (
                <div key={f.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    className="w-full p-4 text-left flex items-start gap-3"
                    onClick={() => setExpandido(aberto ? null : f.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#4d8063]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-[#4d8063]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm">Pedido #{f.id}</p>
                        {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{fmtDate(f.created_at)}</p>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div>
                          <p className="text-[10px] text-slate-400">Total da nota</p>
                          <p className="text-sm font-bold text-slate-500">{fmtBRL(f.total)}</p>
                        </div>
                        {pago > 0 && (
                          <div>
                            <p className="text-[10px] text-slate-400">Já pago</p>
                            <p className="text-sm font-bold text-emerald-600">{fmtBRL(pago)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-slate-400">Em aberto</p>
                          <p className="text-sm font-bold text-[#4d8063]">{fmtBRL(saldoBruto)}</p>
                        </div>
                        {temHaver && haverAplicavel > 0 && (
                          <div>
                            <p className="text-[10px] text-amber-500">Com haver</p>
                            <p className="text-sm font-bold text-amber-600">{fmtBRL(apagarComHaver)}</p>
                          </div>
                        )}
                      </div>

                      {pago > 0 && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#4d8063] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{pct}% pago</p>
                        </div>
                      )}
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform shrink-0 mt-1 ${aberto ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {aberto && (
                    <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-3">
                      {/* Itens */}
                      {f.itens && f.itens.length > 0 && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Itens do Pedido</p>
                          <div className="space-y-1.5">
                            {f.itens.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-medium">{item.qty}x {item.nome}</span>
                                  {item.marca && <span className="text-slate-400 text-xs ml-1">· {item.marca}</span>}
                                </div>
                                <span className="font-semibold text-slate-600 shrink-0 ml-2">{fmtBRL(item.preco * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resumo de valores */}
                      <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
                        <div className="flex justify-between text-slate-500">
                          <span>Total da nota</span>
                          <span className="font-medium">{fmtBRL(f.total)}</span>
                        </div>
                        {pago > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Já pago</span>
                            <span className="font-medium">− {fmtBRL(pago)}</span>
                          </div>
                        )}
                        {temHaver && haverAplicavel > 0 && (
                          <div className="flex justify-between text-amber-600">
                            <span>Haver disponível</span>
                            <span className="font-medium">− {fmtBRL(haverAplicavel)}</span>
                          </div>
                        )}
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-800">
                          <span>{temHaver && haverAplicavel > 0 ? "A pagar (com haver)" : "A pagar"}</span>
                          <span className="text-[#4d8063]">{fmtBRL(temHaver && haverAplicavel > 0 ? apagarComHaver : saldoBruto)}</span>
                        </div>
                      </div>

                      {/* Pagamento */}
                      {f.asaas_invoice_url ? (
                        <div className="bg-[#4d8063]/5 rounded-xl p-3 border border-[#4d8063]/10">
                          <p className="text-xs font-bold text-[#4d8063] mb-2">Pague agora por PIX ou boleto</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => copiarLink(f.id, f.asaas_invoice_url!)}
                              className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${copiado === f.id ? "bg-emerald-100 text-emerald-700" : "bg-white border border-[#4d8063]/20 text-[#4d8063]"}`}
                            >
                              {copiado === f.id ? (
                                <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Copiado!</>
                              ) : (
                                <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copiar Link</>
                              )}
                            </button>
                            <a
                              href={f.asaas_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-[#4d8063] text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              Pagar Agora
                            </a>
                          </div>
                        </div>
                      ) : data.pixKey ? (
                        <div className="bg-[#4d8063]/5 rounded-xl p-3 border border-[#4d8063]/10">
                          <p className="text-xs font-bold text-[#4d8063] mb-1">Pague via PIX</p>
                          <p className="text-[11px] text-slate-500 mb-2">Copie a chave abaixo e realize o pagamento</p>
                          <div className="flex items-center gap-2 bg-white border border-[#4d8063]/20 rounded-lg px-3 py-2.5">
                            <span className="flex-1 text-sm font-mono font-medium text-slate-700 break-all">{data.pixKey}</span>
                            <button
                              onClick={() => copiarPix(data.pixKey!)}
                              className={`shrink-0 text-xs font-bold px-2.5 py-1.5 rounded-md transition-colors ${pixCopiado ? "bg-emerald-100 text-emerald-700" : "bg-[#4d8063] text-white"}`}
                            >
                              {pixCopiado ? "✓ Copiado" : "Copiar"}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2 text-center">Após o pagamento, envie o comprovante para a loja</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 text-center">
                          Entre em contato com a loja para quitar este pedido
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}

        {/* ===== ABA HISTÓRICO ===== */}
        {aba === "historico" && (
          data.historico.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">Nenhum histórico encontrado</p>
            </div>
          ) : (
            data.historico.map(v => (
              <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">Pedido #{v.id}</p>
                    <p className="text-xs text-slate-400">{fmtDate(v.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#4d8063]">{fmtBRL(v.total)}</p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">Pago</span>
                  </div>
                </div>
                {v.itens && v.itens.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-50 space-y-1">
                    {v.itens.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-slate-500">
                        <span>{item.qty}x {item.nome}</span>
                        <span>{fmtBRL(item.preco * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )
        )}

        {/* ===== ABA HAVER ===== */}
        {aba === "haver" && (
          <>
            {data.saldoHaver > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Saldo disponível para usar</p>
                  <p className="text-xl font-bold text-amber-700">{fmtBRL(data.saldoHaver)}</p>
                </div>
              </div>
            )}

            {data.haveres.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-400 text-sm">Nenhum haver registrado</p>
              </div>
            ) : (
              data.haveres.map(h => {
                const usado = parseFloat(h.valor) - parseFloat(h.saldo_restante);
                const pct = Math.min(100, Math.round((usado / parseFloat(h.valor)) * 100));
                const totalUsado = usado > 0;
                return (
                  <div key={h.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">Haver #{h.id}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${parseFloat(h.saldo_restante) > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                            {parseFloat(h.saldo_restante) > 0 ? "Disponível" : "Utilizado"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{fmtDate(h.created_at)}</p>
                        {h.descricao && <p className="text-xs text-slate-500 mt-1 italic">{h.descricao}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">Valor original</p>
                        <p className="font-bold text-slate-600">{fmtBRL(h.valor)}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400">Saldo restante</p>
                        <p className="text-sm font-bold text-amber-600">{fmtBRL(h.saldo_restante)}</p>
                      </div>
                      {totalUsado && (
                        <div>
                          <p className="text-[10px] text-slate-400">Já utilizado</p>
                          <p className="text-sm font-bold text-emerald-600">{fmtBRL(usado)}</p>
                        </div>
                      )}
                    </div>

                    {totalUsado && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pct}% utilizado</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [clienteData, setClienteData] = useState<ClienteData | null>(null);

  return clienteData ? (
    <PortalScreen data={clienteData} onSair={() => setClienteData(null)} />
  ) : (
    <LoginScreen onLogin={setClienteData} />
  );
}
