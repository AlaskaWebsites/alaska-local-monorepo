# 🌐 Alaska Local — Front-end Architecture Documentation (`@alaska/web`)

Documentação técnica oficial da aplicação front-end Nuxt 3 / Vue 3 do ecossistema **Alaska Local**, cobrindo as 4 verticais de negócio (**Alaska Menu**, **Alaska Shop**, **Alaska Hub** e **Alaska Pro**).

---

## 🏛️ 1. Princípios Arquiteturais & Filosofia

- **One Codebase, Infinite Domains**: Resolução dinâmica de múltiplos estabelecimentos através de `pages/[slug]/index.vue`, subdomínios wildcard e domínios próprios via header `host` no middleware Nitro (`server/middleware/tenant.ts`).
- **Single Source of Truth (`@alaska/contracts` — ADR 014)**: Centralização de schemas Zod e tipagens inferidas no workspace `@alaska/contracts`, prevenindo *Contract Drift*.
- **Páginas como Orquestradoras (ADR 015)**: `pages/[slug]/index.vue` e `pages/[slug]/admin.vue` atuam exclusivamente gerenciando estado reativo e orquestrando componentes atômicos desacoplados em `components/storefront/` e `components/admin/`.
- **Resiliência e Zero Downtime**: Fallback inteligente para dados locais (`~/data/*.json`) e imagens com geração dinâmica de SVGs temáticos (`utils/images.ts`).
- **Acessibilidade Semântica W3C / WCAG**: Todos os modais e gavetas contam com `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, captura de tecla `Escape` e trava de rolagem via `useBodyScrollLock`.
- **Mural de Pedidos em Tempo Real (ADR 024)**: Gestão ágil de comandas no balcão e delivery com avanço de status em 1 toque (< 50ms), notificações pré-formatadas para WhatsApp e métricas de faturamento do dia.
- **Autenticação Corporativa do Lojista (ADR 025)**: Login com e-mail corporativo, senha com hash seguro e token JWT, com alternância para PIN rápido e gestão de senhas em tempo real.
- **Criação e Gestão Dinâmica de Categorias (ADR 026)**: Criação instantânea de novas seções de catálogo diretamente pelo smartphone via `AdminCreateCategoryModal.vue` e `useMerchantAdmin.ts`.
- **Resiliência de Vitrine e Modais (ADR 027)**: Deduplicação ativa de produtos, upload postergado no Cloudinary, sincronização estrita de props/emits em `StoreHeaderCard`, `StoreHeroBanner`, `StoreReviewsModal` e eliminação de 404 em `pages/index.vue`.
- **Governança de Escopo Cirúrgico e Anti-Regressão (ADR 028)**: Trava obrigatória contra alucinações de LLM, preservação integral de código anterior e modificação estritamente cirúrgica.

---

## 🧩 2. Mapa de Composables (`apps/web/composables/`)

| Composable | Responsabilidade Central | Dependências / Integrações |
| :--- | :--- | :--- |
| **`useTenant.ts`** | Resolução síncrona e reativa do tenant ativo, cache com `useState`, fallback para `~/data/*.json` e sanitização de catálogo. | `@alaska/contracts`, `useAsyncData` |
| **`useMerchantAdmin.ts`** | Gestão de overrides locais (`alaska_overrides_<slug>`), criação dinâmica de produtos e categorias, deduplicação defensiva, sincronização com API NestJS e autenticação por e-mail/senha. | `@alaska/contracts`, `useApiClient`, `localStorage` |
| **`useCart.ts`** | Sacola de compras persistente e namespaced (`alaska_cart_<slug>`), validação de itens com Zod, opções, observações e cálculo em centavos. | `@alaska/contracts`, `useLocalStorage` |
| **`useBookingSlots.ts`** | Motor de agendamento: cálculo de slots de 30 min, soma de tempos de serviços múltiplos, validação de intervalos de almoço e bloqueios manuais. | `@alaska/contracts`, `useTenant` |
| **`useTenantTheme.ts`** | Resolução reativa dos 11 temas cromáticos do ecossistema, injetando classes do Tailwind CSS nos botões, badges e superfícies. | Tailwind CSS, Design System Claro Suave |
| **`useProductSearch.ts`** | Busca instantânea client-side com normalização Unicode NFD, insensível a acentos e maiúsculas. | Regex / Unicode Standard |
| **`useCep.ts`** | Validação Zod e consulta assíncrona ao ViaCEP com máscara de formatação automática. | ViaCEP API |
| **`useImageUpload.ts`** | Upload otimizado de imagens no Cloudinary com geração de WebP e fallbacks. | Cloudinary REST API |
| **`useBodyScrollLock.ts`** | Trava de rolagem para acessibilidade semântica de modais e gavetas. | DOM Window / Document |

---

## 📜 3. Registros de Decisões de Arquitetura (ADRs Frontend)

- **[ADR 001: Fundação Arquitetural Nuxt 3 e Padrão One Codebase](./adrs/001-fase1-fundacao-arquitetural.md)** — Estrutura de roteamento multi-tenant e componentes reativos.
- **[ADR 002: Arquitetura NestJS e Validação Zod](./adrs/002-arquitetura-nestjs-validacao-zod.md)** — Tipagem de contratos e validação Fail-Fast.
- **[ADR 003: Desacoplamento de Composables e Modais Acessíveis](./adrs/003-desacoplamento-composables-modais-acessibilidade.md)** — WCAG 2.1 AA e trava de rolagem.
- **[ADR 004: Categorização de Negócios e Templates](./adrs/004-categorizacao-de-negocios-e-templates.md)** — As 4 verticais: Menu, Shop, Hub e Pro.
- **[ADR 005: Integração ViaCEP e Autocompletion de Endereço](./adrs/005-integracao-viacep-autocompletion-endereco.md)** — Preenchimento inteligente de endereço no checkout.
- **[ADR 006: Módulo de Agendamento de Serviços e Venda Híbrida](./adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md)** — Slot picker dinâmico e upsell de produtos físicos.
- **[ADR 007: Cálculo de Horário Noturno e Badges Dinâmicos](./adrs/007-calculo-horario-noturno-e-badges-dinamicos.md)** — Detecção em tempo real de status aberto/fechado.
- **[ADR 008: Resiliência de Imagens e Placeholders SVG Temáticos](./adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md)** — Prevenção de erros 404 e eliminação de CLS.
- **[ADR 009: Protocolo de Despacho WhatsApp e Venda Híbrida](./adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md)** — Comandas determinísticas para fechamento no WhatsApp.
- **[ADR 010: Busca Client-Side Zero Latência e Normalização Unicode](./adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md)** — Busca NFD sem impacto em rede.
- **[ADR 011: Persistência de Carrinho Namespaced no LocalStorage](./adrs/011-persistencia-carrinho-namespaced-localstorage.md)** — Isolamento de sacola por estabelecimento.
- **[ADR 012: Arquitetura de Pagamentos Pix (Estágio 1)](./adrs/012-arquitetura-pagamentos-pix-estagio-1.md)** — Payload BACEN EMV e QR Code visual.
- **[ADR 013: Painel do Lojista e Gestão Operacional em Tempo Real](./adrs/013-painel-do-lojista-e-gestao-operacional-em-tempo-real.md)** — Operação mobile de catálogo, preços e horários.
- **[ADR 014: Monorepo Turborepo e Pacote Compartilhado @alaska/contracts](./adrs/014-monorepo-turborepo-e-pacote-contracts.md)** — Single Source of Truth para contratos.
- **[ADR 015: Desacoplamento Atômico de Componentes Storefront e Admin](./adrs/015-desacoplamento-atomico-componentes-storefront-e-admin.md)** — Separação estrita de responsabilidades visuais.
- **[ADR 016: Pipeline CI/CD Vercel com Turborepo e PNPM](./adrs/016-pipeline-ci-cd-vercel-turborepo-pnpm.md)** — Build Output API v3 e deploy contínuo.
- **[ADR 017: Padronização do Design System Claro Suave e Temas Dinâmicos](./adrs/017-padronizacao-design-system-claro-suave-e-temas-dinamicos-admin.md)** — Fundo `bg-slate-50` e temas cromáticos no admin.
- **[ADR 018: Resiliência de Contratos de Props, Emissão Dual e Defesa Anti-Crash](./adrs/018-resiliencia-de-contratos-props-e-eventos-das-abas-admin.md)** — Blindagem das abas operacionais do Admin e canais sociais.
- **[ADR 019: Estratégia de Upload e Otimização de Imagens com Cloudinary](./adrs/019-estrategia-upload-e-otimizacao-de-imagens-cloudinary.md)** — Upload serverless mobile e conversão WebP.
- **[ADR 020: Sincronização de Catálogo no PostgreSQL com Refresh Reativo](./adrs/020-sincronizacao-catalogo-postgresql-refresh-reativo.md)** — Atualização de catálogo sem redeploy.
- **[ADR 021: Gestão Reativa de Especialistas e Bloqueio de Agenda](./adrs/021-gestao-reativa-especialistas-e-bloqueio-agenda-admin.md)** — Escalas e intervalos de profissionais no Admin.
- **[ADR 022: Sincronização e Reatividade das Configurações da Loja](./adrs/022-sincronizacao-reatividade-configuracoes-loja-admin.md)** — Horários semanais e canais de contato no PostgreSQL.
- **[ADR 023: Persistência do PIN Administrativo no PostgreSQL](./adrs/023-persistencia-pin-administrativo-postgresql.md)** — Hashing SHA-256 e sincronização autoritativa.
- **[ADR 024: Mural de Pedidos em Tempo Real e Gestão Operacional (Order Dashboard)](./adrs/024-mural-de-pedidos-e-gestao-em-tempo-real-order-dashboard.md)** — Acompanhamento de comandas, transições de esteira, WhatsApp e métricas diárias.
- **[ADR 025: Autenticação Corporativa do Lojista, Gestão de Senhas e Sessão JWT](./adrs/025-autenticacao-corporativa-lojista-email-senha.md)** — Login corporativo com e-mail e senha, Bearer token, persistência de sessão e alternância com PIN rápido.
- **[ADR 026: Criação Dinâmica de Categorias no Painel do Lojista](./adrs/026-criacao-dinamica-de-categorias-painel-do-lojista.md)** — Criação instantânea de seções pelo smartphone via `AdminCreateCategoryModal.vue` e sincronização no catálogo.
- **[ADR 027: Resiliência de Vitrine, Deduplicação de Produtos e Sincronização de Modais](./adrs/027-resiliencia-storefront-deduplicacao-e-sincronizacao-modais.md)** — Deduplicação de produtos, upload postergado no Cloudinary, sincronização de props/emits em `StoreHeaderCard`/`StoreHeroBanner`/`StoreReviewsModal` e eliminação de 404 em `pages/index.vue`.
- **[ADR 028: Governança de Escopo Cirúrgico e Prevenção de Regressões](./adrs/028-governanca-de-escopo-cirurgico-e-prevencao-de-regressoes.md)** — Trava de isolamento de escopo, preservação cumulativa de código e leitura obrigatória do HEAD.

---

## 📚 4. Guias Especializados de Arquitetura do Frontend

* **[Design System & 11 Temas Cromáticos](./architecture/design-system-e-temas.md)** — Base Clara Suave (`bg-slate-50`), tipografia ergonômica e paletas dinâmicas.
* **[Módulo de Agendamentos & Venda Híbrida](./architecture/modulo-agendamento-e-servicos.md)** — Extração dinâmica, bloqueio de horário fantasma e cálculo de slots.
* **[Performance, Resiliência & Integração SSR](./architecture/performance-e-resiliencia-frontend.md)** — Cache `useState`, deduplicação em voo, `useShare` e middleware Nitro.
* **[Padrões de Acessibilidade W3C / WCAG](./architecture/padroes-de-acessibilidade-e-ux.md)** — Modais acessíveis, focus trap e atalho Escape.
* **[Categorias Canônicas de Negócio](./architecture/categorias-de-negocio.md)** — As 4 verticais: Menu, Shop, Hub e Pro.
