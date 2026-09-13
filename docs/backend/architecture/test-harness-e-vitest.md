# 🧪 Estratégia de Testes Unitários com Vitest

O **Alaska Local Backend** (`@alaska/api`) adota uma suíte de testes unitários abrangente, determinística e veloz baseada em **Vitest** e **SWC** (`unplugin-swc`), garantindo execução completa em menos de 2 segundos sem dependência de containers Docker ou conexões externas.

---

## 🏛️ 1. Pirâmide de Testes e Estrutura Canônica

A suíte cobre 100% das camadas da Clean Architecture:

```
apps/api/tests/unit/
├── domain/                      # Regras Puras, Imutabilidade, VOs e Entidades
│   ├── money.vo.test.ts         # Cálculo monetário estrito em centavos inteiros
│   ├── pix-key.vo.test.ts       # Validação fail-fast de chaves Pix (CPF, CNPJ, Tel, UUID)
│   ├── address.vo.test.ts       # Validação de logradouro e formatação completa
│   ├── tenant.entity.test.ts    # Turnos de funcionamento (diurno e noturno) e status
│   ├── order.entity.test.ts     # Cálculo de totais, taxas de entrega e status de pedidos
│   ├── product.entity.test.ts   # Cálculo com opcionais, quantidade e validações fail-fast
│   └── booking.entity.test.ts   # Soma de duração, preços, status e sinal Pix
├── persistence/                 # Mapeamento e Isolamento de Dados
│   └── postgres-mappers.test.ts # Mapeamento bidirecional PostgreSQL Row <-> Entity
├── use-cases/                   # Orquestração da Lógica de Aplicação
│   ├── authenticate-merchant.use-case.test.ts  # Autenticação por PIN (1234 e hash SHA-256)
│   ├── calculate-pix-payload.use-case.test.ts  # Geração EMV BR Code e centavo de teste
│   ├── create-order.use-case.test.ts           # Checkout delivery/pickup, endereço e Pix
│   ├── get-tenant-by-slug.use-case.test.ts     # Resolução de tenant e tratativa de inativo
│   ├── resolve-tenant-by-domain.use-case.test.ts # Resolução por domínio próprio e subdomínio
│   ├── toggle-option-availability.use-case.test.ts # Pausa/ativação rápida de adicionais
│   ├── toggle-product-availability.use-case.test.ts # Pausa/ativação rápida de produtos (ADR 013)
│   ├── update-product.use-case.test.ts         # Edição de preço e dados de produto
│   └── update-tenant-hours.use-case.test.ts    # Grade de horários e pausa emergencial
├── gateways/                    # Adaptadores de Serviços Externos
│   └── local-pix.gateway.test.ts # Formatação TLV Banco Central, CRC-16 e QR Code DataURL
├── http/                        # Middlewares, Pipes e Guards
│   ├── zod-validation.pipe.test.ts # Validação de entrada fail-fast e BadRequestException
│   └── merchant-auth.guard.test.ts # Validação de token Bearer base64 e UnauthorizedException
├── security/                    # Criptografia e Segurança
│   └── simple-hasher.test.ts    # Geração de hash SHA-256 e comparação com salt
└── controllers/                 # Controladores HTTP
    └── health.controller.test.ts # Contrato do endpoint /health e monitoramento de uptime
```

---

## 📊 2. Matriz de Cobertura Completa por Camada

| Camada | Arquivo de Teste | Qtd. Testes | Escopo & Garantias |
| :--- | :--- | :---: | :--- |
| **Domínio (VO)** | `money.vo.test.ts` | 5 | Prevenção de bugs de float, imutabilidade, conversão e arredondamento seguro. |
| **Domínio (VO)** | `pix-key.vo.test.ts` | 3 | Validação regex de CPF, CNPJ, telefone, e-mail e chave aleatória UUID. |
| **Domínio (VO)** | `address.vo.test.ts` | 3 | Validação de rua, número e bairro obrigatórios, e formatação `formatFull()`. |
| **Domínio (Entity)** | `tenant.entity.test.ts` | 4 | Cálculo se a loja está aberta (`isOpen`) em turnos diurnos e noturnos (`18h às 03h`). |
| **Domínio (Entity)** | `order.entity.test.ts` | 2 | Cálculos de subtotal, taxa de entrega, troco em centavos e transição de status. |
| **Domínio (Entity)** | `product.entity.test.ts` | 4 | Cálculo de item com múltiplos opcionais, multiplicador de quantidade e fail-fast. |
| **Domínio (Entity)** | `booking.entity.test.ts` | 5 | Soma de duração acumulada, soma de preços, status do sinal Pix e confirmação. |
| **Persistência** | `postgres-mappers.test.ts` | 3 | Mapeamento relacional PostgreSQL -> Entidades de Domínio -> JSON DTO. |
| **Use Case** | `authenticate-merchant.use-case.test.ts` | 5 | Login PIN padrão 1234, validação hash SHA-256, recusa de PIN incorreto e sobrecargas. |
| **Use Case** | `calculate-pix-payload.use-case.test.ts` | 4 | Geração Copia e Cola EMV, modo sandbox D-0 (R$ 0,01) e validação de chave. |
| **Use Case** | `create-order.use-case.test.ts` | 5 | Pedidos delivery com frete, pickup sem frete, obrigatoriedade de endereço e código Pix. |
| **Use Case** | `get-tenant-by-slug.use-case.test.ts` | 2 | Busca determinística por slug, isolamento de inquilinos e erro 404 RFC 7807. |
| **Use Case** | `resolve-tenant-by-domain.use-case.test.ts` | 2 | Resolução de domínios próprios (`karinefinardi.com.br`) e subdomínios (`slug.alaska.app`). |
| **Use Case** | `toggle-option-availability.use-case.test.ts` | 4 | Pausa e reativação em nível de opcional (ex: "Bacon Extra") sem pausar o item principal. |
| **Use Case** | `toggle-product-availability.use-case.test.ts` | 3 | Ligar/desligar disponibilidade de produtos no painel do lojista (ADR 013). |
| **Use Case** | `update-product.use-case.test.ts` | 1 | Alteração de preço e dados descritivos com persistência. |
| **Use Case** | `update-tenant-hours.use-case.test.ts` | 1 | Atualização de grade semanal e pausa emergencial do estabelecimento. |
| **Gateway** | `local-pix.gateway.test.ts` | 4 | Montagem de tags TLV (00 a 63), checksum CRC-16 CCITT (0x1021) e sanitização NFD. |
| **HTTP (Pipes)** | `zod-validation.pipe.test.ts` | 3 | Validação fail-fast de DTOs, coerção de tipos Zod e lançamento de `BadRequestException`. |
| **HTTP (Guards)** | `merchant-auth.guard.test.ts` | 3 | Validação de token Bearer base64, injeção de sessão e `UnauthorizedException`. |
| **Segurança** | `simple-hasher.test.ts` | 3 | Hashing determinístico SHA-256 com salt e verificação segura de credenciais. |
| **Controlador** | `health.controller.test.ts` | 2 | Contrato do healthcheck de produção (`status: ok`, `service`, `timestamp`, `uptime`). |
| **TOTAL** | **22 Arquivos** | **71 Testes** | **100% Verde (Zero Flakiness)** |

---

## ⚡ 3. Execução dos Testes

```bash
# Rodar todos os testes unitários do backend via Turborepo
pnpm test:api

# Rodar a suíte completa de todos os workspaces (Contracts, Web e API)
pnpm test

# Executar com relatório de cobertura de código
pnpm --filter @alaska/api test:cov
```
