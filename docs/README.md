# 📚 Alaska Local — Documentação Oficial do Ecossistema

Bem-vindo à base documental unificada do ecossistema **Alaska Local**. Este repositório centraliza os padrões de arquitetura, contratos de dados, decisões técnicas (ADRs) e regras de negócio que governam todas as quatro verticais da plataforma:

* 🍔 **Alaska Menu**: Food service, pizzarias, hamburguerias, adegas e distribuidoras.
* 👗 **Alaska Shop**: Boutiques de moda, semijoias, cosméticos e calçados.
* 💈 **Alaska Hub**: Barbearias, salões de beleza, nail design e estética.
* 🦷 **Alaska Pro**: Consultórios odontológicos, clínicas médicas e profissionais liberais.

---

## 🏛️ Estrutura da Documentação

```
docs/
├── README.md                              # Índice mestre unificado
├── architecture/                          # Arquitetura transacional e cross-cutting
│   └── seguranca-e-isolamento-multitenant.md # Isolamento multi-tenant (Browser & PostgreSQL RLS)
│
├── frontend/                              # Documentação do Front-end (Nuxt 3)
│   ├── README.md                          # Visão geral do Nuxt 3 e ecossistema web
│   ├── adrs/                              # Architectural Decision Records (001 a 018)
│   ├── architecture/                      # Guias de design system, performance e WhatsApp
│   ├── commercial/                        # Propostas comerciais, scripts e fechamento
│   ├── operations/                        # Manuais operacionais e cadastro de tenants
│   └── prompts/                           # Prompts de engenharia e branding
│
└── backend/                               # Documentação do Back-end (NestJS 11)
    ├── README.md                          # Visão geral da API, endpoints e Clean Architecture
    ├── ARCHITECTURE.md                    # Diagramas de camadas e Ports & Adapters
    ├── adrs/                              # Architectural Decision Records (001 a 008)
    ├── architecture/                      # Persistência PostgreSQL, Pix EMV e Erros RFC 7807
    └── commercial/                        # Estratégia de precificação e esteira DFY
```

---

## 📐 Guias Especializados de Arquitetura

### 🌐 Integração Client-Server & Segurança
* **[Guia Mestre de Integração Client-Server](./frontend/architecture/integracao-client-server.md)** — Topologia Vercel ↔ Render, mutações otimistas em 3 camadas, `useApiClient`, fallback de zero downtime e contratos `@alaska/contracts`.
* **[Segurança e Isolamento Multi-Tenant](./architecture/seguranca-e-isolamento-multitenant.md)** — Namespacing por slug no navegador, Row Level Security (RLS) no PostgreSQL e autenticação por PIN.

### 🌐 Frontend & Experiência do Usuário
* **[ADR 018: Resiliência de Contratos de Props e Eventos no Admin](./frontend/adrs/018-resiliencia-de-contratos-props-e-eventos-das-abas-admin.md)** — Padrão dual-prop, dual-emit e defesa anti-crash nas abas operacionais.
* **[Protocolo de Despacho WhatsApp](./frontend/architecture/protocolo-despacho-whatsapp.md)** — Motor comercial de fechamento de vendas, mensagens determinísticas, delivery e agendamentos com upsell.
* **[Resiliência Visual e Placeholders SVG](./frontend/architecture/resiliencia-visual-e-imagens.md)** — Prevenção de erros 404, eliminação de CLS e geração de Data URIs vetoriais por tema.
* **[Design System & 11 Temas Cromáticos](./frontend/architecture/design-system-e-temas.md)** — Base Clara Suave (`bg-slate-50`), micro-animações táteis e 11 paletas temáticas.
* **[Módulo de Agendamentos & Serviços](./frontend/architecture/modulo-agendamento-e-servicos.md)** — Extração dinâmica, validação estrita no Passo 3, prevenção de horário fantasma e sinal Pix.
* **[Performance, Resiliência & Integração SSR](./frontend/architecture/performance-e-resiliencia-frontend.md)** — Cache reativo com `useState`, deduplicação em voo, `useShare` e middleware Nitro.
* **[Padrões de Acessibilidade W3C / WCAG](./frontend/architecture/padroes-de-acessibilidade-e-ux.md)** — Modais com `role="dialog"`, `aria-modal="true"`, focus trap e `useBodyScrollLock`.
* **[Categorias Canônicas de Negócio](./frontend/architecture/categorias-de-negocio.md)** — As 4 verticais: Menu, Shop, Hub e Pro.
* **[Guia de Criação de Novos Tenants](./frontend/operations/guia-criacao-novos-tenants.md)** — Checklist e validação via `pnpm validate:tenants`.

### ⚙️ Backend & Engenharia de Domínio
* **[ADR 008: Auto-População Resiliente no PostgreSQL e Tolerância a Cold-Start](./backend/adrs/008-auto-populacao-resiliente-catalogo-postgresql-e-cold-start.md)** — Seed resiliente de catálogo relacional e persistência otimista.
* **[Ciclo de Vida de Pedidos e Agendamentos](./backend/architecture/ciclo-pedidos-e-agendamentos.md)** — Máquinas de estados de `Order` e `Booking`, invariantes de domínio e rotas de status.
* **[Protocolo Pix BACEN EMV & LocalPixGateway](./backend/architecture/protocolo-pix-emv.md)** — Montagem TLV (Tags 00 a 63), CRC-16 CCITT e QR Code assíncrono.
* **[Tratamento de Erros & RFC 7807](./backend/architecture/tratamento-erros-e-rfc7807.md)** — Exceções puras de domínio e padronização HTTP Problem Details.
* **[Guia de Persistência PostgreSQL & Pooling](./backend/architecture/postgresql-persistence-guide.md)** — Auto-migration, auto-seed e pooling gerenciado via `pg.Pool`.
