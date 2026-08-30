# AGENTS.md — Diretrizes de Backend NestJS 11 (`apps/api`)

> Este documento contém diretrizes específicas para o desenvolvimento no backend. Para a visão de arquitetura global do monorepo e regras de negócio, consulte o **[AGENTS.md mestre na raiz](../../AGENTS.md)**.

---

## 🧭 Invariantes de Backend

1. **Isolamento da Camada Core**: `src/core/domain/` e `src/core/application/` são 100% agnósticas de frameworks (zero decoradores `@Injectable()` ou referências a bancos no Core).
2. **Tratamento Monetário Estrito**: Use sempre o Value Object `Money` com centavos inteiros (`price_cents INT`). Nunca use ponto flutuante para dinheiro.
3. **Validação Zod**: Todos os DTOs de entrada devem ser validados via `ZodValidationPipe` contra schemas de `@alaska/contracts`.
4. **Injeção Desacoplada**: Repositórios e gateways devem ser injetados via `TOKENS` (`TOKENS.TENANT_REPOSITORY`, etc.).
5. **Testes**: Execute `pnpm test:api` para validar as suítes no Vitest com `InMemoryRepository`.
