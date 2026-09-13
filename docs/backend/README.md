# ⚙️ Alaska Local — Back-end Architecture Documentation (`@alaska/api`)

Documentação técnica oficial do backend NestJS 11 do ecossistema **Alaska Local**, construído sob os princípios estritos de **Clean Architecture (Arquitetura Hexagonal / Ports & Adapters)**, validação Fail-Fast com Zod via `@alaska/contracts`, persistência nativa em PostgreSQL 16 com auto-migration/auto-seed e tratamento monetário imutável via Value Object `Money`.

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
   - DTOs são validados na borda da API via `ZodValidationPipe`, impedindo dados corrompidos de atingirem a aplicação.
5. **Persistência Nativa PostgreSQL 16 com Auto-Bootstrap**:
   - Conexão em pool (`pg.Pool`) com auto-migração de schema e auto-seed inicial no `onModuleInit()` de `PostgresService`.
   - Suporte transparente a SSL em instâncias gerenciadas do Render.

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
│       ├── ports/                    # ITenantRepository, IProductRepository, IOrderRepository, IBookingRepository, IPixGateway, IPasswordHasher
│       ├── tokens.ts                 # Injection Tokens para desacoplamento
│       └── use-cases/                # GetTenantBySlug, ResolveTenantByDomain, CreateOrder, ToggleProductAvailability, ToggleOptionAvailability, AuthenticateMerchant, etc.
│
├── infrastructure/                   # 3. Camada de Infraestrutura & Adaptadores
│   ├── http/
│   │   ├── controllers/              # TenantController, ProductController, OrderController, BookingController, PixController, HealthController
│   │   ├── guards/                   # MerchantAuthGuard (validação de token de lojista)
│   │   ├── pipes/                    # ZodValidationPipe (Fail-Fast)
│   │   └── filters/                  # DomainExceptionFilter (RFC 7807)
│   ├── gateways/                     # LocalPixGateway (EMV BACEN & QR Code)
│   ├── security/                     # SimplePasswordHasher (SHA-256 com salt)
│   ├── persistence/
│   │   ├── in-memory/                # Repositórios em memória para testes ultrarrápidos no Vitest
│   │   └── postgres/                 # Repositórios PostgreSQL (Pool pg + RLS + Mappers + Seed)
│   │       ├── mappers/              # TenantMapper, etc.
│   │       ├── migrations/           # Migrações SQL adicionais (002_add_pin_hash_to_tenants.sql)
│   │       ├── seed-catalog.ts       # Catálogo dos 10 estabelecimentos canônicos
│   │       └── postgres.service.ts   # Pool pg com auto-migration e auto-seed
│   └── modules/                      # Módulos NestJS de injeção e orquestração
│
├── config/                           # Validação de Variáveis de Ambiente (env.schema.ts)
└── main.ts                           # Ponto de Entrada da Aplicação NestJS (Swagger OpenAPI v1.4.0)
```

---

## ⚙️ 3. Casos de Uso (Application Layer)

| Caso de Uso | Finalidade | Portas Utilizadas |
| :--- | :--- | :--- |
| **`GetTenantBySlugUseCase`** | Busca dados cadastrais e catálogo do estabelecimento pelo slug da vitrine. | `ITenantRepository` |
| **`ResolveTenantByDomainUseCase`** | Resolve o tenant a partir do domínio próprio (header `Host`). | `ITenantRepository` |
| **`AuthenticateMerchantUseCase`** | Autentica o lojista via PIN (ADR 007) gerando token de sessão. | `ITenantRepository`, `IPasswordHasher` |
| **`UpdateTenantHoursUseCase`** | Atualiza a grade semanal de funcionamento da loja. | `ITenantRepository` |
| **`ToggleProductAvailabilityUseCase`** | Pausa ou despausa itens do catálogo em tempo real (ADR 013). | `IProductRepository` |
| **`ToggleOptionAvailabilityUseCase`** | Pausa ou despausa opcionais/adicionais (ex: bacon esgotado). | `IProductRepository` |
| **`UpdateProductUseCase`** | Atualiza preço e informações de produto do catálogo. | `IProductRepository` |
| **`CreateOrderUseCase`** | Valida produtos, calcula totais via `Money` VO e cria novo pedido. | `IOrderRepository`, `IProductRepository`, `ITenantRepository` |
| **`CalculatePixPayloadUseCase`** | Gera o payload EMV padrão BACEN (Tags 00–63) e QR Code Base64. | `IPixGateway`, `ITenantRepository` |

---

## 🌐 4. Endpoints da API REST (OpenAPI / Swagger v1.4.0)

Documentação interativa disponível em `http://localhost:3333/docs` com schemas RFC 7807 e autenticação `merchant-token`:

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/tenants` | Lista todos os estabelecimentos cadastrados e ativos |
| `GET` | `/api/v1/tenants/:slug` | Retorna dados completos do tenant, horários e catálogo |
| `GET` | `/api/v1/tenants/resolve/domain?host=...` | Resolve estabelecimento por domínio próprio ou subdomínio |
| `POST` | `/api/v1/tenants/:slug/admin/login` | Autenticação do lojista via PIN com retorno de token de sessão |
| `POST` | `/api/v1/tenants/:slug/hours` | Atualiza grade de funcionamento da loja (`merchant-token`) |
| `PATCH` | `/api/v1/tenants/:slug/products/:productId/availability` | Alterna disponibilidade do produto (pausa rápida < 3s) |
| `PATCH` | `/api/v1/tenants/:slug/products/:productId/options/:optionId/availability` | Alterna disponibilidade de opcional/adicional por produto |
| `PATCH` | `/api/v1/tenants/:slug/products/options/:optionId/availability` | Alterna disponibilidade de opcional diretamente pelo slug |
| `PUT` / `PATCH` | `/api/v1/tenants/:slug/products/:productId` | Atualiza preço, dados e disponibilidade do produto |
| `POST` | `/api/v1/orders` | Cria novo pedido com validação Zod e cálculo financeiro |
| `GET` | `/api/v1/orders/:id` | Consulta detalhes, itens e status do pedido |
| `GET` | `/api/v1/orders/tenant/:tenantId` | Lista pedidos de um estabelecimento para o lojista |
| `PATCH` | `/api/v1/orders/:id/status` | Atualiza status operacional (`confirmed`, `preparing`, `dispatched`, `completed`, `cancelled`) |
| `POST` | `/api/v1/bookings` | Registra agendamento com especialista, serviços e sinal Pix |
| `GET` | `/api/v1/bookings/:id` | Consulta dados, profissional e status do agendamento |
| `GET` | `/api/v1/bookings/tenant/:tenantId` | Lista agendamentos filtrados por data e loja |
| `PATCH` | `/api/v1/bookings/:id/status` | Atualiza status do agendamento (`scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`) |
| `POST` | `/api/v1/pix/brcode` / `/api/v1/pix/qrcode` | Gera BR Code EMV oficial (BACEN) e QR Code em Base64 Data URL |
| `GET` | `/api/v1/pix/qrcode` | Consulta dados e imagem do QR Code Pix via query params |
| `GET` | `/api/v1/health` | Healthcheck de integridade, status operacional e uptime |

---

## 📚 5. Guias Especializados de Arquitetura

Para detalhes aprofundados sobre a implementação, consulte:
* **[Guia Mestre de Integração Client-Server](../frontend/architecture/integracao-client-server.md)** — Comunicação ponta a ponta Vercel ↔ Render, mutações otimistas e resiliência.
* **[Ciclo de Vida de Pedidos e Agendamentos](./architecture/ciclo-pedidos-e-agendamentos.md)** — Máquinas de estados, transições e regras de negócio.
* **[Protocolo Pix BACEN EMV](./architecture/protocolo-pix-emv.md)** — Montagem TLV, CRC-16 CCITT e QR Code assíncrono.
* **[Tratamento de Erros & RFC 7807](./architecture/tratamento-erros-e-rfc7807.md)** — Exceções puras de domínio e padronização HTTP Problem Details.
* **[Guia de Persistência PostgreSQL & Docker](./architecture/postgresql-persistence-guide.md)** — Auto-migration, auto-seed e pooling.
* **[Mapa Completo de Arquitetura](./architecture/mapa-arquitetura-backend.md)** — Árvore de arquivos e injeção de dependência.
