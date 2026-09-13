# 📚 Documentação Técnica — Alaska Local Monorepo

Bem-vindo à base documental unificada do ecossistema **Alaska Local**. Este repositório centraliza todas as decisões de arquitetura (ADRs), modelagem de domínio, guias de engenharia, esteira operacional de frontend e backend, e esteiras de integração contínua e deploy.

---

## 🏛️ Registros de Decisões de Arquitetura (ADRs)

### 🌐 Frontend & Experiência do Usuário (`docs/frontend/adrs/`)
* [ADR 001: Fundação Arquitetural do Frontend](./frontend/adrs/001-fase1-fundacao-arquitetural.md) — Nuxt 3, Tailwind CSS, One Codebase e Infinite Domains.
* [ADR 002: Arquitetura NestJS e Validação Zod](./frontend/adrs/002-arquitetura-nestjs-validacao-zod.md) — Estrutura de DTOs e validação estrita.
* [ADR 003: Desacoplamento de Composables e Modais](./frontend/adrs/003-desacoplamento-composables-modais-acessibilidade.md) — Acessibilidade W3C/WCAG e modais desacoplados.
* [ADR 004: Categorização de Negócios e 4 Verticais](./frontend/adrs/004-categorizacao-de-negocios-e-templates.md) — Alaska Menu, Shop, Hub e Pro.
* [ADR 005: Integração ViaCEP e Preenchimento Automático](./frontend/adrs/005-integracao-viacep-autocompletion-endereco.md) — Composable `useCep` com sanitização e foco automático.
* [ADR 006: Módulo de Agendamento de Serviços](./frontend/adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md) — Agendamentos, profissionais e cálculo de duração.
* [ADR 007: Cálculo de Horário Noturno e Badges Dinâmicos](./frontend/adrs/007-calculo-horario-noturno-e-badges-dinamicos.md) — Suporte a turnos noturnos de madrugada.
* [ADR 008: Resiliência de Imagens e Placeholders SVG](./frontend/adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md) — Fallbacks de imagem com cores do tema.
* [ADR 009: Protocolo de Despacho via WhatsApp](./frontend/adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md) — Formatação limpa de pedidos e agendamentos com upsell.
* [ADR 010: Busca Client-Side Zero Latência](./frontend/adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md) — Normalização Unicode NFD e busca instantânea.
* [ADR 011: Persistência de Carrinho Namespaced](./frontend/adrs/011-persistencia-carrinho-namespaced-localstorage.md) — Isolamento de sacola por loja (`alaska_cart_<slug>`).
* [ADR 012: Arquitetura de Pagamentos Pix](./frontend/adrs/012-arquitetura-pagamentos-pix-estagio-1.md) — BR Code EMV, CRC-16 e QR Code Base64.
* [ADR 013: Painel do Lojista e Gestão Operacional em Tempo Real](./frontend/adrs/013-painel-do-lojista-e-gestao-operacional-em-tempo-real.md) — 7 Abas operacionais, 4 modais, pausa rápida <3s e alerta de expediente.
* [ADR 014: Monorepo Unificado com Turborepo e @alaska/contracts](./frontend/adrs/014-monorepo-turborepo-e-pacote-contracts.md) — Workspaces pnpm, pacote de domínio compartilhado e CI/CD.
* [ADR 015: Desacoplamento Atômico de Componentes](./frontend/adrs/015-desacoplamento-atomico-componentes-storefront-e-admin.md) — Separação atômica de Storefront e Painel Admin.
* [ADR 016: Pipeline CI/CD na Vercel com Turborepo e PNPM](./frontend/adrs/016-pipeline-ci-cd-vercel-turborepo-pnpm.md) — Pipeline de deploy automatizado do Frontend na Vercel.
* [ADR 017: Design System Claro Suave e Temas Dinâmicos no Admin](./frontend/adrs/017-padronizacao-design-system-claro-suave-e-temas-dinamicos-admin.md) — Unificação visual no padrão Claro Suave (`bg-slate-50`), script `validate-tenants.mjs` e prevenção de regressão visual.

