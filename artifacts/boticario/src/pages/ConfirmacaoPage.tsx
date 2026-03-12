import { CheckCircle } from "lucide-react";

interface ConfirmacaoPageProps {
  onNavigate: (page: string) => void;
}

export default function ConfirmacaoPage({ onNavigate }: ConfirmacaoPageProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white shadow-xl">
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6">
        <div className="flex items-center justify-center bg-[#4d8063]/10 size-28 rounded-full">
          <CheckCircle className="w-16 h-16 text-[#4d8063]" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Venda Registrada!</h1>
          <p className="text-slate-500 text-sm font-medium">Pedido #823941</p>
          <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
            A venda foi registrada com sucesso no sistema.
          </p>
        </div>

        {/* Resumo */}
        <div className="w-full bg-[#f6f7f7] rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-700">Resumo da Venda</h3>
          {[
            { label: "Cliente", value: "Maria Oliveira" },
            { label: "Forma de Pagamento", value: "Pix" },
            { label: "Itens", value: "2 produtos" },
            { label: "Total", value: "R$ 489,80", bold: true },
          ].map(r => (
            <div key={r.label} className="flex justify-between items-center text-sm">
              <span className="text-slate-500">{r.label}</span>
              <span className={r.bold ? "font-bold text-[#4d8063] text-base" : "font-medium"}>{r.value}</span>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={() => onNavigate("fiados")}
            className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            Ver Controle de Fiados
          </button>
          <button
            onClick={() => onNavigate("home")}
            className="w-full bg-[#4d8063]/10 text-[#4d8063] font-bold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_shopping_cart</span>
            Nova Venda
          </button>
        </div>
      </div>
    </div>
  );
}
