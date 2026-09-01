# 🌐 Alaska Local — Front-end Architecture Documentation (`@alaska/web`)

Documentação técnica oficial da aplicação front-end Nuxt 3 / Vue 3 do ecossistema **Alaska Local**, cobrindo as 4 verticais de negócio (**Alaska Menu**, **Alaska Shop**, **Alaska Hub** e **Alaska Pro**).

---

## 🏛️ 1. Princípios Arquiteturais & Filosofia

- **One Codebase, Infinite Domains**: Resolução dinâmica de múltiplos estabelecimentos através de `pages/[slug]/index.vue`, subdomínios wildcard e domínios próprios via header `host`.
- **Single Source of Truth (`@alaska/contracts` — ADR 014)**: Centralização de schemas Zod e tipagens inferidas no workspace `@alaska/contracts`, prevenindo *Contract Drift*.
- **Páginas como Orquestradoras (ADR 015)**: `pages/[slug]/index.vue` e `pages/[slug]/admin.vue` atuam exclusivamente gerenciando estado reativo e orquestrando componentes atômicos desacoplados em `components/storefront/` e `components/admin/`.
- **Resiliência e Zero Downtime**: Fallback inteligente para dados locais (`~/data/*.json`) e imagens com geração dinâmica de SVGs temáticos (`utils/images.ts`).
- **Acessibilidade Semântica W3C / WCAG**: Todos os modais e gavetas contam com `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, captura de tecla `Escape` e trava de rolagem via `useBodyScrollLock`.

---

## 🧩 2. Mapa de Composables (`apps/web/composables/`)

| Composable | Responsabilidade Central | Dependências / Integrações |
| :--- | :--- | :--- |
| **`useTenant.ts`** | Resolução síncrona e reativa do tenant ativo (via slug ou domínio), carregamento de catálogos locais (`~/data/*.json`) com fallback e mesclagem com a API NestJS. | `useAsyncData`, `@alaska/contracts`, `TenantSchema` |
| **`useMerchantAdmin.ts`** | Gestão operacional mobile (< 50ms): autenticação por PIN, pausa de itens, edição de preços, criação/exclusão de itens e especialistas, escala 7 dias, expediente, almoço, Pix, WhatsApp e emergência. | `@alaska/contracts`, `useHaptic`, `localStorage` (`alaska_overrides_<slug>`) |
| **`useCart.ts`** | Sacola isolada por loja (`alaska_cart_<slug>`), suporte a itens com múltiplos adicionais/opcionais, observações, cálculo de subtotal e feedback tátil. | `@vueuse/core` (`useLocalStorage`), `useHaptic` |
| **`useOpeningHours.ts`** | Verificação em tempo real do status de atendimento, cálculo do próximo horário de abertura/fechamento e detecção da pausa geral de emergência. | `@alaska/contracts`, `Date` |
| **`useBookingSlots.ts`** | Cálculo dinâmico de horários de agendamento (30/45 min), soma cumulativa de duração para múltiplos procedimentos, filtro de expediente, almoço e bloqueios manuais. | `@alaska/contracts`, `useMerchantAdmin` |
| **`useProductSearch.ts`** | Motor de busca client-side com zero latência, normalização Unicode NFD (ignora acentos e caixa alta/baixa) e agrupamento dinâmico de categorias filtradas. | `Product`, `Category` |
| **`useTenantTheme.ts`** | Mapeamento e injeção de classes Tailwind reativas para os 11 temas cromáticos do ecossistema. | `TenantThemeSchema`, `TenantTheme` |
| **`useCep.ts`** | Consulta de CEP assíncrona na API ViaCEP com sanitização de dígitos, máscara e feedback de loading/erro. | `sanitizeDigits`, `ViaCEP` |
| **`useHaptic.ts`** | Feedback tátil mobile via Vibration API para cliques, adições à sacola e switches. | `navigator.vibrate` |
| **`useShare.ts`** | Compartilhamento nativo mobile via Web Share API com fallback para cópia de URL na área de transferência. | `navigator.share`, `navigator.clipboard` |
| **`useBodyScrollLock.ts`** | Trava de rolagem de fundo (`overflow: hidden`) em modais e gavetas abertas. | `document.body.style` |
| **`useApiClient.ts`** | Cliente HTTP resiliente para comunicação com a API NestJS (`apps/api`). | `$fetch`, `useRuntimeConfig` |

---

## 🛠️ 3. Funções Utilitárias (`apps/web/utils/`)

| Arquivo | Funções Exportadas | Finalidade |
| :--- | :--- | :--- |
| **`formatters.ts`** | `formatCurrency(val)`<br>`sanitizeDigits(str)`<br>`formatPhone(str)`<br>`formatCep(str)` | Formatação monetária (BRL `R$ 0,00`), sanitização de dígitos para APIs e máscaras visuais. |
| **`images.ts`** | `handleImageError(e, theme)`<br>`getPlaceholderImage(theme)` | Fallback resiliente para imagens quebradas gerando SVGs com a paleta cromática da loja. |
| **`pix.ts`** | `generatePixPayload(config)`<br>`generatePixQrCodeDataUrl(payload)`<br>`formatKeyTypeLabel(type)` | Geração de payload EMV padrão BACEN, cálculo de CRC-16 CCITT e renderização de QR Code Base64. |
| **`whatsapp.ts`** | `buildOrderWhatsAppMessage(payload)`<br>`buildBookingWhatsAppMessage(payload)` | Construção do texto formatado e geração do link direto `https://wa.me/55...`. |

---

## 🎨 4. Design System & 11 Temas Cromáticos (`useTenantTheme.ts`)

| Identificador | Nome do Tema | Aplicação Principal | Paleta Cromática Tailwind |
| :--- | :--- | :--- | :--- |
| **`food`** | Laranja / Âmbar Gourmet | Hambúrgueres, Pizzarias e Lanchonetes | Amber 500 / Orange 500 |
| **`barber`** | Esmeralda & Dourado | Barbearias Vintage & Modernas | Emerald 600 / Amber 400 |
| **`health`** | Turquesa / Ciano Clínico | Odontologia, Médicos & Clínicas | Cyan 600 / Teal 500 |
| **`drinks`** | Púrpura / Violeta Neon | Adegas, Bebidas & Conveniências | Purple 600 / Violet 500 |
| **`rose`** | Rosa / Framboesa | Boutiques, Moda & Confeitarias | Rose 500 / Pink 500 |
| **`amber`** | Âmbar Quente | Cafeterias & Padarias | Amber 600 / Yellow 500 |
| **`violet`** | Índigo / Violeta | Salões de Beleza & Estética | Indigo 600 / Violet 600 |
| **`blue`** | Azul Real | Farmácias, Pet Shops & Serviços | Blue 600 / Sky 500 |
| **`emerald`** | Verde Esmeralda | Produtos Naturais & Bem-estar | Emerald 600 / Green 600 |
| **`slate`** | Grafite / Minimalista | Tecnologia & Alfaiataria | Slate 800 / Slate 600 |
| **`default`** | Preto & Âmbar Clássico | Showcase & Demonstrações | Slate 950 / Amber 500 |

*Tokens Reativos*: `primaryBg`, `primaryText`, `primaryBorder`, `badgeBg`, `badgeText`, `buttonPrimary`, `focusRing`, `selectedOptionClass`.

---

## 🧱 5. Estrutura de Componentes Desacoplados (ADR 015)

```
apps/web/components/
├── storefront/                 # Componentes Visuais da Vitrine Pública
│   ├── StoreHeroBanner.vue         # Imagem de capa, gradiente, botão voltar e botão compartilhar
│   ├── StoreHeaderCard.vue         # Logo, nome, avaliações, status Aberto/Fechado, agendar e meta-dados
│   ├── FeaturedProductsCarousel.vue# Carrossel horizontal de produtos em destaque
│   ├── ProductCard.vue             # Card individual de produto (preço, badge esgotado, foto com fallback)
│   ├── ProductCatalogGrid.vue      # Listagem por categorias com estados vazios e grid responsivo
│   └── BottomCartFloatingBar.vue   # Barra fixa flutuante de acesso à sacola (ClientOnly)
│
├── admin/                      # Componentes do Painel do Lojista
│   ├── AdminLoginCard.vue          # Tela de bloqueio por PIN com teclado numérico e validação
│   ├── AdminTopHeader.vue          # Cabeçalho do painel com status pulse e botão Sair
│   ├── AdminTabsNav.vue            # Barra de abas com rolagem lateral, setas e mouse wheel
│   │
│   ├── tabs/
│   │   ├── AdminCatalogTab.vue       # Aba 1: Pausa de itens, criação/exclusão e edição de preços
│   │   ├── AdminAgendaTab.vue        # Aba 2: Gestão de especialistas (escala, folgas, almoço) e slots
│   │   ├── AdminPixContactTab.vue    # Aba 3: Configuração Pix (D+0) e canais WhatsApp/Instagram
│   │   ├── AdminHoursTab.vue         # Aba 4: Pausa geral de emergência e escala semanal de 7 dias
│   │   ├── AdminDeliveryTab.vue      # Aba 5: Taxas de entrega, pedido mínimo e prazos
│   │   ├── AdminAnnouncementTab.vue  # Aba 6: Banner de comunicado oficial no topo
│   │   └── AdminSecurityTab.vue      # Aba 7: Troca de PIN de acesso operacional
│   │
│   └── modals/
│       ├── AdminPriceModal.vue         # Modal de ajuste de preço de produto
│       ├── AdminCreateProductModal.vue # Modal de cadastro de novo produto
│       ├── AdminCreateProfModal.vue    # Modal de cadastro de novo especialista
│       └── AdminOptionsModal.vue       # Modal de pausa/ativação de opcionais/adicionais
│
├── BookingModal.vue            # Modal de Agendamento em 4 Passos com bloqueio de folgas e Pix
├── CartDrawerModal.vue         # Gaveta lateral de sacola e checkout WhatsApp
├── ProductCustomizerModal.vue  # Modal de customização de produto com adicionais
├── CategoryTabs.vue            # Barra de categorias com âncora suave
├── ProductSearchInput.vue      # Input de busca client-side
├── StoreInfoModal.vue          # Modal de horários e endereço detalhado
├── StoreReviewsModal.vue       # Modal de avaliações dos clientes
└── PixPaymentModal.vue         # Modal avulso de pagamento via Pix
```

---

## 🧪 6. Suíte de Testes Automatizados (`apps/web/tests/units/`)

O front-end possui **23 suítes de testes unitários** executadas via Vitest:

- `merchant-admin.test.ts`: Autenticação, pausas, alteração de preços, criação/exclusão, escalas e emergência.
- `booking-slots.test.ts`: Slots de agendamento, soma cumulativa, bloqueio de folgas e filtro de almoço.
- `booking-schema.test.ts`: Schemas Zod de agendamento.
- `cart.test.ts` & `cart-drawer.spec.ts`: Operações de sacola e travas de checkout.
- `cep.spec.ts`: Integração ViaCEP e validação de 8 dígitos.
- `opening-hours.test.ts`: Horários de funcionamento e status reativo.
- `pix.test.ts`: Geração de payload EMV e CRC-16.
- `product-search.spec.ts`: Busca Unicode NFD client-side.
- `tenant-theme.test.ts`: 11 temas cromáticos e classes dinâmicas.
- `ssr-safety.test.ts` & `body-scroll-lock.test.ts`: Proteções SSR e trava de rolagem.
