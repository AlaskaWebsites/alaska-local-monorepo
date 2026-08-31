# AGENTS.md — Diretrizes de Engenharia, Clean Architecture & Governança no Monorepo

Este documento é o guia definitivo de arquitetura, padrões técnicos e regras invioláveis para agentes autônomos e engenheiros de software que atuam no monorepo unificado **Alaska Local** (`AlaskaWebsites/alaska-local-monorepo`).

---

## 🧭 1. North Star e Princípios Arquiteturais

* **Missão**: Fornecer a plataforma digital definitiva para comércio e serviços locais, combinando vitrines digitais ultra-rápidas em Nuxt 3 (One Codebase, Infinite Domains, 11 Temas), gestão operacional em tempo real via Painel do Lojista (ADR 013) e backend resiliente em NestJS 11 com Clean Architecture, PostgreSQL e Pix D+0.
* **Single Source of Truth**: Todos os contratos, DTOs e validações residem exclusivamente no pacote compartilhado **`@alaska/contracts`**.
* **Isolamento de Domínio no Backend**: A camada `apps/api/src/core/` é 100% pura e agnóstica de frameworks.
* **Acessibilidade e Desempenho no Frontend**: 100% de conformidade com W3C/WCAG, interações táteis (`useHaptic`), busca client-side zero latência e isolamento rigoroso de sacola por loja (`alaska_cart_<slug>`).

---

## 🏗️ 2. Estrutura do Monorepo

```
alaska-local-monorepo/
├── apps/
│   ├── web/                          # Frontend Nuxt 3 (One Codebase, Infinite Domains)
│   │   ├── composables/              # useTenant, useCart, useOpeningHours, useMerchantAdmin, useCep, useHaptic
│   │   ├── pages/                    # [slug]/index.vue (Vitrine), [slug]/admin.vue (Painel do Lojista)
│   │   └── components/               # Modais acessíveis, customizadores, gaveta de carrinho e agendamento
│   │
│   └── api/                          # Backend NestJS 11 (Clean Architecture & PostgreSQL 16)
│       ├── src/core/domain/          # Entidades puras, Value Objects (Money, PixKey) e Domain Errors
│       ├── src/core/application/     # Casos de Uso, Portas e Tokens de injeção
│       └── src/infrastructure/       # Controladores REST, Pipes Zod, Repositórios PostgreSQL e In-Memory
│
├── packages/
│   └── contracts/                    # @alaska/contracts (Schemas Zod compartilhados)
│
└── docs/                             # Base Documental Completa (ADRs 001 a 014)
```

---

## 📋 3. Regras Invioláveis de Engenharia

### 1. Contratos Compartilhados (`@alaska/contracts`)
* Sempre que criar ou modificar um endpoint, DTO ou regra de validação, atualize primeiro o schema Zod correspondente em `packages/contracts/src/`.
* Nunca duplique interfaces ou tipos manualmente em `apps/web` ou `apps/api`.

### 2. Tratamento Monetário (`Money` Value Object)
* **NUNCA** utilize valores em ponto flutuante (`float`/`number` decimal) no domínio do backend.
* Valores monetários no banco de dados e no domínio são sempre armazenados em **centavos inteiros** (`price_cents INT`).

### 3. Painel do Lojista e Overrides em Tempo Real (ADR 013)
* Alterações operacionais feitas no painel administrativo (`/[slug]/admin`) são salvas de forma otimista em `localStorage` sob a chave `alaska_overrides_<slug>` e sincronizadas com a API.
* A vitrine consome o objeto `effectiveTenant` reativo para refletir produtos esgotados, novos preços, horários, comunicado e pausa geral instantaneamente.

### 4. Bloqueio Rígido de Pedidos Fora de Horário
* Se o estabelecimento estiver fora do expediente ou pausado, a sacola bloqueia o botão de envio para o WhatsApp (`Loja Fechada • Pedidos Desabilitados`).

### 5. Suíte de Testes Automatizados (Vitest Gate)
* Antes de finalizar qualquer alteração ou abrir pull requests, execute `pnpm test`. Todos os 214+ testes unitários devem passar com 100% de sucesso nos 3 workspaces.
