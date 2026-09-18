# ADR 012: Persistência de Configurações Globais e Operacionais da Loja no PostgreSQL

## Status
**Aprovado e Implementado** (Fase 2 - Opção B) — Setembro de 2026

## Contexto
O ecossistema **Alaska Local** permite que os lojistas configurem dinamicamente parâmetros críticos do seu negócio através do Painel Administrativo (`/[slug]/admin`):
1. **Horários de Atendimento e Grade Semanal** (`opening_hours` em JSONB);
2. **Pausa Emergencial da Loja** (`is_closed_emergency` BOOLEAN e `closed_emergency_message` TEXT);
3. **Parâmetros de Delivery & Entrega** (`delivery_fee_cents`, `min_order_value_cents` e `estimated_time`);
4. **Recebimento Direto via Pix D+0** (`pix_config` em JSONB com suporte a taxa zero e modo centavo de teste);
5. **Canais de Contato e Redes Sociais** (`phone_whatsapp` e `instagram`);
6. **Comunicado no Topo da Vitrine** (`announcement` em JSONB com flag `enabled` e texto).

Anteriormente, essas alterações operavam predominantemente em LocalStorage (Camada 1/2). Para que a vitrine pública (`/[slug]`), o cálculo de frete, o checkout e o robô de pedidos do WhatsApp operem em tempo real a partir do banco de dados relacional (Camada 3), fez-se necessária a persistência e mutação canônica no PostgreSQL 16.

## Decisão de Arquitetura

1. **Contratos Canônicos no `@alaska/contracts` (Single Source of Truth)**:
   - `UpdateTenantHoursSchema`: Validação de grade semanal por dia e horários gerais.
   - `UpdateEmergencySchema`: Validação da pausa forçada e mensagem de justificativa.
   - `UpdateDeliveryConfigSchema`: Validação de taxa (reais e centavos), pedido mínimo e tempo estimado.
   - `UpdatePixConfigSchema`: Validação da chave Pix, tipo de chave, favorecido e cidade.
   - `UpdateContactSchema`: Validação do WhatsApp (mínimo 10 dígitos) e perfil do Instagram.
   - `UpdateAnnouncementSchema`: Validação do comunicado da loja.

2. **Evolução do Schema PostgreSQL com DDL Idempotente (`PostgresTenantRepository`)**:
   - `is_closed_emergency BOOLEAN DEFAULT false`
   - `closed_emergency_message TEXT`
   - `announcement JSONB`
   - `estimated_time VARCHAR(50)`
   - `instagram VARCHAR(100)`
   - Execução automática via `ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ...` sem necessidade de migrations manuais em produção.

3. **Casos de Uso Desacoplados no Core de Aplicação (Clean Architecture)**:
   - `UpdateTenantHoursUseCase`
   - `UpdateTenantEmergencyUseCase`
   - `UpdateTenantDeliveryUseCase`
   - `UpdateTenantPixUseCase`
   - `UpdateTenantContactUseCase`
   - `UpdateTenantAnnouncementUseCase`
   - Todos framework-agnostic, dependendo unicamente da porta `ITenantRepository`.

4. **Exposição REST Padronizada via NestJS**:
   - Endpoints sob `/api/v1/tenants/:slug/`:
     - `PATCH /hours`
     - `PATCH /emergency`
     - `PATCH /delivery`
     - `PATCH /pix`
     - `PATCH /contact`
     - `PATCH /announcement`
   - Validados pelo `ZodValidationPipe` retornando RFC 7807 em caso de erro.

## Consequências
- **Consistência Multi-Dispositivo**: Qualquer mudança feita pelo lojista no celular ou desktop reflete instantaneamente para todos os clientes na vitrine pública.
- **Fail-Safe e Resiliência**: Em caso de falha de conexão do lojista, a interface web mantém as alterações salvas em LocalStorage enquanto retenta em background.
- **Cobertura de Testes**: 100% de testes unitários com Vitest cobrindo todos os novos casos de uso e persistência relacional.
