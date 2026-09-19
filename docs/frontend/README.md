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

---

## 🧩 2. Mapa de Composables (`apps/web/composables/`)

| Composable | Responsabilidade Central | Dependências / Integrações |
| :--- | :--- | :--- |
| **`useTenant.ts`** | Resolução síncrona e reativa do tenant ativo, cache com `useState`, deduplicação de requisições em voo, debounce de 2s e fallback local. | `useState`, `@alaska/contracts`, `TenantSchema` |
| **`useMerchantAdmin.ts`** | Gestão operacional mobile (< 50ms): 8 abas operacionais, pausa rápida, criação/exclusão de itens/especialistas, escala 7 dias, Pix e segurança PIN. | `@alaska/contracts`, `useHaptic`, `localStorage` |
| **`useOrderDashboard.ts`** | Gestão de pedidos e comandas em tempo real (< 50ms): métricas do dia, transições de status da esteira, WhatsApp, polling e fallback local. | `@alaska/contracts`, `useHaptic`, `localStorage` |
| **`useCart.ts`** | Sacola isolada por loja (`alaska_cart_<slug>`), múltiplos adicionais, observações e feedback tátil. | `@vueuse/core`, `useHaptic` |
| **`useOpeningHours.ts`** | Verificação em tempo real do status de atendimento, cálculo do próximo horário de abertura/fechamento e detecção da pausa geral de emergência. | `@alaska/contracts`, `Date` |
| **`useBookingSlots.ts`** | Cálculo dinâmico de horários de agendamento (30 min), soma cumulativa de procedimentos, filtro de expediente, almoço e bloqueios manuais. | `@alaska/contracts`, `useMerchantAdmin` |
| **`useProductSearch.ts`** | Motor de busca client-side com zero latência, normalização Unicode NFD (ignora acentos e caixa alta/baixa). | `Product`, `Category` |
| **`useTenantTheme.ts`** | Mapeamento e injeção de classes Tailwind reativas para os 11 temas cromáticos do ecossistema. | `TenantThemeSchema`, `TenantTheme` |
| **`useCep.ts`** | Consulta de CEP assíncrona na API ViaCEP com sanitização de dígitos, máscara e foco no número. | `sanitizeDigits`, `ViaCEP` |
| **`useHaptic.ts`** | Feedback tátil mobile via Vibration API para cliques, adições à sacola e switches. | `navigator.vibrate` |
| **`useShare.ts`** | Compartilhamento nativo mobile via Web Share API com fallback para cópia de URL na área de transferência. | `navigator.share`, `navigator.clipboard` |
| **`useBodyScrollLock.ts`** | Trava de rolagem de fundo (`overflow: hidden`) em modais e gavetas abertas. | `document.body.style` |
| **`useApiClient.ts`** | Cliente HTTP resiliente para comunicação com a API NestJS (`apps/api`). | `$fetch`, `useRuntimeConfig` |

---

## 🧱 3. Estrutura de Componentes Desacoplados (ADR 015 & ADR 024)

