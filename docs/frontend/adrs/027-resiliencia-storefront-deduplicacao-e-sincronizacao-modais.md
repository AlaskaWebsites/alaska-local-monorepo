# ADR 027: Resiliência de Vitrine, Deduplicação de Produtos e Sincronização Dinâmica de Modais e Categorias

- **Status:** Aceito / Implementado
- **Data:** 2026-10-03
- **Contexto:** `apps/web/components/storefront/`, `apps/web/components/admin/`, `apps/web/composables/useMerchantAdmin.ts`, `apps/web/pages/[slug]/index.vue`, `apps/web/pages/index.vue`
- **Referência:** ADR 015 (Desacoplamento Atômico de Componentes), ADR 017 (Design System Claro Suave), ADR 018 (Resiliência de Props/Eventos), ADR 019 (Upload Cloudinary), ADR 026 (Criação Dinâmica de Categorias)

---

## 1. Contexto & Motivação

Com a evolução das funcionalidades operacionais do Painel do Lojista (criação dinâmica de categorias via ADR 026 e upload de imagens de produtos via Cloudinary conforme ADR 019), foram observados comportamentos assíncronos e divergências de contratos entre componentes:

1. **Duplicação de Produtos por Eventos Concorrentes**: O modal `AdminCreateProductModal.vue` emitia simultaneamente `@submit` e `@confirm`, gerando duplo disparo no handler e persistindo itens duplicados no `localStorage` e na vitrine.
2. **Upload Prematuro no Cloudinary**: Imagens eram enviadas ao Cloudinary imediatamente na seleção do arquivo pelo lojista, consumindo banda e recursos de CDN mesmo se o usuário cancelasse o modal antes de salvar.
3. **Descompasso de Props e Eventos em Modais da Vitrine**:
   - `StoreHeaderCard.vue`: Ausência de declaração formal de `open-reviews` e `open-info` no `defineEmits`, provocando advertências e bloqueando a abertura de modais em determinados navegadores.
   - `StoreHeroBanner.vue`: Divergência entre props `:banner` e `:banner-url` e omissão da prop `:announcement`.
   - `StoreReviewsModal.vue`: Utilizava a prop `:store-reviews` e checava `v-if="effectiveTenant.storeReviews"`, impedindo a exibição das avaliações quando o objeto canônico residia em `tenant.reviews`. Faltavam também botão explícito de fechar e rodapé "Entendido" acessível.
   - `StoreInfoModal.vue`: Apresentava elementos visuais desbalanceados com a identidade Claro Suave.
4. **Requisições 404 na Página Inicial (`pages/index.vue`)**: A home tentava consultar uma rota de catálogo agregada inexistente (`/api/v1/tenants`), gerando poluição de logs e falhas de rede no console do navegador.

---

## 2. Decisão Técnica e Arquitetura

Implementamos uma estratégia abrangente de **blindagem defensiva, deduplicação e sincronização de contratos**:

### A. Deduplicação Ativa e Upload Sob Demanda
- **Emissão Única no Modal**: `AdminCreateProductModal.vue` foi padronizado para emitir exclusivamente o evento `create` ao salvar o formulário.
- **Debounce & Deduplicação de Produtos**:
  - `useMerchantAdmin.ts` agora verifica duplicatas antes da inserção por ID e por combinação única de `name + categoryId`.
  - A computada `effectiveTenant` em `pages/[slug]/index.vue` aplica sanitização defensiva, impedindo a exibição de produtos duplicados na vitrine mesmo que existam registros residuais no `localStorage`.
- **Upload Postergado**: O envio do arquivo para o Cloudinary foi movido para o momento exato do clique em "Cadastrar", utilizando preview local temporário com `URL.createObjectURL(file)`. Se o lojista fechar o modal, nenhuma chamada externa é disparada.

### B. Padronização e Acessibilidade dos Modais da Vitrine
- **`StoreHeaderCard.vue`**: Declarados explicitamente `open-reviews`, `open-info` e `open-booking` no `defineEmits`, com computadas defensivas para rating e status aberto/fechado.
- **`StoreHeroBanner.vue`**: Implementado suporte defensivo polimórfico que aceita tanto `:banner` quanto `:banner-url`, além de renderizar o comunicado do lojista (`:announcement`) e o badge de fechamento emergencial (`:is-emergency-closed`).
- **`StoreReviewsModal.vue`**:
  - Padronizado para receber a prop `:reviews` (alinhado a `StoreReviews` do `@alaska/contracts`).
  - Adicionados botão superior de fechamento (`X`) e botão inferior "Entendido" com foco ergonômico.
  - Removida trava de scroll externa concorrente, delegando o controle de acessibilidade W3C/WCAG ao composable `useBodyScrollLock`.
- **`StoreInfoModal.vue`**: Reformulado com o padrão visual claro suave (estilo iFood), com cards brancos, bordas suaves `border-slate-200/90` e contraste ergonômico.

### C. Eliminação de 404 na Home Pública (`pages/index.vue`)
- A consulta agregada a `/api/v1/tenants` foi substituída por consultas concorrentes via `Promise.allSettled` aos endpoints individuais `/api/v1/tenants/:slug` para cada estabelecimento cadastrado, com fallback gracioso para os dados canônicos locais (`apps/web/data/<slug>.json`).

### D. Fail-Fast na Hidratação do LocalStorage
- `useMerchantAdmin.ts` agora utiliza `TenantOverridesSchema.safeParse` na leitura de `alaska_overrides_<slug>`. Se o conteúdo estiver corrompido ou contiver formato incompatível, a aplicação descarta o lixo e recupera o estado são (`{}`) automaticamente, prevenindo tela branca no painel.

---

## 3. Consequências & Benefícios

1. **Estabilidade Absoluta na Vitrine**: Eliminação de duplicações, erros de console 404 e crashes de runtime causados por props ausentes ou eventos não declarados.
2. **Economia de Recursos**: Uploads de mídia executados estritamente após a validação e submissão do formulário.
3. **UX Impecável no Mobile**: Abertura fluida de modais de avaliações e informações com padrões de acessibilidade WCAG 2.1 AA.
4. **Resiliência de Dados**: O lojista opera o catálogo com garantias de idempotência e saneamento automático de estado local.
