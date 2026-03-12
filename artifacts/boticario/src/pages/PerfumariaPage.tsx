import { useState } from "react";
import { ArrowLeft, ShoppingBag, Search, Heart } from "lucide-react";

const products = [
  {
    id: 1,
    brand: "Lily",
    name: "Eau de Parfum 75ml",
    price: "R$ 279,90",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD01thmBaw-85fXK4zO2J2FuRdJ4tQF0wtcFwOaxBG2RVGN0f40CNayvwufRTIB_0ALbCjjxzl8d9bQkofM_8BwR9XHsRsNS1yVLv3I1mXYtW7Gfx3kxcg8-MnHS5on2jHeANz7F_zdy44eCoU4DNET-WuTSEQlZXlRnhBVyI4XmKpHXEIX9vMzCjYeKIDqg6kid4TBQaUByuPK5krDCp57KdTLg0XtHw7Ixs_CvJXbUTU8rvvgl9rJnGau-oChr46GEDFmayEczBY",
    liked: true,
  },
  {
    id: 2,
    brand: "Malbec",
    name: "Magnetic Desodorante Colônia 100ml",
    price: "R$ 209,90",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrd-rSVAJULduK2Y2aNqQmHOcBw6FLSm8ede_yuKbqwYn89IdHPwf_SNfDhYkQodC0xIrFTJehi8RD1jIM5V3Oia9vJZBHg9W0vmLgEdVy90X0W7_Lp6DpJnLRX_bHLlefB5G3sVlydLqECvs8bITVlEzv1y7pV2ynAAMEePWMrJUgklG2vL52AJx3XxC9g3Te_fKzoYwMf3RK6HXtGELO9kga6tOdnm8xT0TwMzKdizDHdK6xYE3wLKB2MZe03nohZaSc4JQtYZg",
    liked: false,
  },
  {
    id: 3,
    brand: "Floratta",
    name: "Red Desodorante Colônia 75ml",
    price: "R$ 139,90",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX-kb5GX_lNTugx-wLBCeF1sy3t8JPCVYh104_I8UrtLA1U597JGHkrx2GqTtJYMuLE1YVNlYZ4iAOq46d1963F9XPQdM1-wdPXVUSyOSP83Z9QqDZoTVotQyhjGrwa2vPiQBBbuHxXhOqC1pdDf_fAxJcjon1C_BLgsIE7-FO-UYpjMbybYUDoD8qcJVNBKw_v_dtC2mN1yGBubO7DCNQ2LiqmZTD5PEITZtoZvgkCzGXie2Dt5hHycPJgpG6wpThplob84y_g60",
    liked: false,
  },
  {
    id: 4,
    brand: "Coffee",
    name: "Woman Duo Colônia 100ml",
    price: "R$ 184,90",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB77iHLMrULhbcr1Bxr2DctSuxL7ABgbCCztBtVsxQC2B83jQEbDcCXT9NSGQogAYCr8icJpjgzTO42dM74P7HNDmOKUBYUqHPZxDKYSszO2OqrdP1v2rWzHCku6u2y7jz6bd8mvldCh5j8a9z8_o3L94iAhAFuPGc7x8JRt31XZOKpbIyp31E31nVN-N8fPkiCgp3jyt88DC76C1BezH7-u5_XnEE4NDwAMZT4VY2R_uJ4KxsF2Woc_6tHSUXzbd6SP8yHZR55vPk",
    liked: false,
  },
];

const tabs = ["Feminino", "Masculino", "Infantil", "Unissex"];

interface PerfumariaPageProps {
  onNavigate: (page: string) => void;
}

