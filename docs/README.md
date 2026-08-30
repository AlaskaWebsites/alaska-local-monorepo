# 📚 Documentação Centralizada do Ecossistema Alaska Local

Bem-vindo à base de conhecimento unificada do **Alaska Local Monorepo**. Toda a documentação técnica, decisões de engenharia, regras de negócios e manuais operacionais estão centralizados aqui de forma categorizada.

---

## 🧭 Mapa de Navegação da Documentação

### 1. 🌐 [Documentação de Frontend (`docs/frontend/`)](./frontend/)
Tudo sobre vitrines digitais, Nuxt 3, Vue 3, Tailwind CSS e UX:
* **[Design System & 11 Temas Cromáticos](./frontend/design-system-e-temas.md)**: Paletas temáticas (`food`, `barber`, `health`, `drinks`, `rose`, `amber`, etc.).
* **[Módulo de Agendamentos & Venda Híbrida](./frontend/modulo-agendamento-e-servicos.md)**: Composable `useBookingSlots`, seleção de profissionais e sinal Pix.
* **[Padrões de Acessibilidade W3C / WCAG](./frontend/padroes-de-acessibilidade-e-ux.md)**: Requisitos semânticos para modais, formulários e foco acessível.
* **[Categorias Canônicas de Negócio](./frontend/categorias-de-negocio.md)**: Modelos das 4 verticais (*Menu*, *Shop*, *Hub*, *Pro*).

---

### 2. ⚙️ [Documentação de Backend (`docs/backend/`)](./backend/)
Tudo sobre a API REST em NestJS 11, Clean Architecture e Banco de Dados:
* **[Guia de Clean Architecture & DDD](./backend/clean-architecture-guide.md)**: Ports & Adapters, Value Object `Money` (centavos inteiros) e desacoplamento do Core.
* **[Padrões de Validação com Zod](./backend/zod-validation-patterns.md)**: Validação Fail-Fast e pipes customizados.
* **[Engine de Agentes de IA & Pipelines](./backend/ai-agents-pipeline.md)**: Ingestão de cardápios via OCR e automações.
* **[Estratégia de Testes & Qualidade](./backend/estrategia-de-testes-e-qualidade.md)**: Vitest Test Harness e testes em milissegundos.

---

### 3. 📜 [Architecture Decision Records (`docs/adrs/`)](./adrs/)
Histórico imutável de todas as decisões técnicas tomadas no projeto (ADRs 001 a 014):
* **[ADR 001](./adrs/001-fase1-fundacao-arquitetural.md)**: Fundação arquitetural Nuxt 3.
* **[ADR 002](./adrs/002-arquitetura-nestjs-validacao-zod.md)**: Arquitetura NestJS 11 e Zod.
* **[ADR 003](./adrs/003-desacoplamento-composables-modais-acessibilidade.md)**: Acessibilidade W3C/WCAG.
* **[ADR 004](./adrs/004-categorizacao-de-negocios-e-templates.md)**: 4 Verticais de Negócio.
* **[ADR 005](./adrs/005-integracao-viacep-autocompletion-endereco.md)**: Autopreenchimento de CEP com ViaCEP.
* **[ADR 006](./adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md)**: Agendamentos e Venda Híbrida.
* **[ADR 007](./adrs/007-calculo-horario-noturno-e-badges-dinamicos.md)**: Cálculo de turnos noturnos.
* **[ADR 008](./adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md)**: Resiliência de imagens SVG.
* **[ADR 009](./adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md)**: Despacho para WhatsApp.
* **[ADR 010](./adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md)**: Busca client-side com normalização Unicode.
* **[ADR 011](./adrs/011-persistencia-carrinho-namespaced-localstorage.md)**: Carrinho no localStorage.
* **[ADR 012](./adrs/012-arquitetura-pagamentos-pix-estagio-1.md)**: Pix EMV BACEN e QR Code.
* **[ADR 013](./adrs/013-painel-do-lojista-e-gestao-operacional.md)**: Painel do Lojista (Merchant Admin) em tempo real.
* **[ADR 014](./adrs/014-monorepo-unificado-e-compartilhamento-de-contratos.md)**: Monorepo Turborepo e pacote `@alaska/contracts`.

---

### 4. 💼 [Inteligência Comercial & Go-to-Market (`docs/commercial/`)](./commercial/)
* **[Plano de Negócio](./commercial/PLANO_DE_NEGOCIO.md)**: Precificação (Plano Anual Pix D+0 vs Plano Mensal Asaas).
* **[Pitch e Scripts de Vendas](./commercial/PITCH_E_SCRIPTS.md)**: Abordagem consultiva Done-for-You (DFY) e prospecção WhatsApp anti-ban.

---

### 5. 🛠️ [Operações & Runbooks (`docs/operations/`)](./operations/)
* **[Guia de Criação de Demos CLI](./operations/new-demo-guide.md)**: Como gerar novas vitrines em 10 segundos via script CLI.
* **[Runbook do Docker & PostgreSQL](./operations/docker-runbook.md)**: Gestão de containers, volumes e comandos de banco de dados.
