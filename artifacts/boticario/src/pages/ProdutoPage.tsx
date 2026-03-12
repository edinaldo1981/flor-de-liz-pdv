import { ArrowLeft, Share2, Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";

interface ProdutoPageProps {
  onNavigate: (page: string) => void;
}

const related = [
  { name: "Creme Acetinado Hidratante Lily", price: "R$ 109,90", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrJwrX4dIVBYVLfy5butVBcG2eszgjVUzYQ63Vhytw5xkFAva1zbyaF8rgo8aaDT0Pumexq-NU8b6WVGcW-g3D15DYEeF-rOekkHj-G93do14AAKYuxv2G1Gv2ebpxseAojri6BHVZCJAJh65szle73p8lqKAGCrtdinBfCurpRrcUa6CmI62jRUqfx6jki3YDpNCWzDZ3nQelJXih1wN7RrxAoqS6fSaRsixQeFrWFKZXXvwHxDkLFFTsHJsgyyfPXkzGbUrjva4" },
  { name: "Lily Absolu Eau de Parfum", price: "R$ 299,90", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGCexMvk9nr4PfFfjAotDZn0Ijjgx-Y87pZKPhQdlzjyUFaxWBrc8QlkbhgxvKnKLY4_MO5BKqBGWfQznyLXKDdgGSowyLWIZ1mhGwER-l_XXbxdsFeqwL8rYyrDl10odnGhmLLODZOv-YPBAnwkJYXwcFs03VambCGnEZ6jzLuQsQyXb9mfJOWK3QAyTa_Cxos1T2r53cqe16UmbYlnpdQwvqyVu9mxo3sgpfp1yD8tH89yelpqLlJFmzXTkxDkPfY5m_woOYCx0" },
  { name: "Óleo Perfumado Corporal Lily", price: "R$ 84,90", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjZFgfjCqVdRsHZFYx2bDUDQVWZKiFsJhaR_leaWbiyhFE0Wmr1CihJzcucjiKYyZt7uCQ164PwstKWcunU0VcTiXM3e4lR8CRT1Sx8ccmpbYEfeAjEhYpGfJp5XseKaroHNrMx6oMX2JVDpWvQLkscELuBTKg__H-RI__qUhil_mIamSTzoL5e249kVtRsaBuH-ubGfinHHCdn6mF3MYPlPJd1W6Ata0tEUQtf7I_UX-fCx7l0BWXQoGk_sLEtEVTscIf3deY3Dw" },
];

export default function ProdutoPage({ onNavigate }: ProdutoPageProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f7f7] max-w-md mx-auto shadow-2xl">
      <div className="sticky top-0 z-50 flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-[#4d8063]/10">
        <button onClick={() => onNavigate("perfumaria")} className="text-[#4d8063] size-10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center">Lily Eau de Parfum</h2>
        <button className="text-[#4d8063] size-10 flex items-center justify-end">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="relative bg-white">
        <div
          className="aspect-[4/5] w-full bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6qdYKZcIHmlSYjQZhRBeSI0hf3N8taIe2_2HkPrjLOeV_PyofBfgIW13arFB--rN_Dh1NJELrd0vBiQFo1Tg9qOaM3nwzXwrJ8hldoxAX5XPWvXEhAEe0r3TtsHi5Pud3la7lQXUjjCu1c8tjlC6UzhORHID9kF1FOhlJ-TUUwtz-GDup1RJnQzI6J1C0TQgvCqUOBs_x5V8eeMmNZPxK3FNdg58wGvlgWZVTesTadD_PSAR8mGPaZAqFENhPkrc_oQOw3sMr1zo')` }}
        />
        <button
          onClick={() => setLiked(!liked)}
          className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-lg"
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-[#4d8063] text-[#4d8063]" : "text-[#4d8063]"}`} />
        </button>
      </div>

      <div className="p-6 space-y-4 bg-white">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#4d8063]/70">Flor de Liz</span>
          <h1 className="text-2xl font-bold leading-tight mt-1">Lily Eau de Parfum 75ml</h1>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex text-yellow-500">
              {[1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-yellow-500" />)}
              <Star className="w-4 h-4 fill-yellow-200 text-yellow-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">(4.8 • 1.2k avaliações)</span>
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">R$ 279,90</h2>
          <p className="text-sm text-slate-600">ou em até <span className="font-bold">10x de R$ 27,99</span></p>
        </div>
        <button onClick={() => onNavigate("carrinho")} className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          COMPRAR
        </button>
      </div>

      <div className="px-6 py-4 border-t border-[#4d8063]/10 bg-white">
        <h3 className="text-lg font-bold mb-3">O Segredo de Lily</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Lily Eau de Parfum faz parte de uma das fragrâncias de maior sucesso de O Boticário. Uma fragrância feminina que soma a delicadeza de facetas florais com a força marcante das madeiras.
        </p>
      </div>

      <div className="mx-4 my-4 px-6 py-6 bg-[#4d8063]/5 rounded-xl space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#4d8063] text-center">Pirâmide Olfativa</h3>
        {[
          { icon: "light_mode", label: "Topo", notes: "Pêra, Mandarina, Pimenta Rosa." },
          { icon: "favorite", label: "Coração", notes: "Lírio do Vale, Gardênia, Violeta." },
          { icon: "nature", label: "Fundo", notes: "Sândalo, Baunilha, Almíscar." },
        ].map((item, i) => (
          <div key={i} className={`flex items-start gap-4 ${i === 1 ? "border-y border-[#4d8063]/10 py-4" : ""}`}>
            <div className="bg-[#4d8063]/20 p-2 rounded-lg text-[#4d8063]">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#4d8063] uppercase">{item.label}</p>
              <p className="text-sm">{item.notes}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="py-8 bg-white">
        <div className="px-6 flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Quem comprou também amou</h3>
          <span className="text-[#4d8063] text-xs font-bold">Ver todos</span>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-4 no-scrollbar">
          {related.map((p, i) => (
            <div key={i} className="min-w-[160px] bg-white p-3 rounded-xl shadow-sm border border-[#4d8063]/5">
              <div className="h-32 w-full bg-slate-100 rounded-lg mb-2 overflow-hidden">
                <img src={p.img} alt={p.name} className="object-cover h-full w-full" />
              </div>
              <p className="text-xs font-medium line-clamp-2">{p.name}</p>
              <p className="text-sm font-bold mt-1 text-[#4d8063]">{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 border-t border-[#4d8063]/10 mb-24 bg-white">
        <h3 className="text-lg font-bold mb-4">Avaliações</h3>
        <div className="flex gap-4">
          <div className="size-10 rounded-full bg-[#4d8063]/20 flex items-center justify-center text-[#4d8063] font-bold">M</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold">Mariana S.</p>
              <span className="text-[10px] text-slate-500">2 dias atrás</span>
            </div>
            <div className="flex text-yellow-500 mb-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-500" />)}
            </div>
            <p className="text-xs text-slate-600">Minha fragrância favorita da vida! Chique e atemporal.</p>
          </div>
        </div>
        <button className="w-full mt-6 py-3 border border-[#4d8063] text-[#4d8063] font-bold rounded-lg text-sm">
          LER TODAS AS AVALIAÇÕES
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white border-t border-[#4d8063]/10">
        <div className="flex gap-2 px-4 pb-3 pt-2">
          {[
            { icon: "home", label: "Início", page: "home", active: true },
            { icon: "search", label: "Busca", page: "perfumaria" },
            { icon: "local_mall", label: "Sacola", page: "carrinho" },
            { icon: "favorite", label: "Favoritos", page: "perfumaria" },
            { icon: "person", label: "Perfil", page: "profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 ${item.active ? "text-[#4d8063]" : "text-slate-400"}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <p className="text-[10px] font-medium">{item.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
