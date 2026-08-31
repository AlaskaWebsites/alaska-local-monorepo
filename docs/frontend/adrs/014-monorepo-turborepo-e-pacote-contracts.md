# ADR 014: Monorepo Unificado com Turborepo e Pacote Compartilhado @alaska/contracts

- **Status:** Aceito / Implementado
- **Data:** 2026-08-30
- **Contexto:** Unificação dos repositórios `Alaska-local` (Frontend) e `alaska-local-backend` (Backend) em uma estrutura Monorepo com `pnpm workspaces` e `@alaska/contracts`.

---

## 1. Contexto & Problema

Anteriormente, o ecossistema Alaska Local era mantido em dois repositórios isolados no GitHub:
1. `AlaskaWebsites/Alaska-local`: Frontend Nuxt 3 com One Codebase, Infinite Domains e 11 temas cromáticos.
2. `AlaskaWebsites/alaska-local-backend`: Backend NestJS 11 com Clean Architecture, PostgreSQL e Pix D+0.

Essa divisão apresentava desafios:
* **Duplicação de Tipos e Contratos:** DTOs e tipos de entidades eram mantidos manualmente em ambos os repositórios, gerando risco de drift e incompatibilidade de contratos.
* **Complexidade de CI/CD e Testes:** Impossibilidade de rodar uma suíte de testes unificada em um único comando ou validar o impacto de mudanças de contrato de ponta a ponta.
* **Versionamento Desalinhado:** Dificuldade em rastrear se uma versão específica do backend era 100% compatível com a versão ativa do frontend.

---

## 2. Decisões Arquiteturais

### A. Estrutura de Monorepo com `pnpm` Workspaces e `Turborepo`

Adotamos a seguinte estrutura de diretórios canônica:

```
alaska-local-monorepo/
├── apps/
│   ├── web/                          # Frontend Nuxt 3 (One Codebase, 11 Temas, Infinite Domains)
│   └── api/                          # Backend NestJS 11 (Clean Architecture & PostgreSQL 16)
│
├── packages/
│   ├── contracts/                    # Pacote @alaska/contracts (Single Source of Truth com Zod)
│   │   ├── src/
│   │   │   ├── tenant/               # Tenant, 11 Temas, Horários, PixConfig, Reviews
│   │   │   ├── catalog/              # Product, Category, OptionGroup, Availability
│   │   │   ├── order/                # CreateOrder, OrderItem, DeliveryType, Status
│   │   │   ├── booking/              # CreateBooking, Services, Professionals, Slots
│   │   │   ├── pix/                  # PixQrCodeRequest, PixQrCodeResponse, PixKey
│   │   │   └── common/               # Address, Cep, MoneyCents
│   │   ├── tsup.config.ts            # Build híbrido ESM (.mjs) e CJS (.js) com .d.ts
│   │   └── package.json              # Subpath exports granulares
│   │
│   └── tsconfig/                     # Configurações TypeScript base compartilhadas
│
├── .husky/pre-commit                 # Hook git executando pnpm turbo test
├── .github/workflows/ci.yml          # Pipeline de integração contínua
├── package.json                      # Scripts raiz ergonômicos
├── pnpm-workspace.yaml               # Configuração dos workspaces
└── turbo.json                        # Pipeline com cache de build e testes
```

### B. Pacote de Domínio `@alaska/contracts` como Single Source of Truth
* Todos os DTOs, schemas de validação e tipos do ecossistema são definidos uma única vez em `packages/contracts` usando **Zod 3.24**.
* O pacote exporta módulos em formato híbrido (ESM/CJS) via `tsup`, permitindo consumo direto pelo Vite/Nuxt no frontend e pelo NestJS/Node.js no backend.

### C. Husky & CI/CD Centralizados
* Configurado `.husky/pre-commit` executando `pnpm turbo test` para impedir commits que quebrem qualquer teste no repositório.
* Pipeline do GitHub Actions (`.github/workflows/ci.yml`) validando builds e 214+ testes a cada push e pull request.

---

## 3. Scripts Ergonômicos na Raiz

| Comando | Descrição |
| :--- | :--- |
| `pnpm dev` | Executa o frontend (`:3000`) e backend (`:3333`) em paralelo |
| `pnpm dev:web` | Executa apenas o frontend Nuxt 3 na porta 3000 |
| `pnpm dev:api` | Executa apenas o backend NestJS 11 na porta 3333 |
| `pnpm test` | Executa todos os 214+ testes (Contracts + Backend + Web) |
| `pnpm test:contracts` | Executa apenas a suíte de contratos Zod |
| `pnpm test:api` | Executa os testes unitários do backend NestJS |
| `pnpm test:web` | Executa os testes unitários e de acessibilidade do frontend |
| `pnpm db:seed` | Sincroniza todos os 9 estabelecimentos no PostgreSQL |
| `pnpm db:up` / `db:down` | Sobe e desce os containers Docker |

---

## 4. Benefícios & Consequências

- **Zero Drift de Contratos:** Qualquer alteração em schemas reflete imediatamente no frontend e no backend.
- **Performance e Cache:** Turborepo reutiliza cache de testes e builds inalterados, acelerando a esteira de desenvolvimento.
- **Governança Simplificada:** Toda a documentação técnica, decisões de arquitetura e código-fonte residem em um único repositório git.
