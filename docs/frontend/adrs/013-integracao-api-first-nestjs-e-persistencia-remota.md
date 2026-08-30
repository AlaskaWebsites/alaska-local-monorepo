# ADR 013: Integração Híbrida API-First com NestJS Backend e Persistência Remota

- **Status:** Aceito / Implementado
- **Data:** 2026-08-29
- **Contexto:** Módulo `composables/useApiClient.ts`, `composables/useTenant.ts`, `nuxt.config.ts`, Integração Front/Back

---

## 1. Contexto & Problema

Durante a Fase 1 (Validação e Tração Inicial), o front-end do Alaska Local operava exclusivamente com catálogos estáticos em formato JSON (`~/data/*.json`) carregados via `import.meta.glob`.

Com o início do **Estágio 2 (6 a 15 Clientes)** e o lançamento do `alaska-local-backend` em NestJS 11 com persistência PostgreSQL:
1. Os pedidos realizados pelos clientes precisam ser registrados em banco de dados (`POST /api/v1/orders`).
2. Os agendamentos de serviços nas verticais Alaska Hub e Alaska Pro precisam ser persistidos (`POST /api/v1/bookings`).
3. O catálogo, horários e dados de estabelecimentos devem ser consumidos da API centralizada em nuvem, mantendo o fallback local para que as demonstrações continuem funcionando mesmo offline ou sem backend.

## 2. Decisão Arquitetural

Adotamos a **Estratégia Híbrida API-First com Fallback Gracioso**:

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND NUXT 3 (CLIENT)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
   [ 1. Tenta API NestJS ]       [ 2. Fallback JSON Local ]
   (http://localhost:3333/api/v1)  (~/data/*.json)
                │                             │
       (Se API responder)             (Se timeout/offline)
                ▼                             ▼
       [ TenantSchema.parse ]        [ TenantSchema.parse ]
                │                             │
                └──────────────┬──────────────┘
                               ▼
                    [ Renderização da Vitrine ]
```

### A. Cliente HTTP Tipado (`composables/useApiClient.ts`)
Criamos um composable centralizado que encapsula as chamadas à API com validação rigorosa via Zod:
* `fetchTenantBySlug(slug)`: Busca dados do tenant, tema e catálogo completo.
* `resolveTenantByDomain(host)`: Resolução dinâmica por domínio próprio ou subdomínio.
* `generatePixBrCode(params)`: Geração do payload Copia e Cola EMV com CRC-16 no backend.
* `createOrder(input)`: Persistência de pedidos com cálculo de frete e status.
* `createBooking(input)`: Persistência de agendamentos com cálculo de duração e profissionais.

### B. Fallback Transparente em `useTenant.ts`
O composable `useTenant` tenta consultar o endpoint `/tenants/:slug` da API. Se a API estiver offline ou o backend não estiver rodando, ele automaticamente carrega o arquivo JSON local sem quebrar a experiência do usuário.

### C. Harness de Testes Unitários
Adicionamos suíte de testes em `tests/units/api-client.test.ts` validando os contratos de DTOs e compatibilidade de schemas.

## 3. Consequências & Benefícios

- **Resiliência Total:** As demos em reuniões comerciais funcionam 100% mesmo sem internet ou sem backend ativo.
- **Transição Suave para Produção:** Quando o backend em Docker/Supabase é iniciado, o frontend consome automaticamente os dados reais em tempo real.
- **Tipagem End-to-End:** Os mesmos schemas Zod garantem a integridade entre o cliente Nuxt 3 e a API NestJS.
