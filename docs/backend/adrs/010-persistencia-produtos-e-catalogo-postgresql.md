# ADR 010: Persistência Real de Produtos e Catálogo no PostgreSQL com Clean Architecture

- **Status:** Aceito / Implementado
- **Data:** 2026-09-17
- **Contexto:** `apps/api/src/infrastructure/http/controllers/product.controller.ts`, `packages/contracts/src/catalog/index.ts`, `apps/web/composables/useMerchantAdmin.ts`
- **Referência:** ADR 001 (Clean Architecture), ADR 003 (PostgreSQL RLS), ADR 013 (Painel do Lojista), ADR 014 (@alaska/contracts)

---

## 1. Contexto & Problema

Anteriormente, ao cadastrar um novo produto ou serviço pelo Painel do Lojista (`apps/web/components/admin/modals/AdminCreateProductModal.vue` e `useMerchantAdmin.ts`), o item era gerado com identificador temporário (`prod-custom-${Date.now()}`) e gravado exclusivamente no `localStorage` do navegador sob a chave `alaska_overrides_<slug>`.

Esse comportamento causava os seguintes problemas:
1. **Dados Não Compartilhados:** Clientes acessando a vitrine de outros navegadores, dispositivos móveis ou computadores não visualizavam os novos produtos cadastrados pelo lojista.
2. **Volatilidade de Sessão:** Caso o lojista limpasse o cache do navegador ou trocasse de dispositivo, os produtos cadastrados desapareciam.
3. **Ausência de Endpoints de Ciclo de Vida:** O backend NestJS possuía apenas endpoints para atualização de preço e status (`PATCH :productId/availability`, `PUT :productId`), não disponibilizando rota de criação (`POST /tenants/:slug/products`) e exclusão (`DELETE /tenants/:slug/products/:productId`).

---

## 2. Decisão Arquitetural

Adotamos a **Persistência Real em 3 Camadas** com suporte a Clean Architecture, Zod Fail-Fast e isolamento multi-tenant:

```
┌────────────────────────────────────────────────────────┐
│             CAMADA 1: REATIVIDADE NA UI                │
│  Feedback instantâneo (< 50ms) com useHaptic e toasts  │
├────────────────────────────────────────────────────────┤
│             CAMADA 2: CACHE OTIMISTA                   │
│  Armazenamento defensivo em localStorage (overrides)   │
├────────────────────────────────────────────────────────┤
│             CAMADA 3: PERSISTÊNCIA REMOTA              │
│  POST /tenants/:slug/products -> PostgreSQL Real       │
└────────────────────────────────────────────────────────┘
```

### A. Contrato Canônico no `@alaska/contracts/catalog`
Declarado `CreateProductSchema` com validação de campos obrigatórios (`name`, `categoryId`, `price`), normalização de inteiros em centavos (`priceCents`) e suporte a fotos do Cloudinary:
```typescript
export const CreateProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome do produto é obrigatório'),
  description: z.string().optional().default(''),
  price: z.number().nonnegative('Preço deve ser não-negativo'),
  priceCents: z.number().int().nonnegative().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  image: z.string().optional().default(''),
  imageUrl: z.string().optional(),
  durationMinutes: z.number().int().nonnegative().optional().default(0),
  isAvailable: z.boolean().optional().default(true),
  available: z.boolean().optional().default(true),
  options: z.array(OptionGroupSchema).optional().default([]),
  optionGroups: z.array(OptionGroupSchema).optional().default([]),
})
```

### B. Core e Casos de Uso Puros no NestJS (`apps/api`)
1. **`CreateProductUseCase`**:
   - Resolve o estabelecimento via `ITenantRepository.findBySlug`.
   - Converte o valor monetário em `Money` VO (centavos inteiros imutáveis).
   - Persiste a entidade na tabela relacional `products` do PostgreSQL associando o `tenant_id` correspondente.
2. **`DeleteProductUseCase`**:
   - Valida a existência do produto via `findById` e executa a exclusão definitiva no PostgreSQL via `IProductRepository.delete`.

### C. Endpoints REST no `ProductController`
- `POST /api/v1/tenants/:slug/products` com `ZodValidationPipe(CreateProductSchema)` retornando HTTP 201.
- `DELETE /api/v1/tenants/:slug/products/:productId` retornando HTTP 200.

### D. Integração no Frontend (`useMerchantAdmin.ts`)
- `createProduct`: Instancia e reflete o produto na UI de imediato, e dispara em background `POST /tenants/:slug/products` para gravar no PostgreSQL.
- `deleteProduct`: Oculta imediatamente da visualização e dispara `DELETE /tenants/:slug/products/:productId`.
- `admin.vue`: Reativação reativa do catálogo via `refresh()` para hidratação oficial com dados retornados pelo backend.

---

## 3. Consequências & Benefícios

- **Persistência Verdadeira:** Produtos criados agora são registros reais na tabela `products` do PostgreSQL e aparecem para qualquer usuário na internet.
- **Zero Latência Percebida:** A mutação otimista mantém a interface mobile instantânea para o lojista (< 50ms).
- **Consistência de Domínio:** Preços sempre gravados como inteiros em centavos (`price_cents INT`), prevenindo discrepâncias monetárias.
