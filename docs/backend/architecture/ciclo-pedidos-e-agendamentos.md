# Ciclo de Vida de Pedidos e Agendamentos — Alaska Local Backend

Este guia documenta o ciclo de vida completo, as máquinas de estados, as regras de negócio e os endpoints de transição para **Pedidos de Delivery/Balcão** e **Agendamentos de Serviços** no backend (`@alaska/api`).

---

## 1. Pedidos de Compra (`Order` Entity)

A entidade `Order` gerencia pedidos nas verticais de alimentação, adegas e produtos físicos (*Alaska Menu* e *Alaska Shop*).

### A. Máquina de Estados de Pedidos

```
                     ┌──────────────────┐
                     │     created      │ (Dinheiro / Cartão no local)
                     └────────┬─────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
     ┌───────────────────┐         ┌───────────────────┐
     │  pending_payment  │ (Pix)   │     confirmed     │
     └─────────┬─────────┘         └─────────┬─────────┘
               │ (Pix pago)                  │
               ▼                             │
     ┌───────────────────┐                   │
     │     confirmed     │◄──────────────────┘
     └─────────┬─────────┘
               │ (Cozinha/Balcão iniciou)
               ▼
     ┌───────────────────┐
     │     preparing     │
     └─────────┬─────────┘
               │ (Saiu para entrega)
               ▼
     ┌───────────────────┐
     │    dispatched     │
     └─────────┬─────────┘
               │ (Entregue ao cliente)
               ▼
     ┌───────────────────┐         ┌───────────────────┐
     │     completed     │         │     cancelled     │ (A qualquer momento)
     └───────────────────┘         └───────────────────┘
```

| Estado | Significado | Condição / Transição |
| :--- | :--- | :--- |
| `created` | Pedido registrado na API | Pagamento em dinheiro ou cartão na entrega/retirada. |
| `pending_payment` | Aguardando liquidação | Pedido com método de pagamento `Pix`. |
| `confirmed` | Pagamento aprovado / Pedido aceito | Transição após validação de pagamento ou aceite do lojista. |
| `preparing` | Em preparação | Estabelecimento montando os itens. |
| `dispatched` | Em trânsito / Pronto | Saiu para entrega via motoboy ou disponível para retirada. |
| `completed` | Concluído com sucesso | Pedido entregue e finalizado. |
| `cancelled` | Cancelado | Pedido cancelado pelo lojista ou cliente. |

### B. Invariantes de Domínio de Pedidos
1. **Total Calculado via `Money` VO:**
   - O subtotal soma `(unitPriceCents + opcionais) * quantidade`.
   - Se a modalidade for `delivery`, soma `deliveryFeeCents`. Se for `pickup`, taxa de entrega é sempre zero.
2. **Proteção contra Confirmação Indevida:**
   - O método `confirmPayment()` lança `ValidationError` caso o pedido já esteja no estado `cancelled`.
3. **Endereço Obrigatório em Delivery:**
   - Se `deliveryType === 'delivery'`, a entidade valida a presença do Value Object `Address`.

---

## 2. Agendamentos de Serviços (`Booking` Entity)

A entidade `Booking` gerencia a marcação de horários com profissionais nas verticais de serviços e saúde (*Alaska Hub* e *Alaska Pro*).

### A. Máquina de Estados de Agendamentos

```
                ┌──────────────────┐
                │    scheduled     │ (Agendado - Aguardando sinal Pix ou confirmação)
                └────────┬─────────┘
                         │
          ┌──────────────┴──────────────┐
          │ (Sinal pago / Aceite)       │ (Cliente faltou)
          ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│    confirmed     │          │     no_show      │
└────────┬─────────┘          └──────────────────┘
         │
         │ (Atendimento finalizado)
         ▼
┌──────────────────┐          ┌──────────────────┐
│    completed     │          │    cancelled     │ (Cancelado pelo cliente/loja)
└──────────────────┘          └──────────────────┘
```

| Estado | Descrição |
| :--- | :--- |
| `scheduled` | Horário pré-reservado na grade do especialista. |
| `confirmed` | Horário confirmado após recebimento do sinal Pix ou confirmação manual. |
| `completed` | Procedimento realizado com sucesso no estabelecimento. |
| `cancelled` | Agendamento desmarcado com liberação do horário. |
| `no_show` | Cliente não compareceu no horário reservado. |

### B. Modalidades de Pagamento (`paymentMode`)
1. **`on_service`**: Pagamento integral realizado no balcão após a execução do serviço.
2. **`pix_deposit`**: Cobrança de sinal Pix (garantia de presença, tipicamente 30% do total).
3. **`pix_full`**: Pagamento de 100% do valor antecipadamente via Pix.

### C. Invariantes de Agendamento
* **Duração Total Somada:** O método `calculateTotalDurationMinutes()` soma a duração individual de todos os procedimentos selecionados.
* **Dados de Contato Mínimos:** Validação estrita de WhatsApp com DDD (mínimo de 10 dígitos) e nome do cliente.

---

## 3. Endpoints REST de Gestão de Ciclo de Vida

### Pedidos (`/api/v1/orders`)
* `POST /api/v1/orders` — Criação do pedido com validação de itens, cálculo de frete e geração de payload Pix EMV quando aplicável.
* `GET /api/v1/orders/:id` — Consulta detalhes e status do pedido.
* `GET /api/v1/orders/tenant/:tenantId` — Listagem de pedidos de um estabelecimento específico.
* `PATCH /api/v1/orders/:id/status` — Atualiza o status do pedido (`body: { status: OrderStatus }`).

### Agendamentos (`/api/v1/bookings`)
* `POST /api/v1/bookings` — Registro de agendamento de serviços com profissional, data, horário e cálculo de sinal.
* `GET /api/v1/bookings/:id` — Consulta dados e status do agendamento.
* `GET /api/v1/bookings/tenant/:tenantId?date=YYYY-MM-DD` — Lista agendamentos filtrados por data e loja.
* `PATCH /api/v1/bookings/:id/status` — Atualiza o status do agendamento (`body: { status: BookingStatus }`).
