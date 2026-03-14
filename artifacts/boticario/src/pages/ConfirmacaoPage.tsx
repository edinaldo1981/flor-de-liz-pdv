import { CheckCircle, Printer } from "lucide-react";
import { useEffect, useState } from "react";

interface ConfirmacaoPageProps {
  onNavigate: (page: string) => void;
}

interface VendaData {
  venda: { id: number; status: string };
  cliente: { nome: string; telefone?: string };
  items: Array<{ brand: string; name: string; price: number; qty: number }>;
  total: number;
  pagamento: string;
}

const pagamentoLabel: Record<string, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  a_prazo: "A Prazo (Fiado)",
};

export default function ConfirmacaoPage({ onNavigate }: ConfirmacaoPageProps) {
  const [dados, setDados] = useState<VendaData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ultima_venda");
      if (raw) setDados(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handlePrint = () => {
    if (!dados) return;

    const linhas = [
      "============================",
      "       FLOR DE LIZ          ",
      "============================",
      `Pedido #${dados.venda?.id || "---"}`,
      `Data: ${new Date().toLocaleString("pt-BR")}`,
      "----------------------------",
      `Cliente: ${dados.cliente.nome}`,
      "----------------------------",
      "ITENS:",
      ...dados.items.map(i => `${i.qty}x ${i.brand} ${i.name}  R$ ${(i.price * i.qty).toFixed(2).replace(".", ",")}`),
      "----------------------------",
      `TOTAL: R$ ${dados.total.toFixed(2).replace(".", ",")}`,
      `Pagamento: ${pagamentoLabel[dados.pagamento] || dados.pagamento}`,
      "============================",
      "    Obrigada pela compra!   ",
      "============================",
    ].join("\n");

    const styleEl = document.createElement("style");
    styleEl.id = "flor-print-style";
    styleEl.textContent = `
      @media print {
        body > *:not(#flor-print-area) { display: none !important; }
        #flor-print-area { display: block !important; }
      }
    `;

    const printEl = document.createElement("div");
    printEl.id = "flor-print-area";
    printEl.style.cssText = "display:none; font-family:monospace; font-size:14px; white-space:pre; padding:20px;";
    printEl.textContent = linhas;

    document.head.appendChild(styleEl);
    document.body.appendChild(printEl);

    window.print();

    document.head.removeChild(styleEl);
    document.body.removeChild(printEl);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md lg:max-w-2xl mx-auto bg-white">
      <div className="flex flex-col items-center px-6 pt-12 pb-6 gap-5">
        <div className="flex items-center justify-center bg-[#4d8063]/10 size-24 rounded-full">
          <CheckCircle className="w-14 h-14 text-[#4d8063]" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Venda Registrada!</h1>
          {dados && <p className="text-slate-500 text-sm mt-1">Pedido #{dados.venda?.id || "---"}</p>}
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {dados && (
        <div className="mx-4 bg-[#f6f7f7] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
            <div className="w-10 h-10 rounded-full bg-[#4d8063]/10 flex items-center justify-center text-[#4d8063] font-bold">
              {dados.cliente.nome[0]}
            </div>
            <div>
              <p className="font-bold">{dados.cliente.nome}</p>
              <p className="text-xs text-slate-500">{dados.cliente.telefone || "Sem telefone"}</p>
            </div>
          </div>

          <div className="space-y-1">
            {dados.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.qty}x {item.brand} {item.name}</span>
                <span className="font-medium">R$ {(item.price * item.qty).toFixed(2).replace(".", ",")}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pagamento</span>
              <span className={`font-semibold ${dados.pagamento === "a_prazo" ? "text-orange-600" : "text-slate-700"}`}>
                {pagamentoLabel[dados.pagamento] || dados.pagamento}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-[#4d8063] text-lg">R$ {dados.total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {dados.pagamento === "a_prazo" && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-sm">warning</span>
              <p className="text-xs text-orange-700 font-medium">Registrado como fiado no controle de cobranças.</p>
            </div>
          )}
        </div>
      )}

      <div className="mx-4 mt-4">
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 bg-white border border-[#4d8063]/30 rounded-xl py-4 text-[#4d8063] font-bold text-sm shadow-sm"
        >
          <Printer className="w-5 h-5" />
          Imprimir Recibo
        </button>
      </div>

      <div className="mx-4 mt-3 flex flex-col gap-3 pb-10">
        <button
          onClick={() => {
            localStorage.removeItem("carrinho_items");
            onNavigate("carrinho");
          }}
          className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add_shopping_cart</span>
          Nova Venda
        </button>
        {dados?.pagamento === "a_prazo" && (
          <button
            onClick={() => onNavigate("fiados")}
            className="w-full bg-orange-50 text-orange-700 font-bold py-4 rounded-xl border border-orange-200 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            Ver Controle de Fiados
          </button>
        )}
        <button
          onClick={() => onNavigate("home")}
          className="w-full bg-[#4d8063]/10 text-[#4d8063] font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">home</span>
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
