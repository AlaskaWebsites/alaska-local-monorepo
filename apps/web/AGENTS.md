# AGENTS.md — Diretrizes de Engenharia, Context Harness & Governança para IA

Este documento é o guia definitivo de arquitetura, padrões e regras de negócio para agentes autônomos e desenvolvedores que atuam no frontend do ecossistema **Alaska Local** (`AlaskaWebsites/Alaska-local`).

---

## 🧭 1. North Star e Visão do Produto

* **Missão**: Entregar vitrines digitais mobile-first ultrarrápidas para estabelecimentos locais (alimentação, adegas, barbearias, clínicas odontológicas/médicas, semijoias, boutiques de moda e profissionais liberais), integrando busca em tempo real, autopreenchimento de CEP, agendamento de serviços, feedback tátil, montagem de pedidos, provas sociais estilo iFood, geração de Pix EMV oficial com QR Code e despacho formatado diretamente para o WhatsApp do lojista.
* **4 Verticais Canônicas**:
  * 🍔 **Alaska Menu**: Food service, hamburguerias, pizzarias, adegas 24h, espetarias e confeitarias.
  * 🛍️ **Alaska Shop**: Boutiques de moda feminina, semijoias finas, calçados e cosméticos com sacola em tempo real.
  * 💈 **Alaska Hub**: Barbearias, salões de beleza, estúdios de tatuagem com agendamento de horários e venda de produtos upsell.
  * ⚖️ **Alaska Pro**: Clínicas médicas, odontologia, psicólogos e advogados com agendamento de consultas e avaliações.
* **Modelo de Negócio**: Venda *Done-for-You* (DFY) no plano anual (R$ 720 / R$ 600 / R$ 990 à vista no Pix D+0 com Setup Grátis e Domínio incluso) ou mensal (Setup + R$ 50 a R$ 120/mês), sem taxas sobre as vendas do lojista.

---

## 🏗️ 2. Estrutura do Repositório (One Codebase, Infinite Domains)

```
Alaska-local/
├── .cursor/rules/                  # Regras de contexto para Cursor IDE e MCP
├── components/                     # Componentes Vue 3 Modulares e Acessíveis (WCAG)
│   ├── BookingModal.vue            # Modal de agendamento em 4 etapas com sinal Pix e QR Code
│   ├── CartDrawerModal.vue         # Drawer de sacola com busca de CEP, totalizadores, Pix EMV e QR Code
│   ├── CategoryTabs.vue            # Abas fixas de navegação no cardápio com semântica <nav>
│   ├── ProductCustomizerModal.vue  # Modal de customização, opcionais dinâmicos e adicionais
│   ├── ProductSearchInput.vue      # Campo de busca em tempo real com debounce e limpar busca
│   ├── StoreInfoModal.vue          # Modal de informações da loja, horários noturnos e rotas no Maps
│   └── StoreReviewsModal.vue       # Prova social estilo iFood com níveis de serviço 1 a 5
├── composables/                    # Composables de Lógica Reativa e Pura
│   ├── useApiClient.ts             # Cliente HTTP desacoplado com fallback resiliente
│   ├── useBodyScrollLock.ts        # Bloqueio reativo de rolagem no body (SSR-Safe)
│   ├── useBookingSlots.ts          # Geração de slots de horários, cálculo de duração e despacho WhatsApp
│   ├── useCart.ts                  # Composable multi-tenant e persistente no localStorage
│   ├── useCep.ts                   # Consulta e autopreenchimento de endereço via ViaCEP com Zod
│   ├── useHaptic.ts                # Feedback tátil mobile via Vibration API (SSR-Safe)
│   ├── useOpeningHours.ts          # Cálculo de loja aberta/fechada com suporte a turno noturno
│   ├── useProductSearch.ts         # Busca reativa client-side insensível a acentos (Unicode NFD)
│   ├── useShare.ts                 # Web Share API com fallback para cópia de URL
│   ├── useTenant.ts                # Resolução híbrida de tenant (API NestJS com fallback JSON local)
│   └── useTenantTheme.ts           # Resolução reativa de paleta visual por segmento
├── data/                           # Catálogos Locais JSON (Estágio 1 - 0 a 5 clientes)
│   ├── adega-prime.json            # Vertical menu (Adega 24h & Bebidas)
│   ├── barbearia-style.json        # Vertical hub (Barbearia & Estética Masculina)
│   ├── bella-donna.json            # Vertical shop (Boutique de Moda Feminina)
│   ├── cafe-central.json           # Vertical menu (Cafeteria & Bistrô)
│   ├── clinica-sorriso.json        # Vertical pro (Odontologia & Saúde)
│   ├── espetaria-brasa.json        # Vertical menu (Espetaria & Churrasco)
│   ├── hamburgueria-x.json         # Vertical menu (Hamburgueria Artesanal)
│   ├── karine-finardi.json         # Vertical shop (Semijoias & Revenda)
│   └── restaurante-bella-italia.json # Vertical menu (Restaurante Italiano)
├── docs/                           # Documentação e Governança
│   ├── adrs/                       # Architecture Decision Records (ADRs 001 a 012)
│   ├── architecture/               # Roadmap, Categorias de Negócio, Agendamentos e Guia de IA
│   ├── commercial/                 # Plano de Negócios, Precificação e Scripts de Vendas
│   ├── operations/                 # Runbooks operacionais e scripts CLI de demo
│   └── prompts/                    # Regras globais de IA e diretrizes de geração
├── pages/                          # Roteamento Baseado em Arquivos do Nuxt 3
│   ├── index.vue                   # Showcase com filtros de nicho e 9 lojas ativas
│   └── [slug].vue                  # Vitrine dinâmica multi-tenant do lojista
├── scripts/                        # Scripts de automação CLI
│   └── new-demo.js                 # Gerador de novas lojas de demonstração em segundos
├── types/                          # Contratos Canônicos de Tipagem TypeScript & Zod
│   ├── booking.ts                  # Schemas Zod de profissionais, serviços e agendamentos
│   ├── cart.ts                     # Interfaces de carrinho, endereço com CEP e ViaCEP Zod schema
│   ├── index.ts                    # Barrel file centralizador de exportações
│   └── tenant.ts                   # Schemas Zod de estabelecimentos, reviews, pixConfig e temas
├── utils/                          # Utilitários Puros
│   ├── formatters.ts               # formatCurrency, formatPhone, formatCep, sanitizeDigits
│   ├── pix.ts                      # CRC-16 CCITT, BR Code EMV, QR Code Base64 e getTenantPixConfig
│   └── whatsapp.ts                 # generateWhatsAppOrderUrl com despacho determinístico
└── tests/units/                    # Suíte de Testes Automatizados no Vitest (22 suítes, 163 testes)
```