export default function PerfumariaPage({ onNavigate }: PerfumariaPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [likes, setLikes] = useState<Record<number, boolean>>({ 1: true });

  return (
    <div className="bg-white min-h-screen flex flex-col max-w-md mx-auto shadow-xl overflow-x-hidden">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#4d8063]/10">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate("home")} className="text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold">Perfumaria</h2>
          </div>
          <button onClick={() => onNavigate("carrinho")}>
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-center rounded-lg bg-[#4d8063]/5 border border-[#4d8063]/10 px-3 h-11 gap-2">
            <Search className="w-4 h-4 text-[#4d8063]" />
            <input className="flex-1 bg-transparent text-sm outline-none placeholder-slate-500" placeholder="Buscar perfumes" />
          </div>
        </div>
      </header>

      <div className="sticky top-[108px] z-10 bg-white border-b border-[#4d8063]/5">
        <div className="flex overflow-x-auto no-scrollbar px-4 gap-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex flex-col items-center border-b-2 pb-3 pt-4 whitespace-nowrap text-sm font-medium ${
                activeTab === i ? "border-[#4d8063] text-[#4d8063] font-bold" : "border-transparent text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 pb-24">
        <div className="flex gap-2 p-4">
          <button className="flex h-9 items-center gap-2 rounded-full bg-[#4d8063]/10 px-4 text-[#4d8063] border border-[#4d8063]/20">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span className="text-xs font-bold">Filtrar</span>
          </button>
          <button className="flex h-9 items-center gap-2 rounded-full bg-[#4d8063]/10 px-4 text-[#4d8063] border border-[#4d8063]/20">
            <span className="material-symbols-outlined text-lg">swap_vert</span>
            <span className="text-xs font-bold">Ordenar</span>
          </button>
        </div>

        {/* Featured Banner */}
        <div className="px-4 mb-6">
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1652d7zzACSXQ2kCS6NsOg1ttriM3-a7UZ068DsH0d6nSjn52lvEeu2rGc78USQeTFhPjhL03huiqNV5_jUtg5lMovidOrw7Qxf7BiLG7_xQWmNFZ1jfkaBTG9KV9EWrYDshfiisacMfrZA_ks6yi0u9f4zOqeRo81kMqyFAZvTJ0asEOVhabZhRs_cfESpCu9YhFVYFwGOMpsH_hb0vSr4g0Iaem6wGTn3WyrhiGSp3hkM0r_t2ITlOgeUTpBfUlUz2zZpuwRPM"
              alt="Lily Lumière"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-6">
              <span className="text-[10px] font-bold tracking-widest text-white uppercase mb-1">Novo Lançamento</span>
              <h3 className="text-2xl font-bold text-white mb-2">Lily Lumière</h3>
              <p className="text-white/80 text-xs max-w-[150px] mb-4">A intensidade do lírio com o frescor da mandarina.</p>
              <button onClick={() => onNavigate("produto")} className="bg-[#4d8063] text-white text-[10px] font-bold px-4 py-2 rounded-full w-fit uppercase tracking-wider">Confira</button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-4 grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="flex flex-col bg-white rounded-xl border border-[#4d8063]/5 overflow-hidden">
              <div className="relative aspect-[4/5] bg-slate-50">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                <button
                  className="absolute top-2 right-2 size-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full"
                  onClick={() => setLikes((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                >
                  <Heart className={`w-4 h-4 ${likes[p.id] ? "fill-[#4d8063] text-[#4d8063]" : "text-slate-400"}`} />
                </button>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <p className="text-[10px] font-bold text-[#4d8063] uppercase tracking-wider mb-0.5">{p.brand}</p>
                <h4 className="text-sm font-medium text-slate-800 leading-tight mb-2 flex-1">{p.name}</h4>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-[#4d8063] font-bold">{p.price}</p>
                  <button
                    onClick={() => onNavigate("carrinho")}
                    className="size-8 bg-[#4d8063] rounded-lg flex items-center justify-center text-white"
                  >
                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 flex gap-2 border-t border-[#4d8063]/10 bg-white/95 backdrop-blur-md px-4 pb-4 pt-2">
        {[
          { icon: "home", label: "Início", page: "home" },
          { icon: "shopping_bag", label: "Loja", page: "carrinho" },
          { icon: "auto_awesome", label: "Perfumaria", page: "perfumaria", active: true },
          { icon: "sell", label: "Ofertas", page: "home" },
          { icon: "person", label: "Perfil", page: "profile" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className={`flex flex-1 flex-col items-center justify-end gap-1 ${item.active ? "text-[#4d8063]" : "text-slate-500"}`}
          >
            <span className={`material-symbols-outlined ${item.active ? "fill-icon" : ""}`}>{item.icon}</span>
            <p className="text-[10px] font-medium">{item.label}</p>
          </button>
        ))}
      </nav>
    </div>
  );
}
