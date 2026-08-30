# 📚 Documentação Técnica — Alaska Local Backend & AI Engine

Bem-vindo à documentação técnica oficial do backend do ecossistema **Alaska Local**. Este documento e seus subguias estabelecem os padrões de engenharia, decisões de arquitetura (ADRs), modelagem de dados, validação de contratos e pipelines de inteligência artificial.

---

## 🏛️ Registros de Decisões de Arquitetura (ADRs)

Os ADRs documentam o contexto, as alternativas avaliadas e as decisões estruturais do projeto:

- [ADR 001: Clean Architecture (Ports & Adapters) e Isolamento do Core](./adrs/001-clean-architecture-e-ports-and-adapters.md) — Separação estrita entre regras de negócio puras (sem decorators) e adaptadores de infraestrutura.
- [ADR 002: Validação Fail-Fast com Zod e Pipes Customizados](./adrs/002-validacao-fail-fast-com-zod-e-pipes-customizados.md) — Validação de DTOs, variáveis de ambiente e outputs de LLM sem class-validator.
- [ADR 003: Multi-Tenancy e Segurança com PostgreSQL Row Level Security (RLS)](./adrs/003-multi-tenancy-e-supabase-postgresql-rls.md) — Isolamento estrito de dados por `tenant_id` em banco relacional.
- [ADR 004: Filas Assíncronas com BullMQ e Redis](./adrs/004-filas-assincronas-com-bullmq-e-redis.md) — Processamento de background jobs, webhooks Asaas, OCR de cardápios e disparo de mensagens.
- [ADR 005: Pipeline de Agentes de IA e Integração via Model Context Protocol (MCP)](./adrs/005-pipeline-de-agentes-de-ia-e-mcp-engine.md) — Agentes de extração visual, co-piloto de atendimento WhatsApp e prospecção de leads.
- [ADR 006: Camada de Persistência PostgreSQL, Connection Pooling e Mappers de Domínio](./adrs/006-camada-de-persistencia-postgresql-e-pooling.md) — Driver nativo `pg`, pool de conexões, suporte a RLS e mapeadores puros de domínio.

---

## 📐 Guias de Arquitetura & Engenharia

- [Guia Prático de Clean Architecture no NestJS 11](./architecture/clean-architecture-guide.md) — Padrão de injeção de dependência via Symbols, Custom Providers e Value Objects.
- [Padrões de Validação com Zod](./architecture/zod-validation-patterns.md) — Schemas, inferência de tipos TypeScript, tratamento de erros e formatação JSON.
- [Guia de Persistência PostgreSQL & Docker](./architecture/postgresql-persistence-guide.md) — Schema DDL, Docker Compose, pooling e suporte a Supabase.
- [Pipeline e Engenharia de Agentes de IA](./architecture/ai-agents-pipeline.md) — Arquitetura de OCR visual para cardápios, structured outputs e ferramentas MCP.
- [Estratégia de Testes Unitários com Vitest](./architecture/test-harness-e-vitest.md) — Configuração com unplugin-swc, mocks in-memory e pirâmide de testes.
