# 🗺️ Mapa Completo de Arquitetura do Front-end (`apps/web`)

Guia de referência para engenheiros e agentes de IA sobre a estrutura de diretórios, divisão de responsabilidades e padrões de desenvolvimento do front-end Nuxt 3 no monorepo Alaska Local.

---

## 📁 1. Árvore de Diretórios

```
apps/web/
├── components/                       # Componentes Vue 3 Reutilizáveis
│   ├── storefront/                   # Componentes da Vitrine Pública (ADR 015)
│   │   ├── StoreHeroBanner.vue
│   │   ├── StoreHeaderCard.vue
│   │   ├── ProductCard.vue
│   │   ├── FeaturedProductsCarousel.vue
│   │   ├── ProductCatalogGrid.vue
│   │   └── BottomCartFloatingBar.vue
│   │
│   ├── admin/                        # Componentes do Painel do Lojista (ADR 013/015)
│   │   ├── AdminLoginCard.vue
│   │   ├── AdminTopHeader.vue
│   │   ├── AdminTabsNav.vue
│   │   ├── tabs/
│   │   │   ├── AdminCatalogTab.vue
│   │   │   ├── AdminAgendaTab.vue
│   │   │   ├── AdminPixContactTab.vue
│   │   │   ├── AdminHoursTab.vue
│   │   │   ├── AdminDeliveryTab.vue
│   │   │   ├── AdminAnnouncementTab.vue
│   │   │   └── AdminSecurityTab.vue
│   │   └── modals/
│   │       ├── AdminPriceModal.vue
│   │       ├── AdminCreateProductModal.vue
│   │       ├── AdminCreateProfModal.vue
│   │       └── AdminOptionsModal.vue
│   │
│   ├── BookingModal.vue              # Modal de Agendamento em 4 Passos
│   ├── CartDrawerModal.vue           # Gaveta de Sacola & Checkout WhatsApp
│   ├── ProductCustomizerModal.vue    # Modal de Customização de Produto
│   ├── CategoryTabs.vue              # Abas de Categorias com Rolagem
│   ├── ProductSearchInput.vue        # Input de Busca com Normalização NFD
│   ├── StoreInfoModal.vue            # Modal de Horários & Endereço
│   ├── StoreReviewsModal.vue         # Modal de Avaliações iFood-Style
│   └── PixPaymentModal.vue           # Modal Avulso de Pagamento Pix
│
├── composables/                      # Camada de Estado & Regras de Negócio
│   ├── useTenant.ts                  # Resolução de Tenant & Overrides
│   ├── useMerchantAdmin.ts           # Gestão Operacional (< 50ms)
│   ├── useCart.ts                    # Sacola Namespaced por Slug
│   ├── useOpeningHours.ts            # Status de Aberto/Fechado & Pausa
│   ├── useBookingSlots.ts            # Slots de Agendamento & Almoço
│   ├── useProductSearch.ts           # Busca Client-Side Zero Latência
│   ├── useTenantTheme.ts             # 11 Temas Cromáticos
│   ├── useCep.ts                     # Consulta ViaCEP & Máscaras
│   ├── useHaptic.ts                  # Feedback Tátil Mobile
│   ├── useShare.ts                   # Web Share API
│   ├── useBodyScrollLock.ts          # Trava de Rolagem de Fundo
│   └── useApiClient.ts               # Cliente HTTP Resiliente
│
├── utils/                            # Funções Puras & Formatadores
│   ├── formatters.ts                 # formatCurrency, sanitizeDigits, formatPhone, formatCep
│   ├── images.ts                     # Fallback de Imagens & SVGs Dinâmicos
│   ├── pix.ts                        # Payload EMV BACEN & QR Code Base64
│   └── whatsapp.ts                   # Montagem de Pedido & Agendamento no WhatsApp
│
├── types/                            # Tipagens & Re-exportação de Contratos
│   ├── index.ts                      # Re-exporta @alaska/contracts
│   ├── tenant.ts                     # Interfaces e Schemas de Tenant
│   ├── cart.ts                       # Interfaces de Sacola
│   └── booking.ts                    # Interfaces de Agendamento
│
├── pages/
│   ├── index.vue                     # Showcase Geral das Vitrines
│   └── [slug]/
│       ├── index.vue                 # Vitrine Pública Multi-Tenant
│       └── admin.vue                 # Painel Operacional do Lojista
│
└── tests/units/                      # 23 Suítes de Testes Unitários Vitest
```

---

## 🔄 2. Fluxo de Dados e Reatividade

1. **Entrada do Usuário**: Acessa `/[slug]` (ex: `/barbearia-style` ou `/clinica-sorriso`).
2. **`useTenant(slug)`**: Carrega o JSON base (`~/data/<slug>.json`) e consulta a API NestJS caso disponível.
3. **`useMerchantAdmin(slug)`**: Carrega os overrides do lojista (`alaska_overrides_<slug>`) do `localStorage`.
4. **`effectiveTenant` (Computed)**: Mescla o catálogo base com os overrides em tempo real (preços, itens pausados, horários, pausa de emergência, chaves Pix e WhatsApp).
5. **Composição Visual**: `pages/[slug]/index.vue` passa `effectiveTenant` para os componentes em `components/storefront/`.
6. **Disparo de Ações**:
   - Compra de produtos $\rightarrow$ `useCart` $\rightarrow$ `CartDrawerModal` $\rightarrow$ WhatsApp.
   - Agendamento de serviços $\rightarrow$ `BookingModal` $\rightarrow$ Sinal Pix $\rightarrow$ WhatsApp.
   - Gestão pelo Lojista $\rightarrow$ `pages/[slug]/admin.vue` $\rightarrow$ `useMerchantAdmin` $\rightarrow$ Grava overrides e notifica a vitrine em tempo real.
