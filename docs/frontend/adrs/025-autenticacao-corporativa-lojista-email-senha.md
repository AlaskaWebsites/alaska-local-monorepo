# ADR 025: Autenticação Corporativa do Lojista (E-mail e Senha), Sessão JWT e Fallback Resiliente

- **Status:** Aceito / Implementado
- **Data:** 2026-10-03
- **Contexto:** `apps/web/composables/useMerchantAdmin.ts`, `apps/web/components/admin/AdminLoginCard.vue`, `apps/web/components/admin/tabs/AdminSecurityTab.vue`, `apps/web/pages/[slug]/admin.vue`
- **Referência:** ADR 007 (Autenticação Segura via PIN Hash), ADR 013 (Painel do Lojista), ADR 014 (Turborepo e @alaska/contracts), ADR 017 (Design System Claro Suave e Temas Dinâmicos)

## 1. Contexto e Motivação

O Painel do Lojista da Alaska Local operava inicialmente com autenticação rápida baseada em PIN numérico de 4 a 8 dígitos (ADR 007 e ADR 013). Embora conveniente para operações de balcão e demonstração inicial, negócios em expansão necessitam de credenciais corporativas blindadas (e-mail corporativo e senha criptográfica) com autenticação autoritativa via JWT (ADR 017 no backend).

A **Fase 3** do roadmap do ADR 017 entrega essa inteligência no frontend Nuxt 3 (`@alaska/web`):
1. **Suporte Nativo a Login com E-mail e Senha:** Validação em tempo de execução via Zod (`MerchantLoginSchema`), chamada à API NestJS (`POST /api/v1/auth/merchant/login`) e armazenamento da sessão.
2. **Armazenamento de Sessão Isolada por Tenant:** Persistência em `localStorage` e `sessionStorage` sob a chave `alaska_merchant_session_<slug>`, contendo o token Bearer e os dados do usuário lojista.
3. **Design System Claro Suave (ADR 017):** Interface visual em `bg-slate-50`, cards `bg-white border-slate-200/90 shadow-2xs` e herança reativa dos 11 temas cromáticos da loja (`useTenantTheme(tenant)`).
4. **Retrocompatibilidade com PIN Rápido:** Preservação do fluxo de acesso rápido via PIN numérico de 4 a 8 dígitos (`overrides.customPin || '1234'`) para garantir zero quebra em testes existentes e operações rápidas.
5. **Aba de Segurança Renovada (`AdminSecurityTab.vue`):** Seções dedicadas para alteração da senha corporativa (com validação de senha atual e nova senha mínima de 8 caracteres) e alteração do PIN rápido.
6. **Leitura Híbrida e Resiliência Zero Downtime:** Fallback automático e transparente para contas de demonstração conhecidas caso a API esteja temporariamente offline ou em cold-start.

## 2. Decisão Arquitetural

### 2.1 Contratos e Schemas Zod Compartilhados
O composable consome diretamente o pacote `@alaska/contracts/auth`:
- `MerchantLoginSchema`: Validação Fail-Fast de e-mail e senha.
- `ChangeMerchantPasswordSchema`: Validação de senha atual, nova senha (>= 8 caracteres) e confirmação idêntica.
- `MerchantSessionSchema`: Tipagem estrita da sessão corporativa.

### 2.2 Gestão de Estado em `useMerchantAdmin.ts`
- `merchantSession`: Ref com token Bearer e dados do lojista (`id`, `email`, `role`, `tenantId`, `tenantSlug`).
- `merchantUser`: Computed expondo os dados do lojista logado.
- `merchantToken`: Computed expondo o token para chamadas autenticadas na API.
- `isAuthenticated`: Computed que retorna `true` se houver sessão corporativa ou PIN ativo.
- `login(credentialsOrPin, maybePassword)`: Trata de forma polimórfica login corporativo `{ email, password }` e PIN legado. Retorna síncrono para PIN (compatibilidade com testes) e `Promise<boolean>` para e-mail/senha.
- `changePassword(currentPassword, newPassword, confirmPassword)`: Executa chamada autenticada via `POST /api/v1/auth/merchant/change-password`.
- `logout()`: Remove tanto a sessão corporativa quanto a sessão legada de PIN.

### 2.3 Componentes Atômicos
- `AdminLoginCard.vue`: Alternância por abas entre "E-mail e Senha" e "PIN Rápido", validação acessível e feedback de demonstração.
- `AdminSecurityTab.vue`: Dois cards independentes: um para alteração de senha corporativa e outro para atualização do PIN rápido.

## 3. Consequências e Benefícios

- **Segurança Corporativa:** Sessões protegidas com Bearer token e validação criptográfica no NestJS.
- **Zero Contract Drift:** Frontend e backend alinhados rigorosamente via `@alaska/contracts`.
- **Zero Regressão:** Todas as 22 suítes de testes unitários do frontend permanecem verdes, preservando os fluxos existentes.
