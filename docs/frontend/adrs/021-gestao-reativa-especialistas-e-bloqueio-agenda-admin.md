# ADR 021: Gestão Reativa de Especialistas, Escala Semanal e Bloqueio de Agenda no Painel do Lojista

- **Status:** Aceito / Implementado
- **Data:** 2026-09-17
- **Contexto:** `apps/web/pages/[slug]/admin.vue`, `apps/web/components/admin/tabs/AdminAgendaTab.vue`, `apps/web/composables/useMerchantAdmin.ts`, `apps/web/composables/useBookingSlots.ts`
- **Referências:** ADR 006 (Módulo de Agendamentos e Venda Híbrida), ADR 013 (Painel do Lojista), ADR 018 (Resiliência de Contratos e Props), ADR 020 (Sincronização Canônica do Catálogo com PostgreSQL), ADR 011 (Backend: Persistência de Profissionais e Bloqueio de Agenda no PostgreSQL)

---

## 1. Contexto & Problema

Nos estabelecimentos prestadores de serviços (**Alaska Hub** e **Alaska Pro**, como barbearias, salões, clínicas e consultórios), o Painel do Lojista mobile (`/[slug]/admin`) disponibiliza a **Aba 2: Especialistas e Agenda** (`AdminAgendaTab.vue`).

Nessa aba, o lojista realiza quatro ações operacionais críticas:
1. **Cadastro e Exclusão de Especialistas**: Adicionar novos profissionais de atendimento (`createProfessional`) ou demitir/remover (`deleteProfessional`).
2. **Disponibilidade Imediata**: Pausar ou ativar a agenda de um especialista específico quando ele se ausenta ou adoece (`toggleProfessionalAvailability`).
3. **Gestão de Escala Semanal e Expediente**:
   - Alternar dias de atendimento (Segunda a Domingo).
   - Ajustar horários de início e fim de atendimento (`workHours: { start, end }`).
   - Ativar e ajustar intervalo de almoço (`lunchBreak: { start, end, enabled }`).
4. **Bloqueio Cirúrgico de Horários (Slots)**: Bloquear datas e horários específicos em que o estabelecimento não poderá atender clientes (`toggleBlockSlot`).

### A Vulnerabilidade do LocalStorage
Anteriormente, essas mutações eram armazenadas exclusivamente em chaves locais do navegador (`alaska_overrides_<slug>`). Como consequência:
- Agendamentos feitos por clientes na vitrine continuavam exibindo horários bloqueados no celular do lojista.
- A troca de aparelho pelo lojista ou limpeza do navegador causava a perda total da escala dos profissionais.

---

## 2. Decisão Arquitetural

Adotamos a orquestração reativa com persistência direta na API NestJS e banco PostgreSQL (ADR 011):

### A. Fluxo Assíncrono com `refresh()` Automático no Admin
No componente `apps/web/pages/[slug]/admin.vue`, todos os manipuladores de eventos da `AdminAgendaTab.vue` passam a ser assíncronos (`async/await`) e acionam `await refresh()` do `useTenant()`:
1. `handleCreateProfSubmit(form)`: Envia `POST /api/v1/tenants/:slug/professionals` e recarrega o tenant.
2. `handleDeleteProf(profId, name)`: Envia `DELETE /api/v1/tenants/:slug/professionals/:profId` e recarrega o tenant.
3. `handleProfAvailabilityToggle(profId, currentAvailable, name)`: Envia `PATCH /api/v1/tenants/:slug/professionals/:profId/availability` e atualiza a UI.
4. `handleProfDayToggle(profId, dayIndex, name)`: Envia `PATCH /api/v1/tenants/:slug/professionals/:profId` com o novo array `availableDays`.
5. `handleProfWorkHoursChange(profId, workHours, name)`: Envia `PATCH /api/v1/tenants/:slug/professionals/:profId` com `workHours`.
6. `handleProfLunchChange(profId, lunchBreak, name)`: Envia `PATCH /api/v1/tenants/:slug/professionals/:profId` com `lunchBreak`.
7. `handleSlotToggle(date, time)`: Envia `POST /api/v1/tenants/:slug/slots/toggle` e atualiza a lista de slots bloqueados.

### B. Integração com a Vitrine e Prevenção de Double Booking
- O composable `useBookingSlots.ts` passa a consumir a lista canônica de profissionais do tenant e a lista de slots bloqueados da API.
- Horários bloqueados pelo lojista recebem imediatamente status `'booked'` ou `'blocked'`, ficando indisponíveis para seleção no `BookingModal.vue`.

---

## 3. Consequências & Prevenção de Recorrências

1. **Zero Divergência de Agenda**: O que o lojista bloqueia no celular reflete instantaneamente para todos os clientes que tentarem agendar pelo WhatsApp.
2. **Escalas Robustas**: A escala de trabalho de cada barbeiro ou dentista fica salva com segurança na nuvem no PostgreSQL do estabelecimento.
3. **Resiliência a Desconexões**: O `useMerchantAdmin.ts` mantém atualização otimista local para feedback instantâneo (< 50ms) e timeout estendido de 15s para conexões lentas ou cold starts.
