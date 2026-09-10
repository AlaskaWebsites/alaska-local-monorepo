# ADR 017: Padronização do Design System Claro Suave e Temas Dinâmicos no Painel do Lojista

- **Status:** Aceito / Implementado
- **Data:** 2026-09-10
- **Contexto:** `apps/web/assets/css/main.css`, `apps/web/app.vue`, `apps/web/components/admin/`, `apps/web/pages/[slug]/admin.vue`, `useTenantTheme.ts`

---

## 1. Contexto & Problema

O ecossistema **Alaska Local** foi concebido com uma experiência visual mobile-first inspirada nos padrões dos grandes marketplaces (iFood, Airbnb), priorizando ergonomia e descanso visual no uso contínuo:

1. **Vitrines e Home (`/[slug]` e `/`)**:
   - Desenvolvidas com uma paleta clara e ergonômica: fundo em **`bg-slate-50`** (off-white neutro suave, evitando o branco `#FFFFFF` puro de alto brilho que fatiga a visão), cards e superfícies em **`bg-white border-slate-200/90 shadow-2xs`**, e tipografia legível em **`text-slate-900`** e **`text-slate-600`**.
   - Identidade visual dinâmica com 11 temas cromáticos (`food`, `barber`, `health`, `drinks`, `rose`, `amber`, etc.) aplicados reativamente via `useTenantTheme.ts`.

2. **Divergência Inicial no Painel do Lojista (`/[slug]/admin`)**:
   - O painel administrativo foi estruturado originalmente em *Dark Modern* rígido (`bg-slate-950`, `bg-slate-900`, `border-slate-800`), com destaques fixos em verde esmeralda (`bg-emerald-500`, `text-emerald-400`).
   - Essa discrepância gerou duas quebras de coerência:
     - **Ruptura de Identidade:** Lojas como a *Adega Prime* (tema âmbar/laranja), *Studio Nail Design* (tema rose) ou *Clínica Sorriso* (tema teal) apresentavam um painel administrativo com acentos verdes genéricos e fundo preto total, desconectado da marca do lojista.
     - **Fadiga Visual:** A perda das tonalidades suaves de branco e cinza claro desenvolvidas para leitura e operação diária pelo comerciante.

---

## 2. Decisão Arquitetural

Adotamos a **Padronização Visual Unificada** entre Vitrine e Painel do Lojista, mantendo a ergonomia das tonalidades suaves e a reatividade cromática multi-tenant:

