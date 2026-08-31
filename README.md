# 🏔️ Alaska Local — Monorepo Unificado

> Monorepo unificado do ecossistema **Alaska Local** gerenciado por **Turborepo** e **pnpm Workspaces**, integrando frontend em **Nuxt 3**, backend em **NestJS 11** e pacote de domínio compartilhado **`@alaska/contracts`**.

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.15.0-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.4.0-EF4444?logo=turborepo)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-3.24.2-3E67B1?logo=zod)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0.5-6E9F18?logo=vitest)](https://vitest.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)

---

## 🏗️ Estrutura de Diretórios

```
alaska-local-monorepo/
├── apps/
│   ├── web/                          # Frontend Nuxt 3 (One Codebase, Infinite Domains, 11 Temas)
│   └── api/                          # Backend NestJS 11 (Clean Architecture, RLS & Pix D+0)
│
├── packages/
│   ├── contracts/                    # @alaska/contracts (Single Source of Truth com Zod 3.24)
│   │   ├── src/
│   │   │   ├── tenant/               # TenantSchema, 11 Temas, Horários, PixConfig, Reviews
│   │   │   ├── catalog/              # ProductSchema, Categories, OptionGroups, Availability
│   │   │   ├── order/                # CreateOrderSchema, OrderItem, Status, Delivery
│   │   │   ├── booking/              # CreateBookingSchema, Services, Professionals, Slots
│   │   │   ├── pix/                  # PixQrCodeRequest, PixQrCodeResponse, PixKey
│   │   │   └── common/               # AddressSchema, CepSchema, MoneyCentsSchema
│   │   └── tsup.config.ts            # Build híbrido ESM/CJS com .d.ts
│   │
│   └── tsconfig/                     # Configurações TypeScript base compartilhadas
│
├── docs/                             # Base Documental Completa (Frontend, Backend, ADRs, Deploy)
│   ├── frontend/                     # ADRs 001 a 014 e Guias de Frontend
│   ├── backend/                      # ADRs 001 a 006 e Guias de Backend
│   └── operations/                   # Guias de Deploy e Operação
│
├── .husky/pre-commit                 # Hook pre-commit rodando pnpm turbo test
├── .github/workflows/ci.yml          # Pipeline de Integração Contínua (CI/CD)
├── package.json                      # Scripts raiz ergonômicos
├── pnpm-workspace.yaml               # Definição dos pacotes do monorepo
└── turbo.json                        # Configuração de pipelines e cache
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js 20+ ou 22+
* pnpm 9+ (`npm install -g pnpm`)
* Docker & Docker Compose (para o PostgreSQL)

### 2. Instalação e Build Inicial
```bash
# 1. Instalar todas as dependências dos workspaces
pnpm install

# 2. Compilar o pacote de contratos compartilhados
pnpm build:contracts
```

### 3. Banco de Dados PostgreSQL (Docker)
```bash
# Iniciar o container PostgreSQL
pnpm db:up

# Executar o seed dos 9 estabelecimentos canônicos
pnpm db:seed
```

### 4. Executar em Desenvolvimento
```bash
# Inicia Frontend (:3000) e Backend (:3333) simultaneamente
pnpm dev

# Ou inicie separadamente:
pnpm dev:web    # Apenas Frontend Nuxt 3 na porta 3000
pnpm dev:api    # Apenas Backend NestJS na porta 3333
```

---

## 🧪 Suíte de Testes Automatizados (214 Testes)

```bash
# Executa todos os testes do monorepo (Contracts + Backend + Web)
pnpm test

# Testes por workspace:
pnpm test:contracts   # 16 testes de schemas Zod
pnpm test:api         # 30 testes de casos de uso e domínio
pnpm test:web         # 168 testes de composables, acessibilidade e modais
```

---

## 📱 Vitrines de Demonstração & Painel do Lojista

| Estabelecimento | Vertical | Vitrine Pública | Painel do Lojista (PIN: 1234) |
| :--- | :--- | :--- | :--- |
| **Hamburgueria X** | *Alaska Menu* | [http://localhost:3000/hamburgueria-x](http://localhost:3000/hamburgueria-x) | [http://localhost:3000/hamburgueria-x/admin](http://localhost:3000/hamburgueria-x/admin) |
| **Adega Prime** | *Alaska Menu* | [http://localhost:3000/adega-prime](http://localhost:3000/adega-prime) | [http://localhost:3000/adega-prime/admin](http://localhost:3000/adega-prime/admin) |
| **Espetaria Brasa** | *Alaska Menu* | [http://localhost:3000/espetaria-brasa](http://localhost:3000/espetaria-brasa) | [http://localhost:3000/espetaria-brasa/admin](http://localhost:3000/espetaria-brasa/admin) |
| **Café Central** | *Alaska Menu* | [http://localhost:3000/cafe-central](http://localhost:3000/cafe-central) | [http://localhost:3000/cafe-central/admin](http://localhost:3000/cafe-central/admin) |
| **Bella Donna** | *Alaska Shop* | [http://localhost:3000/bella-donna](http://localhost:3000/bella-donna) | [http://localhost:3000/bella-donna/admin](http://localhost:3000/bella-donna/admin) |
| **Karine Finardi** | *Alaska Shop* | [http://localhost:3000/karine-finardi](http://localhost:3000/karine-finardi) | [http://localhost:3000/karine-finardi/admin](http://localhost:3000/karine-finardi/admin) |
| **Barbearia Style** | *Alaska Hub* | [http://localhost:3000/barbearia-style](http://localhost:3000/barbearia-style) | [http://localhost:3000/barbearia-style/admin](http://localhost:3000/barbearia-style/admin) |
| **Clínica Sorriso** | *Alaska Pro* | [http://localhost:3000/clinica-sorriso](http://localhost:3000/clinica-sorriso) | [http://localhost:3000/clinica-sorriso/admin](http://localhost:3000/clinica-sorriso/admin) |

---

## 📜 Licença
Distribuído sob licença MIT. Desenvolvido pela equipe **Alaska Websites**.
