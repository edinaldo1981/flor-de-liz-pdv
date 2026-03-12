import { Search } from "lucide-react";

interface FiadosPageProps {
  onNavigate: (page: string) => void;
}

const devedores = [
  {
    name: "João Silva",
    last: "12/10/2023",
    debt: "R$ 150,00",
    highlight: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiDk4z8PPna4Q1iLyMT-GRbPAGxqv-143AOF8k-mhCAdQ8TFx31T6Q1NCsW6ddRD911CMjlb16M7vhs4jArm6GSdwpBqwpOcbwAqDscXvPvm-bLPiCG4q-lQt2MVg4a2IV6hP8WEMjcsE6nzgTWhxyjd0U7bvb7eBoWH_N7uu3JEMtcoWLpipdLslshbBsMK-fnUmktNZO3botV_Zdk1Kn9_Lk9J6a7eHsiYTMOazeTL0mmS1H2CHsNp5rBXmzExX6ynF7dtjoLfI",
  },
  {
    name: "Maria Oliveira",
    last: "05/11/2023",
    debt: "R$ 342,80",
    highlight: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd41_aGHHKYZaM_YfjZ3WJejt-4u47DFC3o_PdMrk53mYsc0FdMYsLPIPt4nBAhTBe41T1uhH18_MPQNsAHEcq6t868Ybpcwnx4CuTvnN7kXbd7Wu88KaYtLtSt72GX7iUZjA4bZOgYT5eS1CjkMWTfXX5vZNN8PIvrt6Wt5xBDRKgw879rka8fG9g6ORZ7yHaJTgRQqJTh9tjslizj4DXSuwLxuTA33kmssXI9nNCeZfbYuANBKNYAMuh_f33Jfkvgm41sU5RV7I",
  },
  {
    name: "Ricardo Santos",
    last: "28/10/2023",
    debt: "R$ 890,00",
    highlight: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBleSxIjn6LwrLyrSDlGY1SPiiNodAUp2sf1RFhUFNNhZvuqDOLFlwHTB3UQcUqGxutYakEE4d4sYNMBg7gtWzNPAeWIOORaNk40w2Ajo17oEUdQG_RIyuf33nyqMyF_Dbo1b4F7tXXcj57jFojrD_5uwMDV3cCYXCLJP3-BYFeqJsvS813uPw8p8StIbOxBVujJK8PqjMK3eYisGShR03D7cIDUQdaoGKJkdh-0HNItMklHOfSvzI-6yEeIbaNqjTt3vW4CGpjOfs",
  },
  {
    name: "Ana Costa",
    last: "02/11/2023",
    debt: "R$ 45,20",
    highlight: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFU0DMT4vcnyRgwpeWIXveKUR-EDB9as7xdrywjsBN5bwOOBgD6FcP18lgC5JMpEB9eAaCcYmM1Mw0E-vyCJMV90lTVaOymQGW8EoI3uApEc6c9WpYh32-dB_wFy7nvr_mB1ZdQ0W10e6NJGyOKFig0ZbpgG_j9Jn_C9j_BBRDyTDROZfnwDH_GPKD2E2Y59TiM4t9S7yLHPMAGARIV92jWkpKoOHwYgySupwax9v8JoIVdqo6ygOf5hmgNmVqzCyy9R2zOgqCJAw",
  },
];

export default function FiadosPage({ onNavigate }: FiadosPageProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white shadow-xl overflow-x-hidden">
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-[#4d8063]/10">
        <div className="text-[#4d8063] flex size-12 shrink-0 items-center">
          <span className="material-symbols-outlined text-3xl">menu</span>
        </div>
        <h2 className="text-lg font-bold flex-1 text-center">Controle de Fiados</h2>
        <button className="w-12 flex items-center justify-end">
          <Search className="w-5 h-5 text-[#4d8063]" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Stats */}
        <div className="flex flex-wrap gap-4 p-4">
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#4d8063]/20 bg-[#4d8063]/5">
            <p className="text-slate-600 text-sm font-medium">Total a Receber</p>
            <p className="text-[#4d8063] text-2xl font-bold">R$ 4.820,50</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-sm">trending_up</span>
              <p className="text-emerald-600 text-xs font-medium">+8.2% este mês</p>
            </div>
          </div>
          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#4d8063]/20 bg-[#4d8063]/5">
            <p className="text-slate-600 text-sm font-medium">Devedores Ativos</p>
            <p className="text-2xl font-bold">18</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-rose-600 text-sm">trending_up</span>
              <p className="text-rose-600 text-xs font-medium">+3 novos</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-2">
          <button
            onClick={() => onNavigate("cadastro")}
            className="w-full flex items-center justify-center gap-2 bg-[#4d8063] text-white py-3 px-4 rounded-xl font-bold shadow-sm"
          >
            <span className="material-symbols-outlined">person_add</span>
            Cadastrar Novo Devedor
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pb-2 pt-6">
          <h3 className="text-lg font-bold">Lista de Devedores</h3>
          <button className="text-[#4d8063] text-sm font-semibold">Ver todos</button>
        </div>

        <div className="flex flex-col gap-1 px-2 pb-24">
          {devedores.map((d) => (
            <button
              key={d.name}
              onClick={() => onNavigate("cobranca")}
              className="flex items-center gap-4 bg-white hover:bg-[#4d8063]/5 p-3 rounded-xl transition-colors border-b border-[#4d8063]/5 w-full text-left"
            >
              <div
                className="aspect-square bg-cover rounded-full h-14 w-14 shrink-0 border-2 border-[#4d8063]/20"
                style={{ backgroundImage: `url('${d.img}')` }}
              />
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-base font-bold">{d.name}</p>
                <p className="text-slate-500 text-xs">Última compra: {d.last}</p>
                <p className={`text-sm font-bold mt-0.5 ${d.highlight ? "text-rose-600" : "text-[#4d8063]"}`}>
                  Dívida: {d.debt}
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate("cobranca"); }}
                  className="text-emerald-500 bg-emerald-50 p-2 rounded-full flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                </button>
              </div>
            </button>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-[#4d8063]/10 bg-white px-4 pb-4 pt-2 flex justify-between items-end z-20">
        <button onClick={() => onNavigate("home")} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-2xl">home</span>
          <p className="text-[10px] font-medium uppercase tracking-wider">Início</p>
        </button>
        <button onClick={() => onNavigate("fiados")} className="flex flex-1 flex-col items-center justify-center gap-1 text-[#4d8063]">
          <span className="material-symbols-outlined text-2xl fill-icon">receipt_long</span>
          <p className="text-[10px] font-bold uppercase tracking-wider">Fiados</p>
        </button>
        <div className="flex-1 flex justify-center -translate-y-4">
          <button onClick={() => onNavigate("cadastro")} className="bg-[#4d8063] text-white p-3 rounded-full shadow-lg shadow-[#4d8063]/40">
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
        <button onClick={() => onNavigate("financeiro")} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-2xl">sell</span>
          <p className="text-[10px] font-medium uppercase tracking-wider">Vendas</p>
        </button>
        <button onClick={() => onNavigate("profile")} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-2xl">more_horiz</span>
          <p className="text-[10px] font-medium uppercase tracking-wider">Mais</p>
        </button>
      </nav>
    </div>
  );
}
