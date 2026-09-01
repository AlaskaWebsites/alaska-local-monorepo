# ADR 015: Desacoplamento Atômico de Componentes da Vitrine e do Painel do Lojista

## Status
**Aceito e Implementado** (2026-09-01)

## Contexto
Com o crescimento das funcionalidades da vitrine digital (`pages/[slug]/index.vue`) e do Painel do Lojista (`pages/[slug]/admin.vue`), os arquivos de página concentravam centenas de linhas de código misturando:
1. Lógica de estado e sincronização de overrides.
2. Renderização de banners, headers, carrosséis, grids de produtos e barras de ação.
3. Formulários das 7 abas operacionais do admin e 4 modais de edição.

Essa concentração elevava a complexidade de manutenção, dificultava testes unitários isolados de componentes visuais e aumentava o risco de regressões.

## Decisão
Decidiu-se refatorar as páginas `pages/[slug]/index.vue` e `pages/[slug]/admin.vue`, transformando-as em **Páginas Orquestradoras**, e extrair toda a camada de apresentação em componentes desacoplados com responsabilidade única:

### 1. Componentes da Vitrine (`components/storefront/`)
- `StoreHeroBanner.vue`: Renderização de imagem de capa, gradiente, botão voltar, botão compartilhar e faixas de alerta de emergência/comunicado.
- `StoreHeaderCard.vue`: Card de identidade da loja, logo, reviews, status Aberto/Fechado, botão Agendar Horário e meta-informações.
- `ProductCard.vue`: Card de produto com foto, preço formatado, badge de oferta e overlay de esgotado.
- `FeaturedProductsCarousel.vue`: Carrossel de destaques da casa com navegação por setas.
- `ProductCatalogGrid.vue`: Listagem por categorias com âncoras suaves e estado de busca vazia.
- `BottomCartFloatingBar.vue`: Barra flutuante de checkout rápido envolvida com `ClientOnly`.

### 2. Componentes do Painel do Lojista (`components/admin/`)
- `AdminLoginCard.vue`: Tela de login com input de PIN numérico.
- `AdminTopHeader.vue`: Cabeçalho superior com status pulse e botão Sair.
- `AdminTabsNav.vue`: Barra de navegação das 7 abas com scroll lateral, setas e suporte a mouse wheel.
- `tabs/`: 7 abas operacionais especializadas (`AdminCatalogTab`, `AdminAgendaTab`, `AdminPixContactTab`, `AdminHoursTab`, `AdminDeliveryTab`, `AdminAnnouncementTab`, `AdminSecurityTab`).
- `modals/`: 4 modais atômicos de criação e edição (`AdminPriceModal`, `AdminCreateProductModal`, `AdminCreateProfModal`, `AdminOptionsModal`).

## Consequências

### Positivas
- **Single Responsibility Principle (SRP)**: Cada componente visual agora tem escopo claro e isolado.
- **Páginas Leves**: `index.vue` e `admin.vue` reduzem sua complexidade visual, focando puramente em orquestração reativa de dados.
- **Testabilidade**: Cada aba ou card pode ser testado ou estilizado independentemente.
- **Manutenibilidade Aumentada**: Modificações no visual do carrossel ou em uma aba do admin não impactam a integridade das demais partes da aplicação.
