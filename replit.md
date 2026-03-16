# Flor de Liz PDV — SaaS Multi-Tenant

## Visão Geral

Plataforma SaaS multi-tenant para revendedoras de beleza. Cada loja tem dados isolados, autenticação própria, chave PIX e planilha Google Sheets. O sistema permite gerenciar vendas, fiados, haver, clientes, produtos e financeiro via app mobile-style.

**URL de produção**: `https://perfumariaflordeliz.replit.app`

---

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24 | **TypeScript**: 5.9
- **API**: Express 5 (artifacts/api-server)
- **Frontend PDV**: React + Vite + Tailwind CSS (artifacts/boticario)
- **Portal do Cliente**: React + Vite (artifacts/portal-cliente)
- **Database**: PostgreSQL (Replit managed, via `DATABASE_URL`)
- **Auth**: JWT (jsonwebtoken) com 30d expiry para lojas, 8h para super admin
- **Pagamentos**: Asaas (PIX cobranças)
- **Backup**: Google Sheets (via Replit integration)

---

## Estrutura do Projeto

```
artifacts/
├── api-server/         # Express API — src/routes/, src/middleware/
├── boticario/          # PDV app React+Vite (admin/colaborador)
├── portal-cliente/     # Portal público do cliente (fiados, pagamentos)
└── mockup-sandbox/     # Sandbox de componentes UI

lib/
├── db/                 # Pool PostgreSQL + verificação de tabelas
├── api-spec/           # OpenAPI spec + Orval codegen
├── api-client-react/   # React Query hooks gerados
└── api-zod/            # Zod schemas gerados

scripts/
└── build-production.sh # Build de todos os artefatos para produção
```

---

## Banco de Dados — Tabelas

| Tabela | Campos relevantes |
|--------|-------------------|
| `lojas` | id, nome, slug, status, plano, created_at |
| `clientes` | id, nome, cpf, telefone, whatsapp, email, loja_id |
| `vendas` | id, cliente_id, total, valor_pago, status, forma_pagamento, loja_id |
| `venda_itens` | id, venda_id, nome_produto, marca, preco_unit, quantidade |
| `produtos` | id, marca, nome, preco, estoque, img_url, loja_id |
| `haveres` | id, cliente_id, valor, saldo_restante, descricao, loja_id |
| `config` | key, value, loja_id — UNIQUE(key, loja_id) |

**Flor de Liz**: loja_id=1, slug="flordeliz"

---

## Auth & JWT

- **Login de loja**: `POST /api/auth/login` → `{ slug, password }` → JWT `{ lojaId, lojaSlug, role, permissions }`
- **Login super admin**: `POST /api/superadmin/login` → `{ password }` → JWT `{ superAdmin: true }`
- **JWT_SECRET**: env var (96 chars auto-gerado)
- **SUPER_ADMIN_PASSWORD**: secret configurado
- **authMiddleware**: extrai lojaId do Bearer token em todas as rotas protegidas
- **Frontend**: JWT salvo em `localStorage("auth_token")` e enviado via `Authorization: Bearer`

---

## API Routes

### Auth (públicas)
- `GET /api/auth/config?slug=` — verifica se loja tem senha configurada
- `POST /api/auth/login` — `{ slug, password }` → `{ token, role, permissions }`
- `GET/POST /api/config/pix` — chave PIX da loja (requer auth)
- `POST /api/auth/config` — salva senhas admin/colab (requer auth admin)

### Super Admin
- `POST /api/superadmin/login` — senha master → token super admin
- `GET /api/superadmin/lojas` — listar todas as lojas com stats
- `POST /api/superadmin/lojas` — criar nova loja
- `PATCH /api/superadmin/lojas/:id` — editar loja (status, plano, nome, senha)
- `POST /api/superadmin/loja-token` — gerar token admin para uma loja

### Portal (público)
- `GET /api/portal/cliente?cpf=&loja=` — dados do cliente (fiados, haveres, histórico)

### Rotas protegidas (requerem Bearer token)
- `/api/clientes` — CRUD clientes
- `/api/vendas` — CRUD vendas + fiados
- `/api/produtos` — CRUD produtos
- `/api/haveres` — CRUD haveres
- `/api/dashboard` — stats do dia
- `/api/financeiro` — relatório financeiro
- `/api/importar-vendas` — importação em lote
- `/api/sheets/status` e `/api/sheets/sync` — Google Sheets backup

---

## Frontend — Boticário

- **Auth flow**: LoginPage → slug + senha → JWT → `localStorage(auth_token, auth_role, auth_permissions, auth_slug)`
- **API calls**: todas usam `apiFetch()` de `src/lib/api.ts` (injeta Bearer token automaticamente)
- **Logout**: `clearToken()` limpa todo o localStorage
- **Super Admin**: botão "admin" discreto na tela de login → `SuperAdminPage` (fundo escuro, separado)
- **Permissões**: admin = acesso total; colaborador = permissões configuráveis

### Páginas
| Página | Acesso |
|--------|--------|
| LoginPage | Público |
| SuperAdminPage | Super admin (senha master) |
| HomePage | Todos autenticados |
| CarrinhoPage | Todos |
| FiadosPage | `ver_fiados` |
| ClientesPage | `ver_clientes` |
| FinanceiroPage | `ver_financeiro` |
| ProfilePage | `ver_perfil` |
| ConfigAcessoPage | Admin only |
| ImportarVendasPage | `importar_vendas` |

---

## Portal do Cliente

- URL: `/portal-cliente/?loja=<slug>`
- Sem autenticação — cliente busca por CPF ou telefone
- Mostra: fiados em aberto, haver disponível, histórico, chave PIX para pagamento
- Se loja não informada, usa `flordeliz` como padrão

---

## Deploy

```bash
bash scripts/build-production.sh
git add -A && git commit -m "SaaS build"
# Clicar em Deploy no Replit
```

Servidor de produção: `node artifacts/api-server/dist/index.cjs`

### ⚠️ Aviso sobre migrações de banco

O Replit compara o **banco de dev** com o **banco de produção** para gerar migrations automáticas. Como o `init.ts` adiciona colunas SaaS (`loja_id`, tabela `lojas`, etc.) no banco de dev em cada startup, haverá sempre diferença entre dev e prod após o primeiro deploy.

**Se o deploy travar em "Migrations failed validation":**
- Selecionar **"Copy your development database schema & data to production"**
- Isso copia o banco de dev (correto) para produção — é seguro porque o `init.ts` garante que a estrutura sempre esteja atualizada em dev

**Estrutura de tabelas gerenciada por**: `artifacts/api-server/src/db/init.ts` (não pelo Drizzle schema)

---

## Variáveis de Ambiente

| Var | Tipo | Descrição |
|-----|------|-----------|
| `DATABASE_URL` | Auto Replit | Conexão PostgreSQL |
| `JWT_SECRET` | Env var | 96 chars, auto-gerado |
| `SUPER_ADMIN_PASSWORD` | Secret | Senha master do super admin |
| `ASAAS_API_KEY` | Secret | API key da Asaas para PIX |

---

## PWA Cache

- Boticário: `api-cache-v3`
- Portal: cache separado

---

## GitHub

Remote: `origin` → `https://github.com/edinaldo1981/flor-de-liz-pdv.git`
