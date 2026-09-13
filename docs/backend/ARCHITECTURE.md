# 🏛️ Arquitetura do Sistema — Alaska Local Backend

O **Alaska Local Backend** (`@alaska/api`) foi projetado seguindo os princípios rigorosos de **Clean Architecture (Arquitetura Hexagonal / Ports & Adapters)** e **Domain-Driven Design (DDD)** tático, assegurando desacoplamento total entre as regras de negócio de domínio e os detalhes de infraestrutura (NestJS, PostgreSQL, Redis, Swagger, Supabase).

---

## 🗺️ 1. Diagrama em Camadas e Fluxo de Dados

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                            │
│  • HTTP: Controllers (Health, Tenant, Pix, Order, Booking, Product)    │
│  • Pipes & Guards: ZodValidationPipe, MerchantAuthGuard               │
│  • Filters: DomainExceptionFilter (RFC 7807 Problem Details)           │
│  • Persistence: PostgresService (pg.Pool), Repositories, Mappers       │
│  • Gateways: LocalPixGateway (BR Code EMV BACEN, CRC-16, QR Code)      │
│  • Security: SimplePasswordHasher (SHA-256 com salt)                  │
├────────────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                               │
│  • Ports: ITenantRepository, IProductRepository, IOrderRepository,     │
│           IBookingRepository, IPixGateway, IPasswordHasher             │
│  • Use Cases: GetTenantBySlug, ResolveTenantByDomain, CreateOrder,     │
│               CalculatePixPayload, ToggleProductAvailability,          │
│               UpdateProduct, ToggleOptionAvailability,                 │
│               UpdateTenantHours, AuthenticateMerchant                  │
│  • Tokens: Injeção por Symbols (TOKENS.TENANT_REPOSITORY, etc.)        │
├────────────────────────────────────────────────────────────────────────┤
│                          DOMAIN LAYER                                  │
│  • Entities: Tenant, Product, Order, Booking (Entidades puras)         │
│  • Value Objects: Money (centavos inteiros imutáveis), Address, PixKey │
│  • Errors: DomainError, EntityNotFoundError, ValidationError,          │
│            InvalidMoneyAmountError                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 2. Ciclo de Execução Ponta a Ponta

1. **Requisição HTTP na Borda:** O NestJS recebe a chamada no Controller e valida o payload via `ZodValidationPipe` a partir de esquemas centralizados em `@alaska/contracts`.
2. **Caso de Uso Puro:** O Controller invoca o Use Case através da injeção de dependência via Symbols (`TOKENS`), sem acoplamento a decorators do NestJS.
3. **Regra de Negócio e Invariantes:** O Use Case consulta e manipula entidades puras de domínio (`Tenant`, `Product`, `Order`, `Booking`) que impõem suas regras de negócio de forma imutável (ex: `Money.fromCents()`, turnos `isOpen()`).
4. **Repositório e Persistência:** Em produção, o repositório PostgreSQL (`PostgresTenantRepository`, etc.) executa queries via `PostgresService` e converte o resultado via `Mapper`. Em ambiente de teste unitário, o `InMemoryRepository` responde em ~1ms.
5. **Resposta RFC 7807:** O Controller retorna o JSON de sucesso (HTTP 200/201) ou o `DomainExceptionFilter` formata o erro em RFC 7807 (HTTP 400/404/500).

---

## 🛡️ 3. Regras Inegociáveis de Engenharia

### A. Tratamento Monetário (`Money` Value Object)
* **Proibido Float:** É estritamente vedado o uso de números com ponto flutuante para dinheiro no domínio.
* **Centavos Inteiros:** Preços são armazenados no banco como inteiros (`price_cents INT`) e manipulados no código pela classe `Money` (`_cents`), com suporte aos getters `cents`, `inCents` e `amount`.

### B. Injeção de Dependências com Tokens (`TOKENS`)
* Todas as portas são abstraídas em interfaces puras e injetadas por `Symbol` no NestJS:
  ```typescript
  constructor(
    @Inject(TOKENS.TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    @Inject(TOKENS.PIX_GATEWAY) private readonly pixGateway: IPixGateway,
  ) {}
  ```

### C. Test Harness e Pirâmide de Testes
* O backend possui uma suíte de **71 testes unitários em 22 arquivos** rodando no Vitest com SWC em ~1.8 segundos, validando entidades, mappers, VOs, gateways, guards e casos de uso de ponta a ponta.
