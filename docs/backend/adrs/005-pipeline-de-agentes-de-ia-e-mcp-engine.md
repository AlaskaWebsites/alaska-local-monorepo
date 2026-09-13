# ADR 005: Pipeline de Agentes de IA e Integração via Model Context Protocol (MCP)

- **Status:** Proposta / Especificação de Roadmap (AI Engine)
- **Data:** 2026-08-28 (Atualizado em 2026-09-13)
- **Contexto:** Especificação para agentes autônomos de cardápio, extração visual OCR e co-piloto conversacional

---

## 1. Contexto & Problema

O modelo de negócio **Done-for-You (DFY)** do Alaska Local prevê extrema agilidade no onboarding de novos lojistas:
- Gerar vitrines e cardápios completos a partir de imagens de panfletos, cardápios impressos ou prints do Instagram.
- Fornecer co-piloto conversacional para responder dúvidas de clientes sobre cardápio e agendamento.

## 2. Decisão Arquitetural & Estado Atual

### Estado Atual no Monorepo:
* As ferramentas de geração de demos e suporte a lojistas operam como **ferramental externo, scripts CLI e skills de agentes** (ex: scripts em `apps/web/scripts/` e agentes MCP auxiliares).
* O runtime da API (`apps/api`) **não possui dependências pesadas de LLMs ou bibliotecas de visão computacional** (`@google/genai`, OpenAI, LangChain ou Tesseract), mantendo o build e o boot do NestJS enxutos e determinísticos.

### Especificação do Pipeline Conceitual:
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

1. **Agente OCR Vision:** Extração multimodal de cardápios para o schema canônico `@alaska/contracts/catalog`.
2. **Co-piloto WhatsApp (MCP Tools):** Exposição de endpoints de leitura (`consultar_cardapio`, `verificar_horario`) para consumo por agentes de chat.
3. **Showcase Engine:** Script CLI de geração automatizada de vitrines demo.

## 3. Consequências

- **Fase Atual:** Zero sobrecarga no runtime do backend, sem custos de API de LLMs embutidos no servidor web principal.
- **Fase Futura:** Integração com MCP Server como serviço desacoplado da API central.
