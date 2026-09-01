# ⚙️ Alaska Local — Back-end Architecture Documentation (`@alaska/api`)

Documentação técnica oficial do backend NestJS 11 do ecossistema **Alaska Local**, construído sob os princípios estritos de **Clean Architecture (Arquitetura Hexagonal / Ports & Adapters)**, validação Fail-Fast com Zod via `@alaska/contracts` e tratamento monetário imutável via Value Object `Money`.

---

## 🏛️ 1. Princípios Arquiteturais Invioláveis

1. **Isolamento do Core de Domínio**:
   - As camadas `src/core/domain/` e `src/core/application/` são **100% puras e agnósticas de frameworks**.
   - Zero acoplamento a decoradores NestJS (`@Injectable`, `@Controller`), ORMs ou bibliotecas de banco de dados no domínio.
2. **Tratamento Monetário Estrito (`Money` Value Object)**:
   - **Regra de Ouro**: NUNCA utilize números de ponto flutuante (`float`/`number` decimal) para valores monetários no backend.
   - Todos os valores são instâncias imutáveis de `Money` e persistidos como inteiros em centavos (`price_cents INT` no PostgreSQL).
3. **Injeção de Dependências Desacoplada via Tokens**:
   - Casos de uso dependem exclusivamente de interfaces abstratas de portas (`ports/`) e tokens definidos em `src/core/application/tokens.ts`.
4. **Validação Fail-Fast com Zod (`@alaska/contracts` — ADR 014)**:
   - DTOs são validados no primeiro contato com a API via `ZodValidationPipe`, impedindo dados corrompidos de atingirem a aplicação.
5. **Multi-Tenancy & Row-Level Security (RLS)**:
   - Isolamento lógico e de banco por `tenant_id`, com suporte a múltiplos estabelecimentos e resolução instantânea por domínio ou slug.

---

## 🧱 2. Mapa de Camadas do Backend

```
apps/api/src/
├── core/
│   ├── domain/                       # 1. Camada de Domínio Pura (Entidades, VOs e Erros)
│   │   ├── entities/                 # Tenant, Product, Order, Booking
│   │   ├── value-objects/            # Money (centavos), Address, PixKey
│   │   └── errors/                   # DomainError, EntityNotFoundError, ValidationError
│   │
│   └── application/                  # 2. Camada de Aplicação (Use Cases & Portas)
│       ├── ports/                    # ITenantRepository, IProductRepository, IOrderRepository, IBookingRepository, IPixGateway
│       ├── tokens.ts                 # Injection Tokens para desacoplamento
│       └── use-cases/                # GetTenantBySlug, ResolveTenantByDomain, CreateOrder, CalculatePixPayload, etc.
│
├── infrastructure/                   # 3. Camada de Infraestrutura & Adaptadores
│   ├── http/
│   │   ├── controllers/              # TenantController, ProductController, OrderController, BookingController, PixController, HealthController
│   │   ├── pipes/                    # ZodValidationPipe (Fail-Fast)
│   │   └── filters/                  # DomainExceptionFilter (RFC 7807)
│   ├── gateways/                     # LocalPixGateway (EMV BACEN & QR Code)
│   ├── persistence/
│   │   ├── in-memory/                # Repositórios em memória para testes e demos rápidas
│   │   └── postgres/                 # Repositórios PostgreSQL (Pool pg + RLS + Mappers)
│   └── modules/                      # Módulos NestJS de injeção e orquestração
│
├── config/                           # Configurações de Ambiente (EnvConfig)
└── main.ts                           # Ponto de Entrada da Aplicação NestJS
```

---

## 🧩 3. Entidades & Value Objects do Domínio