### ⚙️ Backend & Infraestrutura (`docs/backend/adrs/`)
* [ADR 001: Clean Architecture e Ports & Adapters](./backend/adrs/001-clean-architecture-e-ports-and-adapters.md) — Isolamento do Core e inversão de controle via Symbols.
* [ADR 002: Validação Fail-Fast com Zod](./backend/adrs/002-validacao-fail-fast-com-zod-e-pipes-customizados.md) — Pipes Zod em controladores e schemas de ambiente.
* [ADR 003: Multi-Tenancy e Segurança com PostgreSQL RLS](./backend/adrs/003-multi-tenancy-e-supabase-postgresql-rls.md) — Isolamento nativo no PostgreSQL via `pg.Pool` e RLS.
* [ADR 004: Filas Assíncronas com BullMQ e Redis (Roadmap)](./backend/adrs/004-filas-assincronas-com-bullmq-e-redis.md) — Especificação de arquitetura assíncrona para workers futuros.
* [ADR 005: Pipeline de Agentes de IA e MCP Engine (Roadmap)](./backend/adrs/005-pipeline-de-agentes-de-ia-e-mcp-engine.md) — Especificação para extração visual OCR e agentes MCP externos.
* [ADR 006: Camada de Persistência PostgreSQL e Pooling](./backend/adrs/006-camada-de-persistencia-postgresql-e-pooling.md) — Driver nativo `pg`, pool de conexões e mappers de domínio.
* [ADR 007: Autenticação Segura do Painel do Lojista via PIN Hash](./backend/adrs/007-autenticacao-segura-painel-do-lojista-pin-hash.md) — Login via PIN, `SimplePasswordHasher` (SHA-256) e `MerchantAuthGuard`.

---

## 📐 Guias Especializados de Arquitetura

### 🌐 Frontend
* **[Design System & 11 Temas Cromáticos](./frontend/architecture/design-system-e-temas.md)** — Base Clara Suave (`bg-slate-50`), micro-animações táteis e 11 paletas temáticas.
* **[Módulo de Agendamentos & Serviços](./frontend/architecture/modulo-agendamento-e-servicos.md)** — Extração dinâmica, validação estrita no Passo 3, prevenção de horário fantasma e sinal Pix.
* **[Performance, Resiliência & Integração SSR](./frontend/architecture/performance-e-resiliencia-frontend.md)** — Cache reativo com `useState`, deduplicação em voo, `useShare` e middleware Nitro.
* **[Padrões de Acessibilidade W3C / WCAG](./frontend/architecture/padroes-de-acessibilidade-e-ux.md)** — Modais com `role="dialog"`, `aria-modal="true"`, focus trap e `useBodyScrollLock`.
* **[Categorias Canônicas de Negócio](./frontend/architecture/categorias-de-negocio.md)** — As 4 verticais: Menu, Shop, Hub e Pro.
* **[Guia de Criação de Novos Tenants](./frontend/operations/guia-criacao-novos-tenants.md)** — Checklist e validação via `pnpm validate:tenants`.

### ⚙️ Backend
* **[Ciclo de Vida de Pedidos e Agendamentos](./backend/architecture/ciclo-pedidos-e-agendamentos.md)** — Máquinas de estados de `Order` e `Booking`, invariantes de domínio e rotas de status.
* **[Protocolo Pix BACEN EMV & LocalPixGateway](./backend/architecture/protocolo-pix-emv.md)** — Montagem TLV (Tags 00 a 63), CRC-16 CCITT e QR Code assíncrono.
* **[Tratamento de Erros & RFC 7807](./backend/architecture/tratamento-erros-e-rfc7807.md)** — Exceções puras de domínio e padronização HTTP Problem Details.
* **[Guia de Persistência PostgreSQL & Docker](./backend/architecture/postgresql-persistence-guide.md)** — Auto-migration, auto-seed dos 10 estabelecimentos e SSL no Render.
* **[Mapa Completo de Arquitetura do Backend](./backend/architecture/mapa-arquitetura-backend.md)** — Árvore de diretórios, Use Cases e injeção de dependência.

---

## 💼 Inteligência Comercial & Go-to-Market
* **[Plano de Negócio](./frontend/commercial/PLANO_DE_NEGOCIO.md)** — Precificação aceleradora de caixa (Plano Anual Pix D+0 com Setup e Domínio inclusos vs Mensal no Asaas).
* **[Pitch e Scripts de Vendas](./frontend/commercial/PITCH_E_SCRIPTS.md)** — Abordagem consultiva Done-for-You (DFY) e superação de objeções para o comércio local.

---

## 🚀 Esteira de Deploy & Operações
* **Frontend Nuxt 3:** Hospedado na **Vercel** via monorepo Turborepo. Consulte o [Guia Definitivo de Deploy na Vercel](./operations/deploy-vercel-turborepo-monorepo.md).
* **Backend API NestJS 11:** Hospedado no **Render** via Dockerfile multi-stage e blueprint `render.yaml` conectado a PostgreSQL gerenciado com auto-SSL. Consulte o [Guia de Operações e Deploy](./operations/deploy-guide.md).
* **Provisionamento de Novas Demos:** Consulte o [Guia de Criação de Demos CLI](./operations/new-demo-guide.md) (`node apps/web/scripts/new-demo.js`).
