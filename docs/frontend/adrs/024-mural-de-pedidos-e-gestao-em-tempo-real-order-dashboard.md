# ADR 024: Mural de Pedidos em Tempo Real e Gestão Operacional de Comandas (Order Dashboard)

- **Status:** Aceito / Implementado
- **Data:** 2026-09-18
- **Contexto:** `apps/web/composables/useOrderDashboard.ts`, `apps/web/components/admin/tabs/AdminOrdersTab.vue`, `apps/web/components/admin/AdminTabsNav.vue`, `apps/web/pages/[slug]/admin.vue`, `packages/contracts/src/order/index.ts`, `apps/api/src/infrastructure/http/controllers/order.controller.ts`, `apps/api/src/infrastructure/persistence/postgres/postgres-order.repository.ts`, `apps/web/tests/units/order-dashboard.test.ts`
- **Referência:** ADR 013 (Painel do Lojista), ADR 014 (Turborepo & Contracts), ADR 017 (Design System Claro Suave)

---

## 1. Contexto & Problema de Negócio

No ecossistema **Alaska Local** (*Alaska Menu*, *Alaska Shop*, *Alaska Hub* e *Alaska Pro*), o lojista contava com 7 abas operacionais no Painel Administrativo (`/[slug]/admin`) para configuração de catálogo, horários, delivery, especialistas, Pix, comunicado e segurança (PIN).

No entanto, no fluxo diário de vendas, o pequeno comerciante precisava de um **Mural de Pedidos em Tempo Real (Order Dashboard)** para gerenciar a esteira de comandas recebidas no balcão e no delivery:
1. **Visibilidade Imediata das Comandas**: Acompanhar pedidos recebidos via WhatsApp e vitrine digital sem depender exclusivamente de ler mensagens no app do celular.
2. **Avanço de Status com 1 Toque (< 50ms)**: Mover o pedido rapidamente na esteira de produção: `created` / `pending_payment` -> `preparing` (Em Preparo) -> `dispatched` (Saiu para Entrega / Pronto) -> `completed` (Concluído).
3. **Comunicação Ativa com o Cliente no WhatsApp**: Disparar notificações de status personalizadas para o WhatsApp do cliente com 1 toque, gerando transparência e reduzindo a ansiedade do consumidor.
4. **Métricas Financeiras do Dia**: Visualização instantânea no topo do mural com faturamento bruto do dia (R$), total de pedidos atendidos, ticket médio e contador de pedidos pendentes de atenção.
5. **Resiliência Offline-First & Zero Downtime**: Funcionamento tolerante mesmo em cold-start da API ou internet oscilante, com persistência local em `localStorage` sob `alaska_orders_<slug>`.

---

## 2. Decisão Arquitetural & Pilares de Implementação

Estruturamos a solução em 5 pilares modulares:

