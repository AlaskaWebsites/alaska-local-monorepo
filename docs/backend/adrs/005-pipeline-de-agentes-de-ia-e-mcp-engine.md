# ADR 005: Pipeline de Agentes de IA e Integração via Model Context Protocol (MCP)

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Módulo `src/infrastructure/ai/`, Agentes Autônomos de Cardápio, Co-piloto WhatsApp e Prospecção

---

## 1. Contexto & Problema

O modelo de negócio **Done-for-You (DFY)** do Alaska Local depende de velocidade extrema de onboarding:
- Criar a demonstração completa de uma loja em menos de 10 minutos a partir de fotos de cardápios impressos ou feeds do Instagram.
- Atender clientes no WhatsApp tirando dúvidas sobre produtos, estoque e agendamentos.

Processamento manual é lento e caro. Por outro lado, conectar LLMs diretamente sem blindagem gera alucinações de preços, formatos inválidos e quebra de contratos.

## 2. Decisão Arquitetural

Implementamos um pipeline de **Agentes Autônomos de IA com Structured Outputs Zod e Model Context Protocol (MCP)**:

```
┌─────────────────────────────────────────────────────────────┐
│                 PIPELINE DE AGENTES DE IA                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Agente OCR Vision│  │ Agente Co-piloto │  │ Agente Lead      │
│ (Cardápio -> Zod)│  │ (WhatsApp / MCP) │  │ (Maps Prospector)│
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### A. Agente 1: Extração Visual de Cardápios & Catálogos (OCR Vision)
1. Recebe imagem (foto de cardápio físico, panfleto ou print do Instagram).
2. Processa via modelo multimodal (Gemini / Anthropic) solicitando schema estruturado `TenantSchema` em JSON.
3. Valida a saída estritamente com `TenantSchema.parse()`. Se inválido, executa auto-correção imediata.

### B. Agente 2: Co-piloto de Atendimento WhatsApp (MCP Tools)
- Expõe ferramentas no protocolo MCP: `consultar_cardapio`, `verificar_horario`, `calcular_frete`, `gerar_pix_payload`, `buscar_slots_agendamento`.
- O agente atua como recepcionista inteligente do lojista no WhatsApp, respondendo com precisão matemática.

### C. Agente 3: Prospecção e Geração de Demos (Showcase Engine)
- Coleta dados públicos de estabelecimentos locais e gera os JSONs para abordagem consultiva comercial.

## 3. Consequências & Benefícios

- **Zero Alucinação de Formatos:** O schema Zod garante que a IA nunca gere um JSON que quebre o front-end.
- **Onboarding de 3 Minutos:** Cardápios impressos complexos viram lojas digitais prontas em segundos.
