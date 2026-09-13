# Resiliência Visual e Placeholders SVG Temáticos — Alaska Local Frontend

Este documento detalha o padrão de resiliência visual, prevenção de erros 404 e eliminação de *Cumulative Layout Shift (CLS)* implementado no front-end Nuxt 3 (`apps/web/utils/images.ts`).

---

## 1. O Problema das Imagens em Cardápios e Vitrines Digitais

Em plataformas de comércio local, imagens de produtos são um dos pontos mais frequentes de falha visual:
1. **URLs Externas Quebradas**: Imagens hospedadas em CDNs gratuitas, Imgur ou links temporários de redes sociais expiram ou bloqueiam requisições por hotlinking.
2. **Ícone de Imagem Quebrada**: O navegador exibe um ícone cinza de erro com borda vazia, degradando a credibilidade comercial da loja.
3. **Layout Shift Agressivo (CLS)**: Quando uma imagem falha ao carregar e não possui dimensões estáveis, o grid de produtos sofre saltos visuais abruptos na tela do celular.
4. **Dependência de Imagens Estáticas Pesadas**: Utilizar imagens PNG/JPEG locais genéricas como fallback aumenta o tamanho do bundle e desrespeita a paleta de cores do estabelecimento.

---

## 2. A Solução: Placeholders SVG Dinâmicos em Data URIs

O módulo `apps/web/utils/images.ts` resolve o problema gerando **Placeholders SVG em formato Data URI Base64** calculados em tempo de execução:

```
┌────────────────────────────────────────────────────────┐
│                   <img :src="prod.image"               │
│                        @error="handleImageError">      │
└───────────────────────────┬────────────────────────────┘
                            │ (Erro de rede / 404)
                            ▼
┌────────────────────────────────────────────────────────┐
│             apps/web/utils/images.ts                   │
│                                                        │
│  1. Intercepta evento de erro ($event)                 │
│  2. Identifica o tema da loja (food, barber, etc.)    │
│  3. Gera Data URI SVG customizado:                     │
│     "data:image/svg+xml;utf8,<svg ...>"                │
│  4. Aplica cores primárias e secundárias do tema       │
│  5. Substitui o src da imagem instantaneamente         │
└────────────────────────────────────────────────────────┘
```

---

## 3. Cores Semânticas por Tema Canônico

O SVG gerado adota automaticamente as cores correspondentes à identidade visual da loja:

| Tema | Categoria de Negócio | Fundo do SVG | Cor do Ícone / Acento |
| :--- | :--- | :--- | :--- |
| `food` / `default` | Hamburguerias, Pizzarias | `#fee2e2` (Red 100) | `#ef4444` (Red 500) |
| `amber` | Adegas, Bebidas | `#fef3c7` (Amber 100) | `#f59e0b` (Amber 500) |
| `barber` | Barbearias | `#fef3c7` (Gold 100) | `#d97706` (Amber 600) |
| `rose` | Moda, Semijoias, Boutiques | `#ffe4e6` (Rose 100) | `#f43f5e` (Rose 500) |
| `health` | Odontologia, Médicos | `#ccfbf1` (Teal 100) | `#14b8a6` (Teal 500) |
| `drinks` | Conveniências, Bares | `#f3e8ff` (Purple 100) | `#a855f7` (Purple 500) |
| `violet` | Salões de Beleza, Estética | `#ede9fe` (Violet 100) | `#8b5cf6` (Violet 500) |
| `blue` | Serviços Gerais | `#dbeafe` (Blue 100) | `#3b82f6` (Blue 500) |
| `emerald` | Produtos Naturais | `#d1fae5` (Emerald 100) | `#10b981` (Emerald 500) |
| `slate` | Minimalista / Dark | `#f1f5f9` (Slate 100) | `#64748b` (Slate 500) |

---

## 4. O Listener Obrigatório `@error`

### Regra Inviolável de Componentização
Em qualquer componente da vitrine que renderize produtos (`ProductCard.vue`, `FeaturedProductsCarousel.vue`, `ProductCustomizerModal.vue`):

```html
<img
  :src="product.imageUrl || getPlaceholderImage(tenant?.theme)"
  :alt="product.name"
  class="w-full h-full object-cover"
  loading="lazy"
  @error="handleImageError($event, tenant?.theme)"
/>
```

### Comportamento da Função `handleImageError`:
1. Evita loops infinitos de erro marcando o elemento com atributo de controle.
2. Substitui imediatamente a propriedade `target.src` pelo SVG em Data URI.
3. Remove eventuais classes de skeleton/loading, exibindo o card perfeitamente estilizado e alinhado com o restante da página.

---

## 5. Benefícios de Performance & UX

- **Zero Layout Shift (CLS = 0)**: Os containers utilizam classes de proporção fixa (`aspect-square` para produtos e `aspect-[3/1]` para banners), mantendo o espaço reservado mesmo durante a substituição de imagem.
- **Peso Ínfimo (< 800 bytes)**: Por ser um vetor SVG textual em Data URI, não há download de arquivos binários pesados de fallback.
- **Harmonia Cromática**: Uma barbearia com tema `barber` exibirá placeholders em dourado suave, enquanto uma clínica odontológica exibirá em turquesa suave, preservando o conforto do **Design System Claro Suave**.
