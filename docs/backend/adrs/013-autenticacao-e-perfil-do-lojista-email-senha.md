# ADR 013: Autenticação Corporativa do Lojista (E-mail e Senha), Hash Seguro e Sessão JWT

## Status
**Aprovado e Implementado** (Fase 2) — Outubro de 2026

## Contexto
O ecossistema **Alaska Local** operava originalmente com autenticação administrativa baseada em PIN numérico de 4 a 8 dígitos (ADR 007). Essa abordagem supriu com eficiência o acesso rápido no balcão e demonstrações operacionais. Contudo, a evolução do produto e a adesão de estabelecimentos de maior porte exigiram credenciais corporativas blindadas com e-mail e senha criptográfica, gestão de identidade desacoplada e tokens de sessão autoritativos.

Para atender a esses requisitos sem quebrar o fluxo de acesso rápido existente, implementou-se na API NestJS (`@alaska/api`) a camada de autenticação corporativa do lojista, baseada em Clean Architecture e DDD.

---

## Decisão de Arquitetura

### 1. Entidade Pura de Domínio (`MerchantUser`)
Criada em `src/core/domain/entities/merchant-user.entity.ts`, sem qualquer dependência de frameworks ou decorators externos:
- Encapsula identidade (`id`, `tenantId`, `tenantSlug`, `email`, `name`, `role`).
- Proteção criptográfica de senha com hashing seguro (`createWithPassword`, `validatePassword`, `changePassword`).
- Defesa contra timing attacks na verificação de hash.
- Validação de regras de negócio: e-mail corporativo válido, senha com no mínimo 8 caracteres na alteração e controle de ativação (`isActive`).

### 2. Contratos Canônicos Compartilhados (`@alaska/contracts`)
Integração direta com os schemas Zod de borda:
- `MerchantCredentialsLoginSchema`: Validação Fail-Fast de e-mail, senha e slug do tenant.
- `ChangeMerchantPasswordSchema`: Validação de senha atual, nova senha e confirmação idêntica.
- `CreateMerchantUserSchema`: Estrutura para provisionamento administrativo.
- `MerchantSessionSchema`: Tipagem da sessão com token JWT e dados do usuário.

### 3. Inversão de Dependência e Repositórios (`MerchantUserRepository`)
- **Porta Abstrata (`src/core/domain/repositories/merchant-user.repository.ts`)**: Define operações puras `findByEmailAndTenant`, `findById`, `create`, `update` e `countByTenant`.
- **Adaptador em Memória (`InMemoryMerchantUserRepository`)**: Utilizado para testes unitários com velocidade máxima e auto-provisionamento de lojistas de demonstração (`dono@hamburgueria.com.br`, `contato@bamatec.com.br`).
- **Adaptador PostgreSQL (`PostgresMerchantUserRepository`)**:
  - DDL idempotente: Criação automática da tabela `merchant_users` com índices únicos em `(tenant_id, email)` e `(tenant_slug, email)`.
  - Isolamento multi-tenant: Filtros e políticas RLS vinculando cada usuário ao seu respectivo `tenant_id`.

### 4. Casos de Uso no Core de Aplicação
- **`AuthenticateMerchantCredentialsUseCase`**: Localiza o lojista, valida a senha com hash seguro e emite o token JWT com claims completas (`userId`, `tenantId`, `tenantSlug`, `email`, `role`).
- **`ChangeMerchantPasswordUseCase`**: Valida a senha atual, aplica a nova senha criptografada na entidade e persiste a alteração de forma atômica no banco de dados.

### 5. Controladores HTTP e Guards (`MerchantAuthController`)
- Endpoints REST sob `/api/v1/auth/merchant`:
  - `POST /api/v1/auth/merchant/login`: Autenticação e emissão de JWT.
  - `POST /api/v1/auth/merchant/change-password`: Alteração de senha, protegido por Bearer Token e `MerchantAuthGuard`.
- Validação universal de payload via `ZodValidationPipe` retornando RFC 7807 em erros.

---

## Consequências e Benefícios

- **Segurança Corporativa:** Sessões protegidas por JWT assinado, hash seguro com salt e suporte a políticas de complexidade de senha.
- **Isolamento Estrito:** Cada lojista só autentica e altera credenciais no escopo do seu próprio estabelecimento.
- **Zero Regressão:** Acesso rápido via PIN (ADR 007) preservado como alternativa no painel.
- **Cobertura Completa:** 108 testes unitários passando em 31 arquivos no Vitest no backend.
