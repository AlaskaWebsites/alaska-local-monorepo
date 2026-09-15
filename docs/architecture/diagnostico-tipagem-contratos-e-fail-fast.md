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
| **`@alaska/contracts` (SSOT)** | **10.0 / 10** | 🟢 Concluído (Fases 1 e 2) | Schemas Zod 3.24 cobrindo Tenant, Catalog, Order, Booking, Pix e Common. Build duplo ESM/CJS com `.d.ts`. Suporte canônico para status operacionais e mutações tolerantes. |
| **`apps/api` Core Domain** | **9.5 / 10** | 🟢 Exemplar | Clean Architecture pura, Value Objects imutáveis (`Money` em centavos inteiros), entidades ricas e zero dependência de framework. |
| **`apps/api` Presentation** | **6.5 / 10** | 🟡 Atenção (Próximo: Fase 3) | Erosão de schemas nos controllers: `ProductController` e `TenantController.updateHours` recorreram a `@Body() body: any` para contornar divergências de payloads do cliente. |
| **`apps/web` Composables** | **7.5 / 10** | 🟡 Bom | Lógica de negócio robusta e testada (Vitest), mas uso frequente de `$fetch<any>` e ausência de `safeParse` na persistência do `localStorage`. |
| **`apps/web` Types (Shadowing)** | **9.5 / 10** | 🟢 Resolvido (Fase 1) | **Shadowing Eliminado**: `apps/web/types/` unificado sob `@alaska/contracts`, centralizando SSOT e mantendo retrocompatibilidade total. |

---

## 🔍 2. Diagnóstico Detalhado por Camada

### A. `@alaska/contracts` (Single Source of Truth)

O pacote `@alaska/contracts` centraliza os contratos de dados do ecossistema:
1. **Módulos Existentes**:
   * `tenant`: `TenantSchema`, `TenantCategorySchema` (`menu`, `shop`, `hub`, `pro`), `TenantThemeSchema` (11 temas com default `'food'`), `OpeningHoursSchema`, `PixConfigSchema`, `StoreReviewsSchema`, `UpdateTenantHoursSchema`, `VerifyAdminPinSchema`, `MerchantLoginSchema`.
   * `catalog`: `OptionItemSchema`, `OptionGroupSchema`, `ProductSchema`, `CategorySchema`, `ToggleProductAvailabilitySchema`, `ToggleOptionAvailabilitySchema`, `UpdateProductSchema`.
   * `order`: `DeliveryTypeSchema`, `PaymentMethodSchema`, `OrderStatusSchema`, `OrderItemSchema`, `CreateOrderSchema`, `UpdateOrderStatusSchema`.
   * `booking`: `BookingServiceSchema`, `ProfessionalSchema`, `BookingSlotSchema`, `BookingDaySchema`, `BookingAppointmentPayloadSchema`, `CreateBookingSchema`, `BlockBookingSlotSchema`, `BookingStatusSchema`, `UpdateBookingStatusSchema`.
   * `pix`: `PixQrCodeRequestSchema`, `PixQrCodeResponseSchema`.
   * `common`: `MoneyCentsSchema`, `CepSchema`, `PhoneSchema`, `AddressSchema`.

2. **Gaps & Oportunidades no `@alaska/contracts`**:
   * **Schemas de Atualização de Status [RESOLVIDO NA FASE 2]**:
     * Criados os schemas canônicos `UpdateOrderStatusSchema` e `UpdateBookingStatusSchema` com tipagem rigorosa de enums (`OrderStatusSchema` e `BookingStatusSchema`), prontos para blindagem via pipe nos controllers NestJS.
   * **Preprocessamento e Tolerância de Booleans [RESOLVIDO NA FASE 2]**:
     * Implementado `ToggleProductAvailabilitySchema` e `ToggleOptionAvailabilitySchema` com suporte duplo a `isAvailable` e `available`.

---

### B. `apps/api` (Backend NestJS 11)

#### 1. O que está excelente:
* **Clean Architecture & DDD Estrito**:
  * As camadas `core/domain` e `core/application` são puras, sem `@Injectable()` ou referências a ORM/banco.
  * O Value Object `Money` (`money.vo.ts`) encapsula valores em centavos (`cents: number`), bloqueia floats imprecisos e implementa métodos imutáveis (`add`, `subtract`, `multiply`, `equals`, `toDecimal`).
  * Injeção de dependências desacoplada via tokens de símbolo (`TOKENS.TENANT_REPOSITORY`, `TOKENS.PASSWORD_HASHER`, etc.).
  * `DomainExceptionFilter` mapeia exceções de domínio para RFC 7807 Problem Details (400, 404, 500).

