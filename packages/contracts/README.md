# 📦 @alaska/contracts — Single Source of Truth

Pacote compartilhado contendo todos os **Schemas Zod 3.24** e **Tipos TypeScript** canônicos do ecossistema Alaska Local, garantindo *End-to-End Type Safety* entre o frontend (`apps/web`) e o backend (`apps/api`).

---

## 🏛️ Módulos Disponíveis

O pacote expõe subpath exports granulares para importação limpa e performática:

| Módulo | Import | Conteúdo Principal |
| :--- | :--- | :--- |
| **Common** | `@alaska/contracts/common` | `AddressSchema`, `CepSchema`, `PhoneSchema`, `MoneyCentsSchema` |
| **Tenant** | `@alaska/contracts/tenant` | `TenantSchema`, `TenantCategorySchema`, `TenantThemeSchema` (11 temas), `OpeningHoursSchema`, `PixConfigSchema`, `StoreReviewsSchema` |
| **Catalog** | `@alaska/contracts/catalog` | `ProductSchema`, `CategorySchema`, `OptionGroupSchema`, `OptionItemSchema` |
| **Order** | `@alaska/contracts/order` | `CreateOrderSchema`, `OrderItemSchema`, `DeliveryTypeSchema`, `PaymentMethodSchema`, `OrderStatusSchema` |
| **Booking** | `@alaska/contracts/booking` | `CreateBookingSchema`, `BookingServiceSchema`, `ProfessionalSchema`, `BookingSlotSchema` |
| **Pix** | `@alaska/contracts/pix` | `PixQrCodeRequestSchema`, `PixQrCodeResponseSchema`, `PixKeyTypeSchema` |
| **Root Barrel** | `@alaska/contracts` | Reexporta todos os módulos acima |

---

## 🚀 Como Criar ou Alterar um Contrato

Siga o fluxo em 3 passos para evoluir os contratos:

### 1. Definir o Schema Zod
Adicione ou edite o schema no módulo apropriado em `src/<modulo>/index.ts`:

```typescript
import { z } from 'zod'

export const MeuNovoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(2),
  ativo: z.boolean().default(true),
})

export type MeuNovoTipo = z.infer<typeof MeuNovoSchema>
```

### 2. Compilar os Contratos (Gera ESM, CJS e .d.ts)
A partir da raiz do monorepo:
```bash
pnpm build:contracts
```

### 3. Rodar os Testes de Contratos
```bash
pnpm test:contracts
```

---

## 🔗 Como Consumir nas Aplicações

Nos arquivos `package.json` de `apps/web` e `apps/api`:
```json
"dependencies": {
  "@alaska/contracts": "workspace:*"
}
```

Importando no código:
```typescript
import { TenantSchema, type Tenant } from '@alaska/contracts/tenant'
import { CreateOrderSchema, type CreateOrderDto } from '@alaska/contracts/order'
```
