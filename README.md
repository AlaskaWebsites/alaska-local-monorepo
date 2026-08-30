# 🏔️ Alaska Local — Monorepo Unificado

> Monorepo unificado do ecossistema **Alaska Local** gerenciado por **Turborepo** e **pnpm Workspaces**, integrando frontend em **Nuxt 3**, backend em **NestJS 11** e pacote de domínio compartilhado **`@alaska/contracts`**.

---

## 🏗️ Estrutura de Diretórios

```
alaska-local-monorepo/
├── apps/
│   ├── web/                          # Frontend Nuxt 3 (One Codebase, Infinite Domains)
│   └── api/                          # Backend NestJS 11 (Clean Architecture & RLS)
│
├── packages/
│   ├── contracts/                    # @alaska/contracts (Single Source of Truth com Zod 3.24)
│   │   ├── src/
│   │   │   ├── tenant/               # TenantSchema, 11 Temas, Horários, PixConfig, Reviews
│   │   │   ├── catalog/              # ProductSchema, Categories, OptionGroups
│   │   │   ├── order/                # CreateOrderSchema, OrderItem, Status, Delivery
│   │   │   ├── booking/              # CreateBookingSchema, Services, Professionals, Slots
│   │   │   ├── pix/                  # PixQrCodeRequest, PixQrCodeResponse, PixKey
│   │   │   └── common/               # AddressSchema, CepSchema, MoneyCentsSchema
│   │   └── tsup.config.ts            # Build híbrido ESM/CJS com .d.ts
│   │
│   └── tsconfig/                     # Configurações TypeScript base compartilhadas
│
├── package.json                      # Workspaces unificados
├── pnpm-workspace.yaml               # Definição de pacotes pnpm
└── turbo.json                        # Pipeline com cache de build, lint e testes
```

---

## 🚀 Como Iniciar

```bash
# 1. Instalar todas as dependências
pnpm install

# 2. Compilar o pacote de contratos compartilhados
pnpm --filter @alaska/contracts build

# 3. Executar em modo desenvolvimento
pnpm dev

# 4. Executar os testes unificados
pnpm test
```
