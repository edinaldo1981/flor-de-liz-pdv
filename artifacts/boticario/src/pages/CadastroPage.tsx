import { ArrowLeft, Save } from "lucide-react";

interface CadastroPageProps {
  onNavigate: (page: string) => void;
}

export default function CadastroPage({ onNavigate }: CadastroPageProps) {
  return (
    <div className="bg-[#f6f7f7] min-h-screen max-w-md mx-auto flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-4">
        <button onClick={() => onNavigate("profile")} className="flex items-center justify-center size-10 rounded-full hover:bg-[#4d8063]/10 text-[#4d8063]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Cadastrar Cliente</h1>
      </header>

      <main className="flex-1 p-4 pb-28 space-y-6">
        {/* Photo */}
        <div className="flex justify-center py-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#4d8063]/10 flex items-center justify-center border-2 border-[#4d8063]/20">
              <span className="material-symbols-outlined text-[#4d8063] text-4xl">person</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-[#4d8063] text-white rounded-full p-1.5">
              <span className="material-symbols-outlined text-sm">camera_alt</span>
            </button>
          </div>
        </div>

        {/* Informações Pessoais */}
        <section className="flex flex-col gap-4">
          <h3 className="text-[#4d8063] text-sm font-bold uppercase tracking-wider">Informações Pessoais</h3>
          <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#4d8063]/5">
            {[
              { label: "Nome completo", placeholder: "Ex: João da Silva", type: "text", icon: "person" },
              { label: "CPF", placeholder: "000.000.000-00", type: "text", icon: "badge" },
              { label: "Data de nascimento", placeholder: "DD/MM/AAAA", type: "text", icon: "cake" },
            ].map((field) => (
              <label key={field.label} className="flex flex-col w-full">
                <p className="text-slate-700 text-sm font-medium pb-1.5">{field.label}</p>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#4d8063] text-xl">{field.icon}</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 h-12 pl-10 pr-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                    placeholder={field.placeholder}
                    type={field.type}
                  />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Contato */}
        <section className="flex flex-col gap-4">
          <h3 className="text-[#4d8063] text-sm font-bold uppercase tracking-wider">Contato</h3>
          <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#4d8063]/5">
            {[
              { label: "E-mail", placeholder: "email@exemplo.com", type: "email", icon: "mail" },
              { label: "Telefone", placeholder: "(00) 00000-0000", type: "tel", icon: "phone" },
              { label: "WhatsApp", placeholder: "(00) 00000-0000", type: "tel", icon: "chat" },
            ].map((field) => (
              <label key={field.label} className="flex flex-col w-full">
                <p className="text-slate-700 text-sm font-medium pb-1.5">{field.label}</p>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#4d8063] text-xl">{field.icon}</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 h-12 pl-10 pr-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                    placeholder={field.placeholder}
                    type={field.type}
                  />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Endereço */}
        <section className="flex flex-col gap-4">
          <h3 className="text-[#4d8063] text-sm font-bold uppercase tracking-wider">Endereço</h3>
          <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#4d8063]/5">
            <label className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-medium pb-1.5">Rua e Número</p>
              <input className="w-full rounded-lg border border-slate-200 h-12 px-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30" placeholder="Ex: Av. Brasil, 123" />
            </label>
            <div className="flex gap-4">
              <label className="flex flex-col flex-1">
                <p className="text-slate-700 text-sm font-medium pb-1.5">Bairro</p>
                <input className="w-full rounded-lg border border-slate-200 h-12 px-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30" placeholder="Ex: Centro" />
              </label>
              <label className="flex flex-col flex-1">
                <p className="text-slate-700 text-sm font-medium pb-1.5">Cidade</p>
                <input className="w-full rounded-lg border border-slate-200 h-12 px-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30" placeholder="Ex: São Paulo" />
              </label>
            </div>
          </div>
        </section>

        {/* Notas */}
        <section className="flex flex-col gap-4">
          <h3 className="text-[#4d8063] text-sm font-bold uppercase tracking-wider">Notas / Observações</h3>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4d8063]/5">
            <textarea
              className="w-full rounded-lg border border-slate-200 min-h-[100px] px-3 py-2 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30 resize-none"
              placeholder="Adicione preferências de marcas, melhores horários para contato..."
            />
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#4d8063]/10 max-w-md mx-auto z-20">
        <button
          onClick={() => onNavigate("fiados")}
          className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"
        >
          <Save className="w-5 h-5" />
          Salvar Cadastro
        </button>
      </div>
    </div>
  );
}
