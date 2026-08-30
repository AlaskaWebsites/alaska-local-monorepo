# Padrões de Acessibilidade (W3C/WCAG 2.1 AA) e Micro-UX

A experiência do usuário no **Alaska Local** segue rigorosamente as diretrizes internacionais de acessibilidade semântica W3C / WCAG, garantindo que qualquer cliente — incluindo pessoas com deficiência visual ou motora — consiga navegar, selecionar itens e fechar pedidos ou agendamentos com facilidade.

---

## 1. Trava de Rolagem e Gerenciamento de Foco (`useBodyScrollLock.ts`)

Ao abrir qualquer modal ou gaveta lateral (`CartDrawerModal`, `StoreInfoModal`, `StoreReviewsModal`, `BookingModal`, `ProductCustomizerModal`):
1. **Trava do `<body>`:** O composable `useBodyScrollLock` adiciona `overflow: hidden` ao `document.body`.
2. **Prevenção de Salto de Layout:** Compensa a largura do scrollbar no desktop com `paddingRight` dinâmico, impedindo o layout de tremer horizontalmente.
3. **Restauração Automática:** Restaura o estado original do scroll ao fechar o modal ou desmontar o componente.

---

## 2. Atributos Semânticos ARIA e Suporte a Teclado

Todos os modais implementam:
- **Diálogo Modal:** `role="dialog"` e `aria-modal="true"`.
- **Rótulo do Diálogo:** `aria-labelledby="{modal-id-title}"`.
- **Atalho Universal ESC:** Fechamento síncrono ao pressionar a tecla `Escape` em qualquer modal aberto.
- **Regiões Semânticas:** Áreas de resumo da sacola usam `role="region"` com `aria-label`, e listas de itens usam `role="list"` e `role="listitem"`.
- **Status Dinâmico:** Badges de horário utilizam `role="status"` e `aria-label` com descrição contextual completa.

---

## 3. Resposta Tátil no Mobile (`useHaptic.ts`)

Para enriquecer a experiência em smartphones que suportam a API `navigator.vibrate`:
- **Suave (Light - 10ms):** Acionado ao clicar em filtros de categoria, abas ou botões secundários.
- **Médio (Medium - 25ms):** Acionado ao adicionar produtos à sacola ou alterar quantidades (+/-).
- **Sucesso (Success - [15ms, 50ms, 25ms]):** Padrão rítmico acionado ao concluir um pedido ou agendamento no WhatsApp.