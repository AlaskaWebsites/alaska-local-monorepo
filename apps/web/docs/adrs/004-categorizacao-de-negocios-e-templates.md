# ADR 004: Taxonomia de Categorias de Negócio e Especialização de Templates

* **Status**: Aceito
* **Data**: 2026-08-27
* **Autor**: Alaska Websites & AI Engineering Harness

---

## 1. Contexto & Problema

O ecossistema **Alaska Local** iniciou com foco principal no produto **Alaska Menu** (food service e cardápio digital) e links rápidos no **Alaska Hub**. Com a evolução do projeto e a inclusão de novos nichos de mercado (boutiques de moda feminina como `bella-donna`, semijoias como `karine-finardi` e a demanda por páginas institucionais de alta conversão para profissionais liberais como advogados e médicos), tornou-se necessária uma taxonomia clara para:

1. Classificar e filtrar os estabelecimentos na página inicial (`pages/index.vue`).
2. Adaptar os templates de vitrine (`pages/[slug].vue`) de acordo com a necessidade de cada modelo de negócio (carrinho com adicionais vs grade de produtos vs tabela de serviços vs landing page institucional de autoridade).
3. Orientar a abordagem comercial de vendas *Done-for-You* (DFY) e precificação por nicho.

---

## 2. Decisão Arquitetural

Definimos **4 Categorias Canônicas de Negócio** no ecossistema:

1. **`menu` (Alaska Menu - Alimentação & Delivery)**:
   - Focado em food service, hamburguerias, pizzarias, espetarias e adegas.
   - Recursos: Modal de opcionais com regras min/max (`ProductCustomizerModal.vue`), drawer de checkout (`CartDrawerModal.vue`), busca de CEP com foco inteligente no número, prova social estilo iFood e despacho estruturado no WhatsApp.

2. **`shop` (Alaska Shop - Lojas, Boutiques & Varejo)**:
   - Focado em moda feminina/masculina, semijoias, óticas, cosméticos e presentes.
   - Recursos: Vitrine em grid com destaque para fotos, grade de variações (tamanho/cor/acabamento), sacola com cálculo em tempo real e fechamento consultivo no WhatsApp com feedback tátil (`useHaptic.ts`).

3. **`hub` (Alaska Hub - Serviços, Barbearias & Estética)**:
   - Focado em barbearias, salões de beleza, estúdios de tatuagem e clínicas de estética.
   - Recursos: Hub de links de alta conversão para bio do Instagram, tabela de serviços com preços e agendamento direto no WhatsApp.

4. **`pro` (Alaska Pro - Profissionais Liberais & Institucional One-Page)**:
   - Focado em advogados, médicos, psicólogos, contadores, arquitetos e corretores de imóveis.
   - Recursos: Layout One-Page focado em autoridade, credenciais profissionais (OAB/CRM/CRECI), especialidades/áreas de atuação, prova social, FAQ interativo e CTA de agendamento/consulta.

---

## 3. Conformidade de Tipos e Schemas Zod (`types/tenant.ts`)

A propriedade `businessCategory` passa a ser suportada no `TenantSchema`:

```ts
export const BusinessCategorySchema = z.enum(['menu', 'shop', 'hub', 'pro'])
export type BusinessCategory = z.infer<typeof BusinessCategorySchema>
```

---

## 4. Consequências

- **Positivas**:
  - Clareza total para expansão comercial e geração de demonstrações (*Show, Don't Tell*).
  - Experiência do usuário personalizada para cada segmento sem sobrecarregar lojas simples com regras desnecessárias de delivery/adicionais.
  - Facilidade de filtragem na vitrine pública da home.
- **Governança**:
  - Toda nova demonstração adicionada em `data/*.json` deve declarar sua respectiva `businessCategory` para validação fail-fast no Zod e nos testes do Vitest.
