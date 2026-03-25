const ASAAS_KEY = process.env.ASAAS_API_KEY ?? "";
const ASAAS_BASE = process.env.ASAAS_ENV === "production"
  ? "https://api.asaas.com/api/v3"
  : "https://sandbox.asaas.com/api/v3";

function headers() {
  return {
    "Content-Type": "application/json",
    "access_token": ASAAS_KEY,
  };
}

export function asaasEnabled(): boolean {
  return ASAAS_KEY.length > 0;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj?: string;
  mobilePhone?: string;
  email?: string;
}

export interface AsaasCharge {
  id: string;
  invoiceUrl: string;
  pixQrCodeUrl?: string;
  status: string;
  value: number;
  dueDate: string;
}

async function asaasFetch(path: string, options?: RequestInit) {
  const url = `${ASAAS_BASE}${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers(), ...(options?.headers ?? {}) } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asaas error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function findOrCreateAsaasCustomer(cliente: {
  nome: string;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
}): Promise<string> {
  if (cliente.cpf) {
    const found = await asaasFetch(`/customers?cpfCnpj=${encodeURIComponent(cliente.cpf)}&limit=1`);
    if (found.data && found.data.length > 0) {
      return found.data[0].id as string;
    }
  }

  const body: Record<string, string> = { name: cliente.nome };
  if (cliente.cpf) body.cpfCnpj = cliente.cpf;
  if (cliente.telefone) body.mobilePhone = cliente.telefone.replace(/\D/g, "");
  if (cliente.email) body.email = cliente.email;

  const created = await asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return created.id as string;
}

function nextBusinessDay(days = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function createAsaasCharge(opts: {
  customerId: string;
  vendaId: number;
  total: number;
  dueDate?: string;
}): Promise<AsaasCharge> {
  const body = {
    customer: opts.customerId,
    billingType: "UNDEFINED",
    value: opts.total,
    dueDate: opts.dueDate ?? nextBusinessDay(3),
    externalReference: String(opts.vendaId),
    description: `Fiado #${opts.vendaId} - Flor de Liz`,
  };

  const charge = await asaasFetch("/payments", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    id: charge.id,
    invoiceUrl: charge.invoiceUrl,
    pixQrCodeUrl: charge.pixQrCodeUrl,
    status: charge.status,
    value: charge.value,
    dueDate: charge.dueDate,
  };
}

export async function getAsaasCharge(chargeId: string): Promise<AsaasCharge> {
  const charge = await asaasFetch(`/payments/${chargeId}`);
  return {
    id: charge.id,
    invoiceUrl: charge.invoiceUrl,
    pixQrCodeUrl: charge.pixQrCodeUrl,
    status: charge.status,
    value: charge.value,
    dueDate: charge.dueDate,
  };
}
