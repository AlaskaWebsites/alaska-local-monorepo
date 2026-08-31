# ADR 013: Painel do Lojista (Merchant Admin) e Gestão Operacional em Tempo Real

- **Status:** Aceito / Implementado
- **Data:** 2026-08-30
- **Contexto:** Rota `/[slug]/admin`, Composable `useMerchantAdmin`, Gestão de Produtos/Preços, Horários, Pausa Emergencial, Delivery, Agenda e Banner de Comunicado

---

## 1. Contexto & Problema

Com a maturação das vitrines digitais do Alaska Local (*Menu*, *Shop*, *Hub* e *Pro*), identificou-se uma necessidade operacional crítica para pequenos e médios comerciantes: **autonomia e controle em tempo real pelo celular sem necessidade de redeploy ou painéis complexos de SaaS corporativo**.

Cenários reais do dia a dia do lojista:
1. **Acabou um insumo na cozinha/balcão:** Uma hamburgueria fica sem Coca-Cola lata ou sem bacon às 21h no sábado. O lojista precisa pausar o produto no cardápio em menos de 3 segundos pelo celular.
2. **Mudança de preço imediata:** O preço da carne ou cerveja subiu e o lojista precisa atualizar o valor de R$ 28,90 para R$ 31,90 diretamente no cardápio.
3. **Cozinha lotada / Chuva torrencial:** O lojista precisa pausar o atendimento geral da loja com 1 toque ou estender o horário de encerramento de 23:30 para 02:00.
4. **Ajuste de taxa de entrega:** Alterar a taxa de entrega em dias de alta demanda (ex: de R$ 5,00 para R$ 8,00) e alinhar o tempo de espera estimado (ex: 45-60 min).
5. **Bloqueio de horários em barbearias e clínicas:** O profissional precisa tirar 1 hora de folga ou almoço e bloquear a agenda daquele horário para evitar que clientes agendem.
6. **Comunicado oficial:** Divulgar uma promoção ou aviso de retirada no balcão no topo da vitrine.

---

## 2. Decisões Arquiteturais

### A. Autenticação Leve por PIN da Loja
* Em vez de exigir login com e-mail, senha e verificação em duas etapas no balcão, o lojista acessa `/[slug]/admin` e digita seu **PIN de 4 dígitos** (padrão: `1234`).
* A sessão é armazenada de forma segura e isolada por tenant (`sessionStorage.getItem('alaska_admin_auth_<slug>')`).

### B. Mutações Otimistas (< 50ms) e Persistência Híbrida
* Toda alteração feita no painel dispara uma mutação reativa imediata na interface com feedback tátil (`useHaptic`).
* O estado é salvo instantaneamente em `localStorage` sob a chave isolada `alaska_overrides_<slug>` e sincronizado assincronamente com o backend NestJS (`/api/v1/tenants/:slug/...`).
* A vitrine pública (`[slug]/index.vue`) consome o `effectiveTenant` reativo, ouvindo o evento nativo `storage` para atualizar na mesma hora.

### C. 5 Abas Operacionais Adaptativas por Vertical

O painel se adapta automaticamente ao segmento do comércio:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PAINEL DO LOJISTA (ADR 013)                       │
├───────────────────┬───────────────────┬──────────────────┬─────────────┤
│ ⚡ PRODUTOS       │ 📅 AGENDA         │ 🕒 HORÁRIOS &    │ 🛵 DELIVERY │
│ • Pausa < 3s      │ • Bloqueio de     │   PAUSA GERAL    │ • Taxa      │
│ • Edição de preço │   horários/folga  │ • Abrir/Fechar   │ • Pedido mín│
│   e duração       │ • Slots livres    │ • Expediente     │ • Espera    │
├───────────────────┴───────────────────┴──────────────────┴─────────────┤
│ 📢 COMUNICADO DA LOJA                                                  │
│ • Ativar banner de aviso oficial no topo da vitrine pública            │
└────────────────────────────────────────────────────────────────────────┘
```

1. **⚡ Cardápio / Serviços:** Switches W3C/WCAG para pausar/ativar produtos e botão de edição rápida de preço em modal flutuante.
2. **📅 Agenda & Bloqueios** *(Exclusivo para Alaska Hub & Pro — Barbearias e Clínicas)*: Grade de horários com botões rápidos para bloquear/liberar slots específicos.
3. **🕒 Horários & Pausa Geral:** Configuração de abertura/fechamento e botão de emergência *"🛑 Pausar Atendimento da Loja Agora"*.
4. **🛵 Delivery & Taxas** *(Para Alaska Menu & Shop)*: Taxa de entrega dinâmica, pedido mínimo e tempo estimado de espera.
5. **📢 Comunicado:** Switch para ativar banner de aviso personalizado no topo da loja.

### D. Padrão de UX para Produtos Esgotados na Vitrine
* **Transparência**: O produto pausado NÃO desaparece do cardápio (o que faria o cliente achar que a loja cancelou o item).
* **Feedback Visual**: Exibição da tag vermelha **`Esgotado`**, imagem com opacidade reduzida e overlay escuro central **`ESGOTADO`**.
* **Bloqueio de Clique**: Botão substituído por um badge cinza **`Indisponível`** com clique desabilitado.

### E. Bloqueio Rígido de Pedidos Fora do Expediente / Loja Pausada
* Dentro do carrinho (`CartDrawerModal.vue`), se a loja estiver fora do expediente ou pausada:
  * Exibe tarja de aviso vermelha no topo da sacola.
  * Substitui o botão verde de WhatsApp por um botão cinza bloqueado: **`Loja Fechada • Pedidos Desabilitados`**.

---

## 3. Estrutura de Contratos e Schemas Zod (`@alaska/contracts`)

```typescript
export const ToggleProductAvailabilitySchema = z.object({
  isAvailable: z.boolean()
})

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  priceCents: z.number().int().positive().optional(),
  isAvailable: z.boolean().optional()
})

export const UpdateTenantHoursSchema = z.object({
  openingHours: OpeningHoursSchema
})

export const UpdateTenantDeliverySchema = z.object({
  deliveryFee: z.number().nonnegative().optional(),
  minOrderValue: z.number().nonnegative().optional(),
  estimatedTime: z.string().optional()
})

export const UpdateTenantAnnouncementSchema = z.object({
  isEnabled: z.boolean().default(false),
  message: z.string().optional().default('')
})

export const UpdateTenantEmergencyCloseSchema = z.object({
  isClosed: z.boolean().default(false),
  reason: z.string().optional().default('')
})

export const BlockBookingSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional().default('Horário Bloqueado pelo Lojista')
})
```

---

## 4. Endpoints REST no Backend (`apps/api`)

* `PATCH /api/v1/tenants/:slug/products/:productId/availability` — Pausa/ativação rápida de item.
* `PUT /api/v1/tenants/:slug/products/:productId` — Edição de preço e detalhes do produto.
* `PATCH /api/v1/tenants/:slug/hours` — Atualização de horários de funcionamento.
* `POST /api/v1/bookings` — Registro de agendamentos com garantia de chave estrangeira no PostgreSQL.
* `POST /api/v1/orders` — Criação de pedidos com cálculo de taxa de entrega e totais.

---

## 5. Benefícios & Consequências

- **Autonomia do Lojista:** O comerciante gerencia o cardápio, estoque do dia, horários e recados diretamente pelo smartphone.
- **Zero Fricção:** Sem necessidade de redeploy ou processos lentos de build para atualizar preços e produtos.
- **Segurança de Vendas:** Clientes não conseguem enviar pedidos quando o restaurante está fechado ou com insumo esgotado.
