# ADR 010: Motor de Busca Client-Side Zero Latência e Normalização Unicode

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Composable `composables/useProductSearch.ts`, Componente `components/ProductSearchInput.vue`, Suíte `tests/units/product-search.spec.ts`

---

## 1. Contexto & Problema

Em catálogos digitais mobile-first, a busca é a funcionalidade mais utilizada por clientes com intenção clara de compra.

Abordagens tradicionais de busca via API no servidor introduzem:
- Latência de rede (200ms a 800ms por caractere).
- Necessidade de debouncing agressivo para poupar backend.
- Erros de pesquisa quando o usuário não digita acentos (ex: pesquisar "pao de alho" vs "Pão de Alho").

## 2. Decisão Arquitetural

Implementamos em `useProductSearch.ts` um motor de busca puramente client-side, reativo e com normalização de diacríticos:

### A. Normalização Unicode NFD
Função de sanitização de strings:
```ts
export function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
```
Isso assegura que `"acai"`, `"Açaí"`, `"ACAI"` e `"açai"` resultem na mesma chave canônica `"acai"`.

### B. Filtragem Hierárquica em Tempo Real
A busca varre simultaneamente:
- Nome do produto
- Descrição do produto
- Nome dos grupos de opcionais / adicionais

As categorias que não contêm nenhum item correspondente são removidas reativamente da árvore, mantendo a tela organizada e sem seções vazias.

### C. Estados de Busca & Micro-Interações
O composable expõe estados reativos completos:
- `isSearching`: Indica se há texto no input de busca.
- `hasResults`: Indica se ao menos um produto foi encontrado.
- `totalResultsCount`: Quantidade exata de itens encontrados para feedback ao usuário.
- `clearSearch`: Função de reset rápido com 1 toque.

## 3. Consequências & Benefícios

- **Latência Zero (0ms):** Resposta imediata a cada tecla pressionada.
- **Funcionamento Offline:** A busca opera perfeitamente mesmo se o cliente perder conexão temporariamente durante a navegação.
- **Economia de Recursos:** Zero carga e custo de requisições de busca no servidor.