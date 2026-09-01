# Alaska Local — Frontend (@alaska/web)

> **Vitrines Digitais Mobile-First para Comércios Locais**  
> Nuxt 3 • Vue 3 • Tailwind CSS • TypeScript • Zod • Vitest • W3C Acessibilidade

---

## 🧭 Visão Geral & Filosofia de Arquitetura

O `@alaska/web` é o frontend do ecossistema **Alaska Local**, projetado sob o princípio **One Codebase, Infinite Domains**: uma única aplicação Nuxt 3 atende múltiplos estabelecimentos comerciais de forma dinâmica, rápida e isolada.

### Pilares Fundamentais

1. **One Codebase, Infinite Domains:**  
   Resolução multi-tenant por slug (`/pages/[slug]/index.vue`), subdomínios wildcard e domínios próprios (`server/middleware/tenant.ts`).
2. **Single Source of Truth (`@alaska/contracts` — ADR 014):**  
   Tipagens e schemas Zod centralizados no pacote compartilhado do monorepo, garantindo segurança ponta a ponta.
3. **Páginas como Orquestradoras (ADR 015):**  
   As páginas `pages/[slug]/index.vue` e `pages/[slug]/admin.vue` apenas orquestram estado reativo, delegando a apresentação para componentes desacoplados em `components/storefront/` e `components/admin/`.
4. **Resiliência e Zero Downtime:**  
   Fallback automático para catálogos locais em `~/data/*.json` caso a API esteja offline, e placeholders SVG temáticos dinâmicos para imagens quebradas.
5. **Acessibilidade Semântica W3C / WCAG 2.1 AA:**  
   Todos os modais possuem `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco inicial automático, atalho `Escape` e trava de rolagem com `useBodyScrollLock`.
6. **Pipeline de Deploy Determinístico (ADR 016):**  
   Deploy serverless na Vercel orquestrado via Turborepo e PNPM v10 com Build Output API v3.

---

## 🏛️ Registros de Decisões de Arquitetura (ADRs)

| ADR | Título | Escopo |
| :--- | :--- | :--- |
| [ADR 001](./adrs/001-fase1-fundacao-arquitetural.md) | Fundação Arquitetural da Fase 1 | Clean Architecture, POTO e Zod no bootstrap |
| [ADR 002](./adrs/002-arquitetura-nestjs-validacao-zod.md) | Arquitetura NestJS e Validação Zod | Validação universal com Zod e BullMQ |
| [ADR 003](./adrs/003-desacoplamento-composables-modais-acessibilidade.md) | Desacoplamento de Composables e Modais | Teleport, tipos canônicos e acessibilidade W3C |
| [ADR 004](./adrs/004-categorizacao-de-negocios-e-templates.md) | Categorização de Negócios e Templates | Verticais Menu, Shop, Hub e Pro |
| [ADR 005](./adrs/005-integracao-viacep-autocompletion-endereco.md) | Integração ViaCEP e Autocompletion | Composable useCep e máscara |
| [ADR 006](./adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md) | Módulo de Agendamento e Venda Híbrida | Slots dinâmicos e carrinho unificado |
| [ADR 007](./adrs/007-calculo-horario-noturno-e-badges-dinamicos.md) | Cálculo de Horário Noturno | Suporte a turnos pós meia-noite |
| [ADR 008](./adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md) | Resiliência de Imagens e Placeholders SVG | Fallback dinâmico sem layout shift |
| [ADR 009](./adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md) | Protocolo de Despacho via WhatsApp | Templates determinísticos em markdown |
| [ADR 010](./adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md) | Busca Client-Side com Normalização Unicode | Busca NFD sem latência e com acentuação |
| [ADR 011](./adrs/011-persistencia-carrinho-namespaced-localstorage.md) | Persistência de Carrinho Namespaced | Chaves isoladas por tenant e SSR safety |
| [ADR 012](./adrs/012-arquitetura-pagamentos-pix-estagio-1.md) | Pagamentos Pix EMV com CRC-16 | BR Code BACEN e modo de teste de R$ 0,01 |
| [ADR 013](./adrs/013-integracao-api-first-nestjs-e-persistencia-remota.md) | Integração Híbrida API-First | Fallback automático entre API e JSON |
| [ADR 013](./adrs/013-painel-do-lojista-e-gestao-operacional-em-tempo-real.md) | Painel do Lojista (Merchant Admin) | Gestão mobile, PIN e mutações otimistas |
| [ADR 014](./adrs/014-monorepo-turborepo-e-pacote-contracts.md) | Monorepo Turborepo e @alaska/contracts | Pacote compartilhado e Single Source of Truth |
| [ADR 015](./adrs/015-desacoplamento-atomico-componentes-storefront-e-admin.md) | Desacoplamento Atômico Storefront e Admin | Componentização atômica em 7 abas e 4 modais |
| [ADR 016](./adrs/016-pipeline-ci-cd-vercel-turborepo-pnpm.md) | Pipeline de CI/CD na Vercel com Turborepo e PNPM | Deploy serverless, Build Output API v3 e Corepack |

---

## 📚 Documentação Operacional & Deploy

- [Guia Definitivo de Deploy na Vercel (Monorepo Turborepo)](../operations/deploy-vercel-turborepo-monorepo.md)
- [Runbook de Criação de Demos CLI (new-demo.js)](./operations/RUNBOOK_DEMOS.md)
