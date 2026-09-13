# 🗺️ Mapa Completo de Arquitetura do Back-end (`apps/api`)

Referência detalhada de arquivos, classes, casos de uso e injeção de dependência da API NestJS do Alaska Local.

---

## 📁 1. Árvore de Diretórios

```
apps/api/
├── src/
│   ├── config/
│   │   └── env.schema.ts                             # Schema Zod estrito e validação de ambiente
│   │
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── tenant.entity.ts                  # Entidade Tenant
│   │   │   │   ├── product.entity.ts                 # Entidade Product
│   │   │   │   ├── order.entity.ts                   # Entidade Order
│   │   │   │   └── booking.entity.ts                 # Entidade Booking
│   │   │   ├── value-objects/
│   │   │   │   ├── money.vo.ts                       # Value Object Money (centavos inteiros)
│   │   │   │   ├── address.vo.ts                     # Value Object Address
│   │   │   │   └── pix-key.vo.ts                     # Value Object PixKey
│   │   │   └── errors/
│   │   │       ├── domain.error.ts                   # Exceções base de Domínio
│   │   │       └── entity-not-found.error.ts         # Entidade não encontrada
│   │   │
│   │   └── application/
│   │       ├── tokens.ts                             # Tokens de Injeção de Dependência (Symbols)
│   │       ├── ports/
│   │       │   ├── tenant.repository.port.ts         # Porta ITenantRepository
│   │       │   ├── product.repository.port.ts        # Porta IProductRepository
│   │       │   ├── order.repository.port.ts          # Porta IOrderRepository
│   │       │   ├── booking.repository.port.ts        # Porta IBookingRepository
│   │       │   ├── pix-gateway.port.ts               # Porta IPixGateway
│   │       │   └── password-hasher.port.ts           # Porta IPasswordHasher
│   │       └── use-cases/
│   │           ├── get-tenant-by-slug.use-case.ts    # Consulta tenant por slug
│   │           ├── resolve-tenant-by-domain.use-case.ts # Resolução por domínio próprio
│   │           ├── authenticate-merchant.use-case.ts # Autenticação por PIN (ADR 007)
│   │           ├── update-tenant-hours.use-case.ts   # Atualização de horários
│   │           ├── toggle-product-availability.use-case.ts # Pausa rápida de produto
│   │           ├── toggle-option-availability.use-case.ts  # Pausa rápida de opcional/adicional
│   │           ├── update-product.use-case.ts        # Atualização de preço e dados
│   │           ├── create-order.use-case.ts          # Criação de pedido de delivery
│   │           └── calculate-pix-payload.use-case.ts # Geração de Pix EMV & QR Code
│   │
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   ├── tenant.controller.ts              # Endpoints de tenant, login admin e horários
│   │   │   │   ├── product.controller.ts             # Endpoints de produtos, opcionais e disponibilidade
│   │   │   │   ├── order.controller.ts               # Endpoints de pedidos (criação, consulta e PATCH status)
│   │   │   │   ├── booking.controller.ts             # Endpoints de agendamentos (criação, consulta e PATCH status)
│   │   │   │   ├── pix.controller.ts                 # Endpoints Pix (BR Code EMV, QR Code e validação)
│   │   │   │   └── health.controller.ts              # Healthcheck (liveness, readiness e uptime)
│   │   │   ├── guards/
│   │   │   │   └── merchant-auth.guard.ts            # Guard de validação de token do lojista
│   │   │   ├── pipes/
│   │   │   │   └── zod-validation.pipe.ts            # Pipe Fail-Fast Zod
│   │   │   └── filters/
│   │   │       └── domain-exception.filter.ts        # Tradução de DomainError para HTTP RFC 7807
│   │   ├── gateways/
│   │   │   └── local-pix.gateway.ts                  # Gateway EMV BACEN e QR Code Base64
│   │   ├── security/
│   │   │   └── simple-hasher.ts                      # Hasher SHA-256 com salt estático
│   │   ├── persistence/
│   │   │   ├── in-memory/                            # Repositórios em memória para testes no Vitest
│   │   │   │   ├── in-memory-tenant.repository.ts
│   │   │   │   ├── in-memory-product.repository.ts
│   │   │   │   ├── in-memory-order.repository.ts
│   │   │   │   ├── in-memory-booking.repository.ts
│   │   │   │   └── seed-data.ts
│   │   │   └── postgres/                             # Repositórios PostgreSQL (Pool pg + RLS)
│   │   │       ├── postgres-tenant.repository.ts
│   │   │       ├── postgres-product.repository.ts
│   │   │       ├── postgres-order.repository.ts
│   │   │       ├── postgres-booking.repository.ts
│   │   │       ├── postgres.service.ts               # Pool com auto-migration e auto-seed
│   │   │       ├── seed-catalog.ts                   # Catálogo completo dos 10 estabelecimentos
│   │   │       ├── migrations/
│   │   │       │   └── 002_add_pin_hash_to_tenants.sql
│   │   │       └── mappers/
│   │   │           └── tenant.mapper.ts
│   │   └── modules/
│   │       ├── app.module.ts                         # Módulo raiz do NestJS
│   │       ├── database.module.ts                    # Provedor do PostgresService
│   │       ├── tenant.module.ts
│   │       ├── product.module.ts
│   │       ├── order.module.ts
│   │       ├── booking.module.ts
│   │       └── pix.module.ts
│   │
│   └── main.ts                                       # Bootstrap com Swagger OpenAPI v1.4.0
│
└── tests/unit/                                       # Suíte de Testes Unitários no Vitest
```
