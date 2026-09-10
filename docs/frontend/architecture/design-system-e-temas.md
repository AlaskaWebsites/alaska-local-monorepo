# Design System & Sistema de Temas Dinâmicos (Tailwind CSS)

O ecossistema **Alaska Local** utiliza um sistema de design desacoplado, dinâmico e focado em **ergonomia e descanso visual**, projetado para refletir a identidade visual do comércio local sem duplicar código ou depender de compilações customizadas de CSS para cada cliente.

---

## 1. Ergonomia Visual & Tonalidades de Branco (Eye-Friendly Standard)

Para evitar a fadiga visual provocada pelo uso diário de telas tanto pelo cliente final quanto pelo lojista no painel de controle, a aplicação inteira (**Vitrine Pública** e **Painel Admin**) adota uma paleta intencional de tons neutros suaves:

- **Fundo Global (`bg-slate-50`)**: Um tom off-white suave (`#f8fafc`) que elimina o brilho excessivo do branco `#FFFFFF` puro, proporcionando alto conforto para leitura e navegação prolongada.
- **Superfícies e Cards (`bg-white border-slate-200/90 shadow-2xs`)**: Elementos de conteúdo repousam sobre cartões em branco fosco com bordas sutis e sombras de baixa intensidade (`shadow-2xs` / `shadow-xs`), criando hierarquia visual limpa e elegante.
- **Tipografia Escura Confortável (`text-slate-900` e `text-slate-600`)**: Títulos em preto azulado suave (`#0f172a`) e textos secundários em ardósia médio (`#475569`), garantindo conformidade WCAG AAA de contraste sem causar ofuscamento.
- **Inputs e Controles de Formulário (`bg-white border-slate-200 focus:bg-white`)**: Caixas de entrada em branco suave com foco colorido no tom do tema do estabelecimento.

---

## 2. Mapeamento de Paletas Canônicas (`useTenantTheme.ts`)

Cada tenant define em seu JSON a propriedade `theme`. O composable `useTenantTheme` mapeia essa propriedade para classes utilitárias do Tailwind CSS de alto contraste:

| Tema / Vertical | Cor Primária | Fundo Badge | Texto Badge | Botão Primário | Indicador de Categoria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **food / default** | `text-red-600` | `bg-red-50` | `text-red-700` | `bg-red-600 hover:bg-red-700 text-white` | `bg-red-500` |
| **amber / adega** | `text-amber-600` | `bg-amber-50` | `text-amber-800` | `bg-amber-600 hover:bg-amber-700 text-white` | `bg-amber-500` |
| **barber / gold** | `text-amber-500` | `bg-amber-50` | `text-amber-800` | `bg-amber-500 hover:bg-amber-600 text-white` | `bg-amber-500` |
| **rose / shop** | `text-rose-600` | `bg-rose-50` | `text-rose-700` | `bg-rose-600 hover:bg-rose-700 text-white` | `bg-rose-500` |
| **health / pro** | `text-teal-600` | `bg-teal-50` | `text-teal-700` | `bg-teal-600 hover:bg-teal-700 text-white` | `bg-teal-500` |
| **drinks / bar** | `text-purple-600` | `bg-purple-50` | `text-purple-800` | `bg-purple-600 hover:bg-purple-700 text-white` | `bg-purple-500` |
| **violet / moda** | `text-violet-600` | `bg-violet-50` | `text-violet-700` | `bg-violet-600 hover:bg-violet-700 text-white` | `bg-violet-500` |
| **blue / serviços** | `text-blue-600` | `bg-blue-50` | `text-blue-700` | `bg-blue-600 hover:bg-blue-700 text-white` | `bg-blue-500` |
| **emerald / farmácia** | `text-emerald-600` | `bg-emerald-50` | `text-emerald-700` | `bg-emerald-600 hover:bg-emerald-700 text-white` | `bg-emerald-500` |
| **slate / minimal** | `text-slate-900` | `bg-slate-100` | `text-slate-800` | `bg-slate-900 hover:bg-slate-800 text-white` | `bg-slate-900` |

---

## 3. Unificação Visual no Painel do Lojista (ADR 017)

O painel administrativo (`apps/web/pages/[slug]/admin.vue` e `apps/web/components/admin/`) utiliza a mesma base visual da vitrine pública:

1. **Abas Operacionais (`AdminTabsNav.vue`)**:
   - Inativas: `bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-2xs`.
   - Ativas: herdam dinamicamente `themeClasses.primaryBg` com tipografia contrastante e sombra suave.
2. **Botões de Ação Rápida**:
   - Botões principais (`+ Novo Item`, `+ Novo Especialista`, `Salvar`): recebem `themeClasses.primaryBg`.
   - Botões secundários (`Cancelar`, `Voltar`, `Sair`): em `bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100`.
3. **Switches e Badges de Disponibilidade**:
   - Ativo/Atendendo: `themeClasses.primaryBg` e badges em tom pastel correspondente (`themeClasses.badgeBg`/`badgeText`).
   - Inativo/De Folga: fundo neutro em `bg-slate-200` (ou `bg-rose-50 text-rose-700 border border-rose-200`).

---

## 4. Estados Interativos e Micro-Animações

- **Active Scale:** Efeito tátil em cliques e toques (`active:scale-95` e `active:scale-[0.99]`).
- **Snap Scroll:** Carrossel de produtos em destaque e carrossel de 30 dias de agendamento com rolagem suave horizontal e botões de navegação lateral.
- **Transitions:** Transições de 150ms a 200ms para abertura de modais e fade-in de resultados de busca.
