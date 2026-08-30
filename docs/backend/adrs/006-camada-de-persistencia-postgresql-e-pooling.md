# ADR 006: Camada de Persistência PostgreSQL, Connection Pooling e Mappers de Domínio

- **Status:** Aceito / Implementado
- **Data:** 2026-08-29
- **Contexto:** Módulo `src/infrastructure/persistence/postgres/`, `src/infrastructure/modules/database.module.ts`, Ports & Adapters, Docker & Supabase

---

## 1. Contexto & Problema

Na fundação inicial do `alaska-local-backend`, utilizamos repositórios em memória (`InMemoryTenantRepository`, `InMemoryOrderRepository`, `InMemoryBookingRepository`) para acelerar o desenvolvimento dos casos de uso e testes unitários.

Com a entrada no **Estágio 2 (6 a 15 Clientes)**, tornou-se fundamental:
1. Conectar a uma base relacional persistente (**PostgreSQL 16** via Docker local ou **Supabase** em produção).
2. Manter a independência do núcleo de domínio (`src/core/`) sem decorators de ORM (`@Entity()`, `@Column()`), preservando o isolamento de Clean Architecture estabelecido na ADR 001.
3. Suportar **Row Level Security (RLS)** para isolamento rigoroso de tenants por sessão de banco.
4. Fornecer connection pooling de alta performance com reconexão automática e transações ACID.

## 2. Decisão Arquitetural

Implementamos a camada de persistência nativa em PostgreSQL utilizando **node-postgres (`pg`)** com o padrão **Mappers de Domínio**:

```
┌────────────────────────────────────────────────────────────┐
│                       CORE DOMAIN                          │
│          (Tenant, Order, Booking - Entidades Puras)        │
└─────────────────────────────▲──────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │    Mappers Bidirecionais    │
               │   (TenantMapper, etc.)      │
               └──────────────▲──────────────┘
                              │
┌─────────────────────────────┴──────────────────────────────┐
│                  INFRASTRUCTURE PERSISTENCE                │
│    (PostgresTenantRepository, PostgresOrderRepository)     │
│                             │                              │
│                    [ PostgresService ]                     │
│                (pg.Pool, RLS withTenantContext)            │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
                 [ PostgreSQL 16 / Supabase ]
```

### A. Pool de Conexões Gerenciado (`PostgresService`)
* Implementa o ciclo de vida do NestJS (`OnModuleInit`, `OnModuleDestroy`).
* Suporte nativo a transações atômicas (`withTransaction`).
* Suporte a RLS via `withTenantContext(tenantId)` executando `SELECT set_config('app.current_tenant_id', $1, true)`.

### B. Mappers Puros de Domínio (`src/infrastructure/persistence/postgres/mappers/`)
* Converte colunas relacionais e campos `JSONB` (`opening_hours`, `pix_config`, `items`, `services`, `address`) em Value Objects imutáveis (`Money`, `Address`, `PixKey`) e entidades de domínio.
* Isola 100% o schema SQL das regras de negócio.

### C. Injeção Dinâmica por Ambiente
O `TenantModule`, `OrderModule` e `BookingModule` utilizam `useFactory` com injeção condicional:
* Em ambiente de teste unitário (`NODE_ENV=test`), utiliza os repositórios em memória para velocidade instantânea (~5ms).
* Em desenvolvimento (`Docker`) e produção (`Supabase`), utiliza os repositórios PostgreSQL.

## 3. Consequências & Benefícios

- **Zero Vendor Lock-in:** O banco de dados pode ser migrado ou alterado sem alterar uma única linha de regra de negócio em `src/core/`.
- **Desempenho Extremo:** Conexões mantidas em pool persistente sem sobrecarga de ORMs pesados.
- **Segurança Nativa Multi-Tenant:** RLS no PostgreSQL garante que nenhum tenant acesse pedidos ou dados de outro estabelecimento.