| Entidade / VO | Responsabilidade | Invariantes / Métodos |
| :--- | :--- | :--- |
| **`Money` VO** | Representação monetária imutável em centavos inteiros. | `fromCents(cents)`, `fromDecimal(val)`, `add()`, `subtract()`, `multiply()`, `percentage()`, `toDecimal()`, `formatBrl()` |
| **`Tenant` Entity** | Raiz de agregação do estabelecimento. | Validação de slug, categoria (`menu`, `shop`, `hub`, `pro`), 11 temas, horários, Pix e status de emergência |
| **`Product` Entity** | Procedimento ou produto do catálogo. | Preço via `Money` VO, grupos de adicionais/opcionais e controle de disponibilidade |
| **`Order` Entity** | Pedido de compras / delivery. | Subtotal, taxa de entrega, total em centavos e máquina de estados (`received` $\rightarrow$ `completed`) |
| **`Booking` Entity** | Agendamento de horário com especialista. | Data, horário, cliente, especialista, duração e sinal Pix de garantia (30%) |
| **`Address` VO** | Endereço formatado do cliente. | CEP sanitizado de 8 dígitos, logradouro, número e bairro |
| **`PixKey` VO** | Chave Pix do lojista. | Validação estrita de tipo (`cpf`, `cnpj`, `phone`, `email`, `random`) |

---

## ⚙️ 4. Casos de Uso (Application Layer)

| Caso de Uso | Finalidade | Portas Utilizadas |
| :--- | :--- | :--- |
| **`GetTenantBySlugUseCase`** | Busca dados cadastrais e catálogo do estabelecimento pelo slug da vitrine. | `ITenantRepository` |
| **`ResolveTenantByDomainUseCase`** | Resolve o tenant a partir do domínio próprio (header `Host`). | `ITenantRepository` |
| **`CreateOrderUseCase`** | Valida produtos, calcula totais via `Money` VO e cria novo pedido. | `IOrderRepository`, `IProductRepository`, `ITenantRepository` |
| **`CalculatePixPayloadUseCase`** | Gera o payload EMV padrão BACEN (Tags 00–63) e QR Code Base64. | `IPixGateway`, `ITenantRepository` |
| **`ToggleProductAvailabilityUseCase`** | Pausa ou despausa itens em menos de 3 segundos (ADR 013). | `IProductRepository` |
| **`UpdateProductUseCase`** | Atualiza preço e informações de produto do catálogo. | `IProductRepository` |
| **`UpdateTenantHoursUseCase`** | Atualiza a grade semanal de funcionamento da loja. | `ITenantRepository` |

---

## 🌐 5. Endpoints da API REST (`/api`)

| Método | Rota | Descrição | Schema Zod de Entrada |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tenants/:slug` | Retorna dados completos do tenant e catálogo | — |
| `GET` | `/api/tenants/resolve-domain` | Resolve tenant por domínio próprio | `Query: domain` |
| `PATCH` | `/api/tenants/:slug/hours` | Atualiza horários de funcionamento | `UpdateTenantHoursSchema` |
| `GET` | `/api/products/tenant/:tenantId` | Lista produtos por categoria | — |
| `PATCH` | `/api/products/:id/availability` | Alterna disponibilidade (pausa rápida) | `ToggleProductAvailabilitySchema` |
| `PATCH` | `/api/products/:id` | Atualiza preço e dados do produto | `UpdateProductSchema` |
| `POST` | `/api/orders` | Cria novo pedido | `CreateOrderSchema` |
| `POST` | `/api/bookings` | Registra novo agendamento | `CreateBookingSchema` |
| `POST` | `/api/pix/qrcode` | Gera QR Code e Copia e Cola Pix | `PixQrCodeRequestSchema` |
| `GET` | `/api/health` | Healthcheck (Liveness / Readiness) | — |

---

## 🧪 6. Suíte de Testes Unitários (`apps/api/tests/unit/`)

A suíte de testes unitários do backend utiliza **Vitest** com repositórios em memória (`InMemoryRepository`), garantindo execução determinística e ultrarrápida (< 150ms):

- `domain/money.vo.spec.ts`: Operações monetárias, arredondamento e invariantes de centavos inteiros.
- `domain/tenant.entity.spec.ts` & `product.entity.spec.ts`: Validações de domínio.
- `use-cases/create-order.spec.ts`: Criação e cálculo de pedidos.
- `use-cases/calculate-pix-payload.spec.ts`: Geração de payload Pix e CRC-16.
- `use-cases/toggle-product-availability.spec.ts`: Pausa e reativação de produtos.
- `persistence/in-memory-repositories.spec.ts`: Comportamento das portas e repositórios.
