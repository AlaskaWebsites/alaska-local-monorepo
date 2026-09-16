# Diagnóstico de Tipagem, Contratos Compartilhados e Fail-Fast no Monorepo

- **Status:** Documento de Governança e Auditoria Técnica
- **Data:** 2026-09-15
- **Escopo:** `packages/contracts`, `apps/api` (NestJS 11), `apps/web` (Nuxt 3)
- **Referência:** ADR 014 (Turborepo & Contratos), ADR 002 (Validação Zod Fail-Fast), ADR 018 (Resiliência de Contratos de Admin)

---

## 🧭 1. Resumo Executivo & Scorecard de Maturidade

O ecossistema **Alaska Local** opera sob uma arquitetura de Monorepo com Turborepo e PNPM Workspaces, tendo como objetivo central a garantia de **End-to-End Type Safety** e **Validação Fail-Fast** através do pacote canônico `@alaska/contracts`.

Após auditoria aprofundada nas três camadas de código (`packages/contracts`, `apps/api` e `apps/web`), identificou-se uma fundação arquitetural sólida baseada em Clean Architecture e Zod, combinada a pontos pontuais de **erosão de tipagem** decorrentes de correções emergenciais de produção e compatibilidade defensiva:

| Camada / Dimensão | Maturidade | Status | Principais Destaques / Pontos de Atenção |
| :--- | :---: | :---: | :--- |
| **`@alaska/contracts` (SSOT)** | **9.8 / 10** | 🟢 Sólido | Schemas Zod 3.24 cobrindo Tenant, Catalog, Order, Booking, Pix, Common, Overrides operacionais e CartItem. Build duplo ESM/CJS com `.d.ts`. |
| **`apps/api` Core Domain** | **9.8 / 10** | 🟢 Exemplar | Clean Architecture pura, Value Objects imutáveis (`Money` em centavos inteiros), entidades ricas (`Order`, `Booking`) e zero dependência de framework. |
| **`apps/api` Presentation** | **9.8 / 10** | 🟢 Exemplar (Fase 3 Concluída) | **Fim do `any`**: `ProductController`, `TenantController`, `OrderController` e `BookingController` totalmente blindados com `ZodValidationPipe` e contratos canônicos com preprocess tolerante. |
| **`apps/web` Composables** | **9.5 / 10** | 🟢 Excelente (Fase 4 Concluída) | **Hidratação Blindada com Zod**: `useMerchantAdmin` e `useCart` utilizam `safeParse` e `serializer` Zod Fail-Safe na leitura/escrita do `localStorage`, descartando dados corrompidos e garantindo integridade de estado. |
| **`apps/web` Types (Shadowing)** | **9.5 / 10** | 🟢 Resolvido (Fase 1) | **Shadowing Eliminado**: `apps/web/types/` unificado sob `@alaska/contracts`, centralizando SSOT e mantendo retrocompatibilidade total. |

---

## 🔍 2. Diagnóstico Detalhado por Camada

### A. `@alaska/contracts` (Single Source of Truth)

