import { ArrowLeft, Send } from "lucide-react";

interface CobrancaPageProps {
  onNavigate: (page: string) => void;
}

const templates = [
  {
    tone: "Suave",
    toneColor: "bg-green-100 text-green-800",
    title: "Lembrete Amigável",
    icon: "chat_bubble",
    iconColor: "text-[#4d8063]/40",
    borderColor: "border-l-[#4d8063]/30",
    msg: "Olá, João! Passando para lembrar do seu pagamento que vence em breve. Podemos contar com você? Qualquer dúvida, estou à disposição!",
  },
  {
    tone: "Moderado",
    toneColor: "bg-orange-100 text-orange-800",
    title: "Aviso de Atraso",
    icon: "warning",
    iconColor: "text-orange-500/40",
    borderColor: "border-l-orange-500/30",
    msg: "Oi João, notamos que o seu pagamento de R$ 150,00 está com alguns dias de atraso. Aconteceu algo? Se precisar do boleto novamente, me avise.",
  },
  {
    tone: "Urgente",
    toneColor: "bg-red-100 text-red-800",
    title: "Cobrança Urgente",
    icon: "error",
    iconColor: "text-red-500/40",
    borderColor: "border-l-red-500/30",
    msg: "Prezado João, consta em nosso sistema um débito pendente há 15 dias. Solicitamos a regularização imediata para evitar suspensão de novos pedidos.",
  },
];

export default function CobrancaPage({ onNavigate }: CobrancaPageProps) {
  return (
    <div className="font-sans bg-[#f6f7f7] min-h-screen flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#4d8063]/10">
        <div className="flex items-center p-4 gap-4">
          <button onClick={() => onNavigate("fiados")} className="size-10 rounded-full hover:bg-[#4d8063]/10 text-[#4d8063] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Cobrança WhatsApp</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Client Card */}
        <div className="p-4">
          <div className="bg-white rounded-xl shadow-sm border border-[#4d8063]/5 overflow-hidden">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063]">
                  <span className="material-symbols-outlined text-3xl">account_circle</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#4d8063]/70 uppercase tracking-wider">Resumo do Cliente</p>
                  <h2 className="text-2xl font-bold">João Silva</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Total em Aberto</span>
                  <span className="text-lg font-bold text-[#4d8063]">R$ 150,00</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="text-lg font-bold text-orange-600">15 dias de atraso</span>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-r from-[#4d8063]/20 to-[#4d8063]/60" />
          </div>
        </div>

        <div className="px-4 py-2">
          <h3 className="text-lg font-bold text-slate-800">Modelos de Mensagem</h3>
          <p className="text-sm text-slate-500">Selecione um modelo para enviar</p>
        </div>

        {/* Templates */}
        <div className="p-4 space-y-4">
          {templates.map((t) => (
            <div key={t.title} className="bg-white p-5 rounded-xl border border-[#4d8063]/10 flex flex-col gap-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${t.toneColor}`}>{t.tone}</span>
                  <h4 className="text-base font-bold">{t.title}</h4>
                </div>
                <span className={`material-symbols-outlined ${t.iconColor}`}>{t.icon}</span>
              </div>
              <p className={`text-sm text-slate-600 leading-relaxed italic bg-[#f6f7f7] p-3 rounded-lg border-l-4 ${t.borderColor}`}>
                "{t.msg}"
              </p>
              <button className="flex w-full items-center justify-center gap-2 bg-[#4d8063] text-white py-3 rounded-lg font-bold">
                <Send className="w-4 h-4" />
                Enviar via WhatsApp
              </button>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#4d8063]/10 px-4 pb-6 pt-2 flex justify-around items-center max-w-md mx-auto">
        {[
          { icon: "home", label: "Início", page: "home" },
          { icon: "group", label: "Clientes", page: "fiados", active: true },
          { icon: "receipt_long", label: "Vendas", page: "financeiro" },
          { icon: "settings", label: "Ajustes", page: "profile" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className={`flex flex-col items-center gap-1 ${item.active ? "text-[#4d8063]" : "text-slate-400"}`}
          >
            <span className={`material-symbols-outlined ${item.active ? "fill-icon" : ""}`}>{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
