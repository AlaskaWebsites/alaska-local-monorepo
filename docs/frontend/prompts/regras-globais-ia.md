# Regras Globais de Arquitetura, Engenharia e IA — Alaska Local

Este documento estabelece as **diretrizes inegociáveis** para o desenvolvimento no projeto Alaska Local. Qualquer inteligência artificial, agente de código (Cursor, Claude, Copilot, Gemini Spark) ou desenvolvedor humano **DEVE** seguir estritamente estas convenções.

---

## 🎯 1. Filosofia Central e Visão de Negócio

1. **One Codebase, Infinite Domains**:
   * O Alaska Local atende tanto o segmento **Alaska Menu** (food service, lanches, adegas, delivery) quanto o **Alaska Hub** (barbearias, clínicas, serviços locais).
   * Uma única base de código Nuxt 3 / NestJS alimenta infinitos domínios próprios e subdomínios, resolvidos dinamicamente por tenant.

2. **Mobile-First & Conversão Extrema**:
   * O usuário final acessa 95% das vezes via smartphone após escanear QR Code na mesa ou clicar no link da bio do Instagram.
   * O carregamento deve ser instantâneo (< 100ms), sem spinners pesados e sem fricção de login para visualização de cardápio/serviços.

3. **Despacho Direto via WhatsApp**:
   * No Estágio 1, a finalização do pedido é estruturada e enviada diretamente para o WhatsApp oficial do lojista (`wa.me/55...`), formatada com quebras de linha claras, emojis intuitivos e resumo financeiro.

---

## 🏛️ 2. Regras Estritas de Engenharia e Clean Architecture

### 2.1. Tipagem Centralizada e Barrel Export (`types/`)
* **REGRA DE OURO**: **NUNCA** declare interfaces TypeScript redundantes ou tipos anônimos soltos dentro de componentes Vue ou páginas.
* Todas as entidades, schemas Zod e interfaces de domínio pertencem à pasta **`types/`** e devem ser exportadas pelo *barrel file* **`types/index.ts`**.
  * Use `CartItem` para itens na sacola.
  * Use `CheckoutFormData` para o formulário de finalização.
  * Use `Tenant`, `Product`, `OptionGroup`, `Option`, `Category`, `StoreReviews`, `TenantTheme`.

### 2.2. Desacoplamento e Responsabilidade Única (SRP)
* Componentes de páginas (`pages/*.vue`) atuam exclusivamente como **orquestradores de layout e contexto**.
* Toda lógica de negócio, chamadas assíncronas, manipulação de estado e cálculos de data/horário pertencem a **Composables** (`composables/*.ts`) ou **Utilitários** (`utils/*.ts`).
* Modais e Drawers devem ser desacoplados em componentes dedicados sob `components/`, utilizando `<Teleport to="body">` e isolando seu próprio estado visual.

### 2.3. Blindagem com Zod Fail-Fast
* Qualquer dado externo (JSONs locais em `data/`, payloads HTTP de requisições, variáveis de ambiente) **DEVE** ser validado com Zod (`.parse()` ou `.safeParse()`) antes de ser consumido pelo restante da aplicação.
* Falhas de validação devem interromper o fluxo de forma expressiva e rastreável, evitando estados inconsistentes em tempo de execução.

---

## ♿ 3. Acessibilidade W3C e Usabilidade (WCAG)

Todo componente interativo, modal ou drawer **DEVE** atender aos seguintes requisitos de acessibilidade:
1. **Atributos ARIA Semânticos**:
   * Modais e Drawers: `role="dialog"`, `aria-modal="true"` e `aria-labelledby="<id-do-titulo>"`.
   * Abas e Categorias: `role="tablist"`, `role="tab"`, `:aria-selected="isSelected"`.
   * Botões de Ação: `aria-label` claro e descritivo com contexto (ex: `aria-label="Remover X-Bacon da sacola"`).
2. **Controle de Foco e Teclado**:
   * Ao abrir um modal, o foco inicial deve ser direcionado para o elemento primário de interação (ex: input `#checkout-name` com `nameInputRef` e `nextTick`).
   * A tecla `Escape` (`ESC`) deve fechar o modal aberto automaticamente.
3. **Bloqueio de Rolagem de Fundo**:
   * Sempre utilizar o composable `useBodyScrollLock(isOpen)` em modais para impedir que o usuário role a página de fundo enquanto o diálogo estiver ativo.

---

## 🎨 4. Sistema Dinâmico de Temas e Design Tokens (`useTenantTheme`)

* O projeto conta com 4 identidades cromáticas por nicho de mercado:
  * 🍔 `food`: Vermelho vibrante (`red-600`), padrão de apetite iFood.
  * ✂️ `barber`: Âmbar Vintage (`amber-500`) com texto escuro nos botões de CTA.
  * 🦷 `health`: Teal Clínico (`teal-600`) para serviços de saúde e estética.
  * 🍷 `drinks`: Roxo / Violeta Neon (`purple-600`) para conveniência e vida noturna.
* **Proibido hardcodar cores de destaque**: Use sempre os tokens de `themeClasses` (`primaryText`, `primaryBg`, `buttonPrimary`, `primaryBorder`, `badgeBg`, `badgeText`, `focusRing`, `glowEffect`, `categoryIndicator`).

---

## 🧪 5. Regras para Testes Automatizados no Vitest

1. **Execução Contínua**:
   * Antes de commitar qualquer alteração, **SEMPRE** execute `npx vitest run` (ou `npm test`) para garantir 100% de aprovação nas 13 suítes de teste.
2. **Tolerância a Espaços em Formatações de Moeda**:
   * O formatador nativo `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` emite o caractere Unicode `\u00A0` (espaço inquebrável) entre o símbolo `R$` e o valor numérico.
   * Asserções no Vitest não devem quebrar por diferença de espaço ASCII vs Unicode; valide substrings semânticas ou use helpers de sanitização.
3. **Mocks Estritos via Schemas**:
   * Crie mocks de `Tenant`, `Product` e `CartItem` através do `TenantSchema.parse(...)` para garantir que o TypeScript e o Zod validem a integridade dos dados de teste.
