import { ArrowLeft, CheckCircle } from "lucide-react";

interface ConfirmacaoPageProps {
  onNavigate: (page: string) => void;
}

const brands = [
  { name: "O Boticário", status: "Processando envio", value: "R$ 145,90", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTLgKgPeh5Muy5SoAiioWysgGivI66NssAH2Fb5hm8PwCBoQsQTyM7kGS_A4T8obg1Jtg97_uMghtdUM-1675SK9x4vAURlZL7flOVPaHbG8qpHC6dBcCKhwdEzLu8Vie4dBJskIIXI7I_t_TTo3C6sPw9pNXJFpyWXzqTzai6rm-Dfqfe6q8AOVwV7Dbt81x5zLubzMwaYEiaVTSsXtTEY77ZMEXt7zwsjmStW-riSJ4pnHOA-4_KPLcpzJbcBxUkJ75g6qy2GWs" },
  { name: "Natura", status: "Aguardando separação", value: "R$ 89,30", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAH9KPymNoqT-i5RhXayqRzgX72w38CViFnD_5VVXYFziTjCpP54RmHhDsWn0mP4N-IJJqWanPNyyoktMI8t8_tX2ssDQn5Y8kiuS9T3RQG3OERqVH9oJ4nDC0DQsUu-9g7Ko4IWH2pVnGcc8tMENgTxKXVvQMbxmlew2hRvEa4G3v6oF7N7uVMhJLGNXpPJDeFKNpx4zcOmKKgv8C76e5c6bJHpZGnZiDYNTBQGXMZA5FpWVn0AiwQZufReBfh2VgeeLWwlLiJGpI" },
  { name: "Rommanel", status: "Validando estoque", value: "R$ 210,00", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIZzkJ3e9KJs-KmbJva-mcuThacR-5kjTgFlruZ88kXbiR2y0TuhQI5RNz27ebLoIsP1cGTTECLE51OaHWT-gc91wBhlD2mYZUVgjKD5Gjp7W4vY6bDYE2kWrniSw7_R8rqVayzGh3DE6PpZaqSbc7m5GnW69ci6Z8bE9zE39Sqfxoghg70ArtpbLuPLhwkajvCkqmWm7nXqDRPO-AGxKYcbo1TMOFSH4e3dKnrfhS2E3q2GzoCkKFqRDp4yggRt8Dosih0-h1pvw" },
];

export default function ConfirmacaoPage({ onNavigate }: ConfirmacaoPageProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-white shadow-xl">
      <div className="flex items-center bg-white p-4 pb-2 justify-between">
        <button onClick={() => onNavigate("home")} className="text-[#4d8063] size-12 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-12">Confirmação</h2>
      </div>

      <div className="flex flex-col px-6 py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center bg-[#4d8063]/10 size-24 rounded-full">
            <CheckCircle className="w-14 h-14 text-[#4d8063] fill-[#4d8063]/20" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold text-center">Pagamento Realizado com Sucesso!</h1>
            <p className="text-slate-600 text-sm font-medium">Pedido #823941</p>
            <p className="text-slate-500 text-sm text-center max-w-[320px]">Seu pagamento foi processado e aprovado. Em breve você receberá as atualizações por e-mail.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <h3 className="text-lg font-bold mb-2">Resumo do Processamento</h3>
        <p className="text-slate-600 text-sm leading-relaxed">Seu pedido está sendo processado individualmente por cada marca para garantir a melhor entrega.</p>
      </div>

      <div className="flex flex-col gap-1 px-4">
        {brands.map((b) => (
          <div key={b.name} className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 min-h-[72px] py-3 justify-between">
            <div className="flex items-center gap-4">
              <div
                className="rounded-lg size-12 bg-white flex items-center justify-center border border-slate-100 bg-center bg-cover"
                style={{ backgroundImage: `url('${b.img}')` }}
              />
              <div className="flex flex-col justify-center">
                <p className="text-base font-semibold leading-none">{b.name}</p>
                <p className="text-slate-500 text-xs font-normal mt-1">{b.status}</p>
              </div>
            </div>
            <p className="text-base font-medium">{b.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 px-6 py-6 border-t border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-600 text-base font-medium">Total Pago</p>
          <p className="text-[#4d8063] text-2xl font-bold">R$ 445,20</p>
        </div>
        <div className="flex flex-col gap-3">
          <button className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl">
            Ver Meus Pedidos
          </button>
          <button onClick={() => onNavigate("home")} className="w-full bg-[#4d8063]/10 text-[#4d8063] font-bold py-4 rounded-xl">
            Voltar para o Início
          </button>
        </div>
      </div>
      <div className="h-8" />
    </div>
  );
}
