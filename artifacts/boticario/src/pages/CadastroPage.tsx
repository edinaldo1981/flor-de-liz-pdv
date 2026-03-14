import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface CadastroPageProps {
  onNavigate: (page: string) => void;
}

const API_BASE = "/api";

export default function CadastroPage({ onNavigate }: CadastroPageProps) {
  const [editando, setEditando] = useState<{ id: number } | null>(null);
  const [form, setForm] = useState({
    nome: "", cpf: "", nascimento: "",
    email: "", telefone: "",
    rua: "", bairro: "", cidade: "",
    notas: "",
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("cadastro_editar");
    if (raw) {
      try {
        const dados = JSON.parse(raw);
        setEditando({ id: dados.id });
        setForm(f => ({
          ...f,
          nome: dados.nome || "",
          cpf: dados.cpf || "",
          email: dados.email || "",
          telefone: dados.whatsapp || dados.telefone || "",
          rua: dados.endereco || "",
          notas: dados.notas || "",
        }));
        localStorage.removeItem("cadastro_editar");
      } catch { /* ignore */ }
    }
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSalvar = async () => {
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    setSaving(true);
    setErro("");
    try {
      const endereco = [form.rua, form.bairro, form.cidade].filter(Boolean).join(", ");
      const body = {
        nome: form.nome,
        telefone: form.telefone || null,
        whatsapp: form.telefone || null,
        email: form.email || null,
        cpf: form.cpf || null,
        endereco: endereco || null,
        notas: form.notas || null,
      };

      const url = editando ? `${API_BASE}/clientes/${editando.id}` : `${API_BASE}/clientes`;
      const method = editando ? "PUT" : "POST";

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error();
      setSucesso(true);
      setTimeout(() => onNavigate("clientes"), 1500);
    } catch {
      setErro("Erro ao salvar. Verifique a conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#f6f7f7] min-h-screen max-w-md lg:max-w-2xl mx-auto flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#4d8063]/10 px-4 py-4 flex items-center gap-4">
        <button onClick={() => onNavigate("clientes")} className="flex items-center justify-center size-10 rounded-full hover:bg-[#4d8063]/10 text-[#4d8063]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">{editando ? "Editar Cliente" : "Cadastrar Cliente"}</h1>
      </header>

      <main className="flex-1 p-4 pb-28 space-y-6">
        {/* Informações Pessoais */}
        <section className="flex flex-col gap-4">
          <h3 className="text-[#4d8063] text-sm font-bold uppercase tracking-wider">Informações Pessoais</h3>
          <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#4d8063]/5">
            {[
              { label: "Nome completo", key: "nome", placeholder: "Ex: João da Silva", type: "text", icon: "person", required: true },
              { label: "CPF", key: "cpf", placeholder: "000.000.000-00", type: "text", icon: "badge" },
              { label: "Data de nascimento", key: "nascimento", placeholder: "DD/MM/AAAA", type: "text", icon: "cake" },
            ].map((field) => (
              <label key={field.key} className="flex flex-col w-full">
                <p className="text-slate-700 text-sm font-medium pb-1.5">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </p>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#4d8063] text-xl">{field.icon}</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 h-12 pl-10 pr-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                    placeholder={field.placeholder}
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={set(field.key)}
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
              { label: "E-mail", key: "email", placeholder: "email@exemplo.com", type: "email", icon: "mail" },
              { label: "Telefone / WhatsApp", key: "telefone", placeholder: "(00) 00000-0000", type: "tel", icon: "phone" },
            ].map((field) => (
              <label key={field.key} className="flex flex-col w-full">
                <p className="text-slate-700 text-sm font-medium pb-1.5">{field.label}</p>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#4d8063] text-xl">{field.icon}</span>
                  <input
                    className="w-full rounded-lg border border-slate-200 h-12 pl-10 pr-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                    placeholder={field.placeholder}
                    type={field.type}
                    value={form[field.key as keyof typeof form]}
                    onChange={set(field.key)}
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
              <p className="text-slate-700 text-sm font-medium pb-1.5">Rua, Número e Bairro</p>
              <input
                className="w-full rounded-lg border border-slate-200 h-12 px-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                placeholder="Ex: Av. Brasil, 123, Centro"
                value={form.rua}
                onChange={set("rua")}
              />
            </label>
            <label className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-medium pb-1.5">Cidade</p>
              <input
                className="w-full rounded-lg border border-slate-200 h-12 px-3 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30"
                placeholder="Ex: São Paulo"
                value={form.cidade}
                onChange={set("cidade")}
              />
            </label>
          </div>
        </section>

        {/* Notas */}
        <section className="flex flex-col gap-4">
          <h3 className="text-[#4d8063] text-sm font-bold uppercase tracking-wider">Observações</h3>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4d8063]/5">
            <textarea
              className="w-full rounded-lg border border-slate-200 min-h-[100px] px-3 py-2 text-base placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#4d8063]/30 resize-none"
              placeholder="Preferências de marcas, melhores horários para contato..."
              value={form.notas}
              onChange={set("notas")}
            />
          </div>
        </section>

        {erro && (
          <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">{erro}</p>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#4d8063]/10 max-w-md mx-auto lg:max-w-2xl lg:left-60 z-20">
        {sucesso ? (
          <div className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 font-bold py-4 rounded-xl">
            <CheckCircle className="w-5 h-5" />
            {editando ? "Cliente atualizado!" : "Cliente cadastrado com sucesso!"}
          </div>
        ) : (
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="w-full bg-[#4d8063] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
          >
            {saving ? (
              <><span className="material-symbols-outlined animate-spin text-lg">refresh</span> Salvando...</>
            ) : (
              <><Save className="w-5 h-5" /> {editando ? "Salvar Alterações" : "Salvar Cadastro"}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