```
┌────────────────────────────────────────────────────────┐
│               ALASKA LOCAL DESIGN SYSTEM               │
│                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │   VITRINE PÚBLICA    │    │  PAINEL DO LOJISTA   │  │
│  │      (/[slug])       │    │   (/[slug]/admin)    │  │
│  └──────────┬───────────┘    └──────────┬───────────┘  │
│             │                           │              │
│             ▼                           ▼              │
│  ┌──────────────────────────────────────────────────┐  │
│  │              BASE VISUAL CLARA SUAVE             │  │
│  │  • Fundo: bg-slate-50 (Descanso Ocular / Off-White)│  │
│  │  • Cards: bg-white border-slate-200/90 shadow-2xs│  │
│  │  • Tipografia: text-slate-900 & text-slate-600   │  │
│  │  • Inputs: bg-white / bg-slate-50 border-slate-200│  │
│  └──────────────────────────┬───────────────────────┘  │
│                             │                          │
│                             ▼                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │        ACENTOS DINÂMICOS POR TEMA/CATEGORIA      │  │
│  │    (useTenantTheme.ts & html[data-theme="..."])  │  │
│  │  • Amber: Adega / Bebidas       (#f59e0b)        │  │
│  │  • Barber: Barbearias / Gold    (#f59e0b)        │  │
│  │  • Rose: Nail Design / Estética (#f43f5e)        │  │
│  │  • Health: Odonto / Clínicas    (#14b8a6)        │  │
│  │  • Food: Gastronomia / Burger   (#ef4444)        │  │
│  │  • Drinks, Violet, Blue, Slate, Emerald, Default │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### A. Camada de Apresentação nos Componentes do Admin
Os componentes operacionais desacoplados em `apps/web/components/admin/` consomem diretamente o composable `useTenantTheme(tenant)`:
- **`AdminTabsNav.vue`**: Abas ativas recebem `:class="activeTab === key ? [themeClasses.primaryBg, 'text-slate-950 shadow-md font-bold'] : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'"`
- **`AdminCatalogTab.vue`**: Botão `+ Novo Item` usa `themeClasses.primaryBg`, banner de pausa usa `themeClasses.primaryText`, badges "ATIVO" usam `themeClasses.badgeBg`/`themeClasses.badgeText`, e switches usam `themeClasses.primaryBg` com foco `themeClasses.focusRing`.
- **`AdminAgendaTab.vue`**: Botão `+ Novo Especialista`, escala de 7 dias, switches de atendimento e horários livres refletem o tema da loja.
- **`AdminTopHeader.vue`**: Fundo translúcido em `bg-white/95 border-b border-slate-200` com título em `text-slate-900`.
- **`AdminLoginCard.vue`**: Superfície em `bg-white border border-slate-200 rounded-3xl shadow-xl` com fundo da página em `bg-slate-50`.

### B. Cascata Global e Variáveis CSS em `app.vue`
No bloco `<style>` de `app.vue` (embutido pelo Nuxt em todas as páginas):
- Mapeamento das classes utilitárias sobre seletores `html[data-theme="..."]`:
  - `bg-emerald-500` -> remapeado para a cor primária do tema ativo (`--admin-accent-500`).
  - `text-emerald-400` / `text-emerald-300` -> remapeado para variações tonais de destaque.
  - `bg-emerald-500/10` / `bg-emerald-500/20` -> fundos translúcidos de badges e avisos.
  - `border-emerald-500` / `focus:border-emerald-500` -> bordas e anéis de foco.

---

## 3. Diretrizes Invioláveis para Prevenção de Recorrência

Para garantir que novas lojas cadastradas não quebrem o design system ou o fluxo de agendamento/checkout:

1. **Serviços Dinâmicos em `BookingModal.vue`**:
   - NUNCA reintroduzir dicionários estáticos com fallback arbitrário para outras lojas (ex: `|| defaultServicesBySlug['barbearia-style']`).
   - Serviços de agendamento DEVEM ser extraídos dinamicamente de `props.tenant.categories`, filtrando itens com `durationMinutes === 0` (produtos físicos de venda).

2. **Disponibilidade Padrão de Profissionais**:
   - Todo profissional cadastrado em `data/*.json` deve ter disponibilidade padrão ativa (`isAvailable: true`).
   - No código do frontend, profissionais sem a flag explícita devem nascer com fallback `isAvailable: true` e escala padrão `availableDays: [1, 2, 3, 4, 5, 6]`.

3. **Sincronização de Identificadores (IDs)**:
   - Os IDs de profissionais em `data/<slug>.json` devem ser padronizados e sincronizados com os registros do painel admin (`prof-1`, `prof-2`, `prof-3`, etc.).

4. **Exibição do QR Code Pix em Todos os Checkouts**:
   - Tanto no Agendamento (`BookingModal.vue`) quanto na Sacola de Delivery (`CartDrawerModal.vue`), o método de pagamento Pix DEVE gerar e exibir a imagem do QR Code escaneável via `generatePixQrCodeDataUrl` logo acima do código Copia e Cola.

---

## 4. Consequências

- **Ergonomia Operacional:** O lojista gerencia seu negócio em um ambiente claro, suave e agradável aos olhos, no mesmo padrão visual da vitrine pública.
- **Identidade Instantânea:** O painel se adapta automaticamente às cores da categoria de negócio assim que o slug é carregado.
- **Prevenção de Bugs:** Novas lojas criadas nas verticais Menu, Shop, Hub ou Pro herdam o catálogo, profissionais, cores e pagamentos sem necessidade de alterações manuais nos componentes base.
