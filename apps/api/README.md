# 🏔️ Alaska Local — Backend API & AI Agent Engine

> Backend robusto em **NestJS 11** desenvolvido com **Clean Architecture (Ports & Adapters)**, validação rigorosa com **Zod**, banco de dados **PostgreSQL 16** com **Row Level Security (RLS)**, suporte completo a pagamentos **Pix D+0 (BR Code EMV & QR Code)** e documentação interativa **OpenAPI/Swagger**.

[![NestJS](https://img.shields.io/badge/NestJS-11.0.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Zod](https://img.shields.io/badge/Zod-3.24.2-3E67B1?logo=zod)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0.5-6E9F18?logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger)](http://localhost:3333/docs)

---

## 🏛️ Arquitetura Limpa (Ports & Adapters)

O backend segue estritamente os princípios de Clean Architecture e separação em camadas independentes de framework:

```
alaska-local-backend/
├── docker/                         # Configurações de containerização
│   └── init.sql                    # Script de inicialização PostgreSQL, tabelas, RLS e seeds
├── scripts/                        # Scripts de automação e banco
│   └── seed.ts                     # Script de sincronização e seed no PostgreSQL (npm run db:seed)
├── src/
│   ├── config/                     # Configurações de ambiente validadas com Zod
│   │   └── env.schema.ts           # EnvSchema estrito (PORT, DATABASE_URL, CORS, etc.)
│   ├── core/                       # Núcleo da Aplicação (Zero dependência de frameworks)
│   │   ├── application/            # Casos de Uso, Portas e Tokens de Injeção
│   │   │   ├── ports/              # Interfaces: ITenantRepository, IOrderRepository, IBookingRepository, IPixGateway
│   │   │   ├── tokens.ts           # Símbolos de injeção de dependência para Ports
│   │   │   └── use-cases/          # CalculatePixPayload, CreateOrder, GetTenantBySlug, ResolveTenantByDomain
│   │   └── domain/                 # Entidades Puras e Value Objects
│   │       ├── entities/           # Tenant, Product, Order, Booking
│   │       ├── errors/             # DomainError, EntityNotFoundError, ValidationError
│   │       └── value-objects/      # Money (centavos imutáveis), Address
│   └── infrastructure/             # Adaptadores de Entrada/Saída e Frameworks
│       ├── gateways/               # LocalPixGateway (BR Code EMV, CRC-16, QR Code Data URL)
│       ├── http/                   # Controladores REST, Pipes de validação Zod e Filtros de Exceção
│       │   ├── controllers/        # HealthController, TenantController, PixController, OrderController, BookingController
│       │   ├── filters/            # DomainExceptionFilter (converte DomainError para HTTP 400/404/500)
│       │   └── pipes/              # ZodValidationPipe
│       ├── modules/                # Módulos NestJS: DatabaseModule, TenantModule, PixModule, OrderModule, BookingModule
│       └── persistence/            # Camada de Dados (PostgreSQL Pool + Mappers + In-Memory Fallback)
│           ├── in-memory/          # Repositórios em memória para testes unitários ultrarrápidos
│           └── postgres/           # Repositórios PostgreSQL (PostgresService, Mappers e RLS)
├── tests/                          # Suíte de Testes Automatizados no Vitest
│   ├── unit/                       # Testes de Domínio, Use Cases e Value Objects
│   └── e2e/                        # Testes de integração de Controladores e Rotas
├── docker-compose.yml              # Orquestração do PostgreSQL 16
└── vitest.config.ts                # Configuração do Vitest com aliases nativos
```

---

## ⚡ Endpoints da API

A documentação interativa completa está disponível em `http://localhost:3333/docs` via **Swagger / OpenAPI**.

### 🏢 Tenants & Domínios
* `GET /api/v1/tenants/:slug` — Busca dados operacionais, tema e catálogo do estabelecimento.
* `GET /api/v1/tenants/resolve?host=...` — Resolve o tenant via domínio próprio ou subdomínio.

### 💠 Pagamentos Pix
* `POST /api/v1/pix/brcode` — Gera o payload BR Code EMV (Copia e Cola) com CRC-16 e imagem QR Code em Base64 Data URL.
* `GET /api/v1/pix/qrcode?tenantSlug=...&amount=...` — Consulta dados e imagem do QR Code Pix via parâmetros de URL.

### 🛍️ Pedidos (Orders)
* `POST /api/v1/orders` — Cria um novo pedido com validação Zod, cálculo de total e suporte a Pix EMV.
* `GET /api/v1/orders/:id` — Busca os detalhes do pedido.

### 📅 Agendamentos (Bookings)
* `POST /api/v1/bookings` — Registra agendamento de serviços (Alaska Hub & Alaska Pro).
* `GET /api/v1/bookings/tenant/:tenantId?date=...` — Lista agendamentos por estabelecimento e data.

### 🩺 Health Check
* `GET /api/v1/health` — Status de integridade e uptime do serviço.

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js 20+ ou 22+
* Docker e Docker Compose (para o banco PostgreSQL)

### 2. Clonar e Instalar Dependências
```bash
git clone https://github.com/AlaskaWebsites/alaska-local-backend.git
cd alaska-local-backend
npm install
```

### 3. Subir o Banco de Dados PostgreSQL (Docker)
```bash
docker compose up -d
```
O PostgreSQL será inicializado na porta `5432` com as tabelas e extensões UUID criadas.

### 4. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
NODE_ENV=development
PORT=3333
CORS_ORIGINS=*
DATABASE_URL=postgres://alaska:alaskapassword@localhost:5432/alaska_local
```

### 5. Executar o Seed Inicial do Banco
```bash
npm run db:seed
```
O comando atualizará todos os estabelecimentos com as configurações canônicas de Pix e catálogo.

### 6. Iniciar o Servidor NestJS
```bash
npm run start:dev
```
Acesse a documentação interativa em: `http://localhost:3333/docs`

### 7. Executar os Testes Automatizados (Vitest)
```bash
npm run test
```

---

## 📜 Licença
Distribuído sob licença MIT. Desenvolvido pela equipe **Alaska Websites**.
