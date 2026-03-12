import { useState } from "react";
import { ShoppingCart, Search, Star } from "lucide-react";

const brands = [
  { name: "Malbec", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9_byuTsq9dx9jWOqrb31ESq_YS3SJVcqH7BftBBvw0gnBFFR6KKibC8OqqK_fTWWxuK51d4jwuCLYJKmOxzZfQP-7zR-2DF8TVNBdPW4-1rCHQxBpK8X-JAVSMIfSh5mfC1cebgNBLMYt_NFdTWNm0HGb5MbGs9USnCT5yjqjc0diZXhAgg8QCsBS9pOZE222VUsSK0KxrKrZQbpGH3Y5zR9erkxcvmHsqupFuAaNF50w6VGzP4Ny37Ef760jDcasqo6vKHTN3ZA", active: true },
  { name: "Lily", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxNbAjJyzNE2h-0sZFD5SnSmeR8uHPV2TKsyfMdffv39sPjvYl-Q0fxYaNLR-bSvYT6YmzrbAgIKQ1d5S_fYqh4mLVbtwxfilkNIkmqKWpA1n2vyxAyHLl2-ClcLM15mKHQVs4pAxo9lFOO50sVJLyOk2acBFWCKP3t0c_15sBz765-Uu8fFfBwbISrw5ZA3ZKgT1Ka7WG7XdYFfRGDpZbqq4129Q03cnCLcNSK6aKNfA8L-5gv1ge3R6BmrD0CveWVGmrih7yKEE", active: true },
  { name: "Nativa SPA", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5WrmS822iikiHfO53vApzirj2QS9_hA_4r0b45HFJm97gjqA5kK5s34kTpId03_8d6ojYXH-gNyftFUdoD7uIzTd5_uLlv9Cpc6noaU64K4KhDvj39OTxmqgdIBtiEXs1g6yy8JOvX0XAg5jcPQw3JNWvw0FTtj58LHPhlAjkfcVHLLVwyfRR5uhWtI2CM1A5Qc9xeThRr2HxlvhtYsqfBNjW1jws50IVJW0i6-A8x0Wtf_6KxnyOlt9aqqH2TqRda2el8qmxw7s", active: true },
  { name: "Make B.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKwZPse_fKrOTG5jWV3xU-05fD8-ePnLlRgN_KQVpR--DqXSmut7u_sXYP5urCsvgGixz3qDM16cmVRn0IIyprjESkJHhmU1Lna9mbk4fsLDUplfmae6Gt2raflZV09Sy_AubgJbmsXcmX43IWYlV4MtAR6YAE9PKEePRP_GaH8FUKLnpFszxlFS4F4OjrGuNoHhj7Gj1KokFZ4w5OB6MgCSv3he9PUecvMLfr5tfzluL2fCKmvbapBl88k7oJiueW8M4XthxLjBg", active: false },
  { name: "Dr. Botica", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoxxH3te-Eu1F4SmKB5UQJLcHbITYIh-awR6ohbgV6yo7KdWIVvngNjbklen4xcEDFEAWCrHvnTD3oppkRGFelWMF8vCQsa3fOPGq-IaMAl2CCrwPLdJBLlNpiz9G9IvNCTs6k70JDvBWm9ZHrmvLh0Rvg2HQpH8AXaxlRIGTXw_vjFkzQhS2--nOBBxC17RmEnTfsewOmiI7hWm9Lib6YxdwiFyMzRjs7XDrb8Ad0xRZc_21huf0tPlxk9qzZ7BXQnlAbfFpqpLE", active: false },
];

const categories = [
  { name: "Perfumaria", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8z3_K5H5X6LCVaNxMi55WrVuc3Kw8IP-TUw57faX4WBnUTsU1qeWmNs7mWjUR2pJ0-vnLOFZqbMN07IGjGV0SWGPEJb3C27YViblcGBLlfBEXzBQbo9pHgC9Yf_TWO4fzTlsMNGh62p7MDdIybGgH4zYcbxK7LzxoaZLyIaG63YEZRk8LaM6v-7z_t-HG5yM4QXFSjo3ws76KIqVTlSjvMDukvcIC-DVOaQM7x6uMWX8x44N6mIgyiyO3jz3819jPBWUGvPcL8_s" },
  { name: "Maquiagem", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuPC6Z2AmvET0iCpskQZO5s4rL5qlP6xVEZZiX4en0T25OT89Wi12L3t4XSlZGHgIE6yeIIBhqZvo2-6BwLBiLmt_gSXvqRCvd5MWvkgBvBuzwfRjoicTI9PsAMeMQSfDUIaxH44t58fq408Vf7pD_b6MwaQF1edlBWtMipe0h9kvXA3rt7mobdF8NDanMnevg2ADNPoH19KmWazWcDsTEr0IPVXibXml7SsnTaUf-6dOu0NROgGpnPTBpS9w-yG8oR-D89TsDa_k" },
  { name: "Corpo e Banho", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCEBo9mtlKNWBUGeLkPsAQZlHkhwEwqAJeXHdLrkxdiNYbTaNfxJ6nW1lc248-CNxs5SpB6BENCXls3z-r_Dy-aT-ZcL9YnkqRZt4jye-hO4ndn0cKjOOLjwFlDy1ICdfZdjIla6GNanBXvTl5XkLmgFeLViE21OLEBFdXwInmQQh2DnLaTt1LX7UH4vb5llaEt-uSBY1NmzoQaFcCoRCyYYme9JdnNypdLKsgGefiQltRoxqVkHXd258DvOvkuAv_FT1brX9j64E" },
  { name: "Cabelos", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCguQ93jZox412Ll91K-fnRQRmcLDSsepQB4LSjqIL4Oi3T9xRQlVIEzyTK_ehYoTYM_Jofa9AwEgrsypy1sd7Ho8zC1vR2rNFhcOBDInN41eST_Aj1xD9so7CVwq4y3_EmQbkoLRW__4PmR-7eiwJj9k0gbEtsBXA2vHRIiPrYPqRaSqgz8Whl4QbvoMef1TBUoKexNCeQaqS4ll8YHgxxR5iO6ffrvqPpc9ztYBBo5ufXBcpUW-Fiev1oX7wM8cRT-Qzv9WIb4fY" },
];

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="bg-[#f6f7f7] min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4d8063] text-3xl">menu</span>
            <h1 className="text-xl font-bold tracking-tight text-[#4d8063]">O Boticário</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1">
              <span className="material-symbols-outlined text-slate-700">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button onClick={() => onNavigate("profile")} className="w-10 h-10 rounded-full bg-[#4d8063]/10 flex items-center justify-center border border-[#4d8063]/20">
              <span className="material-symbols-outlined text-[#4d8063]">person</span>
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400 w-4 h-4" />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 border-none rounded-xl text-sm placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#4d8063]/50"
            placeholder="O que você procura hoje?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Brand Stories */}
        <section className="py-6 overflow-x-auto no-scrollbar">
          <div className="flex px-4 gap-6">
            {brands.map((b) => (
              <div key={b.name} className="flex flex-col items-center gap-2 shrink-0">
                <div className={`p-0.5 rounded-full border-2 ${b.active ? "border-[#4d8063]" : "border-slate-200"}`}>
                  <div
                    className="w-16 h-16 rounded-full bg-white border border-slate-100 bg-center bg-cover"
                    style={{ backgroundImage: `url('${b.img}')` }}
                  />
                </div>
                <span className="text-xs font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Banner */}
        <section className="px-4 mb-8">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAOOSMydJjlJmMAy0XBfOR7RlY3TLI8QvGcfCFrLk1Eb-IiLrXCgYpOjVxLiexLtLbfe4s5plEmOE6urjaH2IytDuAku1y5pUwLNHX-_z3ugMWbm-GE1YVmp9MCPiA5uaCMqKCNqXE_O-Bz_CzSW8txHXv7QbdpLeXvX4qclm7ZRtLFig6MsN1Q9aEr0rVwMqc9_bKdNMouUZtCbOQ2hSxMzTVjpeHyx7aDsTjmzqRLFER0ngUYoetQq3aE9Z-XDMlyw_4sfo86e3g')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Oferta Exclusiva</span>
              <h2 className="text-white text-2xl font-bold mb-2">Semana da Perfumaria</h2>
              <p className="text-white/90 text-sm mb-4">Até 40% OFF em fragrâncias selecionadas.</p>
              <button onClick={() => onNavigate("perfumaria")} className="bg-[#4d8063] text-white px-6 py-2 rounded-full text-sm font-bold w-fit">Aproveitar</button>
            </div>
          </div>
        </section>

        {/* Loyalty */}
        <section className="px-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#4d8063]/10 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#4d8063]/10 p-3 rounded-xl">
                <span className="material-symbols-outlined text-[#4d8063]">redeem</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Viva O Boticário</h3>
                <p className="text-xs text-slate-500">Você tem <span className="text-[#4d8063] font-bold">1.250 pontos</span></p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Categorias</h3>
            <button onClick={() => onNavigate("perfumaria")} className="text-[#4d8063] text-sm font-semibold">Ver todas</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <button key={cat.name} onClick={() => onNavigate("perfumaria")} className="relative group h-32 rounded-xl overflow-hidden shadow-sm text-left">
                <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url('${cat.img}')` }} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-white font-bold text-sm">{cat.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recommendation */}
        <section className="px-4 mb-12">
          <h3 className="text-lg font-bold mb-4">Especialmente para você</h3>
          <button onClick={() => onNavigate("produto")} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex w-full text-left">
            <div
              className="w-1/3 aspect-square bg-center bg-cover"
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbqh7Jct2T5-t6X4flwABRhIF5yhWnZPrJZuUqzc2gS4hhMchCd_WnTb09e6eBSQrqHlDtL8fxFOd6fOBhZHMtixtdK0UivI7IrtEwLyvZPpZ8M_UyQb2dDZntBA5KEKaWFZHuM-mFSZmRxny2QlHPMGkyvn3E3wjUYlE1CwFVlQxLDv_8gTl3xpyHMpkbEWBWCxYhivvUterTODoFjq5_SSjDvoii7ze5iJ_HZ1ZLZzpEFexdCXqDZv8UQEsyh3-TURk7e4VO6ss')` }}
            />
            <div className="w-2/3 p-4 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-[#4d8063] uppercase mb-1">Novidade</span>
              <h4 className="font-bold text-sm mb-1">Combo Lily: Hidratante + Perfume</h4>
              <p className="text-slate-500 text-xs mb-3">O presente ideal para momentos inesquecíveis.</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#4d8063]">R$ 289,90</span>
                <div className="bg-[#4d8063]/10 p-2 rounded-lg">
                  <ShoppingCart className="text-[#4d8063] w-5 h-5" />
                </div>
              </div>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}
