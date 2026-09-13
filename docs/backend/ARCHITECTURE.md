# 🏛️ Alaska Local — Back-end Clean Architecture Specification

Este documento detalha o design arquitetural da API NestJS (`@alaska/api`), implementada segundo os padrões de **Clean Architecture (Hexagonal / Ports & Adapters)** e **Domain-Driven Design (DDD)**.

---

## 1. Diagrama de Dependências da Arquitetura Hexagonal

```
               ┌────────────────────────────────────────────────────────┐
               │                  Infrastructure Layer                  │
               │  • Controllers (Tenant, Product, Order, Booking, Pix) │
               │  • PostgresService (Pool pg com Auto-Migration & Seed) │
               │  • SimplePasswordHasher, MerchantAuthGuard             │
               │  • LocalPixGateway (BR Code EMV & QR Code)             │
               │  • ZodValidationPipe, DomainExceptionFilter           │
               └───────────────────────────┬────────────────────────────┘
                                           │ (Depends on)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                   Application Layer                    │
               │  • Use Cases (GetTenant, UpdateHours, ToggleOption...) │
               │  • Repository Ports (ITenantRepository, etc.)          │
               │  • Gateway & Security Ports (IPixGateway, Hasher)      │
               │  • Injection Tokens (TOKENS.*)                         │
               └───────────────────────────┬────────────────────────────┘
                                           │ (Depends on)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                      Domain Layer                      │
               │  • Entities (Tenant, Product, Order, Booking)          │
               │  • Value Objects (Money em centavos, Address, PixKey)  │
               │  • Domain Errors (DomainError, EntityNotFoundError...) │
               └────────────────────────────────────────────────────────┘
```

> **Regra de Dependência**: O fluxo de dependências aponta estritamente para dentro. A camada de domínio não tem conhecimento da aplicação, e a aplicação não tem conhecimento de frameworks, controladores ou PostgreSQL.

---

## 2. Padrão Money Value Object (Precisão Monetária)

Para eliminar erros de arredondamento de ponto flutuante (padrão IEEE-754) comuns em e-commerces e cardápios digitais, todos os valores monetários no backend são tratados via `Money`:

```ts
export class Money {
  private readonly amountCents: number

  private constructor(cents: number) {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new ValidationError('Valor monetário deve ser um inteiro não-negativo em centavos.')
    }
    this.amountCents = cents
  }

  static fromCents(cents: number): Money {
    return new Money(cents)
  }

  static fromDecimal(val: number): Money {
    return new Money(Math.round(val * 100))
  }

  add(other: Money): Money {
    return new Money(this.amountCents + other.amountCents)
  }

  percentage(percent: number): Money {
    return new Money(Math.round((this.amountCents * percent) / 100))
  }

  toDecimal(): number {
    return this.amountCents / 100
  }

  get cents(): number {
    return this.amountCents
  }
}
```

---

## 3. Validação Fail-Fast com Zod

Todas as requisições HTTP passam por validação Zod baseada nos contratos compartilhados em `@alaska/contracts`:

```ts
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha de validação nos dados enviados',
        errors: result.error.flatten().fieldErrors
      })
    }
    return result.data
  }
}
```

---

## 4. Persistência PostgreSQL com Auto-Migration e Auto-Seed

A persistência opera de forma resiliente e automatizada através do `PostgresService`:

1. **Auto-Migration (`initSchema()`)**:
   - Executada automaticamente no bootstrap do NestJS (`onModuleInit`).
   - Garante a criação de extensões (`uuid-ossp`), tabelas (`tenants`, `categories`, `products`, `orders`, `bookings`) e colunas (`pin_hash`, `professionals`, `reviews`).
2. **Auto-Seed dos 10 Estabelecimentos (`seedAllStores()`)**:
   - Detecta automaticamente se a tabela `categories` está vazia.
   - Em caso de banco recém-criado (como no primeiro deploy do Render), popula instantaneamente os 10 estabelecimentos canônicos com catálogo, fotos, preços em centavos e horários.
3. **Auto-Detecção de SSL no Render**:
   - Conexões contendo `render.com`, `dpg-`, `oregon-postgres`, `sslmode=require` ou `ssl=true` ativam automaticamente `ssl: { rejectUnauthorized: false }`.
4. **Isolamento em Testes com `InMemoryRepository`**:
   - O Vitest utiliza repositórios em memória para executar toda a suíte de testes unitários do backend em menos de 150ms sem depender de container PostgreSQL.

---

## 5. Deploy de Produção no Render (`render.yaml`)

O deploy da API em produção é orquestrado via blueprint do **Render**:
- **Blueprint:** `render.yaml` na raiz do monorepo.
- **Container:** Dockerfile multi-stage (`node:22-alpine`, pnpm 10.5.2, compilação via Turborepo).
- **Porta:** 10000 em produção (3333 localmente).
