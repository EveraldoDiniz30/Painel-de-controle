# MJ Ofertas — Painel de Gestão

Sistema interno de gestão do **MJ Ofertas**, projeto de afiliados administrado por
**Júnior** e **Maike** (o nome vem das iniciais dos dois sócios). Centraliza gestão
financeira, controle da sociedade, meios de pagamento, e (nas próximas fases)
grupos de WhatsApp, produtos, links de afiliados, comissões, marketing, relatórios
e um assistente de IA.

Este documento cobre a análise técnica inicial, as decisões de arquitetura tomadas
e o estado atual da implementação — servindo tanto de guia de uso quanto de mapa
para quem for continuar o desenvolvimento.

## 1. Stack e decisões técnicas

O projeto partiu de um repositório vazio (apenas um README), então a stack foi
escolhida do zero, priorizando produtividade, tipagem forte de ponta a ponta e
zero dependência de serviços externos para rodar localmente:

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19** | Full-stack em TypeScript, Server Components + Server Actions eliminam a necessidade de uma API REST separada para os CRUDs internos. |
| Linguagem | **TypeScript** | Tipagem ponta a ponta entre banco, backend e formulários. |
| Banco de dados | **Prisma ORM 6 + SQLite** (dev) | Zero-config para rodar localmente sem provisionar infraestrutura. O schema é 100% portável para **PostgreSQL** — troque `provider = "sqlite"` por `"postgresql"` em `prisma/schema.prisma` e aponte `DATABASE_URL` para o Postgres. Recomendado para produção. |
| Autenticação | **Auth.js / NextAuth v5**, Credentials + JWT | Login com e-mail/senha (bcrypt), sem exigir provedor OAuth externo ainda não configurado. |
| UI | **Tailwind CSS v4** + componentes próprios (`src/components/ui`) | Sem dependência de uma lib de componentes externa; identidade visual (`src/app/globals.css`) fica centralizada em tokens CSS. |
| Gráficos | **Recharts** | Paleta e formas seguem a metodologia de dataviz (cores categóricas em ordem fixa, um hue sequencial para comparação de magnitude, sem eixo duplo). |
| Upload de arquivos | Disco local (`/uploads`, fora de `public/`) servido por rota autenticada `/api/documents/[id]` | Sem credenciais de um provedor de storage (S3, etc.) ainda configuradas. Trocar por um storage externo é isolado em `src/lib/storage.ts`. |

Nenhuma integração externa (Mercado Livre, WhatsApp, Meta Ads, IA) foi implementada
com credenciais fictícias — ver seção "Integrações futuras".

## 2. Como rodar localmente

```bash
npm install
cp .env.example .env        # ajuste AUTH_SECRET em produção
npx prisma migrate dev      # cria o banco SQLite e aplica o schema
npm run db:seed             # cria Júnior, Maike, meios de pagamento e categorias
npm run dev
```

Login de teste (criado pelo seed):

| Sócio | E-mail | Senha |
|---|---|---|
| Júnior | `junior@mjofertas.com` | `mudar123` |
| Maike | `maike@mjofertas.com` | `mudar123` |

**Troque essas senhas antes de usar o sistema com dados reais.**

Outros comandos úteis:

```bash
npm run db:studio   # abre o Prisma Studio para inspecionar o banco
npm run build        # build de produção
npm run lint         # eslint
```

## 3. Arquitetura

```
src/
  app/
    login/                 rota pública de autenticação
    (app)/                 grupo de rotas protegidas (checa sessão no layout)
      layout.tsx            sidebar + topbar + guarda de autenticação
      dashboard/            KPIs + gráficos
      sociedade/            sócios e participação societária
      acerto/               cálculo de acerto entre sócios
      despesas/ receitas/   financeiro (cada módulo: page + actions + form + modals)
      aportes/ retiradas/
      meios-pagamento/
      em-breve/[modulo]/    placeholder honesto para módulos ainda não implementados
    api/
      auth/[...nextauth]/   NextAuth
      documents/[id]/       download autenticado de comprovantes
  components/
    ui/                    kit de UI (Button, Card, Modal, Input, Badge, ...)
    layout/                Sidebar, Topbar, navegação
    charts/                wrappers Recharts (client components)
  lib/
    prisma.ts              client singleton
    auth.ts                configuração do NextAuth
    validations.ts         schemas Zod usados nas server actions
    settlement.ts           lógica do "acerto entre sócios"
    dashboard-data.ts       agregações para o dashboard
    documents.ts / storage.ts  upload de comprovantes
    audit.ts               grava o log de auditoria
prisma/
  schema.prisma            schema completo (ver seção 4)
  seed.ts                  dados iniciais
```

Cada módulo financeiro segue o mesmo padrão: uma Server Component (`page.tsx`) busca
os dados e aplica o filtro de período; um Client Component (`*-form.tsx`) cuida do
formulário; `actions.ts` contém as Server Actions (`"use server"`) que validam com
Zod, persistem via Prisma, anexam o comprovante (se enviado) e gravam auditoria.

### Regras de negócio implementadas

