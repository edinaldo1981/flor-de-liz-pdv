import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface CarrinhoPageProps {
  onNavigate: (page: string) => void;
}

const initialItems = [
  {
    id: 1,
    brand: "O Boticário",
    name: "Lily Eau de Parfum 75ml",
    price: 279.90,
    qty: 1,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD01thmBaw-85fXK4zO2J2FuRdJ4tQF0wtcFwOaxBG2RVGN0f40CNayvwufRTIB_0ALbCjjxzl8d9bQkofM_8BwR9XHsRsNS1yVLv3I1mXYtW7Gfx3kxcg8-MnHS5on2jHeANz7F_zdy44eCoU4DNET-WuTSEQlZXlRnhBVyI4XmKpHXEIX9vMzCjYeKIDqg6kid4TBQaUByuPK5krDCp57KdTLg0XtHw7Ixs_CvJXbUTU8rvvgl9rJnGau-oChr46GEDFmayEczBY",
  },
  {
    id: 2,
    brand: "Natura",
    name: "Creme Hidratante Ekos 400ml",
    price: 89.90,
    qty: 2,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrJwrX4dIVBYVLfy5butVBcG2eszgjVUzYQ63Vhytw5xkFAva1zbyaF8rgo8aaDT0Pumexq-NU8b6WVGcW-g3D15DYEeF-rOekkHj-G93do14AAKYuxv2G1Gv2ebpxseAojri6BHVZCJAJh65szle73p8lqKAGCrtdinBfCurpRrcUa6CmI62jRUqfx6jki3YDpNCWzDZ3nQelJXih1wN7RrxAoqS6fSaRsixQeFrWFKZXXvwHxDkLFFTsHJsgyyfPXkzGbUrjva4",
  },
];

export default function CarrinhoPage({ onNavigate }: CarrinhoPageProps) {
  const [items, setItems] = useState(initialItems);

  const updateQty = (id: number, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const frete = 15.90;
  const total = subtotal + frete;

  return (
    <div className="bg-[#f6f7f7] min-h-screen max-w-md mx-auto">
      <header className="sticky top-0 z-10 bg-white border-b border-[#4d8063]/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("perfumaria")} className="p-1 rounded-full hover:bg-[#4d8063]/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Minha Sacola</h1>
        </div>
        <button className="p-2 rounded-full text-slate-600">
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <main className="pb-36">
        {/* Split info */}
        <div className="m-4 p-4 rounded-xl bg-[#4d8063]/10 border border-[#4d8063]/20 flex gap-3 items-start">
          <span className="material-symbols-outlined text-[#4d8063]">info</span>
          <p className="text-sm text-[#4d8063] font-medium">
            Seu pedido será dividido por marca. Cada loja processa e entrega separadamente.
          </p>
        </div>

        {/* Items */}
        <div className="px-4 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-[#4d8063]/5 p-4 flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#4d8063] uppercase">{item.brand}</p>
                <p className="text-sm font-medium leading-tight mt-0.5">{item.name}</p>
                <p className="text-[#4d8063] font-bold mt-1">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-[#4d8063] text-white flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="ml-auto text-slate-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 border border-[#4d8063]/5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#4d8063]">local_offer</span>
            <input className="flex-1 text-sm outline-none placeholder-slate-400" placeholder="Adicionar cupom de desconto" />
            <button className="text-[#4d8063] text-sm font-bold">Aplicar</button>
          </div>
        </div>

        {/* Summary */}
        <div className="mx-4 mt-4 bg-white rounded-xl p-4 border border-[#4d8063]/5 space-y-3">
          <h3 className="font-bold">Resumo do Pedido</h3>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Frete</span>
            <span>R$ {frete.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[#4d8063]">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-[#4d8063]/10">
        <button
          onClick={() => onNavigate("confirmacao")}
          className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          Finalizar Pedido • R$ {total.toFixed(2).replace(".", ",")}
        </button>
      </div>
    </div>
  );
}
