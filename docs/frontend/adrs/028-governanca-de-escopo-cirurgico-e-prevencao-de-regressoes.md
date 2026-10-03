# ADR 028: Governança de Escopo Cirúrgico e Prevenção de Regressões no Frontend

- **Status:** Aceito / Implementado
- **Data:** 2026-10-03
- **Contexto:** `apps/web/`, `apps/web/components/`, `apps/web/composables/`, `apps/web/pages/`
- **Referência:** ADR 014 (Contracts), ADR 015 (Componentes Atômicos), ADR 017 (Design System Claro Suave), ADR 018 (Resiliência de Props/Emits), ADR 027 (Resiliência de Vitrine)

---

## 1. Contexto & Motivação

No desenvolvimento do frontend Nuxt 3 (`@alaska/web`), a complexidade de gerenciar 4 verticais de negócio, 11 temas visuais e um Painel do Lojista dinâmico expõe o código a riscos quando modificado por agentes automatizados ou LLMs:
- Reescrever um componente como `admin.vue` ou `useMerchantAdmin.ts` para adicionar uma funcionalidade pequena frequentemente resultava na **perda de funções pré-existentes** (como categorias customizadas, deduplicação de produtos, sincronização com API ou autenticação por e-mail/senha).
- A perda dessas lógicas forçava o retrabalho constante de refazer funcionalidades que já haviam sido entregues e validadas dias antes.

---

## 2. Decisão Técnica e Arquitetura

Formaliza-se a **Trava de Escopo Cirúrgico e Anti-Regressão** no frontend:

### A. Princípio da Não-Degradação de Contratos
- Toda função, computed, prop, emit ou método utilitário presente em um componente ou composable DEVE ser preservado ao realizar qualquer manutenção.
- Proibição absoluta de simplificar ou deletar lógicas defensivas (como `resolveReviews`, fallbacks de imagem SVG, computeds de tema ou sanitização com `safeParse`).

### B. Leitura Prévia Obrigatória da Branch Main
- Antes de propor qualquer alteração, o agente deve ler o arquivo na íntegra a partir do HEAD remoto (`get_file_contents` na `main`), mapeando todas as props e emits existentes antes de realizar edições.

### C. Isolamento de Escopo por Componente
- Se uma tarefa solicita alteração no `AdminCatalogTab.vue`, nenhum outro arquivo (`AdminOrdersTab.vue`, `AdminSecurityTab.vue`, `StoreHeroBanner.vue`) pode ser modificado.

### D. Validação de Vitrines e Demos
- Antes de concluir qualquer tarefa de catálogo ou loja, deve-se executar `node apps/web/scripts/validate-tenants.mjs` para garantir conformidade estrutural.

---

## 3. Consequências & Benefícios

1. **Fim do Retrabalho**: O código previamente testado e aprovado permanece íntegro e intocado.
2. **Previsibilidade**: O desenvolvedor e o lojista têm a certeza de que novas features não quebram funcionalidades estáveis.
3. **Evolução Segura**: As melhorias somam-se cumulativamente à base de código sem risco de alucinação regressiva.
