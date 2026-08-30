# AGENTS.md — Diretrizes de Engenharia, Clean Architecture & Governança de Backend

Este documento é o guia definitivo de arquitetura, padrões técnicos e regras invioláveis para agentes autônomos e engenheiros de software que atuam no backend do ecossistema **Alaska Local** (`AlaskaWebsites/alaska-local-backend`).

---

## 🧭 1. North Star e Princípios Arquiteturais

* **Missão**: Fornecer uma API REST escalável, resiliente e tipada para suportar vitrines digitais, orquestração de pedidos, agendamentos com cálculo de duração e geração de pagamentos Pix D+0 no ecossistema Alaska Local.
* **Paradigma**: **Clean Architecture** (Ports & Adapters / Arquitetura Hexagonal), **Domain-Driven Design (DDD)** tático e **Validação com Zod**.
* **Isolamento do Domínio**: A camada `src/core/domain/` e `src/core/application/` é 100% agnóstica de frameworks. Não use decoradores `@Injectable()`, `@Controller()`, `@Entity()` ou referências a bibliotecas de banco de dados dentro do Core.

---

## 🏗️ 2. Estrutura Canônica de Diretórios

```
alaska-local-backend/
├── docker/                         # Infraestrutura Docker & PostgreSQL
│   └── init.sql                    # DDL de tabelas, índices e RLS
├── scripts/                        # Scripts operacionais
│   └── seed.ts                     # Sincronização e seeds no banco (npm run db:seed)
├── src/
│   ├── config/                     # Configurações de ambiente validadas com Zod
│   │   └── env.schema.ts           # Schema Zod estrito para variáveis de ambiente
│   ├── core/                       # Núcleo Puro da Aplicação
│   │   ├── application/            # Casos de Uso, Portas (Interfaces) e Tokens
│   │   │   ├── ports/              # ITenantRepository, IOrderRepository, IBookingRepository, IPixGateway
│   │   │   ├── tokens.ts           # Símbolos de injeção (TOKENS.TENANT_REPOSITORY, etc.)
│   │   │   └── use-cases/          # Classes puras com método execute()
│   │   └── domain/                 # Entidades, Value Objects e Erros
│   │       ├── entities/           # Tenant, Product, Order, Booking
│   │       ├── errors/             # DomainError, EntityNotFoundError, ValidationError, InvalidMoneyAmountError
│   │       └── value-objects/      # Money (centavos inteiros imutáveis), Address
│   └── infrastructure/             # Adaptadores de Entrada/Saída e Frameworks
│       ├── gateways/               # LocalPixGateway (EMV BACEN, CRC-16, QR Code Base64)
│       ├── http/                   # Controladores REST, Pipes Zod e Filtros de Exceção
│       │   ├── controllers/        # TenantController, PixController, OrderController, BookingController
│       │   ├── filters/            # DomainExceptionFilter
│       │   └── pipes/              # ZodValidationPipe
│       ├── modules/                # Módulos NestJS (DatabaseModule, TenantModule, etc.)
│       └── persistence/            # Repositórios (PostgresService, Mappers e In-Memory)
│           ├── in-memory/          # Repositórios em memória para testes e isolamento
│           └── postgres/           # Repositórios com Pool pg e mapeamento de entidades
└── tests/                          # Suíte de Testes no Vitest
    ├── unit/                       # Testes de Use Cases e Domínio
    └── e2e/                        # Testes de integração de endpoints
```

---

## 🛡️ 3. O Ciclo de Desenvolvimento para Agentes de IA

Todo agente autônomo ou desenvolvedor deve seguir o fluxo em 5 etapas:

1. **Definição de Domínio / VO:** Crie ou atualize entidades e Value Objects em `src/core/domain/` com validações defensivas.
2. **Definição da Porta (Port):** Declare a interface em `src/core/application/ports/` e registre o token em `tokens.ts`.
3. **Caso de Uso (Use Case):** Implemente o Use Case em `src/core/application/use-cases/` recebendo as portas no construtor.
4. **Testes Unitários (Vitest Test Harness):** Crie o teste em `tests/unit/use-cases/` utilizando `InMemoryRepository`.
5. **Adaptador de Infraestrutura:** Conecte o controlador REST com `ZodValidationPipe` e o repositório PostgreSQL com seu respectivo `Mapper`.

---

## 📋 4. Regras Invioláveis de Engenharia

### 1. Tratamento Monetário (`Money` Value Object)
* **NUNCA** armazene ou calcule valores monetários utilizando ponto flutuante (`float`/`number` decimal) no domínio.
* Sempre utilize a classe `Money` (`src/core/domain/value-objects/money.vo.ts`) e armazene preços no banco em **centavos inteiros** (`price_cents INT`).

### 2. Injeção de Dependências com Tokens
* No NestJS, injete repositórios utilizando os tokens definidos em `TOKENS`:
  ```typescript
  constructor(
    @Inject(TOKENS.TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository
  ) {}
  ```

### 3. Validação de Entrada com Zod
* Todos os DTOs de entrada nos controladores devem ser declarados com Zod e validados via `ZodValidationPipe`:
  ```typescript
  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderDtoSchema))
  async create(@Body() dto: CreateOrderDto) { ... }
  ```

### 4. Tratamento de Erros de Domínio
* Lance sempre subclasses de `DomainError` (`EntityNotFoundError`, `ValidationError`, etc.).
* O `DomainExceptionFilter` intercepta essas exceções e formata as respostas HTTP padronizadas com os devidos status codes (400, 404, 500).

### 5. Pagamentos Pix e QR Code
* A geração do Pix Copia e Cola deve respeitar a especificação do Banco Central (Tag 00 a 63) com checksum **CRC-16 CCITT (0x1021, 0xFFFF)**.
* A geração de QR Code visual em Base64 Data URL deve ser realizada pelo `LocalPixGateway.generateQrCodeDataUrl(payload)`.

### 6. Banco de Dados e Seeds
* Scripts de banco (`scripts/seed.ts` e `init.sql`) devem ser idempotentes e compatíveis com identificadores UUID ou VARCHAR.
* Para atualizar dados de demonstração, utilize `npm run db:seed`.

### 7. Testes Automatizados (Vitest Gate)
* Antes de finalizar qualquer alteração, execute `npm run test`. Todos os testes unitários devem passar com 100% de sucesso.
