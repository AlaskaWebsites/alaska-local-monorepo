# Design System & Sistema de Temas Dinâmicos (Tailwind CSS)

O ecossistema **Alaska Local** utiliza um sistema de temas desacoplado e dinâmico, projetado para refletir a identidade visual do comércio local sem duplicar código ou depender de compilações customizadas de CSS para cada cliente.

---

## 1. Mapeamento de Paletas Canônicas (`useTenantTheme.ts`)

Cada tenant define em seu JSON a propriedade `theme`. O composable `useTenantTheme` mapeia essa propriedade para classes utilitárias do Tailwind CSS de alto contraste:

| Tema / Vertical | Cor Primária | Fundo Badge | Texto Badge | Botão Primário | Indicador de Categoria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **food / emerald** | `text-emerald-600` | `bg-emerald-50` | `text-emerald-700` | `bg-emerald-600 hover:bg-emerald-700 text-white` | `bg-emerald-500` |
| **amber / drinks** | `text-amber-600` | `bg-amber-50` | `text-amber-800` | `bg-amber-600 hover:bg-amber-700 text-white` | `bg-amber-500` |
| **rose / shop** | `text-rose-600` | `bg-rose-50` | `text-rose-700` | `bg-rose-600 hover:bg-rose-700 text-white` | `bg-rose-500` |
| **violet / barber** | `text-violet-600` | `bg-violet-50` | `text-violet-700` | `bg-violet-600 hover:bg-violet-700 text-white` | `bg-violet-500` |
| **blue / health** | `text-blue-600` | `bg-blue-50` | `text-blue-700` | `bg-blue-600 hover:bg-blue-700 text-white` | `bg-blue-500` |
| **slate / dark** | `text-slate-900` | `bg-slate-100` | `text-slate-800` | `bg-slate-900 hover:bg-slate-800 text-white` | `bg-slate-900` |

---

## 2. Padrão Dark Modern & Mobile-First (iFood Standard)

A interface é orientada a telas sensíveis ao toque (smartphones Android e iOS):
- **Base Visual:** `bg-slate-50` com textos em `text-slate-900` e bordas suaves `border-slate-200/80`.
- **Hero Banner:** `h-48 sm:h-64` com gradiente escuro de sobreposição para garantir legibilidade dos botões flutuantes.
- **Card de Identidade Flutuante:** Posicionamento `-mt-16 sm:-mt-20` com cantos arredondados `rounded-3xl` e sombras suaves `shadow-xl`.
- **Barra Inferior da Sacola:** Fixa no rodapé (`fixed bottom-0`) com efeito de vidro fosco (`backdrop-blur-md`), exibindo subtotal e botão de abertura da gaveta.

---

## 3. Estados Interativos e Micro-Animações

- **Active Scale:** Efeito tátil em cliques e toques (`active:scale-95` e `active:scale-[0.99]`).
- **Snap Scroll:** Carrossel de produtos em destaque com rolagem suave horizontal e botões de navegação lateral.
- **Transitions:** Transições de 150ms a 200ms para abertura de modais e fade-in de resultados da busca.