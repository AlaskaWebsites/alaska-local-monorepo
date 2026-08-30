# ⚙️ @alaska/api — Backend NestJS 11 & Clean Architecture

> API REST escalável do ecossistema **Alaska Local Monorepo**, desenvolvida em **NestJS 11** com **Clean Architecture (Ports & Adapters)**, validação **Zod 3.24**, banco de dados **PostgreSQL 16** com **Row Level Security (RLS)**, suporte a pagamentos **Pix D+0** e documentação interativa **OpenAPI/Swagger**.

[![NestJS](https://img.shields.io/badge/NestJS-11.0.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-3.24.2-3E67B1?logo=zod)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0.5-6E9F18?logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger)](http://localhost:3333/docs)

---

## 🏛️ Camadas de Clean Architecture

O backend mantém o isolamento estrito de regras de negócio em relação a frameworks:

```
apps/api/src/
├── core/                             # NÚCLEO PURO (ZERO DEPENDÊNCIA DE FRAMEWORKS)
│   ├── domain/                       # Entidades (Tenant, Product, Order, Booking) e Money VO
│   └── application/                  # Use Cases, Ports (Interfaces) e Tokens de Injeção
└── infrastructure/                   # ADAPTADORES & FRAMEWORKS
    ├── http/                         # Controllers (/api/v1), ZodValidationPipe e Filters
    ├── gateways/                     # LocalPixGateway (EMV BACEN e QR Code Base64)
    ├── modules/                      # Módulos NestJS (Database, Tenant, Order, Booking, Pix)
    └── persistence/                  # PostgresService (pg.Pool), PostgresRepositories e Mappers
```

---

## 🚀 Como Executar

### 1. Subir o PostgreSQL via Docker (na raiz do monorepo)
```bash
pnpm db:up
```

### 2. Sincronizar os 9 Estabelecimentos no Banco (Seed)
```bash
pnpm db:seed
```

### 3. Iniciar a API em Modo Desenvolvimento
```bash
# A partir da raiz do monorepo (porta 3333):
pnpm dev:api

# Ou de dentro da pasta apps/api:
pnpm start:dev
```

### 4. Rodar os Testes Unitários no Vitest
```bash
# A partir da raiz:
pnpm test:api

# Em modo watch:
pnpm --filter @alaska/api test:watch
```

---

## 📡 Endpoints Principais (Prefixo Global `/api/v1`)

* **Swagger UI Interativo**: `http://localhost:3333/docs`
* **Health Check**: `http://localhost:3333/api/v1/health`
* **Consultar Estabelecimento**: `http://localhost:3333/api/v1/tenants/:slug`
* **Resolução por Domínio**: `http://localhost:3333/api/v1/tenants/resolve?host=cliente.com.br`
* **Criar Pedido**: `POST http://localhost:3333/api/v1/orders`
* **Criar Agendamento**: `POST http://localhost:3333/api/v1/bookings`
* **Gerar Pix BR Code**: `POST http://localhost:3333/api/v1/pix/brcode`

---

## 📚 Documentação Completa

Para guias aprofundados de Clean Architecture, RLS no PostgreSQL e ADRs, consulte a pasta centralizada **[`docs/`](../../docs/)** na raiz do monorepo.