O pacote `@alaska/contracts` centraliza os contratos de dados do ecossistema:
1. **Módulos Existentes**:
   * `tenant`: `TenantSchema`, `TenantCategorySchema` (`menu`, `shop`, `hub`, `pro`), `TenantThemeSchema` (11 temas com default `'food'`), `OpeningHoursSchema`, `PixConfigSchema`, `StoreReviewsSchema`, `UpdateTenantHoursSchema`, `VerifyAdminPinSchema`, `MerchantLoginSchema`, `DayScheduleSchema`, `ProfessionalOverrideSchema`, `PixConfigOverrideSchema`, `ContactOverrideSchema`, `CustomProfessionalSchema`, `ProductOverrideSchema`, `TenantOverridesSchema`.
   * `catalog`: `OptionItemSchema`, `OptionGroupSchema`, `ProductSchema`, `CategorySchema`, `ToggleProductAvailabilitySchema`, `ToggleOptionAvailabilitySchema`, `UpdateProductSchema`.
   * `order`: `DeliveryTypeSchema`, `PaymentMethodSchema`, `OrderStatusSchema`, `OrderItemSchema`, `CreateOrderSchema`, `UpdateOrderStatusSchema`, `CartItemSchema`, `CartItemsArraySchema`.
   * `booking`: `BookingServiceSchema`, `ProfessionalSchema`, `BookingSlotSchema`, `BookingDaySchema`, `BookingAppointmentPayloadSchema`, `CreateBookingSchema`, `BlockBookingSlotSchema`, `BookingStatusSchema`, `UpdateBookingStatusSchema`.
   * `pix`: `PixQrCodeRequestSchema`, `PixQrCodeResponseSchema`, `GeneratePixDtoSchema`, `QueryPixQrCodeSchema`.
   * `common`: `MoneyCentsSchema`, `CepSchema`, `PhoneSchema`, `AddressSchema`.

2. **Gaps & Oportunidades no `@alaska/contracts`**:
   * **Schemas de Atualização de Status [RESOLVIDO NA FASE 2]**:
     * Criados os schemas canônicos `UpdateOrderStatusSchema` e `UpdateBookingStatusSchema` com tipagem rigorosa de enums (`OrderStatusSchema` e `BookingStatusSchema`), devidamente integrados com `ZodValidationPipe` no backend.
   * **Mutações Tolerantes de Catálogo [RESOLVIDO NA FASE 2]**:
     * `ToggleProductAvailabilitySchema` e `ToggleOptionAvailabilitySchema` unificados com preprocess defensivo para aceitar `isAvailable` ou `available`.
   * **Schemas de Overrides e Sacola [RESOLVIDO NA FASE 4]**:
     * Declarados `TenantOverridesSchema` e `CartItemSchema` no contracts, unificando a modelagem canônica de persistência local.

---

### B. `apps/api` (Backend NestJS 11)

#### 1. O que está excelente:
* **Clean Architecture & DDD Estrito**:
  * As camadas `core/domain` e `core/application` são puras, sem `@Injectable()` ou referências a ORM/banco.
  * O Value Object `Money` (`money.vo.ts`) encapsula valores em centavos (`cents: number`), bloqueia floats imprecisos e implementa métodos imutáveis (`add`, `subtract`, `multiply`, `equals`, `toDecimal`).
  * Entidades `Order` e `Booking` encapsulam suas transições de estado via métodos canônicos (`updateStatus`, `cancel`), validando regras de negócio e lançando `ValidationError` para transições inválidas.
  * Injeção de dependências desacoplada via tokens de símbolo (`TOKENS.TENANT_REPOSITORY`, `TOKENS.ORDER_REPOSITORY`, `TOKENS.BOOKING_REPOSITORY`, `TOKENS.PASSWORD_HASHER`, etc.).
  * `DomainExceptionFilter` mapeia exceções de domínio para RFC 7807 Problem Details (400, 404, 500).

#### 2. Fragilidades de Tipagem e Fail-Fast Tratadas:
* **Eliminação Total do `any` nos Controllers [RESOLVIDO NA FASE 3]**:
  * `ProductController`: todas as rotas tipadas com DTOs validados via `ZodValidationPipe(ToggleProductAvailabilitySchema)`, `ZodValidationPipe(UpdateProductSchema)` e `ZodValidationPipe(ToggleOptionAvailabilitySchema)`.
  * `TenantController`: `updateHours` tipado com `UpdateTenantHoursDto` e validado via `ZodValidationPipe(UpdateTenantHoursSchema)`, além de `login` com `MerchantLoginSchema`.
  * `OrderController` e `BookingController`: `updateStatus` validado com `UpdateOrderStatusSchema` e `UpdateBookingStatusSchema`. Entidades persistem através de métodos ricos de domínio em vez de mutação direta de propriedades internas, e lançam `EntityNotFoundError` quando o registro não existe.
  * `PixController`: unificado para consumir os schemas e tipos canônicos de `@alaska/contracts/pix`.

