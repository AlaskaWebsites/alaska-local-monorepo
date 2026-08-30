# ADR 003: Desacoplamento de Modais, Composables Especializados, Acessibilidade W3C e Sistema Dinâmico de Temas no Frontend Nuxt 3

**Status:** Aprovado e Implementado  
**Data:** 25 de Agosto de 2026  
**Contexto:** Frontend Nuxt 3 (Estágio 1 - Fundação de Vitrines Digitais)  
**Decisores:** Danilo Gozzi (Alaska Websites / Tech Lead) & Gemini Spark

---

## 1. Contexto e Problema

No início do desenvolvimento do **Estágio 1 (MVP Nuxt 3 Estático)**, a página dinâmica `pages/[slug].vue` acumulou múltiplas responsabilidades operacionais, de apresentação e de negócio em um único arquivo de mais de 500 linhas:
1. **Carregamento de dados de arquivos JSON** via `import.meta.glob`, com resolução de rotas e fallbacks.
2. **Cálculo de status de funcionamento** (loja aberta ou fechada, incluindo regras para horários noturnos que ultrapassam a meia-noite).
3. **Gerenciamento de compartilhamento social** com `navigator.share` (mobile) e cópia para área de transferência (desktop) com feedback toast.
4. **Gerenciamento do estado da sacola de compras** e montagem de pedidos.
5. **Formulário de checkout e despacho para o WhatsApp**, embutido diretamente no template da página.
6. **Duplicação de interfaces TypeScript** locais (`CartItemState`, `CartItemPayload`) sem fonte única de verdade.
7. **Acoplamento cromático**: todas as lojas exibiam tons vermelhos (`food`), ignorando a identidade visual de nichos como barbearias, clínicas e adegas.

Essa sobrecarga violava o **Princípio da Responsabilidade Única (SRP)**, dificultava testes unitários isolados e impedia a evolução escalável do frontend para os Estágios 2 e 3.

---

## 2. Decisões Arquiteturais Tomadas

### 2.1. Desacoplamento do Drawer de Checkout (`components/CartDrawerModal.vue`)
* Extraímos toda a seção de finalização de compras e checkout da página `[slug].vue` para um componente modular independente: `components/CartDrawerModal.vue`.
* O modal utiliza `<Teleport to="body">`, garantindo isolamento da árvore de renderização do Vue.
* Implementamos acessibilidade rigorosa:
  * `role="dialog"` e `aria-modal="true"`.
  * `aria-labelledby="cart-drawer-title"`.
  * Fechamento no teclado via tecla `Escape` (`ESC`).
  * Bloqueio automático de rolagem do fundo através do composable `useBodyScrollLock`.
  * Autofoco no primeiro campo do formulário (`#checkout-name`) via `nameInputRef` e `nextTick`.

### 2.2. Criação de Composables Atômicos e Reutilizáveis
Isolamos a lógica de negócio em composables específicos com auto-import do Nuxt 3:

1. **`composables/useTenant.ts`**:
   * Responsável pela resolução de rotas, leitura de arquivos JSON locais via `import.meta.glob('~/data/*.json', { eager: true })`, validação estrita com Zod (`TenantSchema.parse`) e emissão de erro 404 em caso de estabelecimento inexistente.
   * Totalmente compatível com SSR (Server-Side Rendering) e Vercel Serverless.

2. **`composables/useTenantTheme.ts`**:
   * Sistema de design tokens dinâmicos por segmento de mercado:
     * 🍔 `food`: Vermelho vibrante (`red-600`), padrão iFood.
     * ✂️ `barber`: Âmbar Vintage (`amber-500`) com contraste `text-slate-950`.
     * 🦷 `health`: Teal Clínico (`teal-600`) para consultórios e odontologia.
     * 🍷 `drinks`: Roxo / Violeta Neon (`purple-600`) para adegas e conveniência 24h.
   * Fornece tokens para texto, botões de CTA, badges, contornos dinâmicos, anéis de foco (`focusRing`), efeitos de glow radial e seleção de texto.

3. **`composables/useOpeningHours.ts`**:
   * Encapsula as regras de cálculo de horário de funcionamento, tratando tanto expedientes diurnos (ex: 08:00 às 18:00) quanto expedientes noturnos que viram a meia-noite (ex: 18:00 às 03:00).
   * Elimina a duplicação entre `[slug].vue` e `StoreInfoModal.vue`.

4. **`composables/useShare.ts`**:
   * Encapsula a Web Share API nativa com fallback transparente para cópia no clipboard com estado reativo de feedback toast (`isCopied`).

5. **`composables/useBodyScrollLock.ts`**:
   * Trava de rolagem de body SSR-safe, protegida com `getCurrentInstance()` guard para evitar quebras durante a renderização no servidor.

### 2.3. Padronização Global de Tipos e Barrel Export (`types/`)
* **`types/cart.ts`**: Define `CartItem`, `CheckoutFormData`, `Address`, `DeliveryType`, `PaymentMethod` e `CartState` como fontes canônicas de verdade.
* **`types/index.ts`**: *Barrel file* exportando `tenant` e `cart`, permitindo importações simplificadas em qualquer parte do projeto:
  ```ts
  import type { Tenant, Product, CartItem, CheckoutFormData } from '~/types'
  ```
* **`utils/formatters.ts`**: Centralização de `formatCurrency(value)` e `formatPhone(phone)`.

---

## 3. Consequências e Benefícios

| Aspecto | Antes | Depois |
| :--- | :--- | :--- |
| **Linhas no `[slug].vue`** | ~500 linhas com lógica misturada | ~200 linhas focadas puramente na orquestração da vitrine |
| **Acessibilidade (WCAG)** | Modais sem ARIA e sem foco | 100% compatível com W3C ARIA, foco automático e ESC |
| **Identidade Visual** | Monocromático em vermelho | 4 temas dinâmicos aplicados em tempo real por nicho |
| **Tipagem TypeScript** | Interfaces locais anônimas e redundantes | Tipos centralizados em `types/index.ts` |
| **Cobertura de Testes** | Testes acoplados | 13 suítes com 61+ testes unitários no Vitest passando 100% |

---

## 4. Conformidade e Próximos Passos
* Esta decisão encerra a refatoração do **Estágio 1 (Frontend)** e estabelece a base estável para a integração com o **Estágio 2 (NestJS Backend + Supabase/PostgreSQL RLS)**.
