# ADR 011: Persistência Real de Especialistas e Bloqueio de Agenda no PostgreSQL com Clean Architecture

- **Status:** Aceito / Implementado
- **Data:** 2026-09-17
- **Contexto:** `apps/api/src/infrastructure/http/controllers/professional.controller.ts`, `packages/contracts/src/booking/index.ts`, `apps/web/composables/useMerchantAdmin.ts`
- **Referência:** ADR 001 (Clean Architecture), ADR 003 (PostgreSQL RLS), ADR 006 (Persistência PostgreSQL), ADR 010 (Persistência de Produtos), ADR 013 (Painel do Lojista), ADR 014 (@alaska/contracts)

---

## 1. Contexto & Problema

No ecossistema **Alaska Local**, os estabelecimentos das verticais **Alaska Hub** (barbearias, salões de beleza, estúdios de tatuagem) e **Alaska Pro** (clínicas médicas, dentistas, psicólogos) dependem criticamente da gestão de profissionais (especialistas) e do bloqueio de horários de agenda.

Anteriormente:
1. **Volatilidade no LocalStorage**: O cadastro de novos profissionais (`createProfessional`), a exclusão (`deleteProfessional`), a definição de escala semanal (`availableDays`), horários de expediente (`workHours`), intervalo de almoço (`lunchBreak`) e bloqueio de slots (`blockedSlots`) eram gravados exclusivamente no `localStorage` do navegador sob a chave `alaska_overrides_<slug>`.
2. **Desconexão com o Cliente Final**: Clientes acessando a vitrine ou o modal de agendamento (`BookingModal.vue` / `useBookingSlots.ts`) a partir de seus próprios celulares não visualizavam os especialistas recém-cadastrados nem os horários que o lojista havia bloqueado.
3. **Ausência de Endpoints Canônicos**: O backend NestJS gerenciava apenas a tabela de agendamentos (`bookings`), sem endpoints dedicados para persistência e gestão do ciclo de vida dos profissionais e slots bloqueados.

---

## 2. Decisão Arquitetural: Persistência Relacional em 3 Camadas

Adotamos a **Persistência Real no PostgreSQL (Render)** para profissionais e bloqueios de agenda, seguindo estritamente a Clean Architecture (Ports & Adapters) e isolamento multi-tenant:

```
┌────────────────────────────────────────────────────────┐
│             CAMADA 1: REATIVIDADE NA UI                │
│  Feedback instantâneo (< 50ms) com useHaptic e toasts  │
├────────────────────────────────────────────────────────┤
│             CAMADA 2: CACHE OTIMISTA                   │
│  LocalStorage (alaska_overrides_<slug>) para offline   │
├────────────────────────────────────────────────────────┤
│             CAMADA 3: PERSISTÊNCIA REAL NO BACKEND     │
│  API NestJS + PostgreSQL no Render (ADR 011)           │
└────────────────────────────────────────────────────────┘
```

### A. Modelagem Relacional no PostgreSQL

Duas novas tabelas relacionais com integridade referencial ao `tenants`:

```sql
-- 1. Tabela de Especialistas / Profissionais
CREATE TABLE IF NOT EXISTS professionals (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Profissional',
    avatar TEXT,
    available_days JSONB DEFAULT '[1, 2, 3, 4, 5]',
    work_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}',
    lunch_break JSONB DEFAULT '{"start": "12:00", "end": "13:00", "enabled": true}',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Bloqueio de Horários / Slots
CREATE TABLE IF NOT EXISTS blocked_slots (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(10) NOT NULL,
    reason TEXT DEFAULT 'Horário Bloqueado pelo Lojista',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, slot_date, slot_time)
);

-- Row Level Security
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
```

### B. Endpoints Canônicos na API NestJS
- `POST /api/v1/tenants/:slug/professionals`: Cadastra novo profissional no tenant.
- `DELETE /api/v1/tenants/:slug/professionals/:profId`: Exclui profissional do catálogo.
- `PATCH /api/v1/tenants/:slug/professionals/:profId`: Atualiza expediente, almoço, escala semanal e cargo.
- `PATCH /api/v1/tenants/:slug/professionals/:profId/availability`: Pausa ou ativa o especialista.
- `GET /api/v1/tenants/:slug/professionals`: Lista profissionais do estabelecimento.
- `POST /api/v1/tenants/:slug/slots/toggle`: Alterna bloqueio de slot na data/hora especificada.
- `GET /api/v1/tenants/:slug/slots/blocked`: Lista horários bloqueados da loja.

---

## 3. Consequências & Garantias

1. **Sincronização em Tempo Real com Clientes**: Horários bloqueados pelo lojista somem instantaneamente do seletor de agendamentos no celular do cliente (`useBookingSlots.ts`), prevenindo agendamentos duplicados (*Double Booking*).
2. **Escala Preservada**: Alterações nos dias de atendimento, horários de expediente e intervalo de almoço persistem no banco de dados, imunes a limpezas de cache do navegador.
3. **Living Docs & Contratos Zod**: Todos os DTOs utilizam schemas estritos em `@alaska/contracts/booking` com validação Fail-Fast no `ZodValidationPipe`.
