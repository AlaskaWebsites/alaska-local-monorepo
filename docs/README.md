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
    ├── adrs/                              # Architectural Decision Records (001 a 009)
    ├── architecture/                      # Persistência PostgreSQL, Pix EMV e Erros RFC 7807
    └── commercial/                        # Estratégia de precificação e esteira DFY
```

---

## 🧭 Guias Rápidos por Domínio

### 🛡️ Governança & Segurança Monorepo
* **[Segurança e Isolamento Multi-Tenant](./architecture/seguranca-e-isolamento-multitenant.md)** — Namespacing por slug no navegador, Row Level Security (RLS) no PostgreSQL e autenticação por PIN.

### 🌐 Frontend & Experiência do Usuário
* **[ADR 018: Resiliência de Contratos de Props, Emissão Dual e Defesa Anti-Crash](./frontend/adrs/018-resiliencia-de-contratos-props-e-eventos-das-abas-admin.md)** — Padrão dual-prop, dual-emit, canais sociais (Instagram), pedido mínimo no checkout e flexbox balanceado.
* **[Protocolo de Despacho WhatsApp](./frontend/architecture/protocolo-despacho-whatsapp.md)** — Motor comercial de fechamento de vendas, mensagens determinísticas, delivery e agendamentos com upsell.
* **[Resiliência Visual e Placeholders SVG](./frontend/architecture/resiliencia-visual-e-imagens.md)** — Prevenção de erros 404, eliminação de CLS e geração de Data URIs vetoriais por tema.
* **[Design System & 11 Temas Cromáticos](./frontend/architecture/design-system-e-temas.md)** — Base Clara Suave (`bg-slate-50`), micro-animações táteis e 11 paletas temáticas.
* **[Busca Client-Side Zero Latência](./frontend/architecture/performance-e-resiliencia-frontend.md)** — Normalização Unicode NFD e filtragem instantânea sem requisições de rede.
* **[Guia de Criação de Novos Tenants](./frontend/operations/guia-criacao-novos-tenants.md)** — Checklist e validação via `pnpm validate:tenants`.

### ⚙️ Backend & Engenharia de Domínio
* **[ADR 008: Auto-População Resiliente no PostgreSQL e Tolerância a Cold-Start](./backend/adrs/008-auto-populacao-resiliente-catalogo-postgresql-e-cold-start.md)** — Seed resiliente de catálogo relacional e persistência otimista.
* **[ADR 009: Resiliência de Rotas de Catálogo, Disponibilidade e Fuso Horário](./backend/adrs/009-resiliencia-de-rotas-de-catalogo-disponibilidade-e-fuso-horario-brasilia.md)** — Tratamento polimórfico de disponibilidade, eliminação de 404 e sincronização no fuso oficial de Brasília (`America/Sao_Paulo`).
* **[Ciclo de Vida de Pedidos e Agendamentos](./backend/architecture/ciclo-pedidos-e-agendamentos.md)** — Máquinas de estados de `Order` e `Booking`, invariantes de domínio e rotas de status.
* **[Protocolo Pix BACEN EMV & LocalPixGateway](./backend/architecture/protocolo-pix-emv.md)** — Montagem TLV (Tags 00 a 63), CRC-16 CCITT e QR Code assíncrono.
* **[Tratamento de Erros & RFC 7807](./backend/architecture/tratamento-erros-e-rfc7807.md)** — Exceções puras de domínio e padronização HTTP Problem Details.
* **[Guia de Persistência PostgreSQL & Pooling](./backend/architecture/postgresql-persistence-guide.md)** — Auto-migration, auto-seed e pooling gerenciado via `pg.Pool`.
