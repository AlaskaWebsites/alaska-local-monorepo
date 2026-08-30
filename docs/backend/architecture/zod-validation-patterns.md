# Padrões de Validação com Zod

O **Zod** é a biblioteca padrão para validação em todas as camadas de entrada e saída do backend.

---

## 1. Validação de Variáveis de Ambiente

Todas as variáveis de ambiente necessárias para a inicialização do sistema são declaradas em `src/config/env.schema.ts` com coerção automática de tipos:

```ts
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().optional()
})
```

---

## 2. Validação de DTOs HTTP nos Controllers

Para validar parâmetros de Query, Body ou Params, declare o schema Zod e utilize o `ZodValidationPipe`:

```ts
export const CreateTenantDtoSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  name: z.string().min(2).max(100),
  phoneWhatsApp: z.string().min(10).max(15),
  businessCategory: z.enum(['menu', 'shop', 'hub', 'pro']),
  theme: z.enum(['food', 'barber', 'health', 'drinks', 'default']).default('food')
})

export type CreateTenantDto = z.infer<typeof CreateTenantDtoSchema>

@Post()
@UsePipes(new ZodValidationPipe(CreateTenantDtoSchema))
async create(@Body() dto: CreateTenantDto) {
  return this.createTenantUseCase.execute(dto)
}
```

---

## 3. Formatação e Tratamento de Erros

Quando o `ZodValidationPipe` detecta inconsistências, ele retorna HTTP 400 Bad Request com estrutura padronizada:

```json
{
  "statusCode": 400,
  "message": "Dados de entrada inválidos.",
  "errors": {
    "slug": {
      "_errors": ["Slug deve conter apenas letras minúsculas, números e hífens"]
    }
  }
}
```
