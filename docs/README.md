# 📚 Documentação do Ecossistema Alaska Local

Bem-vindo à base de conhecimento centralizada do **Alaska Local Monorepo**.

---

## 🧭 Estrutura de Documentação

### 1. [Architecture Decision Records (ADRs)](./adrs/)
Registros históricos e decisões de engenharia imutáveis do projeto:
* **[ADR 001](./adrs/001-fase1-fundacao-arquitetural.md)**: Fundação arquitetural da Fase 1 (Nuxt 3).
* **[ADR 002](./adrs/002-arquitetura-nestjs-validacao-zod.md)**: Arquitetura NestJS e validação Fail-Fast com Zod.
* **[ADR 003](./adrs/003-desacoplamento-composables-modais-acessibilidade.md)**: Acessibilidade W3C/WCAG e desacoplamento de modais.
* **[ADR 004](./adrs/004-categorizacao-de-negocios-e-templates.md)**: As 4 verticais canônicas (*Menu*, *Shop*, *Hub*, *Pro*).
* **[ADR 005](./adrs/005-integracao-viacep-autocompletion-endereco.md)**: Autopreenchimento de endereço com ViaCEP.
* **[ADR 006](./adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md)**: Agendamentos e venda híbrida.
* **[ADR 007](./adrs/007-calculo-horario-noturno-e-badges-dinamicos.md)**: Cálculo de turnos noturnos e badges.
* **[ADR 008](./adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md)**: Resiliência de imagens SVG temáticas.
* **[ADR 009](./adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md)**: Despacho formatado para WhatsApp.
* **[ADR 010](./adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md)**: Busca client-side com normalização Unicode NFD.
* **[ADR 011](./adrs/011-persistencia-carrinho-namespaced-localstorage.md)**: Carrinho namespaced no localStorage.
* **[ADR 012](./adrs/012-arquitetura-pagamentos-pix-estagio-1.md)**: Arquitetura de pagamentos Pix EMV e QR Code.
* **[ADR 013](./adrs/013-painel-do-lojista-e-gestao-operacional.md)**: Painel do Lojista (Merchant Admin) em tempo real.
* **[ADR 014](./adrs/014-monorepo-unificado-e-compartilhamento-de-contratos.md)**: Monorepo Turborepo e pacote `@alaska/contracts`.

---

### 2. [Arquitetura & Engenharia](./architecture/)
* **[Monorepo e Contratos Compartilhados](./architecture/monorepo-e-contratos-compartilhados.md)**: Especificação completa do Turborepo e `@alaska/contracts`.
* **[Design System e 11 Temas Cromáticos](./architecture/design-system-e-temas.md)**: Cores, tipografia e classes utilitárias por nicho.
* **[Módulo de Agendamentos](./architecture/modulo-agendamento-e-servicos.md)**: Lógica de slots, profissionais e duração.
* **[Padrões de Acessibilidade](./architecture/padroes-de-acessibilidade-e-ux.md)**: Requisitos W3C/WCAG para modais e formulários.
* **[Estratégia de Testes](./architecture/estrategia-de-testes-e-qualidade.md)**: Vitest Test Harness e portões de qualidade.

---

### 3. [Inteligência Comercial & GTM](./commercial/)
* **[Plano de Negócio](./commercial/PLANO_DE_NEGOCIO.md)**: Estratégia de precificação (Plano Anual Pix D+0 vs Plano Mensal no Asaas).
* **[Pitch e Scripts de Vendas](./commercial/PITCH_E_SCRIPTS.md)**: Abordagem consultiva Done-for-You (DFY) e prospecção WhatsApp anti-ban.

---

### 4. [Operações & Runbooks](./operations/)
* Automação de demos com CLI (`node scripts/new-demo.js <slug> "<Nome>" "<Telefone>"`).
* Orquestração local com Docker e PostgreSQL 16 (`docker compose up -d postgres`).
