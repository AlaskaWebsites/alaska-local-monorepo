# Alaska Local — Backend API (@alaska/api)

> **API REST Multi-Tenant para Comércios Locais**  
> NestJS 11 • Clean Architecture • Ports & Adapters • Zod • PostgreSQL • Docker

---

## 🏛️ 1. Pilares da Arquitetura

1. **Clean Architecture Estrita (DDD / Onion)**:
   * **Domain**: Entidades puras (`Tenant`, `Category`, `Product`, `Order`, `Booking`, `MerchantUser`), Value Objects (`Money`, `PixKey`, `Address`), regras de negócio e interfaces de repositório (`ITenantRepository`, `IProductRepository`, `IMerchantUserRepository`). Zero dependência de framework.
   * **Application**: Casos de uso atômicos (`GetTenantBySlugUseCase`, `CreateOrderUseCase`, `CreateBookingUseCase`, `ToggleProductAvailabilityUseCase`, `AuthenticateMerchantCredentialsUseCase`, `ChangeMerchantPasswordUseCase`).
   * **Infrastructure**: Implementações concretas de portas (`PostgresTenantRepository`, `PostgresProductRepository`, `PostgresMerchantUserRepository`, `LocalPixGateway`).
   * **Presentation**: Controladores HTTP NestJS (`TenantController`, `OrderController`, `BookingController`, `ProductController`, `MerchantAuthController`).
2. **Inversão de Dependência via Symbols (IoC)**:
   * Desacoplamento através de tokens de injeção (`TENANT_REPOSITORY`, `PRODUCT_REPOSITORY`, `PIX_GATEWAY`, `MERCHANT_USER_REPOSITORY`).
3. **Money Pattern Imutável**:
   * Todos os valores monetários são processados e persistidos em centavos inteiros (`cents: number`) via Value Object `Money`, eliminando imprecisão de ponto flutuante IEEE 754.
4. **Validação Fail-Fast com Zod e DTOs Tipados (ADR 002 e ADR 014)**:
   * Interceptação de dados na borda externa via `ZodValidationPipe` consumindo schemas de `@alaska/contracts`. Eliminação total de `@Body() body: any` e imposição de invariantes nos construtores das entidades.
5. **Erros Padronizados em RFC 7807 (Problem Details)**:
   * Exceções de domínio (`ValidationError`, `EntityNotFoundError`) convertidas automaticamente pelo `DomainExceptionFilter` para JSON estruturado com status HTTP adequado (400, 404, 409, 500).
6. **Auto-População Resiliente no PostgreSQL (ADR 008)**:
   * Proteção contra vitrines esvaziadas através de auto-seeding transacional de categorias e produtos caso o tenant exista com catálogo vazio.
7. **Resiliência de Rotas de Catálogo e Fuso Horário de Brasília (ADR 009)**:
   * Tratamento polimórfico de disponibilidade de produtos no PostgreSQL e sincronização horária canônica em `America/Sao_Paulo`.
8. **Autenticação Corporativa do Lojista e JWT (ADR 013)**:
   * Login com e-mail corporativo, senha com hash seguro e tokens JWT com isolamento estrito por tenant.
9. **Encapsulamento de Entidades DDD e Ciclo de Vida Canônico (ADR 014)**:
   * Métodos canônicos `updateStatus()` e `cancel()` em `Order` e `Booking`, impedindo mutações arbitrárias de propriedades internas.
10. **Governança de Escopo Cirúrgico e Anti-Regressão (ADR 015)**:
   * Modificações estritas ao escopo solicitado, preservação total de invariantes de domínio e proteção contra alterações colaterais.

---

## 🚀 2. Rotas Principais da API

Documentação interativa OpenAPI / Swagger disponível em: `http://localhost:3333/api/docs`

