# AGENTS.md — Diretrizes de Engenharia, Monorepo & Governança de IA (Master)

Este documento é o guia definitivo de arquitetura, padrões técnicos e regras de negócio para agentes autônomos e engenheiros de software que atuam no ecossistema unificado **Alaska Local** (`AlaskaWebsites/alaska-local-monorepo`).

---

## 🧭 1. North Star e Visão do Produto

* **Missão**: Entregar uma plataforma SaaS multi-tenant de alta performance para estabelecimentos locais (alimentação, adegas, barbearias, clínicas odontológicas/médicas, semijoias, boutiques de moda e profissionais liberais), unindo vitrines mobile-first ultrarrápidas, pedidos e agendamentos via WhatsApp, geração oficial de Pix EMV (BACEN), painel operacional do lojista e backend escalável com Clean Architecture e PostgreSQL RLS.
* **4 Verticais Canônicas**:
  * 🍔 **Alaska Menu**: Food service, hamburguerias, pizzarias, adegas 24h, espetarias, confeitarias e delivery.
  * 🛍️ **Alaska Shop**: Boutiques de moda feminina, semijoias finas, calçados e cosméticos com sacola em tempo real.
  * 💈 **Alaska Hub**: Barbearias, salões de beleza, estúdios de tatuagem com agendamento de horários e venda de produtos upsell.
  * ⚖️ **Alaska Pro**: Clínicas médicas, odontologia, psicólogos e advogados com agendamento de consultas e avaliações.
* **Modelo de Negócio**: Venda *Done-for-You* (DFY) no plano anual (R$ 720 / R$ 600 / R$ 990 à vista no Pix D+0 com Setup Grátis e Domínio incluso no 1º ano) ou mensal (Setup + R$ 50 a R$ 120/mês), sem taxas sobre as vendas do lojista.

---

## 🏗️ 2. Arquitetura do Monorepo Unificado (Turborepo + pnpm)

```
alaska-local-monorepo/
├── AGENTS.md                         # Este guia mestre de engenharia
├── README.md                         # Visão geral do monorepo e comandos
├── docker-compose.yml                # Orquestração local (PostgreSQL 16 e Backend API)
├── package.json                      # Scripts raiz (dev, test, db:up, db:seed)
├── pnpm-workspace.yaml               # Configuração de workspaces pnpm
├── turbo.json                        # Pipeline Turborepo com cache inteligente
│
├── apps/
│   ├── web/                          # Frontend Nuxt 3 (One Codebase, Infinite Domains)
│   │   ├── components/               # Modais e componentes com acessibilidade W3C/WCAG
│   │   ├── composables/              # useCart, useBookingSlots, useCep, useTenantTheme, useHaptic
│   │   ├── data/                     # Catálogos locais JSON das 9 lojas ativas
│   │   ├── pages/                    # index.vue (Showcase) e [slug].vue (Vitrine dinâmica)
│   │   └── server/                   # Middleware de resolução de domínios (tenant.ts)
│   │
│   └── api/                          # Backend NestJS 11 (Clean Architecture & RLS)
│       ├── src/
│       │   ├── core/ (domain, application, ports, use-cases) # Domínio 100% puro e agnóstico
│       │   └── infrastructure/ (http, gateways, modules, persistence)
│       ├── docker/                   # init.sql com DDL, índices e RLS
│       └── scripts/                  # seed.ts para sincronização no banco de dados
│
├── packages/
│   ├── contracts/                    # @alaska/contracts (Single Source of Truth com Zod 3.24)
│   │   ├── src/ (tenant, catalog, order, booking, pix, common)
│   │   └── tsup.config.ts            # Build híbrido ESM, CJS e tipos .d.ts
│   │
│   └── tsconfig/                     # Configurações TypeScript compartilhadas
│
└── docs/                             # Documentação Centralizada do Ecossistema
    ├── README.md                     # Índice de documentação
    ├── adrs/                         # Architecture Decision Records (ADRs 001 a 014)
    ├── architecture/                 # Guias técnicos de arquitetura e qualidade
    ├── commercial/                   # Planos de negócio, scripts de vendas e Asaas
    └── operations/                   # Runbooks de operação, CLI e Docker
```

