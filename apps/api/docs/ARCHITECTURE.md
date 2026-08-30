# 🏛️ Arquitetura do Sistema — Alaska Local Backend

O **Alaska Local Backend** foi projetado seguindo os princípios de **Clean Architecture (Hexagonal / Ports & Adapters)**, garantindo desacoplamento total entre o domínio e os detalhes de infraestrutura (NestJS, PostgreSQL, Redis, Swagger, Supabase).

---

## 🗺️ Diagrama em Camadas

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                            │
│  • HTTP: Controllers (Tenant, Pix, Order, Booking), ZodValidationPipe │
│  • Persistence: PostgresService (pg.Pool), Repositories, Mappers       │
│  • Background: BullMQ Queues, Redis                                    │
│  • AI & Tools: MCP Engine, OCR Multimodal                              │
├────────────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                               │
│  • Ports: ITenantRepository, IOrderRepository, IBookingRepository      │
│  • Use Cases: GetTenantBySlug, ResolveTenantByDomain, CreateOrder...   │
│  • Tokens: Injeção por Symbols (TOKENS.TENANT_REPOSITORY, etc.)        │
├────────────────────────────────────────────────────────────────────────┤
│                          DOMAIN LAYER                                  │
│  • Entities: Tenant, Product, Order, Booking (Entidades puras)         │
│  • Value Objects: Money (cálculo em centavos), Address, PixKey         │
│  • Errors: DomainError, EntityNotFoundError, ValidationError           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Fluxo de Execução com Persistência Real

1. **Requisição HTTP:** O NestJS recebe a chamada no Controller e valida o payload via `ZodValidationPipe`.
2. **Caso de Uso:** O Controller invoca o Use Case através da injeção de dependência via Symbols (`TOKENS`).
3. **Regra de Negócio:** O Use Case consulta e manipula entidades puras de domínio (`Tenant`, `Order`, `Booking`).
4. **Repositório PostgreSQL:** O `PostgresTenantRepository` / `PostgresOrderRepository` executa queries via `PostgresService` e converte o resultado via `Mapper`.
5. **Resposta:** O Controller retorna o JSON padronizado com HTTP 200/201.
