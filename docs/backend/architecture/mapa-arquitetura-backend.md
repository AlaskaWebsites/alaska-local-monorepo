# 🗺️ Mapa Completo de Arquitetura do Back-end (`apps/api`)

Referência detalhada de arquivos, classes, casos de uso e injeção de dependência da API NestJS do Alaska Local.

---

## 📁 1. Árvore de Diretórios

```
apps/api/
├── src/
│   ├── config/
│   │   └── env.config.ts                     # Variáveis de ambiente validadas
│   │
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── tenant.entity.ts          # Entidade Tenant
│   │   │   │   ├── product.entity.ts         # Entidade Product
│   │   │   │   ├── order.entity.ts           # Entidade Order
│   │   │   │   └── booking.entity.ts         # Entidade Booking
│   │   │   ├── value-objects/
│   │   │   │   ├── money.vo.ts               # Value Object Money (centavos)
│   │   │   │   ├── address.vo.ts             # Value Object Address
│   │   │   │   └── pix-key.vo.ts             # Value Object PixKey
│   │   │   └── errors/
│   │   │       └── domain.error.ts           # Exceções de Domínio
│   │   │
│   │   └── application/
│   │       ├── tokens.ts                     # Tokens de Injeção de Dependência
│   │       ├── ports/
│   │       │   ├── tenant.repository.port.ts
│   │       │   ├── product.repository.port.ts
│   │       │   ├── order.repository.port.ts
│   │       │   ├── booking.repository.port.ts
│   │       │   └── pix-gateway.port.ts
│   │       └── use-cases/
│   │           ├── get-tenant-by-slug.use-case.ts
│   │           ├── resolve-tenant-by-domain.use-case.ts
│   │           ├── create-order.use-case.ts
│   │           ├── calculate-pix-payload.use-case.ts
│   │           ├── toggle-product-availability.use-case.ts
│   │           ├── update-product.use-case.ts
│   │           └── update-tenant-hours.use-case.ts
│   │
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   ├── tenant.controller.ts
│   │   │   │   ├── product.controller.ts
│   │   │   │   ├── order.controller.ts
│   │   │   │   ├── booking.controller.ts
│   │   │   │   ├── pix.controller.ts
│   │   │   │   └── health.controller.ts
│   │   │   ├── pipes/
│   │   │   │   └── zod-validation.pipe.ts
│   │   │   └── filters/
│   │   │       └── domain-exception.filter.ts
│   │   ├── gateways/
│   │   │   └── local-pix.gateway.ts
│   │   ├── persistence/
│   │   │   ├── in-memory/
│   │   │   │   ├── in-memory-tenant.repository.ts
│   │   │   │   ├── in-memory-product.repository.ts
│   │   │   │   ├── in-memory-order.repository.ts
│   │   │   │   ├── in-memory-booking.repository.ts
│   │   │   │   └── seed-data.ts
│   │   │   └── postgres/
│   │   │       ├── postgres-tenant.repository.ts
│   │   │       ├── postgres-order.repository.ts
│   │   │       ├── postgres-booking.repository.ts
│   │   │       ├── postgres.service.ts
│   │   │       └── mappers/
│   │   └── modules/
│   │       ├── app.module.ts
│   │       ├── tenant.module.ts
│   │       ├── product.module.ts
│   │       ├── order.module.ts
│   │       ├── booking.module.ts
│   │       └── pix.module.ts
│   │
│   └── main.ts                               # Bootstrap com Swagger OpenAPI
│
└── tests/unit/                               # Suíte de Testes Unitários Vitest
```
