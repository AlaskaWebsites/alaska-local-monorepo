# Alaska Local — Backend API (@alaska/api)

> **API REST Multi-Tenant para Comércios Locais**  
> NestJS 11 • Clean Architecture • Ports & Adapters • Zod • PostgreSQL • Docker

---

## 🏛️ 1. Pilares da Arquitetura

1. **Clean Architecture Estrita (DDD / Onion)**:
   * **Domain**: Entidades puras (`Tenant`, `Category`, `Product`, `Order`, `Booking`), Value Objects (`Money`, `PixKey`, `Address`), regras de negócio e interfaces de repositório (`ITenantRepository`, `IProductRepository`). Zero dependência de framework.
   * **Application**: Casos de uso atômicos (`GetTenantBySlugUseCase`, `CreateOrderUseCase`, `CreateBookingUseCase`, `ToggleProductAvailabilityUseCase`).
   * **Infrastructure**: Implementações concretas de portas (`PostgresTenantRepository`, `PostgresProductRepository`, `LocalPixGateway`).
   * **Presentation**: Controladores HTTP NestJS (`TenantController`, `OrderController`, `BookingController`, `ProductController`).
2. **Inversão de Dependência via Symbols (IoC)**:
   * Desacoplamento através de tokens de injeção (`TENANT_REPOSITORY`, `PRODUCT_REPOSITORY`, `PIX_GATEWAY`).
3. **Money Pattern Imutável**:
   * Todos os valores monetários são processados e persistidos em centavos inteiros (`cents: number`) via Value Object `Money`, eliminando imprecisão de ponto flutuante IEEE 754.
4. **Validação Fail-Fast com Zod**:
   * Interceptação de dados na borda externa via `ZodValidationPipe` e imposição de invariantes no construtor das entidades e Value Objects (`Money`, `PixKey`, `Address`).
5. **Erros Padronizados em RFC 7807 (Problem Details)**:
   * Exceções de domínio (`ValidationError`, `EntityNotFoundError`) convertidas automaticamente pelo `DomainExceptionFilter` para JSON estruturado com status HTTP adequado (400, 404, 500).
6. **Auto-População Resiliente no PostgreSQL (ADR 008)**:
   * Proteção contra vitrines esvaziadas através de auto-seeding transacional de categorias e produtos caso o tenant exista com catálogo vazio.
7. **Resiliência de Rotas de Catálogo e Fuso Horário de Brasília (ADR 009)**:
   * Tratamento polimórfico de disponibilidade de produtos no PostgreSQL e sincronização horária canônica em `America/Sao_Paulo`.

---

## 🌐 2. Endpoints da API

Documentação interativa OpenAPI / Swagger disponível em: `http://localhost:3333/api/docs`

