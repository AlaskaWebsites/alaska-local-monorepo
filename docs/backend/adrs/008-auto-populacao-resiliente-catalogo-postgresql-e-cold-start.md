# ADR 008: Auto-População Resiliente de Catálogo no PostgreSQL e Tolerância a Cold-Start na Leitura Híbrida

- **Status:** Aceito / Implementado
- **Data:** 2026-09-15
- **Contexto:** `apps/api/src/infrastructure/persistence/postgres/postgres-tenant.repository.ts`, `apps/web/composables/useTenant.ts`, `apps/web/composables/useMerchantAdmin.ts`

---

## 1. Contexto & Diagnóstico do Problema

O ecossistema **Alaska Local** utiliza uma arquitetura híbrida de dados para conciliar desempenho extremo, zero downtime e persistência relacional com PostgreSQL 16 (Render/Supabase):

```
┌────────────────────────────────────────────────────────────────────────┐
│               FLUXO DE LEITURA HÍBRIDA & AUTO-SEED                     │
│                                                                        │
│    apps/web (useTenant) ─────── 1. Tenta API NestJS (Render) ───────┐  │
│          │                                                          │  │
│          │ (Se API retornar categorias vazias ou falhar)            ▼  │
│          ▼                                                 PostgreSQL  │
│    data/<slug>.json (Catálogo Canônico) ◄────────────── Auto-Popula se │
│                                                         catálogo vazio │
└────────────────────────────────────────────────────────────────────────┘
```

### O Desafio da Vitrine Esvaziada:
1. Quando um estabelecimento (`tenant`) era inserido no PostgreSQL sem ter seus produtos e categorias previamente persistidos nas tabelas relacionais `categories` e `products`, a rota `GET /api/v1/tenants/:slug` retornava o tenant com `categories: []`.
2. O frontend, ao receber resposta HTTP 200 OK da API, substituía as categorias locais pelo array vazio vindo do servidor, resultando no desaparecimento visual de todos os itens do cardápio/vitrine.
3. Além disso, em momentos de **cold-start** do serviço backend gratuito/serverless, requisições de mutação rápida de status de produtos (`PATCH /tenants/:slug/products/:id/availability`) demoravam vários segundos, travando a interface se não houvesse camada otimista com timeout seguro.

---

## 2. Decisão Arquitetural

Implementamos uma estratégia em três frentes de resiliência:

### A. Auto-População Resiliente no Repositório PostgreSQL (`PostgresTenantRepository`)
No método `findBySlug` de `postgres-tenant.repository.ts`, caso o tenant seja localizado mas o número de categorias vinculadas seja zero (`categories.length === 0`), o repositório busca o catálogo canônico daquele slug (do seed base) e executa a auto-população transparente em transação SQL:

```typescript
// Trecho de resiliência em PostgresTenantRepository:
if (categories.length === 0) {
  const seedCategories = getBaseCatalogForSlug(slug)
  if (seedCategories && seedCategories.length > 0) {
    await this.autoSeedCategoriesAndProducts(tenantId, seedCategories)
    categories = await this.loadCategoriesWithProducts(tenantId)
  }
}
```

### B. Proteção Defensiva no Cliente (`useTenant.ts`)
No front-end Nuxt 3, a função `fetchTenant` implementa uma guarda de integridade:
* Se a resposta da API retornar com sucesso mas com `categories.length === 0`, enquanto os dados estáticos locais (`data/<slug>.json`) possuem categorias ativas, o composable preserva o catálogo local e emite um alerta informativo no log.
* Isso garante **Zero Downtime Visual** para os clientes finais da loja.

### C. Mutação Otimista em 3 Camadas no Admin (`useMerchantAdmin.ts`)
Para pausas e despausas rápidas de produtos no painel (`toggleProductAvailability`):
1. **Camada 1 (UI)**: Atualização reativa imediata na tela com feedback tátil de vibração via Vibration API.
2. **Camada 2 (Local Storage)**: Gravação instantânea sob a chave `alaska_overrides_<slug>` com disparo do evento global `alaska_overrides_updated`.
3. **Camada 3 (Persistência Remota)**: Chamada assíncrona para `PATCH /api/v1/tenants/:slug/products/:productId/availability` com timeout defensivo de 4000ms. Caso a API demore devido a cold-start, a UI do lojista permanece fluida e não bloqueia a operação no balcão.

---

## 3. Consequências

- **Vitrines Sempre Disponíveis**: Nenhum cliente se depara com catálogo em branco mesmo durante manutenções ou deploys parciais do banco de dados.
- **Auto-Cura do Banco de Dados**: Estabelecimentos novos têm suas tabelas relacionais preenchidas automaticamente na primeira requisição.
- **Independência Operacional**: O lojista consegue pausar e alterar produtos pelo celular em menos de 3 segundos sem travar a interface.