---

## 🛡️ 3. O Ciclo de Desenvolvimento para Agentes de IA (Contract-First & Test-Harness)

Todo agente ou desenvolvedor deve seguir rigorosamente o fluxo em 5 etapas:

1. **ADR / Spec:** Documentar a decisão técnica em `docs/adrs/` ou `docs/architecture/`.
2. **Contrato Zod:** Definir o schema estrito em `types/` garantindo validação em tempo de execução e inferência de tipos.
3. **Testes Unitários (Vitest):** Escrever a suíte de testes em `tests/units/` para servir como **Harness** de validação determinística.
4. **Composable Puro:** Implementar a lógica de negócio isolada sem dependência direta do DOM.
5. **Componente UI & Build Gate:** Construir o componente visual com acessibilidade W3C/WCAG e rodar `npx vitest run`.

---

## 📋 4. Regras Globais Invioláveis

1. **Tipos e Contratos**:
   * **NUNCA** crie interfaces locais duplicadas em arquivos `.vue`. Sempre importe de `~/types`:
     ```ts
     import type { Tenant, Product, Category, CartItem, CheckoutFormData, Address, BookingService, BookingProfessional } from '~/types'
     ```
2. **Preservação de Schemas (Zod)**:
   * Sempre que adicionar campos em arquivos JSON ou APIs, declare-os explicitamente no `TenantSchema` em `types/tenant.ts` para evitar que o Zod faça o strip do campo durante o `.parse()`.
3. **Pagamento Pix EMV & QR Code (`utils/pix.ts`)**:
   * O padrão de extração de configuração de Pix deve utilizar a função canônica `getTenantPixConfig(tenant)`.
   * A geração de QR Code deve ser assíncrona com `generatePixQrCodeDataUrl(payload)` e fallback visual de carregamento.
4. **Consulta de CEP (`useCep`)**:
   * A busca deve sanitizar a entrada (`sanitizeDigits`), validar os 8 dígitos e validar a resposta pública do ViaCEP via `ViaCepResponseSchema` com Zod.
5. **Feedback Tátil Mobile (`useHaptic`)**:
   * Ações táteis no mobile (como adicionar produtos à sacola) disparam `triggerHaptic(30)` via Vibration API com degradação graciosa para navegadores sem suporte.
6. **Busca de Produtos (`useProductSearch`)**:
   * A busca deve ser insensível a acentos (`normalizeSearchText`), minúsculas/maiúsculas e filtrar produtos dentro de categorias, ocultando automaticamente categorias sem correspondências.
7. **Acessibilidade W3C/WCAG**:
   * Todos os modais devem conter `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `useBodyScrollLock` e listener para a tecla `Escape`.
   * A busca deve conter `role="search"` e labels acessíveis.
8. **Resolução de Temas**:
   * Utilize sempre `themeClasses` fornecido por `useTenantTheme(tenant)` para classes utilitárias de cores, fundos, bordas e `focusRing`.
9. **Verificação de Testes (Harness Gate)**:
   * Antes de considerar qualquer tarefa pronta, execute `npx vitest run`. Todas as 22 suítes de teste (163 testes) devem passar com 100% de sucesso.