```
┌────────────────────────────────────────────────────────────────────────┐
│               MURAL DE PEDIDOS EM TEMPO REAL (ADR 024)                 │
├────────────────────────────────────────────────────────────────────────┤
│  MÉTRICAS DO DIA: [📦 Pedidos]  [💰 Faturamento]  [🏷️ Ticket]  [⏳ Novos] │
├────────────────────────────────────────────────────────────────────────┤
│  FILTROS:  [Todos]  [🔔 Novos]  [👨‍🍳 Em Preparo]  [🛵 Em Rota]  [✅ Prontos]│
├────────────────────────────────────────────────────────────────────────┤
│  COMANDAS DE PEDIDOS:                                                  │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ #ORD-101 • 19:42 • 🛵 Delivery   │  │ #ORD-102 • 19:45 • 🛍️ Balcão │  │
│  │ Cliente: Danilo (11 99999-8888) │  │ Cliente: Mariana            │  │
│  │ 2x Smash Burger Especial        │  │ 1x Item Promocional         │  │
│  │ 1x Coca-Cola Lata               │  │ Total: R$ 29,90 (Crédito)   │  │
│  │ Total: R$ 61,90 (Pix)           │  │                             │  │
│  │ [📲 Avisar WhatsApp] [👨‍🍳 Aceitar]│  │ [📲 WhatsApp] [🛵 Despachar]│  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### A. Contrato Canônico no `@alaska/contracts`
Declaramos o schema estrito `OrderDashboardItemSchema` e o tipo `OrderDashboardItem`:
- Identificador único do pedido (`id`) e do tenant (`tenantId`).
- Dados cadastrais do cliente (`customerName`, `customerPhone`).
- Modalidade de entrega (`deliveryType`: `'delivery'` | `'pickup'`) e endereço estruturado (`address`).
- Comanda de itens (`items` com `productName`, `quantity`, `unitPrice`, `options`, `notes`).
- Valores monetários (`subtotal`, `deliveryFee`, `total`).
- Status operacional (`OrderStatusSchema`: `'created'`, `'pending_payment'`, `'confirmed'`, `'preparing'`, `'dispatched'`, `'completed'`, `'cancelled'`).
- Chave e código Pix EMV (`pixCode`).

### B. Enriquecimento da API NestJS (`apps/api`)
1. **`OrderController.listByTenant`**:
   - Atualizado para retornar todos os metadados da comanda: itens detalhados com opções/adicionais, endereço de entrega completo, taxas e observações.
2. **`PostgresOrderRepository.listByTenant`**:
   - Query SQL tolerante que busca por `tenant_id = $1 OR tenant_id = $2 OR tenant_id = $3` aceitando tanto o slug puro (`hamburgueria-x`) quanto o identificador prefixado (`ten-hamburgueria-x`).

### C. Composable Reativo `useOrderDashboard` (`apps/web`)
1. **Leitura e Gravação Híbrida**:
   - Lê instantaneamente do `localStorage` (`alaska_orders_<slug>`) garantindo UI zero latência.
   - Sincroniza assincronamente com `GET /api/v1/orders/tenant/:slug`.
   - Gera comandas de demonstração realistas no primeiro acesso de novas lojas para suporte ao modelo comercial Done-for-You (DFY).
2. **Transições de Status Atômicas**:
   - `updateOrderStatus(orderId, newStatus)`: atualiza a lista em memória, persiste no storage, emite o evento `alaska_orders_updated` e envia `PATCH /api/v1/orders/:id/status`.
3. **Notificação no WhatsApp**:
   - `generateStatusWhatsAppUrl(order, status, tenantName)`: gera links `wa.me/55...` com templates dinâmicos para cada fase (Confirmado, Em Preparo, Saiu para Entrega, Concluído e Cancelado).
4. **Polling Inteligente**:
   - Auto-refresh a cada 15 segundos quando a aba estiver visível e o switch estiver ativo.

### D. Componente Visual `AdminOrdersTab.vue` (Design System Claro Suave — ADR 017)
1. **Cards de Métricas**:
   - 4 blocos em `bg-white border-slate-200/90 shadow-2xs rounded-2xl` com destaque pulsante âmbar se houver comandas aguardando ação.
2. **Barra de Controle & Chips**:
   - Campo de busca instantânea (por nome, WhatsApp ou #ID).
   - Chips com contadores por status operacional.
3. **Cards de Comanda**:
   - Header com `#ID` curto, hora formatada, badges de status e modalidade.
   - Lista legível de itens com adicionais e observações.
   - Ações de 1 toque: botão principal de avanço de status, botão de WhatsApp e cancelamento com confirmação rápida.

### E. Integração no `AdminTabsNav.vue` e `admin.vue`
- Adicionada a aba `'orders'` (`🛎️ Pedidos`) com badge dinâmico do número de pedidos aguardando atenção (`pendingOrdersCount`).
- Rota `pages/[slug]/admin.vue` configurada para abrir diretamente na aba de pedidos (`activeTab = 'orders'`).

---

## 3. Testes Automatizados (Vitest Test Harness)

A suíte em `apps/web/tests/units/order-dashboard.test.ts` cobre 100% dos fluxos operacionais:
1. Inicialização e carregamento híbrido de pedidos.
2. Criação de novo pedido via `addOrder` com persistência em storage.
3. Transição de status da esteira operacional (`created` -> `preparing` -> `dispatched` -> `completed`).
4. Cancelamento de pedido.
5. Cálculo de métricas diárias (total, faturamento excluindo cancelados e ticket médio).
6. Filtragem por status e busca textual.
7. Geração determinística de URLs do WhatsApp por status.

---

## 4. Consequências & Ganhos Operacionais

1. **Autonomia Operacional Completa**: O comerciante gerencia o ciclo de vida completo de cada venda direto pelo celular no balcão.
2. **Redução de Fricção no WhatsApp**: O cliente é mantido informado sobre o andamento do pedido com mensagens pré-formatadas em 1 toque.
3. **Métricas Claras de Venda**: O comerciante sabe exatamente quanto faturou no dia e o ticket médio da operação.
4. **Living Docs Gate**: Documentação sincronizada em frontend e contratos sem ocorrência de *Doc Drift*.
