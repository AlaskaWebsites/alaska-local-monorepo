# ADR 026: Criação Dinâmica de Categorias no Painel do Lojista e Sincronização em Tempo Real no Catálogo

- **Status:** Aceito / Implementado
- **Data:** 2026-10-03
- **Contexto:** `apps/web/components/admin/modals/AdminCreateCategoryModal.vue`, `apps/web/components/admin/tabs/AdminCatalogTab.vue`, `apps/web/components/admin/modals/AdminCreateProductModal.vue`, `apps/web/composables/useMerchantAdmin.ts`, `apps/web/pages/[slug]/admin.vue`, `apps/web/pages/[slug]/index.vue`
- **Referência:** ADR 010 (Persistência Real de Catálogo), ADR 013 (Painel do Lojista), ADR 014 (Turborepo e @alaska/contracts), ADR 017 (Design System Claro Suave e Temas Dinâmicos), ADR 018 (Resiliência de Contratos e Props das Abas Admin)

---

## 1. Contexto & Motivação

No Painel do Lojista da Alaska Local (`/[slug]/admin`), os lojistas já contavam com a possibilidade de cadastrar novos produtos e serviços dinamicamente (`AdminCreateProductModal.vue`) e gerenciar disponibilidades e preços em tempo real (`AdminCatalogTab.vue`).

Contudo, a estrutura de **categorias** permanecia atrelada exclusivamente ao schema estático do estabelecimento (`data/<slug>.json`), limitando o lojista a vincular novos itens apenas a categorias pré-existentes. Quando o lojista expande o mix de produtos (por exemplo, uma adega introduzindo "Petiscos Especiais" ou uma barbearia lançando "Estética Capilar"), tornava-se imperativo criar seções sob demanda diretamente pelo celular, com latência imperceptível (< 50ms) e sem necessidade de deploy.

---

## 2. Decisão Técnica e Arquitetura

Implementamos a funcionalidade de **Criação e Gestão Dinâmica de Categorias** operando nas seguintes camadas:

### A. Novo Modal Acessível (`AdminCreateCategoryModal.vue`)
- **Padrão W3C / WCAG 2.1 AA**: Foco inicial automático, backdrop blur com trava de rolagem, tecla `Escape` e botão de fechamento.
- **Identidade Claro Suave (ADR 017)**: Fundo `bg-white`, bordas `border-slate-200/90`, sombras suaves e botão principal refletindo a cor do tenant via `themeClasses.primaryBg`.
- **Seleção Rápida de Emojis/Ícones**: Grade rápida com os emojis mais populares do comércio local (🥩, 🍖, 🍔, 🍕, 🍺, 🍷, 🥃, 🥤, ☕, 🍰, 🐶, 🐱, 💈, ✂️, 🩺, 🛍️, 🏷️) e input livre para personalização.

### B. Integração nos Pontos de Entrada da UX Operacional
1. **Aba Catálogo (`AdminCatalogTab.vue`)**:
   - Botão **`+ Nova Categoria`** adicionado no banner de topo ao lado de `+ Novo Item`.
   - Botão de exclusão (`Trash2`) para categorias criadas pelo lojista ou vazias.
   - Botão pontilhado ao final da lista para adicionar nova seção diretamente.
2. **Modal de Criação de Produto (`AdminCreateProductModal.vue`)**:
   - Atalho direto **`+ Nova Categoria`** posicionado ao lado do label `Categoria:`, permitindo ao lojista criar uma seção sem perder o preenchimento do produto e selecionando a nova categoria automaticamente.

### C. Gestão no Composable (`useMerchantAdmin.ts`)
- **`createCategory(payload)`**: Cria uma categoria com ID único prefixado (`cat-custom-${Date.now()}`), adiciona à coleção `overrides.customCategories`, persiste no `localStorage` sob a chave da loja e dispara o evento `storage`/`alaska_overrides_updated`.
- **`deleteCategory(categoryId)`**: Remove a categoria da lista e adiciona o ID em `overrides.deletedCategoryIds` para exclusão persistente.
- **`getEffectiveCategories(baseCategories)`**: Mescla as categorias canônicas do tenant com as categorias customizadas do lojista, expurga as deletadas e distribui os produtos de forma transparente.

### D. Reatividade Imediata no Storefront Público (`index.vue`)
- A computada `effectiveTenant` utiliza a resolução unificada de categorias, garantindo que as novas seções apareçam imediatamente na vitrine pública do cliente, no `CategoryTabs.vue` e na navegação de produtos.

---

## 3. Consequências & Benefícios

1. **Autonomia Total do Lojista**: O lojista organiza seu cardápio ou vitrine de serviços livremente direto pelo smartphone.
2. **Zero Downtime & Zero Deploy**: Criação instantânea com persistência local e reatividade em tempo real (< 50ms).
3. **Consistência Visual**: Aderência estrita à paleta temática do estabelecimento e ao Design System Claro Suave.
