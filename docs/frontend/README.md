# 📚 Documentação Técnica — Frontend Nuxt 3 & Vitrines Digitais

Bem-vindo à documentação técnica oficial do frontend do ecossistema **Alaska Local** (`apps/web`). Este repositório centraliza as decisões de arquitetura (ADRs), padrões de acessibilidade W3C/WCAG, design system com 11 temas cromáticos e integração com o Painel do Lojista (ADR 013).

---

## 🏛️ Registros de Decisões de Arquitetura (ADRs)

- [ADR 001: Fundação Arquitetural do Frontend](./adrs/001-fase1-fundacao-arquitetural.md) — Nuxt 3, Tailwind CSS, One Codebase, Infinite Domains e SSR defensivo.
- [ADR 002: Arquitetura NestJS e Validação Zod](./adrs/002-arquitetura-nestjs-validacao-zod.md) — Integração de contratos com DTOs e validação estrita.
- [ADR 003: Desacoplamento de Composables e Modais](./adrs/003-desacoplamento-composables-modais-acessibilidade.md) — Acessibilidade W3C/WCAG, trap focus e modais desacoplados.
- [ADR 004: Categorização de Negócios e 4 Verticais](./adrs/004-categorizacao-de-negocios-e-templates.md) — Alaska Menu (Food/Bebidas), Alaska Shop (Varejo/Moda), Alaska Hub (Barbearia/Estética) e Alaska Pro (Clínicas/Consultas).
- [ADR 005: Integração ViaCEP e Preenchimento Automático](./adrs/005-integracao-viacep-autocompletion-endereco.md) — Composable `useCep` com cache em memória e autocompletion de endereço.
- [ADR 006: Módulo de Agendamento de Serviços e Venda Híbrida](./adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md) — Seleção de múltiplos serviços, visagistas, profissionais e cálculo de duração.
- [ADR 007: Cálculo de Horário Noturno e Badges Dinâmicos](./adrs/007-calculo-horario-noturno-e-badges-dinamicos.md) — Algoritmo com suporte a turnos que viram a meia-noite (ex: 18h às 04h).
- [ADR 008: Resiliência de Imagens e Placeholders SVG Temáticos](./adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md) — Tratamento com `handleImageError` e placeholders cromáticos.
- [ADR 009: Protocolo de Despacho via WhatsApp e Venda Híbrida](./adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md) — Formatação de pedidos e agendamentos com chave Pix e sinal.
- [ADR 010: Busca Client-Side Zero Latência e Normalização Unicode](./adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md) — Normalização NFD/NFC com busca instantânea sem acentos.
- [ADR 011: Persistência de Carrinho Namespaced no LocalStorage](./adrs/011-persistencia-carrinho-namespaced-localstorage.md) — Isolamento rigoroso de sacola por loja (`alaska_cart_<slug>`).
- [ADR 012: Arquitetura de Pagamentos Pix Estágio 1](./adrs/012-arquitetura-pagamentos-pix-estagio-1.md) — BR Code EMV BACEN, CRC-16 e renderização de QR Code Base64.
- [ADR 013: Painel do Lojista e Gestão Operacional em Tempo Real](./adrs/013-painel-do-lojista-e-gestao-operacional-em-tempo-real.md) — 5 Abas operacionais, pausa rápida <3s, edição inline de preços, bloqueio de horários e banner de comunicado.
- [ADR 014: Monorepo Unificado com Turborepo e Pacote @alaska/contracts](./adrs/014-monorepo-turborepo-e-pacote-contracts.md) — Workspaces pnpm, pacote de contratos compartilhados e pipeline de CI/CD.

---

## 📐 Guias de Arquitetura & Engenharia

- [Design System & 11 Temas Cromáticos](./architecture/design-system.md) — Paleta de cores, tipografia e classes semânticas.
- [Guia de Acessibilidade W3C/WCAG](./architecture/accessibility-guide.md) — Diretrizes de teclado, leitor de tela e contraste.
- [Estrutura de Componentes e Modais](./architecture/components-guide.md) — Catálogo, customizador de produtos, sacola e agendamento.
- [Estratégia de Testes Unitários no Vitest](./architecture/test-guide.md) — 168+ testes unitários e de acessibilidade.
