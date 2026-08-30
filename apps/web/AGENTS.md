# AGENTS.md — Diretrizes de Frontend Nuxt 3 (`apps/web`)

> Este documento contém diretrizes específicas para o desenvolvimento no frontend. Para a visão de arquitetura global do monorepo e regras de negócio, consulte o **[AGENTS.md mestre na raiz](../../AGENTS.md)**.

---

## 🧭 Invariantes de Frontend

1. **Acessibilidade W3C / WCAG**: Modais com `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco inicial, atalho `Escape` e `useBodyScrollLock`.
2. **Segurança SSR**: Nunca acesse `.length` sem fallback (`v-if="(items?.length || 0) > 0"`).
3. **Resiliência de Imagens**: Anexe sempre `@error="handleImageError($event, tenant?.theme)"` e use SVGs de fallback.
4. **Contratos**: Importe tipos canônicos de `@alaska/contracts` (ou `~/types`).
5. **Testes**: Execute `pnpm test:web` para validar as 22 suítes no Vitest.
