# ADR 001: Clean Architecture (Ports & Adapters) e Isolamento do Core

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Camadas `src/core/` vs `src/infrastructure/`, Inversão de Controle, Módulos NestJS 11

---

## 1. Contexto & Problema

Em sistemas empresariais convencionais em NestJS, é comum acoplar entidades de domínio e casos de uso a decorators de frameworks (`@Injectable()`, `@Entity()`, `@Column()`, `@ApiProperty()`).

Esse acoplamento causa:
1. **Dificuldade de Testes:** Necessidade de instanciar o container do NestJS (`Test.createTestingModule`) até para testes unitários simples.
2. **Dependência de Framework:** Regras de negócio ficam reféns de mudanças de versão do framework ou ORM.
3. **Vazamento de Infraestrutura:** Detalhes de banco de dados ou HTTP poluem o raciocínio das regras de negócio do lojista.

## 2. Decisão Arquitetural

Adotamos a **Clean Architecture (Hexagonal / Ports & Adapters)** com as seguintes regras inegociáveis:

```
┌────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE                       │
│   (NestJS Controllers, Drizzle/Prisma, Redis, HTTP)    │
│   ┌────────────────────────────────────────────────┐   │
│   │                  APPLICATION                   │   │
│   │        (Use Cases, DTOs, Repository Ports)     │   │
│   │   ┌────────────────────────────────────────┐   │   │
│   │   │                 DOMAIN                 │   │   │
│   │   │   (Entities, Value Objects, Errors)    │   │   │
│   │   └────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### A. Camada Core (`src/core/`)
- **Zero Decorators:** Nenhuma classe em `src/core/` utiliza anotações do NestJS (`@Injectable()`, etc.).
- **Entidades Puras:** A entidade `Tenant` encapsula seus comportamentos (`isOpen()`, `updateDetails()`, `setPixConfig()`).
- **Value Objects Imutáveis:** `Money` para cálculos monetários em centavos e `PixKey` para validação de chaves.

### B. Inversão de Controle com Symbols (`src/core/application/tokens.ts`)
As portas de repositórios são definidas como interfaces TypeScript (`ITenantRepository`) e injetadas através de tokens únicos:
```ts
export const TOKENS = {
  TENANT_REPOSITORY: Symbol('ITenantRepository'),
  PRODUCT_REPOSITORY: Symbol('IProductRepository')
}
```

No módulo NestJS (`TenantModule`), conectamos a implementação usando `useFactory` ou `useClass`:
```ts
{
  provide: GetTenantBySlugUseCase,
  useFactory: (repo: ITenantRepository) => new GetTenantBySlugUseCase(repo),
  inject: [TOKENS.TENANT_REPOSITORY]
}
```

## 3. Consequências & Benefícios

- **Testes Instantâneos:** Casos de uso e entidades rodam em ~5ms no Vitest com repositórios em memória (`InMemoryTenantRepository`).
- **Independência Tecnológica:** Trocar o banco de dados de Supabase para PostgreSQL nativo ou MongoDB afeta apenas a pasta `src/infrastructure/persistence/`.
