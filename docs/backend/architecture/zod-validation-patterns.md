# 🛡️ Padrões de Validação com Zod e Blindagem Fail-Fast

No ecossistema **Alaska Local Backend**, o **Zod** é a ferramenta única e universal de validação de esquemas de dados, tipagem estática e blindagem contra anomalias. Adotamos o princípio de **Fail-Fast**: dados inconsistentes são interceptados e rejeitados na fronteira externa da aplicação antes de propagarem para os casos de uso ou para o banco de dados.

---

## 🏛️ 1. Single Source of Truth (`@alaska/contracts`)

Conforme estabelecido no **ADR 014**, todos os contratos e esquemas compartilhados entre o front-end (`apps/web`) e o back-end (`apps/api`) residem no pacote centralizado `@alaska/contracts`.

### Vantagens:
* **Zero Drift de Tipos**: Não há interfaces duplicadas manualmente entre front e back.
* **Inferência Direta**: Os DTOs do NestJS são inferidos diretamente dos esquemas Zod via `z.infer<typeof Schema>`.
* **Módulos Canônicos**:
  * `@alaska/contracts/catalog`: `ProductSchema`, `OptionGroupSchema`, `ToggleProductAvailabilitySchema`, `UpdateProductSchema`.
  * `@alaska/contracts/tenant`: `TenantSchema`, `OpeningHoursSchema`, `StoreReviewsSchema`, `VerifyAdminPinSchema`, `MerchantLoginSchema`.
  * `@alaska/contracts/order`: `CreateOrderSchema`, `OrderItemSchema`, `DeliveryTypeSchema`, `PaymentMethodSchema`.
  * `@alaska/contracts/booking`: `CreateBookingSchema`, `BookingServiceSchema`, `ProfessionalSchema`.
  * `@alaska/contracts/pix`: `PixQrCodeRequestSchema`, `PixQrCodeResponseSchema`.
  * `@alaska/contracts/common`: `MoneyCentsSchema`, `CepSchema`, `AddressSchema`.

---

## ⚙️ 2. Validação no Bootstrap de Ambiente (`EnvSchema`)

Antes de instanciar qualquer módulo do NestJS, o `src/config/env.schema.ts` executa a validação das variáveis de ambiente com coerção automática de tipos:

```ts
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default('*'),
  REDIS_URL: z.string().optional(),
  ASAAS_API_KEY: z.string().optional(),
})

export type EnvConfig = z.infer<typeof EnvSchema>

export function validateEnv(): EnvConfig {
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('❌ Configuração inválida de variáveis de ambiente:', parsed.error.format())
    process.exit(1)
  }
  return parsed.data
}
```

---

## 🚀 3. Validação de Entrada HTTP via `ZodValidationPipe`

Todos os controladores utilizam o `ZodValidationPipe` (`src/infrastructure/http/pipes/zod-validation.pipe.ts`). O pipe intercepta a requisição, aplica coerções e defaults, e rejeita entradas inválidas com `BadRequestException` (HTTP 400):

```ts
@Post(':slug/admin/login')
@HttpCode(HttpStatus.OK)
@UsePipes(new ZodValidationPipe(MerchantLoginSchema))
async login(
  @Param('slug') slug: string,
  @Body() body: MerchantLoginInput,
) {
  return this.authenticateMerchantUseCase.execute({ slug, pin: body.pin })
}
```

### Comportamento do Pipe:
1. **Transformação Automática**: Schemas com `.default()` ou `.transform()` aplicam seus valores sanitizados antes do controlador receber o payload.
2. **Coerção Segura**: Parâmetros numéricos ou booleanos recebidos como string são convertidos de forma tipada.
3. **Erros Transparentes**: Retorna o detalhamento exato dos campos violados.

---

## 🔄 4. Transformações e Resiliência Bidirecional

Para garantir total tolerância a falhas e compatibilidade entre catálogos legados JSON locais (`~/data/*.json`) e respostas estruturadas do PostgreSQL, utilizamos transformações resilientes:

### Prova Social e Avaliações (`StoreReviewsSchema`):
Suporta tanto `score` quanto `rating`, e `totalReviews` ou `count`, normalizando ambos os pares de propriedades:
```ts
export const StoreReviewsSchema = z.object({
  score: z.number().min(0).max(5).optional(),
  rating: z.number().min(0).max(5).optional(),
  totalReviews: z.number().optional(),
  count: z.number().optional(),
  distribution: z.record(z.string(), z.number()).optional().default({}),
  comments: z.array(ReviewCommentSchema).optional().default([])
}).transform((val) => {
  const score = typeof val.score === 'number' ? val.score : (typeof val.rating === 'number' ? val.rating : 5.0)
  const totalReviews = typeof val.totalReviews === 'number' ? val.totalReviews : (typeof val.count === 'number' ? val.count : 0)
  return {
    ...val,
    score,
    rating: score,
    totalReviews,
    count: totalReviews,
  }
})
```

### Estabelecimentos (`TenantSchema`):
Compatibiliza `phoneWhatsApp` e `whatsapp`:
```ts
export const TenantSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2),
  name: z.string().min(2),
  phoneWhatsApp: z.string().optional(),
  whatsapp: z.string().optional(),
  businessCategory: z.enum(['menu', 'shop', 'hub', 'pro']),
  theme: TenantThemeSchema.default('food'),
  openingHours: OpeningHoursSchema.optional(),
  pixConfig: PixConfigSchema.optional(),
  // ...
})
```

---

## 💎 5. Blindagem na Camada de Domínio (Value Objects)

A validação de negócio não se limita aos endpoints HTTP. As entidades e Value Objects do Core impõem invariantes absolutas no construtor:

1. **`Money` VO**:
   * Impede valores negativos (`InvalidMoneyAmountError`).
   * Força cálculos em centavos inteiros (`_cents`), eliminando bugs de ponto flutuante em troco e subtotal.
   * Expõe `inCents` e `cents` para leitura transparente.
2. **`PixKey` VO**:
   * Validação estrita por tipo (`cpf`, `cnpj`, `phone`, `email`, `random` UUID).
3. **`Address` VO**:
   * Exige rua, número e bairro para pedidos de delivery.

---

## 🚨 6. Tratamento de Erros e RFC 7807 (Problem Details)

Quando ocorrem erros de validação Zod ou violações de domínio, o `DomainExceptionFilter` intercepta a exceção e devolve uma resposta estruturada de acordo com o padrão **RFC 7807**:

```json
{
  "type": "https://alaska.app/errors/VALIDATION_ERROR",
  "title": "Erro de Validação de Entrada",
  "status": 400,
  "detail": "Um ou mais campos enviados violam as regras do contrato.",
  "instance": "/api/v1/orders",
  "errors": [
    {
      "field": "customerPhone",
      "message": "Telefone de WhatsApp inválido. Mínimo de 10 dígitos."
    },
    {
      "field": "items",
      "message": "A sacola de pedidos deve conter pelo menos 1 item."
    }
  ]
}
```
