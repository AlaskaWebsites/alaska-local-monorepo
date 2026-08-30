# ⚙️ Documentação de Backend — Alaska Local (NestJS 11)

Este diretório contém os guias técnicos e padrões de arquitetura do backend em **NestJS 11**, desenvolvido com **Clean Architecture (Ports & Adapters)** e **PostgreSQL com RLS**.

---

## 📑 Guias Disponíveis

1. **[Guia de Clean Architecture & DDD](./clean-architecture-guide.md)**: Isolamento estrito da camada `core`, Value Object `Money` (em centavos inteiros imutáveis) e injeção por tokens.
2. **[Padrões de Validação com Zod](./zod-validation-patterns.md)**: Validação Fail-Fast nos controladores com `ZodValidationPipe`.
3. **[Pipeline de Agentes de IA & MCP](./ai-agents-pipeline.md)**: Arquitetura de ingestão de cardápios via OCR e provisionamento autônomo.
4. **[Estratégia de Testes no Vitest](./estrategia-de-testes-e-qualidade.md)**: Test Harness desacoplado com `InMemoryRepository`.