---

### C. `apps/web` (Frontend Nuxt 3)

#### 1. O que está excelente:
* Suíte robusta de testes unitários no Vitest (163+ testes) cobrindo regras de carrinho, horários, slots de agendamento e despacho WhatsApp.
* Resolução multi-tenant dinâmica por subdomínio ou slug.
* Placeholders de imagem em SVG vetorial embutido (Data URI), garantindo CLS = 0 e tolerância a 404.

#### 2. Fragilidades de Tipagem e Fail-Fast Tratadas:
* **Shadowing de Tipos (`apps/web/types/index.ts`) [RESOLVIDO NA FASE 1]**:
  * Schemas locais depreciados em favor de re-exportações diretas do `@alaska/contracts`.
* **Persistência em `localStorage` sem Blindagem Zod [RESOLVIDO NA FASE 4]**:
  * `useMerchantAdmin.ts`: `getOverrides()` executa `safeParse` via `TenantOverridesSchema`, descartando entradas corrompidas e garantindo a resiliência do estado operacional do lojista.
  * `useCart.ts`: `useLocalStorage` integrado com `cartItemSerializer` executando `CartItemSchema.safeParse` na hidratação, protegendo o carrinho contra corrupções e schemas legados.

---

## 🛠️ 3. Plano de Ação Recomendado (Roadmap de Blindagem)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ROADMAP DE BLINDAGEM DE TIPAGEM                      │
│                                                                         │
│  [CONCLUÍDO] Fase 1: Eliminar Shadowing de Tipos no Frontend            │
│          Schemas canônicos centralizados no @alaska/contracts           │
│          e apps/web/types re-exportando estritamente do SSOT.           │
│                                                                         │
│  [CONCLUÍDO] Fase 2: Contratos Canônicos para Ações Operacionais        │
│          Criados UpdateOrderStatusSchema, UpdateBookingStatusSchema     │
│          e schemas tolerantes de catálogo no @alaska/contracts.         │
│                                                                         │
│  [CONCLUÍDO] Fase 3: Blindagem Fail-Fast nos Controllers NestJS         │
│          Reintroduzido ZodValidationPipe em todos os controllers        │
│          com DTOs estritos, eliminação de any e métodos de domínio.     │
│                                                                         │
│  [CONCLUÍDO] Fase 4: Validação de Hydration no LocalStorage             │
│          Validar dados de overrides e carrinho via Zod safeParse        │
│          ao inicializar no navegador e serializador defensivo.          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Detalhamento das Etapas:

1. **Fase 1 — Eliminação do Shadowing de Tipos no Web (CONCLUÍDO)**:
   * **Centralização no `@alaska/contracts`**: Enriquecimento do `TenantSchema` com `currency`, `categories`, `professionals`, `services`, `paymentMethods`, `distance`, `priceRange`, `deliveryFeeCents`, `minOrderValueCents` e `.passthrough()`.
   * **Inclusão de Agendamento Canônico**: `BookingDaySchema`, `BookingAppointmentPayloadSchema` e aliases incorporados em `@alaska/contracts/booking`.
   * **Desacoplamento em `apps/web/types/`**: `tenant.ts` e `booking.ts` convertidos em adaptadores puros que re-exportam 100% do `@alaska/contracts`, eliminando duplicatas e blindando o ecossistema contra *Contract Drift*.
   * **Isolamento de UI em `cart.ts`**: Preservação de interfaces estritas de apresentação (`CheckoutFormData`, `CartState`, `ViaCepResponseSchema`).

