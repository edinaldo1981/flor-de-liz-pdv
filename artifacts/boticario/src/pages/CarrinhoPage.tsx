import { ArrowLeft, Trash2, Plus, Minus, Search } from "lucide-react";
import { useState } from "react";

interface CarrinhoPageProps {
  onNavigate: (page: string) => void;
}

const initialItems = [
  { id: 1, brand: "Lily", name: "Eau de Parfum 75ml", price: 279.90, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD01thmBaw-85fXK4zO2J2FuRdJ4tQF0wtcFwOaxBG2RVGN0f40CNayvwufRTIB_0ALbCjjxzl8d9bQkofM_8BwR9XHsRsNS1yVLv3I1mXYtW7Gfx3kxcg8-MnHS5on2jHeANz7F_zdy44eCoU4DNET-WuTSEQlZXlRnhBVyI4XmKpHXEIX9vMzCjYeKIDqg6kid4TBQaUByuPK5krDCp57KdTLg0XtHw7Ixs_CvJXbUTU8rvvgl9rJnGau-oChr46GEDFmayEczBY" },
  { id: 2, brand: "Malbec", name: "Magnetic 100ml", price: 209.90, qty: 1, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrd-rSVAJULduK2Y2aNqQmHOcBw6FLSm8ede_yuKbqwYn89IdHPwf_SNfDhYkQodC0xIrFTJehi8RD1jIM5V3Oia9vJZBHg9W0vmLgEdVy90X0W7_Lp6DpJnLRX_bHLlefB5G3sVlydLqECvs8bITVlEzv1y7pV2ynAAMEePWMrJUgklG2vL52AJx3XxC9g3Te_fKzoYwMf3RK6HXtGELO9kga6tOdnm8xT0TwMzKdizDHdK6xYE3wLKB2MZe03nohZaSc4JQtYZg" },
];

const clientes = ["Maria Oliveira", "João Silva", "Ana Costa", "Ricardo Santos"];
const formasPagamento = [
  { icon: "payments", label: "Dinheiro" },
  { icon: "credit_card", label: "Cartão" },
  { icon: "qr_code", label: "Pix" },
  { icon: "receipt_long", label: "Fiado" },
];

export default function CarrinhoPage({ onNavigate }: CarrinhoPageProps) {
  const [items, setItems] = useState(initialItems);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [pagamento, setPagamento] = useState(0);
  const [showClientes, setShowClientes] = useState(false);

  const updateQty = (id: number, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const isFiado = pagamento === 3;

  return (
    <div className="bg-[#f6f7f7] min-h-screen max-w-md mx-auto flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-3">
        <button onClick={() => onNavigate("home")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Nova Venda</h1>
          <p className="text-xs text-slate-500">{items.length} {items.length === 1 ? "produto" : "produtos"} adicionados</p>
        </div>
        <button onClick={() => onNavigate("perfumaria")} className="flex items-center gap-1 bg-[#4d8063]/10 text-[#4d8063] px-3 py-2 rounded-xl text-xs font-bold">
          <Plus className="w-3 h-3" />
          Produto
        </button>
      </header>

      <main className="flex-1 pb-36 overflow-y-auto">
        {/* Cliente */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cliente</h3>
          <button
            onClick={() => setShowClientes(!showClientes)}
            className="bg-white w-full rounded-xl border border-[#4d8063]/10 px-4 py-3 flex items-center gap-3 shadow-sm text-left"
          >
            <span className="material-symbols-outlined text-[#4d8063]">account_circle</span>
            <span className={`flex-1 text-sm ${clienteSelecionado ? "font-semibold text-slate-800" : "text-slate-400"}`}>
              {clienteSelecionado || "Selecionar cliente..."}
            </span>
            <span className="material-symbols-outlined text-slate-400">expand_more</span>
          </button>
          {showClientes && (
            <div className="bg-white mt-1 rounded-xl border border-[#4d8063]/10 shadow-md overflow-hidden">
              {clientes.map(c => (
                <button
                  key={c}
                  onClick={() => { setClienteSelecionado(c); setShowClientes(false); }}
                  className="w-full px-4 py-3 text-sm text-left hover:bg-[#4d8063]/5 border-b last:border-0 border-slate-100"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Itens */}
        <div className="px-4 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Itens da Venda</h3>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-[#4d8063]/5 p-3 flex gap-3 shadow-sm">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#4d8063] uppercase">{item.brand}</p>
                  <p className="text-sm font-semibold leading-tight truncate">{item.name}</p>
                  <p className="text-[#4d8063] font-bold text-sm mt-0.5">R$ {item.price.toFixed(2).replace(".", ",")}</p>
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
        </div>

        {/* Forma de Pagamento */}
        <div className="px-4 pt-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Forma de Pagamento</h3>
          <div className="grid grid-cols-4 gap-2">
            {formasPagamento.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setPagamento(i)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-colors ${
                  pagamento === i
                    ? "bg-[#4d8063] text-white border-[#4d8063]"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
          {isFiado && (
            <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-lg">warning</span>
              <p className="text-xs text-orange-700 font-medium">Esta venda será registrada como fiado para o cliente selecionado.</p>
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 border border-[#4d8063]/5 shadow-sm">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500">Desconto</span>
            <span className="font-medium text-emerald-600">— R$ 0,00</span>
          </div>
          <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[#4d8063] text-lg">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-[#4d8063]/10">
        <button
          onClick={() => onNavigate("confirmacao")}
          className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
        >
          <span className="material-symbols-outlined">{isFiado ? "receipt_long" : "check_circle"}</span>
          {isFiado ? "Registrar como Fiado" : `Confirmar Venda • R$ ${total.toFixed(2).replace(".", ",")}`}
        </button>
      </div>
    </div>
  );
}
