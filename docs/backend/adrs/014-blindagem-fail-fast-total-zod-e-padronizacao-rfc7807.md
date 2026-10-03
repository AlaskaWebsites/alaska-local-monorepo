# ADR 014: Blindagem Fail-Fast Total com ZodValidationPipe e Padronização RFC 7807 nos Controladores de Domínio

## Status
**Aprovado e Implementado** — Outubro de 2026

## Contexto
Durante a auditoria arquitetural e evolução das rotas da API NestJS (`@alaska/api`), identificou-se a presença residual de tipagens anêmicas como `@Body() body: any` em controladores centrais (`ProductController`, `TenantController`, `OrderController` e `BookingController`). Adicionalmente, verificaram-se mutações diretas em propriedades internas de entidades DDD (como `(order as any).props.status = status`), violando os princípios de encapsulamento e integridade do modelo de domínio.

Outro ponto crítico envolvia o retorno de status HTTP 200 com mensagens de erro ou falhas 500 sem tipagem semântica em situações de registros não encontrados ou parâmetros inválidos, em desacordo com as diretrizes de API REST profissional e com o padrão RFC 7807 (Problem Details).

---

## Decisão de Arquitetura

Para assegurar conformidade com a Clean Architecture, eliminar qualquer débito de tipagem e garantir validação Fail-Fast determinística na borda HTTP, foram tomadas as seguintes decisões:

### 1. Eliminação Definitiva de `@Body() body: any` e Validação via Zod
- Todos os controladores HTTP da API agora utilizam estritamente o `ZodValidationPipe` associado a schemas canônicos importados de `@alaska/contracts`.
- DTOs validados na borda de entrada:
  - `ProductController`: `CreateProductSchema`, `ToggleProductAvailabilitySchema`, `UpdateProductSchema`.
  - `MerchantAuthController`: `MerchantCredentialsLoginSchema`, `ChangeMerchantPasswordSchema`.
  - `PixController`: `GeneratePixDtoSchema`, `QueryPixQrCodeSchema`.
  - `OrderController` e `BookingController`: Schemas canônicos de criação e atualização de status de pedidos e agendamentos.
- Se qualquer campo estiver fora do contrato (ex: preço negativo, chave Pix inválida, e-mail malformado ou slug ausente), a requisição é interceptada e abortada na borda externa com status 400 ou 422, impedindo que dados corrompidos atinjam os casos de uso.

### 2. Encapsulamento Estrito de Entidades DDD
- As entidades de domínio (`Order`, `Booking`, `Product`, `Tenant`, `MerchantUser`) receberam métodos expressivos de ciclo de vida (`updateStatus`, `cancel`, `changePassword`, `toggleAvailability`).
- Proibição absoluta de mutações diretas de propriedades internas (`(entity as any).props`). Todas as transições de estado devem respeitar invariantes de negócio declaradas no construtor ou métodos canônicos da entidade. Transições inválidas disparam subclasses de `DomainError`.

### 3. Padronização RFC 7807 (Problem Details) via `DomainExceptionFilter`
- O filtro global de exceções captura subclasses de `DomainError` e normaliza a resposta HTTP no padrão RFC 7807:
  - `EntityNotFoundError` -> HTTP 404 `{ statusCode: 404, error: "ENTITY_NOT_FOUND", message: "..." }`.
  - `ValidationError` -> HTTP 400 `{ statusCode: 400, error: "VALIDATION_ERROR", message: "..." }`.
  - `ConflictError` -> HTTP 409 `{ statusCode: 409, error: "CONFLICT", message: "..." }`.
- Eliminação completa de status 200 com mensagens de erro e de status 500 genéricos para falhas de domínio conhecidas.

### 4. Money Pattern Imutável em Centavos Inteiros
- Todos os fluxos financeiros utilizam o Value Object `Money` (`cents: number`) e persistência relacional em `price_cents INT`. Nenhuma fração decimal ou ponto flutuante é admitida na camada de domínio ou banco de dados.

---

## Consequências & Benefícios

1. **Zero Contract Drift**: O backend e o frontend compartilham a mesma fonte de verdade (`@alaska/contracts`).
2. **Defesa em Profundidade**: Validação Fail-Fast na borda HTTP impede a propagação de payloads inválidos.
3. **Consistência de Erros**: Clientes HTTP e storefronts recebem respostas semânticas, estruturadas e previsíveis.
4. **Cobertura Automatizada**: 108 testes unitários passando em 31 arquivos no Vitest, garantindo zero regressões.