2. **Fase 2 — Novos Schemas Operacionais no `@alaska/contracts` (CONCLUÍDO)**:
   * **Esteira de Pedidos**: Declarado `UpdateOrderStatusSchema = z.object({ status: OrderStatusSchema })` e ampliado `OrderStatusSchema` para cobrir todos os 7 status do ciclo de vida operacional (`created`, `pending_payment`, `confirmed`, `preparing`, `dispatched`, `completed`, `cancelled`).
   * **Esteira de Agendamentos**: Declarado `BookingStatusSchema = z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])` e `UpdateBookingStatusSchema = z.object({ status: BookingStatusSchema })`.\n   * **Mutações de Catálogo Tolerantes**: Enriquecido `ToggleProductAvailabilitySchema` e adicionado `ToggleOptionAvailabilitySchema` com suporte duplo a `isAvailable` e `available`, eliminando o risco de falhas com payloads legados.
   * **Testes Automatizados**: Criada cobertura completa de testes em `order.spec.ts`, `booking.spec.ts` e `catalog.spec.ts`.

3. **Fase 3 — Reativação do `ZodValidationPipe` nos Controllers (CONCLUÍDO)**:
   * **Eliminação de `@Body() body: any`**: `ProductController`, `TenantController`, `OrderController` e `BookingController` agora utilizam estritamente DTOs validados na borda HTTP.
   * **Encapsulamento de Entidades DDD**: Entidades `Order` e `Booking` receberam métodos de ciclo de vida (`updateStatus`, `cancel`) com validações de regra de negócio, eliminando mutações diretas de propriedades internas (`(order as any).props.status = status`).
   * **Respostas RFC 7807**: Entidades não encontradas disparam `EntityNotFoundError`, garantindo respostas 404 padronizadas no lugar de status 200 com mensagem de erro.

4. **Fase 4 — Fail-Fast na Hidratação do LocalStorage (CONCLUÍDO)**:
   * **Contratos Canônicos de Overrides no `@alaska/contracts/tenant`**:
     * Declarado o schema estrito `TenantOverridesSchema` com suporte a `DayScheduleSchema`, `ProfessionalOverrideSchema`, `PixConfigOverrideSchema`, `ContactOverrideSchema`, `CustomProfessionalSchema` e `ProductOverrideSchema` com `.passthrough()`.
     * Exportados tipos TypeScript de primeira classe (`TenantOverrides`, `DaySchedule`, `ProfessionalOverride`, etc.), eliminando duplicidades no frontend.
   * **Blindagem de Overrides no `useMerchantAdmin.ts`**:
     * Implementada validação `safeParse` em `getOverrides()`. Se o conteúdo do `localStorage` estiver corrompido, contiver tipo primitivo inválido ou schema incompatível, a aplicação recupera o estado são (`{}`) automaticamente sem estourar exceções de runtime.
     * Implementada validação defensiva em `saveOverrides()` garantindo que os dados persistidos estejam sempre em conformidade com o schema canônico.
   * **Contratos Canônicos de Sacola no `@alaska/contracts/order`**:
     * Declarados `CartItemSchema` e `CartItemsArraySchema` encapsulando a modelagem canônica de itens da sacola, opcionais selecionados e observações.
     * Re-exportação limpa em `apps/web/types/cart.ts` mantendo 100% de compatibilidade com os componentes de UI (`CartDrawerModal.vue`).
   * **Serializador Zod Fail-Safe em `useCart.ts`**:
     * Adicionado o `cartItemSerializer` acoplado ao `useLocalStorage<CartItem[]>` do `@vueuse/core`.
     * Na leitura (hydration / recarregamento / evento de storage multi-aba), cada item é validado individualmente via `CartItemSchema.safeParse`. Itens nulos, corrompidos ou malformados são filtrados silenciosamente, prevenindo o temido `TypeError: Cannot read properties of undefined` no template do carrinho.
   * **Testes Automatizados de Resiliência**:
     * Suíte de testes em `merchant-admin.test.ts` validando recuperação de JSON inválido, tipos primitivos e arrays no `localStorage`.
     * Suíte de testes em `cart.test.ts` validando `cartItemSerializer.read` e `write` com dados corrompidos e filtragem de itens inválidos.
