import { useState } from "react";
import { ArrowLeft, Search, Plus } from "lucide-react";

const products = [
  { id: 1, brand: "Lily", name: "Eau de Parfum 75ml", price: 279.90, stock: 5, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD01thmBaw-85fXK4zO2J2FuRdJ4tQF0wtcFwOaxBG2RVGN0f40CNayvwufRTIB_0ALbCjjxzl8d9bQkofM_8BwR9XHsRsNS1yVLv3I1mXYtW7Gfx3kxcg8-MnHS5on2jHeANz7F_zdy44eCoU4DNET-WuTSEQlZXlRnhBVyI4XmKpHXEIX9vMzCjYeKIDqg6kid4TBQaUByuPK5krDCp57KdTLg0XtHw7Ixs_CvJXbUTU8rvvgl9rJnGau-oChr46GEDFmayEczBY" },
  { id: 2, brand: "Malbec", name: "Magnetic Desodorante Colônia 100ml", price: 209.90, stock: 8, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrd-rSVAJULduK2Y2aNqQmHOcBw6FLSm8ede_yuKbqwYn89IdHPwf_SNfDhYkQodC0xIrFTJehi8RD1jIM5V3Oia9vJZBHg9W0vmLgEdVy90X0W7_Lp6DpJnLRX_bHLlefB5G3sVlydLqECvs8bITVlEzv1y7pV2ynAAMEePWMrJUgklG2vL52AJx3XxC9g3Te_fKzoYwMf3RK6HXtGELO9kga6tOdnm8xT0TwMzKdizDHdK6xYE3wLKB2MZe03nohZaSc4JQtYZg" },
  { id: 3, brand: "Floratta", name: "Red Desodorante Colônia 75ml", price: 139.90, stock: 12, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX-kb5GX_lNTugx-wLBCeF1sy3t8JPCVYh104_I8UrtLA1U597JGHkrx2GqqTtJYMuLE1YVNlYZ4iAOq46d1963F9XPQdM1-wdPXVUSyOSP83Z9QqDZoTVotQyhjGrwa2vPiQBBbuHxXhOqC1pdDf_fAxJcjon1C_BLgsIE7-FO-UYpjMbybYUDoD8qcJVNBKw_v_dtC2mN1yGBubO7DCNQ2LiqmZTD5PEITZtoZvgkCzGXie2Dt5hHycPJgpG6wpThplob84y_g60" },
  { id: 4, brand: "Coffee Woman", name: "Duo Colônia 100ml", price: 184.90, stock: 3, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB77iHLMrULhbcr1Bxr2DctSuxL7ABgbCCztBtVsxQC2B83jQEbDcCXT9NSGQogAYCr8icJpjgzTO42dM74P7HNDmOKUBYUqHPZxDKYSszO2OqrdP1v2rWzHCku6u2y7jz6bd8mvldCh5j8a9z8_o3L94iAhAFuPGc7x8JRt31XZOKpbIyp31E31nVN-N8fPkiCgp3jyt88DC76C1BezH7-u5_XnEE4NDwAMZT4VY2R_uJ4KxsF2Woc_6tHSUXzbd6SP8yHZR55vPk" },
  { id: 5, brand: "Lily", name: "Creme Acetinado Hidratante 200ml", price: 109.90, stock: 7, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrJwrX4dIVBYVLfy5butVBcG2eszgjVUzYQ63Vhytw5xkFAva1zbyaF8rgo8aaDT0Pumexq-NU8b6WVGcW-g3D15DYEeF-rOekkHj-G93do14AAKYuxv2G1Gv2ebpxseAojri6BHVZCJAJh65szle73p8lqKAGCrtdinBfCurpRrcUa6CmI62jRUqfx6jki3YDpNCWzDZ3nQelJXih1wN7RrxAoqS6fSaRsixQeFrWFKZXXvwHxDkLFFTsHJsgyyfPXkzGbUrjva4" },
  { id: 6, brand: "Lily", name: "Absolu Eau de Parfum 75ml", price: 299.90, stock: 2, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGCexMvk9nr4PfFfjAotDZn0Ijjgx-Y87pZKPhQdlzjyUFaxWBrc8QlkbhgxvKnKLY4_MO5BKqBGWfQznyLXKDdgGSowyLWIZ1mhGwER-l_XXbxdsFeqwL8rYyrDl10odnGhmLLODZOv-YPBAnwkJYXwcFs03VambCGnEZ6jzLuQsQyXb9mfJOWK3QAyTa_Cxos1T2r53cqe16UmbYlnpdQwvqyVu9mxo3sgpfp1yD8tH89yelpqLlJFmzXTkxDkPfY5m_woOYCx0" },
];

const categorias = ["Todos", "Perfume", "Hidratante", "Colônia", "Óleo"];

interface PerfumariaPageProps {
  onNavigate: (page: string) => void;
}

export default function PerfumariaPage({ onNavigate }: PerfumariaPageProps) {
  const [search, setSearch] = useState("");
  const [catAtiva, setCatAtiva] = useState(0);
  const [adicionados, setAdicionados] = useState<number[]>([]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAdd = (id: number) => {
    setAdicionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="bg-[#f6f7f7] min-h-screen flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-20 bg-white border-b border-[#4d8063]/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => onNavigate("home")} className="p-1 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1">Catálogo de Produtos</h1>
          <button onClick={() => onNavigate("carrinho")} className="relative p-1">
            <span className="material-symbols-outlined text-[#4d8063]">shopping_cart</span>
            {adicionados.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4d8063] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {adicionados.length}
              </span>
            )}
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
          </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-3 gap-2">
          {categorias.map((c, i) => (
            <button
              key={c}
              onClick={() => setCatAtiva(i)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold ${catAtiva === i ? "bg-[#4d8063] text-white" : "bg-white text-slate-600 border border-slate-200"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-3 pb-24">
        <p className="text-xs text-slate-500 mb-3 font-medium">{filtered.length} produtos encontrados</p>
        <div className="flex flex-col gap-3">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-[#4d8063]/5 flex items-center gap-3 p-3 shadow-sm">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#4d8063] uppercase tracking-wider">{p.brand}</p>
                <p className="text-sm font-semibold leading-tight mt-0.5 truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[#4d8063] font-bold text-sm">R$ {p.price.toFixed(2).replace(".", ",")}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${p.stock <= 3 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-700"}`}>
                    {p.stock} un. em estoque
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleAdd(p.id)}
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${adicionados.includes(p.id) ? "bg-[#4d8063] text-white" : "bg-[#4d8063]/10 text-[#4d8063]"}`}
              >
                {adicionados.includes(p.id)
                  ? <span className="material-symbols-outlined text-lg">check</span>
                  : <Plus className="w-5 h-5" />
                }
              </button>
            </div>
          ))}
        </div>
      </main>

      {adicionados.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-[#4d8063]/10">
          <button
            onClick={() => onNavigate("carrinho")}
            className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            Ir para Venda ({adicionados.length} {adicionados.length === 1 ? "item" : "itens"})
          </button>
        </div>
      )}
    </div>
  );
}
