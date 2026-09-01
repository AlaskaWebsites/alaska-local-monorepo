# 🏛️ Alaska Local — Back-end Clean Architecture Specification

Este documento detalha o design arquitetural da API NestJS (`@alaska/api`), implementada segundo os padrões de **Clean Architecture (Hexagonal / Ports & Adapters)** e **Domain-Driven Design (DDD)**.

---

## 1. Diagrama de Dependências da Arquitetura Hexagonal

```
               ┌────────────────────────────────────────┐
               │         Infrastructure Layer           │
               │  Controllers (NestJS), PostgreSQL,     │
               │  Pix Gateways, Pipes, Filters          │
               └───────────────────┬────────────────────┘
                                   │ (Depends on)
                                   ▼
               ┌────────────────────────────────────────┐
               │          Application Layer             │
               │  Use Cases, Repository Ports,          │
               │  Gateway Ports, Injection Tokens       │
               └───────────────────┬────────────────────┘
                                   │ (Depends on)
                                   ▼
               ┌────────────────────────────────────────┐
               │             Domain Layer               │
               │  Entities (Tenant, Product, Order),    │
               │  Value Objects (Money, Address, Pix),  │
               │  Domain Errors (Pure TypeScript)       │
               └────────────────────────────────────────┘
```

> **Regra de Dependência**: O fluxo de dependências aponta estritamente para dentro. A camada de domínio não tem conhecimento da camada de aplicação, e a aplicação não tem conhecimento de controllers, banco de dados ou frameworks.

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

## 3. Validação Fail-Fast com ZodValidationPipe

Todas as requisições HTTP passam pelo `ZodValidationPipe`, que utiliza os schemas centralizados em `@alaska/contracts`:

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

## 4. Persistência Desacoplada e Testes

A infraestrutura implementa as portas de aplicação através de duas estratégias:
1. **`InMemoryRepository`**: Utilizado em suítes de testes unitários e de integração leve, permitindo rodar todos os testes em milissegundos sem depender de Docker ou banco de dados externo.
2. **`PostgresRepository`**: Utilizado em produção com conexão em pool (`pg`), mapeamento bidirecional via `Mapper` e Row-Level Security (RLS) por `tenant_id`.
