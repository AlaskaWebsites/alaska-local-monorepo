# Roadmap Arquitetural & Evolução Técnica — Ecossistema Alaska Local

> **Status:** Estágio 2 (Persistência PostgreSQL Concluída — Próximo: Painel do Lojista)  
> **Versão:** 1.1.0  
> **Data de Atualização:** 2026-08-29  

---

## 🗺️ Visão Geral dos Estágios de Maturidade

```
┌───────────────────────────────────────────────────────────────────┐
│ ✅ ESTÁGIO 1: Validação, Tração Inicial & MVP Pronto (CONCLUÍDO)   │
│ • Frontend Nuxt 3 (SSR + Nitro + Tailwind CSS + Lucide Icons)     │
│ • One Codebase, Infinite Domains (Wildcard & Custom Domains)      │
│ • 4 Verticais Canônicas: Alaska Menu, Shop, Hub e Pro             │
│ • Busca em Tempo Real Client-Side com Normalização Unicode NFD    │
│ • Autopreenchimento de Endereço via CEP (ViaCEP)                  │
│ • Sacola Persistente por Tenant com LocalStorage Namespacing       │
│ • Módulo de Agendamento de Serviços & Venda Híbrida               │
│ • Pagamentos Pix BR Code EMV, CRC-16, Modo Teste R$ 0,01 & Sinal  │
│ • Resiliência de Imagens com Fallbacks SVG Dinâmicos por Tema     │
│ • Acessibilidade Total W3C/WCAG 2.1 AA (BodyScrollLock, ESC)      │
│ • Backend Core NestJS 11 + Clean Architecture + Zod + Vitest      │
│ • 100% de Cobertura de Testes Unitários no Vitest                 │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ 🚀 ESTÁGIO 2: Painel do Lojista, Persistência PostgreSQL & Automação│
│ • [x] Persistência PostgreSQL com Pooling & RLS no Backend         │
│ • [x] Integração useApiClient API-First no Frontend Nuxt 3        │
│ • [ ] Painel Administrativo Nuxt Admin para Lojistas (Pausar itens)│
│ • [ ] Autenticação JWT e RBAC por Tenant                          │
│ • [ ] Webhooks Asaas (Pix D+0) e Filas Assíncronas com BullMQ/Redis│
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ 🌐 ESTÁGIO 3: Micro-SaaS, Escala & Hardware Local (15+ Clientes)  │
│ • Impressão Térmica ESC/POS (58mm/80mm) via Web Bluetooth / USB   │
│ • Agendamento Sincronizado ao Google Calendar API                 │
│ • Pipeline de Agentes de IA Autônomos (OCR de Cardápios & Leads)  │
│ • PWA Offline com Service Workers                                 │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🏆 Entregas Recentes

### Estágio 2 — Marco 1: Persistência & Integração API-First (Concluído)
- [x] **Persistência Relacional com PostgreSQL & Docker:**
  - Repositórios `PostgresTenantRepository`, `PostgresOrderRepository` e `PostgresBookingRepository` conectados via `pg.Pool`.
  - Mappers puros de Domínio $\leftrightarrow$ Banco de Dados (`TenantMapper`, `OrderMapper`, `BookingMapper`).
  - Suporte a multi-tenancy com Row Level Security (RLS) via variável de sessão `app.current_tenant_id`.
  - Documentado na **ADR 006** do backend e **ADR 013** do frontend.
- [x] **Cliente HTTP Resiliente no Frontend (`composables/useApiClient.ts`):**
  - Métodos tipados para consulta de tenants, resolução de domínios, geração de Pix EMV, persistência de pedidos e agendamentos.
  - Suíte de testes em `tests/units/api-client.test.ts`.

---

## 🎯 Próximo Foco: Estágio 2 — Marco 2 (Painel do Lojista / Nuxt Admin)

1. Interface mobile-first simplificada para o comerciante pausar produtos esgotados, alterar preços e atualizar horários.
2. Autenticação JWT leve e proteção de rotas administrativas por tenant.
3. Conexão do painel aos endpoints REST do backend.
