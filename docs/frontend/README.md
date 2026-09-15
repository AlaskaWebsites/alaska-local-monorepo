# 🌐 Alaska Local — Front-end Architecture Documentation (`@alaska/web`)

O `@alaska/web` é o frontend do ecossistema **Alaska Local**, projetado sob o paradigma **One Codebase, Infinite Domains** com Nuxt 3, Vue 3, Tailwind CSS e TypeScript.

---

## 🏛️ Pilares de Engenharia do Front-end

1. **One Codebase, Infinite Domains:**  
   Suporte a infinitos estabelecimentos locais (Menu, Shop, Hub e Pro) através de resolução dinâmica por subdomínio wildcard e header `Host`.
2. **End-to-End Type Safety com Monorepo:**  
   Tipagens e schemas Zod centralizados no pacote compartilhado do monorepo, garantindo segurança ponta a ponta.
3. **Integração Client-Server Resiliente:**  
   Estratégia API-First conectada ao NestJS no Render, com fallback offline gracioso para `~/data/*.json` e mutações otimistas em < 50ms no Painel do Lojista.
4. **Motor Comercial WhatsApp:**  
   Despacho estruturado de comandas de delivery, retirada e agendamentos de serviços diretamente no WhatsApp oficial do lojista.
5. **Zero Layout Shift (CLS):**  
   Imagens com placeholders SVG temáticos codificados em Data URI que garantem renderização instantânea mesmo com conexões instáveis.
6. **Acessibilidade W3C / WCAG 2.1 AA:**  
   Todos os modais possuem `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco inicial automático, atalho `Escape` e trava de rolagem com `useBodyScrollLock`.
7. **Pipeline de Deploy Determinístico (ADR 016):**  
   Deploy serverless na Vercel orquestrado via Turborepo e PNPM v10 com Build Output API v3.
8. **Design System Claro Suave (ADR 017):**  
   Padronização visual em `bg-slate-50`, cards `bg-white border-slate-200/90 shadow-2xs` e 11 temas cromáticos dinâmicos.
9. **Resiliência de Contratos em Abas do Admin e Storefront (ADR 018):**  
   Padrão dual-prop, dual-emit, exibição de canais sociais (Instagram), sincronização unidirecional de horários, trava de pedido mínimo no checkout e layout flexbox balanceado.

---

## 📜 Decisões Arquiteturais (ADRs)

- **[ADR 001: Fundação Arquitetural Nuxt 3](./adrs/001-fase1-fundacao-arquitetural.md)** — Estrutura base, roteamento multi-tenant e SSR.
- **[ADR 002: Arquitetura NestJS e Validação Zod](./adrs/002-arquitetura-nestjs-validacao-zod.md)** — Integração com o backend e contratos tipados.
- **[ADR 003: Desacoplamento de Composables e Modais](./adrs/003-desacoplamento-composables-modais-acessibilidade.md)** — Acessibilidade WCAG e separação de concerns.
- **[ADR 004: Categorização de Negócios e Templates](./adrs/004-categorizacao-de-negocios-e-templates.md)** — As 4 verticais: Menu, Shop, Hub e Pro.
- **[ADR 005: Integração ViaCEP e Autocompletion de Endereço](./adrs/005-integracao-viacep-autocompletion-endereco.md)** — Preenchimento inteligente de checkout.
- **[ADR 006: Módulo de Agendamento e Venda Híbrida](./adrs/006-modulo-agendamento-servicos-e-venda-hibrida.md)** — Slots de 30 min, escala semanal e produtos de balcão.
- **[ADR 007: Cálculo de Horário Noturno e Badges Dinâmicos](./adrs/007-calculo-horario-noturno-e-badges-dinamicos.md)** — Indicadores de loja aberta/fechada e turnos noturnos.
- **[ADR 008: Resiliência de Imagens e Placeholders SVG Temáticos](./adrs/008-resiliencia-de-imagens-e-placeholders-svg-tematicos.md)** — Data URIs vetoriais anti-404.
- **[ADR 009: Protocolo de Despacho WhatsApp e Venda Híbrida](./adrs/009-protocolo-despacho-whatsapp-e-venda-hibrida.md)** — Formatação determinística de comandas.
- **[ADR 010: Busca Client-Side Zero Latência e Normalização Unicode](./adrs/010-busca-client-side-zero-latencia-e-normalizacao-unicode.md)** — Busca NFD insensível a acentos.
- **[ADR 011: Persistência de Carrinho Namespaced por Loja](./adrs/011-persistencia-carrinho-namespaced-localstorage.md)** — Isolamento `alaska_cart_<slug>`.
- **[ADR 012: Arquitetura de Pagamentos Pix (Estágio 1)](./adrs/012-arquitetura-pagamentos-pix-estagio-1.md)** — Integração Pix Copia e Cola D+0.
- **[ADR 013: Painel do Lojista e Gestão em Tempo Real](./adrs/013-painel-do-lojista-e-gestao-operacional-em-tempo-real.md)** — Mutações operacionais pelo celular.
- **[ADR 014: Monorepo Turborepo e Pacote @alaska/contracts](./adrs/014-monorepo-turborepo-e-pacote-contracts.md)** — Centralização de contratos Zod.
- **[ADR 015: Desacoplamento Atômico de Componentes Storefront e Admin](./adrs/015-desacoplamento-atomico-componentes-storefront-e-admin.md)** — Páginas como orquestradoras.
- **[ADR 016: Pipeline de CI/CD Vercel com Turborepo e PNPM](./adrs/016-pipeline-ci-cd-vercel-turborepo-pnpm.md)** — Build Output API v3 e deploy contínuo.
- **[ADR 017: Padronização do Design System Claro Suave e Temas Dinâmicos](./adrs/017-padronizacao-design-system-claro-suave-e-temas-dinamicos-admin.md)** — Fundo `bg-slate-50` e temas cromáticos no admin.
- **[ADR 018: Resiliência de Contratos de Props, Emissão Dual de Eventos e Defesa Anti-Crash](./adrs/018-resiliencia-de-contratos-props-e-eventos-das-abas-admin.md)** — Blindagem das abas operacionais do Admin (Catálogo, Pix, Horários, Delivery e Comunicado), exibição de Instagram, trava de pedido mínimo, eliminação de 404 em disponibilidade e layout flexbox balanceado.

---

## 📚 Guias de Arquitetura Frontend (`docs/frontend/architecture/`)

- **[Integração Client-Server Resiliente](./architecture/integracao-client-server.md)** — Estratégia de hidratação e tolerância a cold-start.
- **[Performance, Resiliência e Integração SSR](./architecture/performance-e-resiliencia-frontend.md)** — Cache reativo, deduplicação em voo e Web Share API.
- **[Design System & 11 Temas Cromáticos](./architecture/design-system-e-temas.md)** — Paleta Claro Suave e tokens dinâmicos.
- **[Módulo de Agendamentos & Serviços](./architecture/modulo-agendamento-e-servicos.md)** — Prevenção de horário fantasma e cálculo de slots.
- **[Guia de Criação de Novos Tenants](./operations/guia-criacao-novos-tenants.md)** — Checklist e validação via `pnpm validate:tenants`.
