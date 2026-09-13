# ADR 004: Filas Assíncronas com BullMQ e Redis (Roadmap)

- **Status:** Proposta / Backlog (Roadmap Futuro)
- **Data:** 2026-08-28 (Atualizado em 2026-09-13)
- **Contexto:** Especificação arquitetural para processamento em background assíncrono (Webhooks pesados, jobs batch e disparo de mensagens em lote)

---

## 1. Contexto & Problema

Operações do backend variam amplamente em tempo de execução:
1. **Requisições Síncronas (Rápidas - < 50ms):** Consulta de cardápio, resolução de domínios, autenticação via PIN, mutações otimistas de produtos e cálculo de status aberto/fechado.
2. **Tarefas Assíncronas Futuras (Pesadas - 500ms a 10s+):** Processamento em lote de webhooks financeiros do Asaas, pipelines pesados de OCR e disparos em massa no WhatsApp.

## 2. Decisão Arquitetural & Estado Atual

### Estado Atual no Runtime (`apps/api`):
* No estágio atual, a API NestJS opera de forma **stateless, síncrona e ultrarrápida** conectada diretamente ao PostgreSQL com pool de conexões (`pg.Pool`).
* Não há acoplamento de `bullmq` ou `ioredis` nas dependências de produção do `apps/api/package.json`, mantendo o container de produção leve (consumindo < 80MB de RAM) e eliminando a necessidade de manter uma instância de Redis no deploy do Render (`render.yaml`).

### Especificação para Ativação Futura:
Quando o volume de transações e webhooks exigir desacoplamento de workers:
1. **Adicionar dependências:** `pnpm --filter @alaska/api add bullmq ioredis`.
2. **Provisionar Redis:** Adicionar container Redis ao `render.yaml` e `docker-compose.yml`.
3. **Módulo de Fila:** Implementar `QueueModule` em `src/infrastructure/modules/queue.module.ts` consumindo a porta `IPaymentWebhookQueue` e `INotificationQueue`.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Webhook / Event │ ───►  │ BullMQ Queue    │ ───►  │ Worker          │
│ (Asaas / Batch) │       │ (Redis AOF)     │       │ (Job Processor) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Retry com       │
                          │ Backoff Exp.    │
                          └─────────────────┘
```

## 3. Consequências

- **Fase Atual:** Menor consumo de recursos, menor custo de infraestrutura no Render e deploy simplificado de container único com PostgreSQL.
- **Fase Futura:** Caminho arquitetural documentado para escalar workers independentes sem alterar as entidades de domínio.