```
apps/web/components/
├── storefront/                 # Componentes Visuais da Vitrine Pública
│   ├── StoreHeroBanner.vue         # Imagem de capa, gradiente, botão voltar e botão compartilhar (useShare)
│   ├── StoreHeaderCard.vue         # Logo, nome, avaliações, status Aberto/Fechado e botão de agendamento
│   ├── FeaturedProductsCarousel.vue# Carrossel horizontal de produtos em destaque
│   ├── ProductCard.vue             # Card individual de produto (preço, badge esgotado, foto com fallback)
│   ├── ProductCatalogGrid.vue      # Listagem por categorias com estados vazios e grid responsivo
│   └── BottomCartFloatingBar.vue   # Barra fixa flutuante de acesso à sacola (ClientOnly)
│
├── admin/                      # Componentes do Painel do Lojista (8 Abas & 4 Modais)
│   ├── AdminLoginCard.vue          # Tela de bloqueio por PIN com validação
│   ├── AdminTopHeader.vue          # Cabeçalho do painel com status pulse e botão Sair
│   ├── AdminTabsNav.vue            # Barra de abas com rolagem lateral e setas (badge de novos pedidos)
│   │
│   ├── tabs/
│   │   ├── AdminOrdersTab.vue        # Aba 0: Mural de pedidos em tempo real, métricas e WhatsApp (ADR 024)
│   │   ├── AdminCatalogTab.vue       # Aba 1: Pausa de itens, criação/exclusão e edição de preços
│   │   ├── AdminAgendaTab.vue        # Aba 2: Especialistas (escala, folgas, almoço), slots e alerta de fechamento
│   │   ├── AdminPixContactTab.vue    # Aba 3: Configuração Pix (D+0) e canais WhatsApp/Instagram
│   │   ├── AdminHoursTab.vue         # Aba 4: Pausa geral de emergência e escala semanal de 7 dias
│   │   ├── AdminDeliveryTab.vue      # Aba 5: Taxas de entrega, pedido mínimo e prazos
│   │   ├── AdminAnnouncementTab.vue  # Aba 6: Banner de comunicado oficial no topo
│   │   └── AdminSecurityTab.vue      # Aba 7: Troca de PIN de segurança do lojista (ADR 023)
│   │
│   └── modals/
│       ├── AdminPriceModal.vue         # Modal de ajuste de preço de produto
│       ├── AdminCreateProductModal.vue # Modal de cadastro de novo produto
│       ├── AdminCreateProfModal.vue    # Modal de cadastro de novo especialista
│       └── AdminOptionsModal.vue       # Modal de pausa/ativação de opcionais/adicionais
│
├── BookingModal.vue            # Modal de Agendamento em 4 Passos com bloqueio de 0 vagas e Pix
├── CartDrawerModal.vue         # Gaveta lateral de sacola e checkout WhatsApp
├── ProductCustomizerModal.vue  # Modal de customização de produto com adicionais
├── CategoryTabs.vue            # Barra de categorias com âncora suave
├── ProductSearchInput.vue      # Input de busca client-side
├── StoreInfoModal.vue          # Modal de horários e endereço detalhado
├── StoreReviewsModal.vue       # Modal de avaliações iFood-Style com distribuição por estrelas
└── PixPaymentModal.vue         # Modal avulso de pagamento via Pix
```

---

## 🏛️ Registros de Decisões de Arquitetura (ADRs)

- **[ADR 013: Painel do Lojista e Gestão Operacional em Tempo Real](./adrs/013-painel-do-lojista-e-gestao-operacional-em-tempo-real.md)** — Gestão mobile, PIN e mutações otimistas.
- **[ADR 014: Monorepo Turborepo e Pacote @alaska/contracts](./adrs/014-monorepo-turborepo-e-pacote-contracts.md)** — Centralização de contratos Zod.
- **[ADR 015: Desacoplamento Atômico de Componentes Storefront e Admin](./adrs/015-desacoplamento-atomico-componentes-storefront-e-admin.md)** — Páginas como orquestradoras.
- **[ADR 016: Pipeline de CI/CD Vercel com Turborepo e PNPM](./adrs/016-pipeline-ci-cd-vercel-turborepo-pnpm.md)** — Build Output API v3 e deploy contínuo.
- **[ADR 017: Padronização do Design System Claro Suave e Temas Dinâmicos](./adrs/017-padronizacao-design-system-claro-suave-e-temas-dinamicos-admin.md)** — Fundo `bg-slate-50` e temas cromáticos no admin.
- **[ADR 018: Resiliência de Contratos de Props, Emissão Dual e Defesa Anti-Crash](./adrs/018-resiliencia-de-contratos-props-e-eventos-das-abas-admin.md)** — Blindagem das abas operacionais do Admin e canais sociais.
- **[ADR 023: Persistência do PIN Administrativo no PostgreSQL](./adrs/023-persistencia-pin-administrativo-postgresql.md)** — Hashing SHA-256 e sincronização autoritativa.
- **[ADR 024: Mural de Pedidos em Tempo Real e Gestão Operacional (Order Dashboard)](./adrs/024-mural-de-pedidos-e-gestao-em-tempo-real-order-dashboard.md)** — Acompanhamento de comandas, transições de esteira, WhatsApp e métricas diárias.

---

## 📚 4. Guias Especializados de Arquitetura do Frontend

* **[Design System & 11 Temas Cromáticos](./architecture/design-system-e-temas.md)** — Base Clara Suave (`bg-slate-50`), tipografia ergonômica e paletas dinâmicas.
* **[Módulo de Agendamentos & Venda Híbrida](./architecture/modulo-agendamento-e-servicos.md)** — Extração dinâmica, bloqueio de horário fantasma e cálculo de slots.
* **[Performance, Resiliência & Integração SSR](./architecture/performance-e-resiliencia-frontend.md)** — Cache `useState`, deduplicação em voo, `useShare` e middleware Nitro.
* **[Padrões de Acessibilidade W3C / WCAG](./architecture/padroes-de-acessibilidade-e-ux.md)** — Modais acessíveis, focus trap e atalho Escape.
* **[Categorias Canônicas de Negócio](./architecture/categorias-de-negocio.md)** — As 4 verticais: Menu, Shop, Hub e Pro.