| Módulo | Método | Rota | Descrição |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/v1/health` | Status da API e conectividade com banco de dados. |
| **Tenants** | `GET` | `/api/v1/tenants/:slug` | Dados públicos do estabelecimento, categorias e catálogo. |
| **Tenants** | `POST` | `/api/v1/tenants` | Criação de novo tenant com validação de slug único. |
| **Tenants** | `PATCH` | `/api/v1/tenants/:slug/emergency-close` | Pausa emergencial com mensagem personalizada. |
| **Tenants** | `POST` | `/api/v1/tenants/:slug/hours` | Atualização da grade semanal de funcionamento. |
| **Tenants** | `PATCH` | `/api/v1/tenants/:slug/pin` | Atualização segura da senha PIN do painel. |
| **Produtos** | `PATCH` | `/api/v1/tenants/:slug/products/:id/availability` | Pausa ou ativação de produto em tempo real. |
| **Produtos** | `PUT` | `/api/v1/tenants/:slug/products/:id` | Edição de preço e metadados do item. |
| **Produtos** | `PATCH` | `/api/v1/tenants/:slug/products/:id/options/:optionId/availability` | Pausa de adicional/opcional específico. |
| **Pedidos** | `POST` | `/api/v1/orders` | Recepção e persistência do pedido com cálculo de totais. |
| **Pedidos** | `GET` | `/api/v1/orders/:id` | Consulta de pedido por ID com status de pagamento. |
| **Pedidos** | `GET` | `/api/v1/orders/tenant/:tenantId` | Listagem de pedidos de um estabelecimento. |
| **Agendamentos** | `POST` | `/api/v1/bookings` | Registro de agendamento de serviços com cálculo de duração somada. |
| **Agendamentos** | `GET` | `/api/v1/bookings/:id` | Consulta de agendamento por ID. |
| **Agendamentos** | `GET` | `/api/v1/bookings/tenant/:tenantId` | Listagem de agendamentos por loja e data de atendimento. |
| **Agendamentos** | `PATCH` | `/api/v1/bookings/:id/status` | Atualização de status de agendamento (`scheduled`, `confirmed`, `completed`...). |

---

## 🧪 3. Testes Automatizados (Vitest)

Suíte completa de testes unitários e de integração validando casos de uso, entidades e adaptadores:

```bash
pnpm test:api
```

---

## 📜 4. Decisões Arquiteturais (ADRs Backend)

- **[ADR 001: Clean Architecture e Ports & Adapters](./adrs/001-clean-architecture-e-ports-and-adapters.md)** — Isolamento total do core de domínio de frameworks e bibliotecas externas.
- **[ADR 002: Validação Fail-Fast com Zod e Pipes Customizados](./adrs/002-validacao-fail-fast-com-zod-e-pipes-customizados.md)** — Blindagem da borda HTTP com `ZodValidationPipe`.
- **[ADR 003: Clean Architecture, Ports & Adapters e Money VO](./adrs/003-clean-architecture-ports-adapters-e-money-vo.md)** — Tratamento monetário imutável em centavos inteiros.
- **[ADR 003: Multi-Tenancy e Supabase / PostgreSQL RLS](./adrs/003-multi-tenancy-e-supabase-postgresql-rls.md)** — Políticas RLS nativas garantindo isolamento estrito por tenant.
- **[ADR 004: Filas Assíncronas com BullMQ e Redis](./adrs/004-filas-assincronas-com-bullmq-e-redis.md)** — Processamento em background desacoplado da thread HTTP.
- **[ADR 005: Pipeline de Agentes de IA e MCP Engine](./adrs/005-pipeline-de-agentes-de-ia-e-mcp-engine.md)** — Integração via Model Context Protocol para orquestração autônoma.
- **[ADR 006: Camada de Persistência PostgreSQL e Pooling](./adrs/006-camada-de-persistencia-postgresql-e-pooling.md)** — Gestão de conexões resilientes e mapeadores bidirecionais.
- **[ADR 007: Autenticação Segura no Painel do Lojista via PIN Hash](./adrs/007-autenticacao-segura-painel-do-lojista-pin-hash.md)** — Hashing SHA-256 com salt de domínio sem dependências externas.
- **[ADR 008: Auto-População Resiliente de Catálogo no PostgreSQL e Tolerância a Cold-Start](./adrs/008-auto-populacao-resiliente-catalogo-postgresql-e-cold-start.md)** — Auto-seed transacional de categorias vazias e persistência assíncrona tolerante a cold-start.
- **[ADR 009: Resiliência de Rotas de Catálogo, Sincronização de Disponibilidade e Fuso Horário de Brasília](./adrs/009-resiliencia-de-rotas-de-catalogo-disponibilidade-e-fuso-horario-brasilia.md)** — Tratamento polimórfico de disponibilidade, eliminação de 404 por booleanos e normalização temporal em America/Sao_Paulo.

---

## 📚 5. Links da Documentação Viva (`docs/backend/`)

- [Mapa Completo de Arquitetura](./architecture/mapa-arquitetura-backend.md)
- [Padrões de Validação com Zod e Fail-Fast](./architecture/zod-validation-patterns.md)
- [Guia de Persistência PostgreSQL & Pooling](./architecture/postgresql-persistence-guide.md)
- [Tratamento de Erros & RFC 7807](./architecture/tratamento-erros-e-rfc7807.md)