---

## 🛡️ 3. O Ciclo de Desenvolvimento para Agentes de IA (5 Etapas)

Todo agente ou desenvolvedor deve seguir rigorosamente o fluxo em 5 etapas:

1. **ADR / Spec:** Documentar a decisão técnica em `docs/adrs/` ou `docs/architecture/`.
2. **Contrato Zod:** Declarar ou atualizar schemas canônicos no pacote `@alaska/contracts` (`packages/contracts/src/`).
3. **Test Harness (Vitest):** Criar suítes de teste unitário determinísticas no `packages/contracts`, `apps/api` e `apps/web`.
4. **Implementação Pura:** Implementar os Casos de Uso (backend) ou Composables (frontend) sem acoplamento indevido a frameworks ou DOM.
5. **Integração UI/Controller & Build Gate:** Conectar controladores REST ou componentes de interface e rodar `pnpm test` (garantindo 100% dos testes em verde).

---

## 📋 4. Regras Invioláveis de Engenharia

### A. Domínio e Backend (Clean Architecture / NestJS 11)
1. **Tratamento Monetário Estrito (`Money` VO)**:
   * **NUNCA** utilize números de ponto flutuante (`float`/`number` decimal) para valores monetários no domínio do backend.
   * Sempre utilize o Value Object `Money` (`src/core/domain/value-objects/money.vo.ts`) e armazene preços no PostgreSQL em **centavos inteiros** (`price_cents INT`).
2. **Isolamento do Core**:
   * A camada `src/core/domain/` e `src/core/application/` deve ser 100% pura (zero decoradores `@Injectable()`, `@Controller()`, `@Entity()` ou bibliotecas de banco de dados).
3. **Injeção por Tokens**:
   * Repositórios e gateways devem ser injetados no NestJS utilizando os símbolos de `TOKENS` (`TOKENS.TENANT_REPOSITORY`, etc.).
4. **Validação Fail-Fast com Zod**:
   * Todos os DTOs de entrada devem ser validados via `ZodValidationPipe` contra schemas do `@alaska/contracts`.

### B. Frontend e Vitrine (Nuxt 3 / Vue 3 / Tailwind CSS)
1. **Regra de Ouro**: *One Codebase, Infinite Domains*.
   * Uma única base Nuxt 3 resolve dinamicamente todos os estabelecimentos via rotas por slug (`pages/[slug].vue`), subdomínios wildcard e domínios próprios (`www.cliente.com.br`).
2. **Acessibilidade W3C / WCAG**:
   * Todos os modais devem conter `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, auto-focus, atalho `Escape` e trava de rolagem via `useBodyScrollLock`.
3. **Segurança SSR & Null-Safety**:
   * Proteja acessos a arrays e tamanhos em templates (ex: `v-if="(items?.length || 0) > 0"`).
4. **Resolução de Temas**:
   * Utilize `useTenantTheme` para aplicar dinamicamente as classes utilitárias dos 11 temas cromáticos.
5. **Pagamento Pix EMV & QR Code**:
   * Geração de BR Code compatível com BACEN (Tags 00 a 63) com checksum CRC-16 CCITT (0x1021, 0xFFFF) e QR Code Base64 assíncrono.

### C. Contratos Compartilhados (`@alaska/contracts`)
1. O pacote `@alaska/contracts` é a **Single Source of Truth** de todos os tipos e schemas Zod.
2. Sempre que um campo for adicionado ou alterado, a modificação deve iniciar em `packages/contracts/src/` e ser compilada com `pnpm build:contracts`.

---

## 🚫 5. Anti-Patterns Proibidos

* ❌ **NUNCA** invente propriedades locais não mapeadas nos schemas Zod.
* ❌ **NUNCA** utilize `class-validator`, `Joi` ou Prisma (o ecossistema utiliza Zod e pg Pool nativo com RLS).
* ❌ **NUNCA** suba alterações para produção sem antes garantir que `pnpm test` esteja passando 100% verde (*Green*).
* ❌ **NUNCA** comite pastas `.nuxt`, `.output`, `dist`, `node_modules` ou chaves de ambiente no Git.
