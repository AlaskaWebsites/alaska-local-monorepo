# ADR 007: Autenticação Segura do Painel do Lojista com PIN Hash e Bearer Token

## Status
Aceito (Accepted)

## Data
2026-09-01

## Contexto e Problema
No Estágio 1 e 2, o Painel do Lojista (`/[slug]/admin`) utilizava uma validação de PIN de 4 dígitos estritamente client-side com valor mockado (`1234`). 
Com a evolução para o **Estágio 3 (Escala & Multi-Tenancy)** e a persistência em banco de dados PostgreSQL com múltiplos lojistas reais em produção:
1. Mutações administrativas críticas (pausar produtos, alterar preços e editar horários) não podem depender de validações exclusivamente locais no navegador.
2. O PIN de acesso de cada estabelecimento deve ser armazenado como hash criptográfico seguro (`pin_hash`), evitando vazamento em caso de inspeção do banco.
3. Requisições administrativas à API NestJS devem ser autorizadas através de um Bearer Token emitido após login bem-sucedido.
4. Deve ser mantida a resiliência e retrocompatibilidade com demonstrações locais em `~/data/*.json` através de fallback transparente.

## Decisão de Arquitetura

1. **Camada de Domínio e Ports Puros:**
   - Criação da porta `IPasswordHasher` (`src/core/application/ports/password-hasher.port.ts`) para manter o Core 100% puro e desacoplado de bibliotecas de criptografia.
   - Atualização da entidade `Tenant` (`src/core/domain/entities/tenant.entity.ts`) com o atributo opcional `pinHash` e método de verificação `verifyPin(pin: string, hasher: IPasswordHasher): Promise<boolean>`.

2. **Caso de Uso de Autenticação (`AuthenticateMerchantUseCase`):**
   - Recebe `slug` e `pin`.
   - Busca o tenant pelo repositório.
   - Verifica o PIN contra o hash armazenado (com fallback para o PIN padrão de demo `1234` caso o tenant não tenha `pin_hash` configurado).
   - Emite um token de sessão contendo identificador do tenant, slug e timestamp.

3. **Contratos Zod em `@alaska/contracts`:**
   - Definição de `MerchantLoginSchema` (`pin: z.string().min(4).max(8)`) e `MerchantAuthResponseSchema` (`authenticated: boolean`, `token?: string`, `message?: string`).

4. **Guarda de Segurança HTTP e Endpoint:**
   - Criação do endpoint `POST /tenants/:slug/admin/login` no `TenantController`.
   - Implementação de `MerchantAuthGuard` para proteção de mutações administrativas.

5. **Persistência e Migrations DDL:**
   - Criação da migração SQL `002_add_pin_hash_to_tenants.sql` adicionando a coluna `pin_hash VARCHAR(255)` na tabela `tenants`.

6. **Integração no Frontend (`useMerchantAdmin.ts`):**
   - O composable tenta autenticar contra a API NestJS; caso a API esteja indisponível, recorre ao mock local mantendo demonstrações comerciais 100% operacionais.

## Consequências e Regras Estritas

- **Isolamento e Segurança Multi-Tenant:** Apenas requisições autenticadas com token válido para o respectivo tenant podem executar mutações de catálogo e horários.
- **Testes Determinísticos no Vitest:** O caso de uso e a validação de PIN são testados no Vitest com `InMemoryTenantRepository` e implementações mock de hasher sem dependência de banco de dados.
- **Zero Downtime em Demos:** Clientes sem backend conectado continuam funcionando no modo local com PIN padrão.
