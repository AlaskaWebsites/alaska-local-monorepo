# 📚 Documentação Técnica — Alaska Local Monorepo

Bem-vindo à documentação técnica unificada do ecossistema **Alaska Local**. Este repositório centraliza todas as decisões de arquitetura (ADRs), modelagem de domínio, guias de engenharia, esteira operacional e pipelines de inteligência artificial.

---

## 🏛️ Registros de Decisões de Arquitetura (ADRs)

### 🌐 Frontend & Experiência do Usuário (`docs/frontend/adrs/`)
* [ADR 001: Fundação Arquitetural do Frontend](./frontend/adrs/001-fase1-fundacao-arquitetural.md) — Nuxt 3, Tailwind CSS, One Codebase e Infinite Domains.
* [ADR 002: Arquitetura NestJS e Validação Zod](./frontend/adrs/002-arquitetura-nestjs-validacao-zod.md) — Estrutura de DTOs e validação estrita.
* [ADR 003: Desacoplamento de Composables e Modais](./frontend/adrs/003-desacoplamento-composables-modais-acessibilidade.md) — Acessibilidade W3C/WCAG e modais desacoplados.
* [ADR 004: Categorização de Negócios e 4 Verticais](./frontend/adrs/004-categorizacao-de-negocios-e-templates.md) — Alaska Menu, Shop, Hub e Pro.
* [ADR 005: Integração ViaCEP e Preenchimento Automático](./frontend/adrs/005-integracao-viacep-autocompletion-endereco.md) — Composable `useCep` com cache.
* [ADR 006: Módulo de Agendamento de Serviços](./frontend/adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md) — Agendamentos, profissionais e cálculo de duração.
* [ADR 007: Cálculo de Horário Noturno e Badges Dinâmicos](./frontend/adrs/007-calculo-horario-noturno-e-badges-dinamicos.md) — Suporte a turnos noturnos de madrugada.
* [ADR 008: Resiliência de Imagens e Placeholders SVG](./frontend/adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md) — Fallbacks de imagem com cores do tema.
* [ADR 009: Protocolo de Despacho via WhatsApp](./frontend/adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md) — Formatação limpa de pedidos e agendamentos.
* [ADR 010: Busca Client-Side Zero Latência](./frontend/adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md) — Normalização Unicode e busca instantânea.
* [ADR 011: Persistência de Carrinho Namespaced](./frontend/adrs/011-persistencia-carrinho-namespaced-localstorage.md) — Isolamento de sacola por loja (`alaska_cart_<slug>`).
* [ADR 012: Arquitetura de Pagamentos Pix](./frontend/adrs/012-arquitetura-pagamentos-pix-estagio-1.md) — BR Code EMV, CRC-16 e QR Code.
* [ADR 013: Painel do Lojista e Gestão Operacional em Tempo Real](./frontend/adrs/013-painel-do-lojista-e-gestao-operacional-em-tempo-real.md) — 5 Abas operacionais, pausa rápida <3s, edição de preços e bloqueio de horários.
* [ADR 014: Monorepo Unificado com Turborepo e @alaska/contracts](./frontend/adrs/014-monorepo-turborepo-e-pacote-contracts.md) — Workspaces pnpm, pacote de domínio compartilhado e CI/CD.

### ⚙️ Backend & Infraestrutura (`docs/backend/adrs/`)
* [ADR 001: Clean Architecture e Ports & Adapters](./backend/adrs/001-clean-architecture-e-ports-and-adapters.md) — Isolamento do Core e inversão de controle via Symbols.
* [ADR 002: Validação Fail-Fast com Zod](./backend/adrs/002-validacao-fail-fast-com-zod-e-pipes-customizados.md) — Pipes Zod em controladores e schemas de ambiente.
* [ADR 003: Multi-Tenancy e Segurança com PostgreSQL RLS](./backend/adrs/003-multi-tenancy-e-supabase-postgresql-rls.md) — Isolamento seguro por tenant.
* [ADR 004: Filas Assíncronas com BullMQ e Redis](./backend/adrs/004-filas-assincronas-com-bullmq-e-redis.md) — Processamento de background jobs.
* [ADR 005: Pipeline de Agentes de IA e MCP Engine](./backend/adrs/005-pipeline-de-agentes-de-ia-e-mcp-engine.md) — Integração com LLMs e OCR.
* [ADR 006: Camada de Persistência PostgreSQL e Pooling](./backend/adrs/006-camada-de-persistencia-postgresql-e-pooling.md) — Driver nativo `pg`, pool e mappers de domínio.

---

## 🚀 Guia de Operações e Deploy

Consulte o [Guia de Deploy e Operação](./operations/deploy-guide.md) para detalhes de build e publicação na Vercel e VPS/Docker.
