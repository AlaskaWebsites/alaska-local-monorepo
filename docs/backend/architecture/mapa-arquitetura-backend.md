# 🗺️ Mapa Completo de Arquitetura do Backend — Alaska Local

O **Alaska Local Backend** (`@alaska/api`) foi projetado sob os princípios de **Clean Architecture (Ports & Adapters)**, **Domain-Driven Design (DDD)** e **Validação Fail-Fast com Zod**. Este documento é o mapa canônico de componentes, portas, adaptadores, tokens de injeção, casos de uso e suíte de testes unitários.

---

## 🏗️ 1. Árvore Canônica de Componentes

```
apps/api/src/
├── config/                          # Configurações de ambiente
│   └── env.schema.ts                # Schema Zod estrito (PORT, DATABASE_URL, CORS...)
├── core/                            # NÚCLEO PURO (Zero decorators, zero frameworks)
│   ├── domain/                      # Camada de Domínio
│   │   ├── entities/                # Entidades Puras
│   │   │   ├── tenant.entity.ts     # Tenant (isOpen turnos diurno/noturno, toJSON)
│   │   │   ├── product.entity.ts    # Product (opcionais, cálculo de item total)
│   │   │   ├── order.entity.ts      # Order (cálculo de subtotal/total, taxas, VOs)
│   │   │   └── booking.entity.ts    # Booking (duração total, soma de serviços, sinal)
│   │   ├── value-objects/           # Value Objects Imutáveis
│   │   │   ├── money.vo.ts          # Money (_cents inteiros, cents/inCents/amount)
│   │   │   ├── pix-key.vo.ts        # PixKey (validação de chave CPF, CNPJ, Tel, UUID)
│   │   │   └── address.vo.ts        # Address (rua, número, bairro, cidade, formatFull)
│   │   └── errors/                  # Hierarquia de Exceções de Domínio
│   │       ├── domain.error.ts      # DomainError, ValidationError, InvalidMoneyAmountError
│   │       └── entity-not-found.error.ts # EntityNotFoundError
│   └── application/                 # Camada de Aplicação
│       ├── ports/                   # Interfaces de Saída (Ports)
│       │   ├── tenant.repository.port.ts   # ITenantRepository
│       │   ├── product.repository.port.ts  # IProductRepository
│       │   ├── order.repository.port.ts    # IOrderRepository
│       │   ├── booking.repository.port.ts  # IBookingRepository
│       │   ├── pix-gateway.port.ts         # IPixGateway
│       │   └── password-hasher.port.ts     # IPasswordHasher
│       ├── tokens.ts                # Símbolos de Injeção de Dependência (TOKENS)
│       └── use-cases/               # Casos de Uso Puros (execute)
│           ├── get-tenant-by-slug.use-case.ts
│           ├── resolve-tenant-by-domain.use-case.ts
│           ├── calculate-pix-payload.use-case.ts
│           ├── create-order.use-case.ts
│           ├── toggle-product-availability.use-case.ts
│           ├── update-product.use-case.ts
│           ├── toggle-option-availability.use-case.ts
│           ├── update-tenant-hours.use-case.ts
│           └── authenticate-merchant.use-case.ts
└── infrastructure/                  # ADAPTADORES DE INFRAESTRUTURA
    ├── gateways/                    # Gateways de Integração
    │   └── local-pix.gateway.ts     # BR Code EMV BACEN, CRC-16 CCITT, QR Code Data URL
    ├── security/                    # Segurança e Criptografia
    │   └── simple-hasher.ts         # Hash SHA-256 com salt de domínio
    ├── http/                        # Adaptadores de Entrada HTTP (NestJS)
    │   ├── controllers/             # Controladores REST com OpenAPI / Swagger v1.4.0
    │   │   ├── health.controller.ts # GET /health
    │   │   ├── tenant.controller.ts # GET /tenants, GET /tenants/:slug, GET /resolve, POST /login, POST/PATCH /hours
    │   │   ├── product.controller.ts# PATCH /availability, PUT/PATCH /:productId, PATCH /options/:id/availability
    │   │   ├── pix.controller.ts    # POST /brcode, POST/GET /qrcode
    │   │   ├── order.controller.ts  # POST /orders, GET /orders/:id, GET /tenant/:tenantId, PATCH /:id/status
    │   │   └── booking.controller.ts# POST /bookings, GET /bookings/:id, GET /tenant/:tenantId, PATCH /:id/status
    │   ├── guards/                  # Guardiões de Rota
    │   │   └── merchant-auth.guard.ts # Autenticação Bearer base64 do Lojista
    │   ├── pipes/                   # Pipes de Validação
    │   │   └── zod-validation.pipe.ts # Validação fail-fast via schemas Zod
    │   └── filters/                 # Filtros Globais de Exceção
    │       └── domain-exception.filter.ts # Conversão de DomainError para HTTP RFC 7807
    ├── persistence/                 # Camada de Dados
    │   ├── in-memory/               # Repositórios em Memória para Testes Rápidos (~1.8s)
    │   └── postgres/                # Repositórios PostgreSQL com Connection Pooling e RLS
    └── modules/                     # Módulos do NestJS 11
```

---

## 💉 2. Inversão de Dependência via Tokens (`TOKENS`)

Na camada Core, as interfaces não dependem de decorators do NestJS. A injeção é realizada através de `Symbol`:

| Token | Porta de Destino | Implementação Produção | Implementação Testes |
| :--- | :--- | :--- | :--- |
| `TOKENS.TENANT_REPOSITORY` | `ITenantRepository` | `PostgresTenantRepository` | `InMemoryTenantRepository` |
| `TOKENS.PRODUCT_REPOSITORY` | `IProductRepository` | `PostgresProductRepository` | `InMemoryProductRepository` |
| `TOKENS.ORDER_REPOSITORY` | `IOrderRepository` | `PostgresOrderRepository` | `InMemoryOrderRepository` |
| `TOKENS.BOOKING_REPOSITORY` | `IBookingRepository` | `PostgresBookingRepository` | `InMemoryBookingRepository` |
| `TOKENS.PIX_GATEWAY` | `IPixGateway` | `LocalPixGateway` | `LocalPixGateway` |
| `TOKENS.PASSWORD_HASHER` | `IPasswordHasher` | `SimplePasswordHasher` | `SimplePasswordHasher` |
| `TOKENS.DATABASE_SERVICE` | `PostgresService` | `PostgresService` (Pool `pg`) | Mocks In-Memory |

---

## 🧪 3. Suíte de Testes Unitários no Vitest

A suíte possui **71 testes em 22 arquivos** executados em ~1.8 segundos:

* **Domínio**: `money.vo.test.ts`, `pix-key.vo.test.ts`, `address.vo.test.ts`, `tenant.entity.test.ts`, `order.entity.test.ts`, `product.entity.test.ts`, `booking.entity.test.ts`.
* **Persistência**: `postgres-mappers.test.ts`.
* **Casos de Uso**: `authenticate-merchant.use-case.test.ts`, `calculate-pix-payload.use-case.test.ts`, `create-order.use-case.test.ts`, `get-tenant-by-slug.use-case.test.ts`, `resolve-tenant-by-domain.use-case.test.ts`, `toggle-option-availability.use-case.test.ts`, `toggle-product-availability.use-case.test.ts`, `update-product.use-case.test.ts`, `update-tenant-hours.use-case.test.ts`.
* **Gateways & Infra**: `local-pix.gateway.test.ts`, `zod-validation.pipe.test.ts`, `merchant-auth.guard.test.ts`, `simple-hasher.test.ts`.
* **Controladores**: `health.controller.test.ts`.