| Módulo | Método | Rota | Descrição |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/v1/health` | Status da API e conectividade com banco de dados. |
| **Autenticação** | `POST` | `/api/v1/auth/merchant/login` | Login corporativo do lojista (e-mail, senha e slug) com emissão de token JWT. |
| **Autenticação** | `POST` | `/api/v1/auth/merchant/change-password` | Alteração de senha corporativa (protegido por Bearer token). |
| **Tenants** | `GET` | `/api/v1/tenants/:slug` | Dados públicos do estabelecimento, categorias e catálogo. |
| **Tenants** | `POST` | `/api/v1/tenants` | Criação de novo tenant com validação de slug único. |
| **Tenants** | `PATCH` | `/api/v1/tenants/:slug/emergency-close` | Pausa emergencial com mensagem personalizada. |
| **Produtos** | `POST` | `/api/v1/products` | Cadastro de produto com categoria e preço em centavos. |
| **Produtos** | `PATCH` | `/api/v1/products/:id/toggle` | Alternância de disponibilidade com propagação imediata. |
| **Produtos** | `PUT` | `/api/v1/products/:id` | Atualização de dados, preços e categoria de produto. |
| **Produtos** | `DELETE` | `/api/v1/products/:id` | Exclusão lógica ou física de item do catálogo. |
| **Pedidos** | `POST` | `/api/v1/orders` | Criação de pedido de delivery/retirada com itens e endereço. |
| **Pedidos** | `GET` | `/api/v1/orders/:id` | Consulta detalhada de comanda e status operacional. |
| **Pedidos** | `PATCH` | `/api/v1/orders/:id/status` | Avanço de status na esteira de produção. |
| **Agendamentos** | `POST` | `/api/v1/bookings` | Criação de agendamento com validação de slot e profissional. |
| **Agendamentos** | `GET` | `/api/v1/bookings/:id` | Consulta detalhada do agendamento de serviço. |
| **Agendamentos** | `PATCH` | `/api/v1/bookings/:id/status` | Confirmação, conclusão ou cancelamento de agendamento. |
| **Pix** | `POST` | `/api/v1/pix/qrcode` | Geração de payload Pix EMV estático/dinâmico e QR Code Base64. |

---

## 🧪 3. Testes Automatizados (Vitest)

Suíte completa com **108 testes unitários em 31 arquivos**, validando casos de uso, entidades e adaptadores:

```bash
pnpm test:api
```

---

## 🏛️ 4. Registros de Decisões de Arquitetura (ADRs)

- **[ADR 001: Clean Architecture e Ports & Adapters](./adrs/001-clean-architecture-e-ports-and-adapters.md)** — Separação estrita de camadas e inversão de controle.
- **[ADR 002: Validação Fail-Fast com Zod e Pipes Customizados](./adrs/002-validacao-fail-fast-com-zod-e-pipes-customizados.md)** — Eliminação de DTOs anêmicos e validação na borda externa.
- **[ADR 003: Clean Architecture, Ports & Adapters e Money VO](./adrs/003-clean-architecture-ports-adapters-e-money-vo.md)** — Cálculos monetários seguros em centavos inteiros.
- **[ADR 004: Filas Assíncronas com BullMQ e Redis](./adrs/004-filas-assincronas-com-bullmq-e-redis.md)** — Processamento resiliente em segundo plano.
- **[ADR 005: Pipeline de Agentes de IA e MCP Engine](./adrs/005-pipeline-de-agentes-de-ia-e-mcp-engine.md)** — Automação e inteligência artificial para comércios locais.
- **[ADR 006: Camada de Persistência PostgreSQL e Pooling](./adrs/006-camada-de-persistencia-postgresql-e-pooling.md)** — Gestão de conexões resilientes e mapeadores bidirecionais.
- **[ADR 007: Autenticação Segura no Painel do Lojista via PIN Hash](./adrs/007-autenticacao-segura-painel-do-lojista-pin-hash.md)** — Hashing SHA-256 com salt de domínio sem dependências externas.
- **[ADR 008: Auto-População Resiliente de Catálogo no PostgreSQL e Tolerância a Cold-Start](./adrs/008-auto-populacao-resiliente-catalogo-postgresql-e-cold-start.md)** — Auto-seed transacional de categorias vazias e persistência assíncrona tolerante a cold-start.
- **[ADR 009: Resiliência de Rotas de Catálogo, Sincronização de Disponibilidade e Fuso Horário de Brasília](./adrs/009-resiliencia-de-rotas-de-catalogo-disponibilidade-e-fuso-horario-brasilia.md)** — Tratamento polimórfico de disponibilidade, eliminação de 404 por booleanos e normalização temporal em America/Sao_Paulo.
- **[ADR 010: Persistência de Criação e Exclusão de Produtos no PostgreSQL](./adrs/010-persistencia-produtos-e-catalogo-postgresql.md)** — Gestão de catálogo relacional com mutações atômicas no PostgreSQL 16.
- **[ADR 011: Persistência de Profissionais e Bloqueio de Agenda no PostgreSQL](./adrs/011-persistencia-profissionais-e-bloqueio-agenda-postgresql.md)** — Escalas, expediente, intervalos de almoço e bloqueios manuais de slots.
- **[ADR 012: Persistência de Configurações Globais da Loja no PostgreSQL](./adrs/012-persistencia-configuracoes-globais-loja-postgresql.md)** — Grade semanal, emergência, delivery, Pix, canais sociais e comunicados.
- **[ADR 013: Autenticação Corporativa do Lojista (E-mail e Senha), Hash Seguro e Sessão JWT](./adrs/013-autenticacao-e-perfil-do-lojista-email-senha.md)** — Autenticação corporativa com MerchantUser, RLS por tenant, hash seguro e tokens JWT.
- **[ADR 014: Blindagem Fail-Fast Total com ZodValidationPipe e Padronização RFC 7807](./adrs/014-blindagem-fail-fast-total-zod-e-padronizacao-rfc7807.md)** — Eliminação definitiva de `@Body() body: any`, encapsulamento DDD nas entidades `Order`/`Booking` e respostas HTTP 400/404 padronizadas.
- **[ADR 015: Governança de Escopo Cirúrgico e Prevenção de Regressões no Backend](./adrs/015-governanca-de-escopo-cirurgico-e-prevencao-de-regressoes.md)** — Protocolo contra alterações colaterais, leitura obrigatória da main e proteção de use cases e entidades.

---
