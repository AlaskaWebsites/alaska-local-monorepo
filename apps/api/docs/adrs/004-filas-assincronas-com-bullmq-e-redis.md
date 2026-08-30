# ADR 004: Filas Assíncronas com BullMQ e Redis

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Módulo de Processamento em Background, Webhooks Asaas, Notificações WhatsApp, OCR de Cardápios

---

## 1. Contexto & Problema

Operações do backend variam amplamente em tempo de execução:
1. **Requisições Síncronas (Rápidas - < 50ms):** Consulta de cardápio, resolução de domínios e cálculo de status aberto/fechado.
2. **Tarefas Assíncronas (Pesadas - 500ms a 10s+):** Processamento de webhooks financeiros do Asaas, OCR de fotos de cardápios com IA, envio de notificações no WhatsApp e geração de relatórios.

Executar tarefas pesadas no ciclo síncrono da requisição HTTP causaria timeouts, travamento do Event Loop e perda de eventos em caso de picos de tráfego.

## 2. Decisão Arquitetural

Adotamos **BullMQ + Redis** para gerenciamento de filas assíncronas com garantia de entrega:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Webhook / Event │ ───►  │ BullMQ Queue    │ ───►  │ Worker          │
│ (Asaas / Upload)│       │ (Redis AOF)     │       │ (Job Processor) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Retry com       │
                          │ Backoff Exp.    │
                          └─────────────────┘
```

### A. Filas Canônicas do Sistema
1. `queue:webhooks-asaas`: Processamento idempotente de notificações de pagamento Pix D+0.
2. `queue:ai-ocr-extraction`: Fila de processamento de imagens e extração de produtos com LLMs.
3. `queue:notifications`: Fila de disparo de mensagens transacionais no WhatsApp.

### B. Políticas de Resiliência
- **Retries com Backoff Exponencial:** 3 a 5 tentativas automáticas em caso de instabilidade na API externa.
- **Dead Letter Queue (DLQ):** Mensagens que falharem após todas as tentativas são isoladas para inspeção.

## 3. Consequências & Benefícios

- **Zero Perda de Webhooks:** O endpoint do Asaas responde HTTP 200 em < 20ms e enfileira o processamento.
- **Escalabilidade Horizontal:** Workers de IA podem ser escalados independentemente dos servidores de API.
