# ADR 020: Sincronização Canônica do Catálogo com PostgreSQL, Resiliência a Exclusões e Refresh Reativo no Painel do Lojista

- **Status:** Aceito / Implementado
- **Data:** 2026-09-17
- **Contexto:** `apps/web/pages/[slug]/admin.vue`, `apps/web/pages/[slug]/index.vue`, `apps/web/composables/useMerchantAdmin.ts`, `apps/web/composables/useTenant.ts`, `apps/api/src/infrastructure/http/controllers/product.controller.ts`
- **Referências:** ADR 010 (Backend: Persistência de Produtos e Catálogo no PostgreSQL), ADR 013 (Painel do Lojista), ADR 018 (Resiliência de Contratos e Props), ADR 019 (Upload e Otimização Cloudinary)

---

## 1. Contexto & Diagnóstico do Problema ("Itens Zumbis" e Resiliência Visual)

Durante a validação prática do cadastro e gerenciamento de produtos pelo Painel do Lojista (`/[slug]/admin`), foram observados dois comportamentos que geravam dúvidas operacionais ao lojista:

1. **Persistência Relacional vs Limpeza de LocalStorage ("Item Zumbi")**:
   - O lojista cadastrou um item ("carro") no painel da loja.
   - Em seguida, ao tentar "zerar" a loja limpando o `localStorage` do navegador via DevTools, o produto **permaneceu visível** tanto na vitrine quanto no painel de administração.
   - **Causa Raiz**: O backend do ecossistema Alaska Local (implementado na ADR 010) já persistia criações diretamente no banco relacional PostgreSQL (Render). Quando o `localStorage` era limpo, o `useTenant()` reexecutava a busca remota e trazia o produto diretamente da tabela `products` do PostgreSQL. O lojista acreditava que o item estava armazenado apenas no navegador local.

2. **Exibição do Card com Placeholder Alaska Local (Resiliência Visual Anti-404)**:
   - Ao cadastrar o produto, a foto não foi exibida e surgiu o placeholder padrão vetorial da Alaska Local.
   - **Causa Raiz**: Caso a criação do produto seja confirmada sem URL de foto ou antes do término do upload assíncrono para o Cloudinary, o campo `image` é salvo como string vazia (`""`). O mecanismo de resiliência visual anti-404 de `ProductCard.vue` e `FeaturedProductsCarousel.vue` intercepta a ausência de imagem ou erros HTTP e renderiza um SVG temático seguro, evitando elementos quebrados na vitrine.

3. **Descompasso entre Exclusão Local e Exclusão Remota**:
   - A ação `deleteProduct()` no composable `useMerchantAdmin.ts` gravava o ID do produto em `deletedProductIds` no `localStorage` e disparava uma chamada assíncrona desacoplada via `$fetch(..., { method: 'DELETE' })` com timeout baixo (4000ms).
   - O painel orquestrador (`admin.vue`) não aguardava a confirmação da API e não disparava `refresh()` na instância do `useTenant()`.
   - Se a requisição sofresse timeout por *cold start* da hospedagem gratuita do Render, o registro permanecia no banco relacional. Uma limpeza subsequente do `localStorage` removia o filtro de `deletedProductIds`, fazendo o item reaparecer no catálogo.

---

## 2. Decisão Arquitetural: PostgreSQL como Única Fonte da Verdade (SSOT)

Adotamos a transição definitiva para que o **PostgreSQL seja a Única Fonte da Verdade** para o catálogo de produtos e serviços, mantendo o `localStorage` restrito a preferências transitórias de sessão e fallback de contingência:

### A. Fluxo Assíncrono com Confirmação e Refresh Reativo
1. **`deleteProduct(productId)`**:
   - Assinatura assíncrona (`async/await`) que executa a exclusão remota `DELETE /api/v1/tenants/:slug/products/:productId` no PostgreSQL.
   - Timeout estendido para 15 segundos para tolerar tempos de *cold start* em instâncias desacopladas.
   - Limpeza simultânea no cache local para resposta visual imediata (< 50ms).
   - Chamada mandatória de `await refresh()` do `useTenant()` no componente orquestrador (`admin.vue`), revalidando o estado canônico do banco de dados.

2. **`createProduct(productData)`**:
   - Aguarda a confirmação do backend (`POST /api/v1/tenants/:slug/products`).
   - Dispara `await refresh()` para incluir o item gerado com ID definitivo do banco na árvore reativa do Vue.

### B. Deduplicação Preventiva em `categories` e `effectiveCategories`
- Para evitar que itens persistidos no banco de dados apareçam duplicados na vitrine caso também estejam presentes em caches locais transitórios, tanto `admin.vue` quanto `index.vue` realizam deduplicação estrita por `id` (`!baseProducts.some(bp => bp.id === customProduct.id)`).

### C. Fluxo de Exclusão Definitiva pelo Lojista
- Para excluir um produto cadastrado incorretamente ou em teste, o lojista deve utilizar o botão de exclusão (ícone da lixeira vermelha 🗑️) no Painel do Lojista (`/[slug]/admin`).
- Esse fluxo garante a remoção atômica na tabela `products` via Clean Architecture e invalidação do cache em tempo real.

---

## 3. Consequências & Benefícios

1. **Fim dos Itens Zumbis**: A limpeza de dados do navegador não altera mais o catálogo real da loja. O catálogo reflete sempre os dados persistidos no PostgreSQL.
2. **Exclusão Permanente Garantida**: A exclusão via painel remove o registro do banco de dados na nuvem, sendo refletida instantaneamente para todos os clientes em qualquer dispositivo.
3. **Consistência Visual**: A resiliência visual garante que produtos sem imagem ou com upload incompleto mantenham layout limpo e padronizado sem quebras de layout.