#### 2. Fragilidades de Tipagem e Fail-Fast Identificadas:
* **Relaxamento para `any` no `ProductController`**:
  * No commit `53e353ef164740b3073518f36a90c9da2a9a9a98`, os pipes de validação Zod foram removidos das rotas de produto para flexibilizar payloads.
* **Ausência de Validação nas Rotas de Status Operacional**:
  * Em `OrderController`: `@Patch(':id/status')` aceita `@Body('status') status: any`.
  * Em `BookingController`: `@Patch(':id/status')` aceita `@Body('status') status: any`.
* **Contrato Frouxo em `TenantController.updateHours`**:
  * Aceita `@Body() body: any`, extraindo `const hours = body?.hours || body?.openingHours || body` sem validação do `UpdateTenantHoursSchema`.
* **Duplicação de Schemas no `PixController`**:
  * Define internamente `GeneratePixDtoSchema` e `QueryPixQrCodeSchema` em vez de importar `PixQrCodeRequestSchema` de `@alaska/contracts`.

---

### C. `apps/web` (Frontend Nuxt 3)

#### 1. O que está excelente:
* Suíte robusta de testes unitários no Vitest (163 testes / 22 suítes) cobrindo regras de carrinho, horários, slots de agendamento e despacho WhatsApp.
* Resolução multi-tenant dinámica por subdomínio ou slug.
* Placeholders de imagem em SVG vetorial embutido (Data URI), garantindo CLS = 0 e tolerância a 404.

#### 2. Fragilidades de Tipagem e Fail-Fast Identificadas:
* **Shadowing de Tipos (`apps/web/types/index.ts`) [RESOLVIDO NA FASE 1]**:
  * `apps/web/types/tenant.ts` e `apps/web/types/booking.ts` foram convertidos em re-exportadores estritos de `@alaska/contracts`.
  * Schemas canônicos completos residem agora exclusivamente no `@alaska/contracts`.
* **Persistência em `localStorage` sem Blindagem Zod**:
  * No composable `useMerchantAdmin.ts`, a função `saveOverrides` grava diretamente o JSON no `localStorage` sem validar via schema Zod (`TenantOverridesSchema`).
  * O mesmo ocorre em `useCart.ts`, onde `useLocalStorage<CartItem[]>` armazena objetos sem passar por um validador de integridade no momento da leitura (hydration).
* **Consumo de API com `$fetch<any>` e Silenciamento de Erros RFC 7807**:
  * Em `useTenant.ts` e `useMerchantAdmin.ts`, requisições HTTP usam `$fetch<any>` sem tipar o retorno esperado.
* **Casting `as any` em Componentes**:
  * Diversos componentes (`AdminCatalogTab.vue`, `StoreReviewsModal.vue`, `StoreHeaderCard.vue`) utilizam `(item as any)` para acessar propriedades.

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
│          UpdateOrderStatusSchema, UpdateBookingStatusSchema,             │
│          BookingStatusSchema e ToggleProductAvailability tolerante.     │
│                                                                         │
│  Fase 3: Blindagem Fail-Fast nos Controllers NestJS                     │
│          Reintroduzir ZodValidationPipe em ProductController,           │
│          OrderController e TenantController com schemas canônicos.      │
│                                                                         │
│  Fase 4: Validação de Hydration no LocalStorage                         │
│          Validar dados de overrides e carrinho via Zod safeParse        │
│          ao inicializar no navegador.                                   │
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
   * **Esteira de Agendamentos**: Declarado `BookingStatusSchema = z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])` e `UpdateBookingStatusSchema = z.object({ status: BookingStatusSchema })`.
   * **Mutações de Catálogo Tolerantes**: Enriquecido `ToggleProductAvailabilitySchema` e adicionado `ToggleOptionAvailabilitySchema` com suporte duplo a `isAvailable` e `available`, eliminando o risco de falhas com payloads legados.
   * **Testes Automatizados**: Criada cobertura completa de testes em `order.spec.ts`, `booking.spec.ts` e `catalog.spec.ts`.

3. **Fase 3 — Reativação do `ZodValidationPipe` nos Controllers**:
   * Substituir `@Body() body: any` em `product.controller.ts`, `order.controller.ts`, `booking.controller.ts` e `tenant.controller.ts` por DTOs tipados com validação de pipe.
   * Substituir mutações diretas `(order as any).props.status = status` por métodos canônicos de entidade (`order.updateStatus(status)`).
   * Lançar `EntityNotFoundError` quando o registro não for encontrado em rotas de status.

4. **Fase 4 — Fail-Fast na Hidratação do LocalStorage**:
   * Adicionar `safeParse` em `getOverrides()` de `useMerchantAdmin.ts` para descartar chaves corrompidas e recuperar o estado são automaticamente.