- **Receita, Despesa, Aporte, Retirada e Transferência nunca se misturam** — são
  modelos de banco separados (`Revenue`, `Expense`, `Contribution`, `Withdrawal`),
  conforme a regra financeira do projeto. Aportes e retiradas nunca entram no
  cálculo de resultado operacional do dashboard.
- **Acerto entre sócios** (`src/lib/settlement.ts`): para cada sócio, calcula
  `deveria_pagar = total_despesas * participação%` e compara com o que ele
  efetivamente pagou. A diferença aparece como "a receber da sociedade" (pagou a
  mais) ou "deve à sociedade" (pagou a menos). **Nenhuma transferência é feita
  automaticamente** — o sistema apenas calcula e apresenta, como pedido.
- **UX de despesa rápida**: ao selecionar quem pagou, o campo de meio de
  pagamento é filtrado no cliente para mostrar apenas os meios daquele sócio.
- **Auditoria**: toda criação/edição/exclusão de sócio, meio de pagamento,
  despesa, receita, aporte e retirada grava uma entrada em `AuditLog` com quem
  fez o quê.
- **Dados sensíveis de cartão**: apenas os últimos 4 dígitos são armazenados
  (`PaymentMethod.lastFourDigits`); o número completo nunca é solicitado.

## 4. Banco de dados

O schema (`prisma/schema.prisma`) já modela **todas** as entidades da visão de
produto, mesmo as que ainda não têm interface (para que a Fase 2 do roadmap —
banco de dados — ficasse resolvida de uma vez):

`User`, `Partner`, `PaymentMethod`, `Category`, `Expense`, `Revenue`,
`Contribution`, `Withdrawal`, `Group`, `GroupMembershipHistory`, `Product`,
`AffiliateLink`, `Click`, `Commission`, `Campaign`, `Document`, `AuditLog`,
`Integration`, `AiConversation`.

As tabelas sem interface ainda (Grupos, Produtos, Links, Comissões, Campanhas)
aparecem nos cards do dashboard com valores reais (zero, por enquanto) em vez de
dados fictícios — o dashboard consulta o banco de verdade.

## 5. O que está implementado (Fases 1–6)

- [x] Fundação: Next.js + TypeScript + Tailwind + Prisma + banco de dados
- [x] Autenticação (Júnior e Maike, ambos administradores) e proteção de rotas
- [x] Sociedade: cadastro dos sócios e configuração de participação (%)
- [x] Meios de pagamento: cadastro livre por sócio, com tipos e últimos 4 dígitos
- [x] Financeiro: despesas, receitas, aportes e retiradas (CRUD completo, com
      upload de comprovante, categorias, status, filtros de período)
- [x] Acerto entre sócios (cálculo automático, sem transferência)
- [x] Dashboard: cards de KPI, filtros de período, 4 gráficos (evolução
      financeira, despesas por categoria, por sócio e por meio de pagamento)
- [x] Auditoria de alterações financeiras
- [x] Responsivo (sidebar colapsável, cards em grid, gráficos e tabelas com
      scroll horizontal em telas pequenas)

Testado manualmente via Playwright (login, CRUD de cada módulo, edição, exclusão,
upload de comprovante, cálculo de acerto, aviso de participação != 100%,
navegação mobile) — ver histórico de sessão para os fluxos verificados.

## 6. Roadmap (próximas fases)

As páginas correspondentes já existem no menu como "em breve" com a fase prevista,
em vez de links fictícios ou funcionalidades incompletas:

| Fase | Módulo | Observação |
|---|---|---|
| 7 | Documentos | Central de documentos (o upload de comprovante já existe por registro; falta a tela central com filtros/categorias) |
| 8 | Grupos de WhatsApp | Tabelas `Group` e `GroupMembershipHistory` já existem no schema |
| 9 | Produtos, Links de afiliados, Comissões | Tabelas já existem no schema |
| 10 | Marketing / Campanhas | Tabela `Campaign` já existe no schema |
| 11 | Relatórios (exportação CSV/XLSX/PDF) | |
| 12 | MJ Assistant (IA) | Tabela `AiConversation` já existe; requer definir o provedor de IA e a política de confirmação para ações que alteram dados |
| 13 | Automações e integrações externas | Tabela `Integration` já existe como camada preparada; nenhuma integração real (Mercado Livre, WhatsApp, Meta/Google/TikTok Ads) foi configurada — exige credenciais reais, que devem ser adicionadas via variáveis de ambiente, nunca commitadas |
| 14 | Testes automatizados e revisão de segurança adicional | |

## 7. Segurança

- Senhas com hash `bcrypt`; sessão via JWT assinado (`AUTH_SECRET`).
- Todas as rotas de `(app)` exigem sessão (checagem no `layout.tsx` + `proxy.ts`).
- Uploads validam tipo MIME e tamanho máximo (15MB); arquivos ficam fora de
  `public/` e só são servidos autenticados.
- Nenhuma chave de API fica no frontend; `.env.example` documenta as variáveis
  esperadas para integrações futuras, sem valores reais.
