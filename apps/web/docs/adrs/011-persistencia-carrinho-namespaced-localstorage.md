# ADR 011: Persistência de Carrinho com Namespacing no LocalStorage e Segurança SSR

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Composable `composables/useCart.ts`, Suíte `tests/units/cart.test.ts` e `tests/units/ssr-safety.test.ts`

---

## 1. Contexto & Problema

O Alaska Local adota o modelo **One Codebase, Infinite Domains**, permitindo servir centenas de lojas em uma única aplicação.

Se a sacola de compras utilizasse uma chave única no `localStorage` (ex: `"alaska_cart"`):
- Um cliente comprando em uma pizzaria (`slug: pizzaria-bella`) e depois visitando uma barbearia (`slug: barbearia-style`) veria pizzas na sacola da barbearia.
- Acesso ao objeto `localStorage` durante o Server-Side Rendering (SSR) do Nuxt causaria exceções de `ReferenceError: localStorage is not defined` e erros de *Hydration Mismatch*.

## 2. Decisão Arquitetural

Implementamos o gerenciamento de estado persistente do carrinho em `useCart.ts`:

### A. Chaves com Namespacing Dinâmico por Tenant
O composable aceita o tenant como referência reativa e computa a chave exclusiva de armazenamento:
```ts
const storageKey = computed(() => `alaska_cart_${tenantRef.value?.slug || 'default'}`)
```

### B. Guardas Defensivas de SSR (`import.meta.client`)
- A leitura inicial do `localStorage` e a gravação de alterações são executadas exclusivamente no cliente (`if (import.meta.client)`).
- Durante o SSR no servidor Node/Edge, o carrinho é inicializado com lista vazia previsível, prevenindo quebras de renderização.

### C. Normalização de Estrutura de Itens (Compatibilidade Legada e Futura)
Para suportar variações na estrutura de dados de opcionais e notas:
- Identificador único do item no carrinho: `${product.id}-${JSON.stringify(selectedOptions)}`.
- Acesso seguro via helpers: `item.options || item.selectedOptions || []` e `item.notes || item.observation || ''`.

## 3. Consequências & Benefícios

- **Isolamento Absoluto:** Cada loja possui sua sacola de compras totalmente independente.
- **Tolerância a Recarregamento:** O cliente não perde os itens selecionados caso atualize a página ou atenda uma ligação.
- **Compatibilidade Universal:** Funciona em qualquer navegador moderno com fallback gracioso em memória caso o armazenamento local esteja bloqueado.