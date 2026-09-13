# 🏔️ Alaska Local — Backend API & Engine de Pagamentos (NestJS 11)

> Backend escalável, tipado e resiliente em **NestJS 11** desenvolvido sob os princípios de **Clean Architecture (Ports & Adapters)**, validação fail-fast universal com **Zod**, banco de dados **PostgreSQL 16** com **Row Level Security (RLS)**, geração nativa de pagamentos **Pix D+0 (BR Code EMV & QR Code Data URL)**, contratos OpenAPI v1.4.0 e suíte determinística com **71 testes unitários no Vitest**.

[![NestJS](https://img.shields.io/badge/NestJS-11.0.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-3.24.2-3E67B1?logo=zod)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.7-6E9F18?logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%201.4.0-85EA2D?logo=swagger)](http://localhost:3333/docs)

---

## 🏛️ 1. Pilares de Engenharia & Arquitetura

1. **Clean Architecture Estrita (Zero Decorators no Core)**:
   * As regras de negócio fundamentais residem em `src/core/domain/` e `src/core/application/` sem dependências do NestJS ou de drivers de banco.
   * Inversão de dependência através de símbolos únicos (`TOKENS`) injetados via providers.
2. **Single Source of Truth (`@alaska/contracts`)**:
   * Contratos de DTOs e validações compartilhados de forma canônica entre front-end (`apps/web`) e back-end (`apps/api`), prevenindo desvios de interface.
3. **Tratamento Monetário em Centavos (`Money` VO)**:
   * Todos os preços, taxas de entrega e subtotais são calculados estritamente em **centavos inteiros** (`_cents`), eliminando discrepâncias de ponto flutuante em troco e total.
4. **Validação Fail-Fast em Camadas**:
   * Interceptação de dados na borda externa via `ZodValidationPipe` e imposição de invariantes no construtor das entidades e Value Objects (`Money`, `PixKey`, `Address`).
5. **Erros Padronizados em RFC 7807 (Problem Details)**:
   * Exceções de domínio (`ValidationError`, `EntityNotFoundError`) convertidas automaticamente pelo `DomainExceptionFilter` para JSON estruturado com status HTTP adequado (400, 404, 500).

---

## ⚡ 2. Matriz Completa de Endpoints REST (`/api/v1/`)

Documentação interativa OpenAPI / Swagger disponível em: `http://localhost:3333/docs`

| Módulo | Método HTTP | Rota Canônica | Descrição & Resiliência |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/v1/health` | Healthcheck operacional, service ID, timestamp ISO 8601 e uptime. |
| **Tenants** | `GET` | `/api/v1/tenants` | Listagem de todos os estabelecimentos ativos do ecossistema. |
| **Tenants** | `GET` | `/api/v1/tenants/:slug` | Metadados, tema, horários, prova social e catálogo de categorias/produtos. |
| **Tenants** | `GET` | `/api/v1/tenants/resolve` | Resolução do tenant a partir de domínio próprio ou subdomínio (header Host). |
| **Tenants** | `GET` | `/api/v1/tenants/resolve/domain` | Alias canônico para resolução de domínio com header Cache-Control `no-store`. |
| **Tenants** | `POST` | `/api/v1/tenants/:slug/admin/login` | Autenticação por PIN de 4 a 8 dígitos comparando hash SHA-256 no banco. |
| **Tenants** | `POST` | `/api/v1/tenants/:slug/hours` | Atualização da grade semanal e horários de atendimento da loja. |
| **Tenants** | `PATCH` | `/api/v1/tenants/:slug/hours` | Alias HTTP PATCH compatível com mutações do `@alaska/contracts`. |
| **Catálogo** | `PATCH` | `/api/v1/tenants/:slug/products/:productId/availability` | Pausa/ativação rápida de item no catálogo (ADR 013). |
| **Catálogo** | `PUT` / `PATCH` | `/api/v1/tenants/:slug/products/:productId` | Atualização de preço (`price`/`priceCents`) e descrição de produto. |
| **Catálogo** | `PATCH` | `/api/v1/tenants/:slug/products/:productId/options/:optionId/availability` | Pausa/ativação rápida de opcional/adicional específico no estoque. |
| **Catálogo** | `PATCH` | `/api/v1/tenants/:slug/products/options/:optionId/availability` | Pausa/ativação rápida de opcional diretamente pelo slug do tenant. |
| **Pix D+0** | `POST` | `/api/v1/pix/brcode` | Geração do payload EMV Copia e Cola com CRC-16 e QR Code Base64. |
| **Pix D+0** | `POST` | `/api/v1/pix/qrcode` | Alias compatível para emissão de cobrança Pix direta. |
| **Pix D+0** | `GET` | `/api/v1/pix/qrcode?tenantSlug=...&amount=...` | Consulta de payload Pix via parâmetros de URL. |
| **Pedidos** | `POST` | `/api/v1/orders` | Criação de pedido com validação Zod, cálculo de taxa por modalidade e Pix. |
| **Pedidos** | `GET` | `/api/v1/orders/:id` | Consulta de pedido por identificador único. |
| **Pedidos** | `GET` | `/api/v1/orders/tenant/:tenantId` | Listagem operacional de pedidos filtrados por estabelecimento. |
| **Pedidos** | `PATCH` | `/api/v1/orders/:id/status` | Atualização da máquina de estados do pedido (`confirmed`, `dispatched`...). |
| **Agendamentos** | `POST` | `/api/v1/bookings` | Registro de agendamento de serviços com cálculo de duração somada. |
| **Agendamentos** | `GET` | `/api/v1/bookings/:id` | Consulta de agendamento por ID. |
| **Agendamentos** | `GET` | `/api/v1/bookings/tenant/:tenantId` | Listagem de agendamentos por loja e data de atendimento. |
| **Agendamentos** | `PATCH` | `/api/v1/bookings/:id/status` | Atualização de status de agendamento (`confirmed`, `completed`...). |

---

## 🧪 3. Estratégia e Pirâmide de Testes (Vitest)

O projeto conta com **71 testes unitários em 22 arquivos**, executados em ~1.8 segundos com suporte nativo a SWC e repositórios em memória:

```text
✓ tests/unit/domain/money.vo.test.ts (5 tests)
✓ tests/unit/domain/pix-key.vo.test.ts (3 tests)
✓ tests/unit/domain/address.vo.test.ts (3 tests)
✓ tests/unit/domain/tenant.entity.test.ts (4 tests)
✓ tests/unit/domain/order.entity.test.ts (2 tests)
✓ tests/unit/domain/product.entity.test.ts (4 tests)
✓ tests/unit/domain/booking.entity.test.ts (5 tests)
✓ tests/unit/persistence/postgres-mappers.test.ts (3 tests)
✓ tests/unit/use-cases/authenticate-merchant.use-case.test.ts (5 tests)
✓ tests/unit/use-cases/calculate-pix-payload.use-case.test.ts (4 tests)
✓ tests/unit/use-cases/create-order.use-case.test.ts (5 tests)
✓ tests/unit/use-cases/get-tenant-by-slug.use-case.test.ts (2 tests)
✓ tests/unit/use-cases/resolve-tenant-by-domain.use-case.test.ts (2 tests)
✓ tests/unit/use-cases/toggle-option-availability.use-case.test.ts (4 tests)
✓ tests/unit/use-cases/toggle-product-availability.use-case.test.ts (3 tests)
✓ tests/unit/use-cases/update-product.use-case.test.ts (1 test)
✓ tests/unit/use-cases/update-tenant-hours.use-case.test.ts (1 test)
✓ tests/unit/gateways/local-pix.gateway.test.ts (4 tests)
✓ tests/unit/http/zod-validation.pipe.test.ts (3 tests)
✓ tests/unit/http/merchant-auth.guard.test.ts (3 tests)
✓ tests/unit/security/simple-hasher.test.ts (3 tests)
✓ tests/unit/controllers/health.controller.test.ts (2 tests)

Test Files  22 passed (22)
Tests       71 passed (71)
```

### Comandos de Teste:
```bash
# Executar suíte de testes do backend via Turborepo
pnpm test:api

# Executar todos os testes do monorepo (Contracts, Web e API)
pnpm test
```

---

## 📜 Licença
Distribuído sob licença MIT. Desenvolvido pela equipe **Alaska Websites**.
