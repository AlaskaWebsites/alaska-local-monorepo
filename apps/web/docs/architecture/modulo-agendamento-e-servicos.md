# 💈 Especificação Técnica: Módulo de Agendamentos, Serviços & Venda Híbrida (Alaska Hub & Pro)

> **Documento de Arquitetura de Software & Estratégia de Produto**  
> **Ecossistema:** Alaska Local (`Alaska Hub` & `Alaska Pro`)  
> **Versão:** 1.0.0  
> **Status:** Aprovado  
> **Última Atualização:** 2026-08-27  

---

## 🎯 1. Visão Geral & A Dor de Negócio

No comércio local, existe uma distinção fundamental entre estabelecimentos de **Alimentação / Food Service** (`menu`), **Vitrines de Produtos / Varejo** (`shop`) e **Prestadores de Serviços & Clínicas** (`hub` e `pro`):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     TAXONOMIA DE EXPERIÊNCIA DO USUÁRIO                         │
├───────────────────┬───────────────────┬───────────────────┬──────────────────────┤
│ 🍔 Alaska Menu    │ 🛍️ Alaska Shop    │ 💈 Alaska Hub     │ ⚖️ Alaska Pro         │
├───────────────────┼───────────────────┼───────────────────┼──────────────────────┤
│ Hamburguerias,    │ Boutiques de moda,│ Barbearias,       │ Clínicas médicas,    │
│ pizzarias, adegas │ semijoias, sapatos│ salões de beleza, │ consultórios odonto, │
│ e delivery        │ e cosméticos      │ estética, tattoos │ advogados, psicólogos│
├───────────────────┼───────────────────┼───────────────────┼──────────────────────┤
│ Ação Principal:   │ Ação Principal:   │ Ação Principal:   │ Ação Principal:      │
│ "Fazer Pedido /   │ "Ver Catálogo /   │ "Agendar Horário  │ "Agendar Consulta /  │
│  Delivery"        │  Comprar Peça"    │  + Escolher Prof."│  Avaliação Técnica"  │
└───────────────────┴───────────────────┴───────────────────┴──────────────────────┘
```

### 💡 A Dor Compartilhada do Agendamento
- **Barbeiros, Tatuadores e Cabeleireiros:** Perdem tempo no WhatsApp respondendo *"Tem horário hoje às 15h?"*, consultando a agenda em papel ou celular e lidando com esquecimentos (*no-show*).
- **Dentistas, Médicos e Esteticistas:** Precisam de triagem prévia do procedimento (ex: profilaxia, avaliação de implante, clareamento) e confirmação formal de horário.
- **O Desafio da Venda Híbrida (Serviços + Produtos Upsell):**
  - O barbeiro corta cabelo, mas também quer vender a **pomada modeladora** ou o **óleo de barba**.
  - O salão faz mechas, mas quer vender o **kit de hidratação home care**.
  - A clínica odontológica faz a profilaxia e quer oferecer o **kit de escovação ortodôntica**.

---

## 🧩 2. Arquitetura da Venda Híbrida (One Codebase)

Em vez de criar plataformas separadas, a arquitetura do **Alaska Local** unifica itens de serviço e produtos na mesma estrutura de sacola (`CartItem`), adicionando contexto de agendamento quando necessário:

```
┌────────────────────────────────────────────────────────┐
│                  SACOLA UNIFICADA                      │
├──────────────────────────┬─────────────────────────────┤
│ 💈 SERVIÇOS SELECIONADOS │ • Corte Fade Navalhado (R$ 45)│
│                          │ • Barba com Toalha (R$ 35)  │
├──────────────────────────┼─────────────────────────────┤
│ 🛍️ PRODUTOS UPSELL       │ • Pomada Matte Efeito Seco (R$ 30)│
├──────────────────────────┼─────────────────────────────┤
│ 📅 DADOS DE AGENDAMENTO  │ • Profissional: Lucas (Master)│
│                          │ • Data: Sábado, 30/08 às 15:30│
└──────────────────────────┴─────────────────────────────┘
```

---

## 🛠️ 3. Análise Comparativa de Tecnologias para Agendamento

Avaliamos três abordagens tecnológicas para suportar o motor de agendamento, balanceando **simplicidade operacional para o lojista**, **custo de infraestrutura** e **velocidade de Go-to-Market**:

| Critério | Opção A: WhatsApp Direct + Slot Picker Local (Fase 1) | Opção B: Google Calendar API (Fase 2 - Recomendada) | Opção C: Cal.com / Motor Próprio Pesado |
| :--- | :--- | :--- | :--- |
| **Complexidade de Infraestrutura** | **Zero** (100% Client-side Nuxt 3) | **Baixa** (Server Route Nuxt / NestJS + Service Account) | **Alta** (Containers dedicados, webhooks complexos) |
| **Adesão do Profissional Local** | **100% Imediata** (Recebe tudo pronto no WhatsApp) | **Excelente** (O profissional já usa o Google Agenda no celular) | **Baixa** (Exige login em novo painel e treinamento) |
| **Sincronização Bidirecional** | Não (confirmação manual no chat) | **Sim** (Bloqueios na agenda pessoal bloqueiam o site) | Sim (Painel próprio) |
| **Custo Mensal por Tenant** | **R$ 0,00** | **R$ 0,00** (Google Workspace / Gmail Free) | Variável ($15 a $50/mês) |
| **Régua Anti No-Show** | Manual via WhatsApp | **Automática** (Notificação no celular + Lembrete WhatsApp) | Automática |

---

## 🚀 4. Arquitetura Recomendada em 2 Fases

### 📍 Fase 1: Slot Picker Dinâmico + Despacho Estruturado no WhatsApp (Zero Custo)
1. **Modelagem no JSON do Tenant (`data/*.json`):**
   - Cadastro de profissionais (`professionals: [{ id, name, role, avatar }]`).
   - Cadastro de serviços com duração estimada (`services: [{ id, name, price, durationMinutes }]`).
   - Horários de funcionamento (`openingHours: { open: "09:00", close: "19:00", intervalMinutes: 30 }`).
2. **Composable `useBookingSlots.ts`:**
   - Gera dinamicamente os horários disponíveis do dia com base na duração total dos serviços escolhidos.
3. **Despacho Formatado:**
   ```text
   💈 *NOVO AGENDAMENTO & PEDIDO — BARBEARIA STYLE*
   ━━━━━━━━━━━━━━━━━━━━━
   📅 *DATA & HORÁRIO:*
   • Data: Sábado, 30/08/2026
   • Horário: 15:30
   • Profissional: Lucas Mendes (Barbeiro Master)

   ✂️ *SERVIÇOS:*
   • 1x Corte Degradê Navalhado — R$ 45,00
   • 1x Barba Terapia com Toalha — R$ 35,00

   🛍️ *PRODUTOS ADICIONAIS:*
   • 1x Pomada Matte Efeito Seco — R$ 30,00

   ━━━━━━━━━━━━━━━━━━━━━
   Subtotal: R$ 110,00
   *TOTAL: R$ 110,00*
   ━━━━━━━━━━━━━━━━━━━━━
   👤 *CLIENTE:* Danilo Gozzi
   📱 *WHATSAPP:* (11) 99999-9999
   💳 *PAGAMENTO:* Pix no Local
   ```

---

### 📍 Fase 2: Sincronização Google Calendar API + Supabase PostgreSQL
1. **Google Calendar API (Service Account):**
   - O Google Calendar atua como a *fonte da verdade* da agenda do profissional.
   - O Nuxt 3 consulta a API `freeBusy` do Google Agenda antes de renderizar os horários livres.
   - Ao confirmar o agendamento, o evento é criado automaticamente com alerta sonoro no celular do profissional.
2. **Tabela de Agendamentos no Supabase (`appointments`):**
   ```sql
   CREATE TABLE appointments (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       tenant_id TEXT NOT NULL,
       professional_id TEXT NOT NULL,
       client_name TEXT NOT NULL,
       client_phone TEXT NOT NULL,
       scheduled_at TIMESTAMPTZ NOT NULL,
       duration_minutes INT NOT NULL DEFAULT 30,
       total_amount DECIMAL(10,2) NOT NULL,
       status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, completed
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
3. **Régua Automática Anti No-Show (BullMQ + WhatsApp API):**
   - **D-1 (24 horas antes):** Lembrete automático com botão de confirmação.
   - **H-2 (2 horas antes):** Lembrete com localização do estabelecimento no Google Maps.

---

## 📋 5. Schemas Zod Propostos (`types/booking.ts`)

```typescript
import { z } from 'zod'

export const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional().default('Profissional'),
  avatar: z.string().optional(),
  available: z.boolean().default(true),
})

export const BookingServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  price: z.number().min(0),
  durationMinutes: z.number().min(5).default(30),
  professionalIds: z.array(z.string()).optional(),
})

export const BookingAppointmentSchema = z.object({
  serviceIds: z.array(z.string()).min(1, 'Selecione pelo menos um serviço'),
  professionalId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD obrigatório'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm obrigatório'),
  customerName: z.string().min(2, 'Nome é obrigatório'),
  customerPhone: z.string().min(10, 'Telefone válido é obrigatório'),
  notes: z.string().optional(),
})

export type Professional = z.infer<typeof ProfessionalSchema>
export type BookingService = z.infer<typeof BookingServiceSchema>
export type BookingAppointment = z.infer<typeof BookingAppointmentSchema>
```

---

## 📈 6. Impacto Comercial & ROI para o Cliente

- **Redução de No-Show:** De 25% para menos de 5% com a clareza e confirmação direta no WhatsApp.
- **Aumento de Ticket Médio (+30%):** A vitrine estimula o cliente que ia apenas cortar o cabelo a comprar a pomada ou adicionar a barba.
- **Diferencial Competitivo Alaska Local:** O barbeiro e o dentista têm uma página própria sem precisar pagar mensalidades de R$ 150 a R$ 300 para softwares legados de agenda.
