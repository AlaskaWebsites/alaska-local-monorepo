# ADR 023: Persistência e Sincronização do PIN Administrativo no PostgreSQL

## Status
**Aprovado e Implementado** (Fase 2 - Ponto C) — Setembro de 2026

## Contexto
O Painel Administrativo (`/[slug]/admin`) é protegido por um PIN numérico de 4 a 8 dígitos (ADR 007). Anteriormente, a alteração de PIN através da aba **Segurança** (`AdminSecurityTab.vue`) persistia o novo PIN unicamente no LocalStorage do dispositivo do lojista (`saveOverrides({ customPin: newPin })`).

Isso causava um desacoplamento entre dispositivos: se o lojista alterasse o PIN no smartphone, o computador do balcão ou outro sócio continuava exigindo o PIN original ou o PIN padrão (`1234`). Para consolidar a arquitetura multi-tenant em 3 camadas e fechar o ciclo de autonomia de **todas as 7 abas do painel**, fez-se necessária a persistência e mutação do hash criptográfico do PIN diretamente no PostgreSQL.

## Decisão de Arquitetura

1. **Contrato Canônico no `@alaska/contracts` (ADR 014)**:
   - Definição do schema `ChangeAdminPinSchema`:
     ```typescript
     export const ChangeAdminPinSchema = z.object({
       currentPin: z.string().min(4).max(8).optional(),
       newPin: z
         .string()
         .min(4, 'O novo PIN deve ter no mínimo 4 dígitos')
         .max(8, 'O novo PIN deve ter no máximo 8 dígitos'),
     });
     export type ChangeAdminPinDto = z.infer<typeof ChangeAdminPinSchema>;
     ```

2. **Caso de Uso no Core de Aplicação (`ChangeAdminPinUseCase`)**:
   - Totalmente desacoplado de framework (Clean Architecture).
   - Valida o `currentPin` contra o hash atual (ou fallback `1234` se o lojista nunca configurou hash).
   - Realiza o hash seguro do novo PIN via `IPasswordHasher` (com salt de domínio).
   - Atualiza a entidade de domínio `Tenant` e persiste via `ITenantRepository`.

3. **Evolução do Schema e Persistência no PostgreSQL (`PostgresTenantRepository`)**:
   - DDL idempotente garantindo a coluna `pin_hash VARCHAR(255)` na tabela `tenants`.
   - Mapeamento bidirecional no `TenantMapper` (`row.pin_hash` <-> `tenant.pinHash`).

4. **Exposição REST Padronizada via NestJS (`TenantController`)**:
   - Endpoint `PATCH /api/v1/tenants/:slug/admin/pin`.
   - Validação na borda HTTP via `ZodValidationPipe(ChangeAdminPinSchema)`.
   - Tratamento de erro padronizado RFC 7807 (400 Bad Request se o PIN atual estiver incorreto).

5. **Sincronização em Background no Frontend (`useMerchantAdmin.ts`)**:
   - O método `changePin(newPin, currentPin)` atualiza o LocalStorage imediatamente (resposta < 50ms com feedback tátil) e dispara `$fetch` em background para persistir o hash no PostgreSQL.

## Consequências
- **Consistência Total entre Dispositivos**: A alteração do PIN feita em qualquer aparelho passa a valer instantaneamente em qualquer navegador ou dispositivo conectado.
- **100% de Cobertura do Painel**: Todas as 7 abas do Painel do Lojista (`Catálogo`, `Horários`, `Delivery`, `Pix & Contatos`, `Especialistas`, `Comunicado` e `Segurança`) agora possuem persistência autoritativa no banco relacional.
- **Validação Automatizada**: 100% dos testes unitários do frontend (`merchant-admin.test.ts`) e do backend (`change-admin-pin.use-case.test.ts`) passam com sucesso.
