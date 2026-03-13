import { ArrowLeft, Check, Copy, ExternalLink, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface CobrancaPageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = "/api-server/api";

interface Venda {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  total: string;
  valor_pago: string;
  status: string;
  asaas_invoice_url: string | null;
  asaas_status: string | null;
  created_at: string;
}

interface Haver {
  id: number;
  valor: string;
  saldo_restante: string;
  descricao: string;
  created_at: string;
}

export default function CobrancaPage({ onNavigate }: CobrancaPageProps) {
  const [venda, setVenda] = useState<Venda | null>(null);
  const [copied, setCopied] = useState(false);

  const [baixaValor, setBaixaValor] = useState("");
  const [dandoBaixa, setDandoBaixa] = useState(false);
  const [baixaSucesso, setBaixaSucesso] = useState(false);

  const [haveres, setHaveres] = useState<Haver[]>([]);
  const [totalHaver, setTotalHaver] = useState(0);

  const [haverValor, setHaverValor] = useState("");
  const [aplicandoHaver, setAplicandoHaver] = useState(false);
  const [haverSucesso, setHaverSucesso] = useState(false);

  const [modalHaver, setModalHaver] = useState(false);
  const [novoHaverValor, setNovoHaverValor] = useState("");
  const [novoHaverDesc, setNovoHaverDesc] = useState("");
  const [salvandoHaver, setSalvandoHaver] = useState(false);

  const [erro, setErro] = useState("");

  const [copiedMsg, setCopiedMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fiado_selecionado");
      if (raw) {
        const v = JSON.parse(raw);
        setVenda(v);
        fetchHaveres(v.cliente_id);
      }
    } catch { }
  }, []);

  const fetchHaveres = async (clienteId: number) => {
    try {
      const resp = await fetch(`${API_BASE}/clientes/${clienteId}/haveres`);
      if (resp.ok) {
        const data = await resp.json();
        setHaveres(data.haveres);
        setTotalHaver(data.total);
      }
    } catch { }
  };

  if (!venda) {
    return (
      <div className="flex min-h-screen items-center justify-center max-w-md mx-auto">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">receipt_long</span>
          <p className="text-slate-500">Nenhum fiado selecionado.</p>
          <button onClick={() => onNavigate("fiados")} className="mt-4 text-[#4d8063] font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  const total = parseFloat(venda.total);
  const pago = parseFloat(venda.valor_pago || "0");
  const saldo = Math.max(0, total - pago);
  const progressoPct = Math.min(100, Math.round((pago / total) * 100));
  const nome = venda.cliente_nome ?? "Cliente";

  const handleCopiarLink = () => {
    if (!venda.asaas_invoice_url) return;
    navigator.clipboard.writeText(venda.asaas_invoice_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleBaixa = async () => {
    const valor = parseFloat(baixaValor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) { setErro("Informe um valor válido."); return; }
    setDandoBaixa(true);
    setErro("");
    try {
      const resp = await fetch(`${API_BASE}/vendas/${venda.id}/baixa`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor_pago: valor }),
      });
      if (!resp.ok) throw new Error();
      const atualizada = await resp.json();
      const novaVenda = { ...venda, ...atualizada };
      setVenda(novaVenda);
      localStorage.setItem("fiado_selecionado", JSON.stringify(novaVenda));
      setBaixaSucesso(true);
      setBaixaValor("");
      setTimeout(() => { setBaixaSucesso(false); if (novaVenda.status === "confirmada") onNavigate("fiados"); }, 1800);
    } catch {
      setErro("Erro ao dar baixa. Tente novamente.");
    } finally {
      setDandoBaixa(false);
    }
  };

  const handleAplicarHaver = async () => {
    const valor = parseFloat(haverValor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) { setErro("Informe um valor válido para o haver."); return; }
    if (valor > totalHaver) { setErro(`Saldo de haver insuficiente (disponível: R$ ${totalHaver.toFixed(2).replace(".", ",")})`); return; }
    setAplicandoHaver(true);
    setErro("");
    try {
      const resp = await fetch(`${API_BASE}/vendas/${venda.id}/aplicar-haver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor }),
      });
      const data = await resp.json();
      if (!resp.ok) { setErro(data.error || "Erro ao aplicar haver."); return; }
      const novaVenda = { ...venda, ...data.venda };
      setVenda(novaVenda);
      localStorage.setItem("fiado_selecionado", JSON.stringify(novaVenda));
      setHaverSucesso(true);
      setHaverValor("");
      fetchHaveres(venda.cliente_id);
      setTimeout(() => { setHaverSucesso(false); if (novaVenda.status === "confirmada") onNavigate("fiados"); }, 1800);
    } catch {
      setErro("Erro ao aplicar haver.");
    } finally {
      setAplicandoHaver(false);
    }
  };

  const handleRegistrarHaver = async () => {
    const valor = parseFloat(novoHaverValor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) return;
    setSalvandoHaver(true);
    try {
      const resp = await fetch(`${API_BASE}/clientes/${venda.cliente_id}/haveres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, descricao: novoHaverDesc || "Haver registrado" }),
      });
      if (!resp.ok) throw new Error();
      setModalHaver(false);
      setNovoHaverValor("");
      setNovoHaverDesc("");
      fetchHaveres(venda.cliente_id);
    } catch {
      setErro("Erro ao registrar haver.");
    } finally {
      setSalvandoHaver(false);
    }
  };

  const msgSuave = `Olá, ${nome}! Passando para lembrar do seu pagamento de R$ ${saldo.toFixed(2).replace(".", ",")} que está em aberto. Podemos contar com você? 😊`;
  const msgModerado = `Oi ${nome}, notamos que o pagamento de R$ ${saldo.toFixed(2).replace(".", ",")} (Pedido #${venda.id}) está pendente. Aconteceu algo? Me avise para combinarmos!`;
  const msgUrgente = `${nome}, consta um débito de R$ ${saldo.toFixed(2).replace(".", ",")} em atraso (Pedido #${venda.id}). Por favor, regularize para não bloquear novos pedidos.`;

  const templates = [
    { tone: "Suave", toneColor: "bg-green-100 text-green-800", title: "Lembrete Amigável", icon: "chat_bubble", iconColor: "text-[#4d8063]/40", borderColor: "border-l-[#4d8063]/30", msg: msgSuave },
    { tone: "Moderado", toneColor: "bg-orange-100 text-orange-800", title: "Aviso de Atraso", icon: "warning", iconColor: "text-orange-500/40", borderColor: "border-l-orange-500/30", msg: msgModerado },
    { tone: "Urgente", toneColor: "bg-red-100 text-red-800", title: "Cobrança Urgente", icon: "error", iconColor: "text-red-500/40", borderColor: "border-l-red-500/30", msg: msgUrgente },
  ];

  const handleCopiarMsg = (msg: string, title: string) => {
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedMsg(title);
      setTimeout(() => setCopiedMsg(null), 2000);
    });
  };

  return (
    <div className="font-sans bg-[#f6f7f7] min-h-screen flex flex-col max-w-md mx-auto relative">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#4d8063]/10">
        <div className="flex items-center p-4 gap-4">
          <button onClick={() => onNavigate("fiados")} className="size-10 rounded-full hover:bg-[#4d8063]/10 text-[#4d8063] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Fiado #{venda.id}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-10">
        {/* Client card */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm border border-[#4d8063]/5 overflow-hidden">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063] text-2xl font-bold">
                  {nome[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#4d8063]/70 uppercase tracking-wider">Cliente</p>
                  <h2 className="text-xl font-bold">{nome}</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Total</span>
                  <span className="text-base font-bold text-slate-700">R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Pago</span>
                  <span className="text-base font-bold text-emerald-600">R$ {pago.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Saldo</span>
                  <span className="text-base font-bold text-[#4d8063]">R$ {saldo.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progresso</span>
                  <span>{progressoPct}% pago</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4d8063] rounded-full transition-all" style={{ width: `${progressoPct}%` }} />
                </div>
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-[#4d8063]/20 to-[#4d8063]/60" />
          </div>
        </div>

        {/* Haver Section */}
        <div className="px-4 pb-4">
          <div className={`rounded-xl border p-4 shadow-sm ${totalHaver > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">account_balance_wallet</span>
                <div>
                  <p className="font-bold text-sm">Saldo de Haver</p>
                  <p className={`text-lg font-bold ${totalHaver > 0 ? "text-amber-700" : "text-slate-400"}`}>
                    R$ {totalHaver.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalHaver(true)}
                className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Registrar Haver
              </button>
            </div>

            {totalHaver > 0 && saldo > 0 && (
              haverSucesso ? (
                <div className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 font-bold py-3 rounded-lg text-sm">
                  <Check className="w-4 h-4" /> Haver aplicado com sucesso!
                </div>
              ) : (
                <div>
                  <p className="text-xs text-amber-700 mb-2 font-medium">Usar haver para abater este fiado:</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                      <input
                        className="w-full h-11 pl-9 pr-3 rounded-lg border border-amber-200 text-base outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        placeholder={Math.min(totalHaver, saldo).toFixed(2).replace(".", ",")}
                        value={haverValor}
                        onChange={e => setHaverValor(e.target.value.replace(/[^0-9,]/g, ""))}
                        inputMode="decimal"
                      />
                    </div>
                    <button
                      onClick={handleAplicarHaver}
                      disabled={aplicandoHaver}
                      className="bg-amber-500 text-white px-4 rounded-lg font-bold text-sm disabled:opacity-60 flex items-center gap-1"
                    >
                      {aplicandoHaver
                        ? <span className="material-symbols-outlined animate-spin text-base">refresh</span>
                        : <><Check className="w-4 h-4" />Aplicar</>
                      }
                    </button>
                  </div>
                  {haveres.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {haveres.map(h => (
                        <div key={h.id} className="flex justify-between text-xs text-amber-700">
                          <span className="truncate">{h.descricao}</span>
                          <span className="font-bold ml-2 shrink-0">R$ {parseFloat(h.saldo_restante).toFixed(2).replace(".", ",")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Asaas link */}
        <div className="px-4 pb-4">
          {venda.asaas_invoice_url ? (
            <div className="bg-white rounded-xl border border-[#4d8063]/15 p-4 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4d8063]">link</span>
                <p className="font-bold text-sm">Cobrança Digital</p>
                {venda.asaas_status === "PENDING" && <span className="ml-auto text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">Aguardando</span>}
                {venda.asaas_status === "RECEIVED" && <span className="ml-auto text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Pago</span>}
                {venda.asaas_status === "OVERDUE" && <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Vencido</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopiarLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-colors ${copied ? "bg-emerald-100 text-emerald-700" : "bg-[#4d8063]/10 text-[#4d8063]"}`}
                >
                  {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Link</>}
                </button>
                <a href={venda.asaas_invoice_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#4d8063] text-white py-2.5 px-4 rounded-lg font-bold text-sm">
                  <ExternalLink className="w-4 h-4" />Abrir
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">link_off</span>
              <div>
                <p className="text-sm font-bold text-slate-600">Sem cobrança digital</p>
                <p className="text-xs text-slate-400">Cadastre o CPF do cliente para gerar cobrança automática</p>
              </div>
            </div>
          )}
        </div>

        {/* Baixa manual */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-xl border border-[#4d8063]/10 p-4 shadow-sm">
            <p className="font-bold text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4d8063] text-base">payments</span>
              Pagamento em Dinheiro / PIX
            </p>
            {baixaSucesso ? (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-3 rounded-lg text-sm">
                <Check className="w-4 h-4" /> Baixa registrada!
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                  <input
                    className="w-full h-11 pl-9 pr-3 rounded-lg border border-slate-200 text-base outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                    placeholder={saldo.toFixed(2).replace(".", ",")}
                    value={baixaValor}
                    onChange={e => setBaixaValor(e.target.value.replace(/[^0-9,]/g, ""))}
                    inputMode="decimal"
                  />
                </div>
                <button
                  onClick={handleBaixa}
                  disabled={dandoBaixa}
                  className="bg-[#4d8063] text-white px-4 rounded-lg font-bold text-sm disabled:opacity-60 flex items-center gap-1"
                >
                  {dandoBaixa ? <span className="material-symbols-outlined animate-spin text-base">refresh</span> : <><Check className="w-4 h-4" />Dar Baixa</>}
                </button>
              </div>
            )}
            {erro && <p className="text-red-600 text-xs mt-2">{erro}</p>}
          </div>
        </div>

        {/* Message templates */}
        <div className="px-4 pb-2">
          <h3 className="text-base font-bold text-slate-800">Modelos de Mensagem</h3>
          <p className="text-sm text-slate-500">Copie e envie pelo canal que preferir</p>
        </div>
        <div className="p-4 space-y-4">
          {templates.map((t) => (
            <div key={t.title} className="bg-white p-4 rounded-xl border border-[#4d8063]/10 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${t.toneColor}`}>{t.tone}</span>
                  <h4 className="text-sm font-bold">{t.title}</h4>
                </div>
                <span className={`material-symbols-outlined ${t.iconColor}`}>{t.icon}</span>
              </div>
              <p className={`text-sm text-slate-600 leading-relaxed italic bg-[#f6f7f7] p-3 rounded-lg border-l-4 ${t.borderColor}`}>
                "{t.msg}"
              </p>
              <button
                onClick={() => handleCopiarMsg(t.msg, t.title)}
                className={`flex w-full items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-colors ${copiedMsg === t.title ? "bg-emerald-100 text-emerald-700" : "bg-[#4d8063]/10 text-[#4d8063]"}`}
              >
                {copiedMsg === t.title ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Mensagem</>}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Registrar Haver */}
      {modalHaver && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={() => setModalHaver(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-xl">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-bold text-base">Registrar Haver</h3>
                <p className="text-xs text-slate-500">Crédito para {nome}</p>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
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
              <button onClick={() => setModalHaver(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm">
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
