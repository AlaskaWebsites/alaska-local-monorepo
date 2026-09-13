# Módulo de Agendamentos & Venda Híbrida — Alaska Local

Este guia documenta o funcionamento técnico, os algoritmos e os padrões de interface do módulo de **Agendamento de Horários e Venda Híbrida** (`useBookingSlots.ts` e `BookingModal.vue`), utilizado nas verticais **Alaska Hub** (barbearias, salões de beleza, estúdios) e **Alaska Pro** (clínicas odontológicas, médicos e profissionais liberais).

---

## 1. Visão Geral do Fluxo em 4 Passos

O agendamento opera em um modal semântico W3C/WCAG (`role="dialog"`, `aria-modal="true"`) estruturado em 4 etapas sequenciais:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PASSO 1    │ ──► │   PASSO 2    │ ──► │   PASSO 3    │ ──► │   PASSO 4    │
│ Procedimentos│     │ Especialista │     │ Data/Horário │     │ Confirmação  │
│  & Duração   │     │ (Profissional│     │ & Bloqueios  │     │ & Sinal Pix  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Passo 1: Seleção de Serviços & Duração**:
   - Seleção múltipla com checkbox de procedimentos.
   - Cálculo automático da **duração total somada** e do valor total.
2. **Passo 2: Escolha do Especialista**:
   - Opção de escolher um profissional específico ou "Qualquer Profissional Disponível".
3. **Passo 3: Seleção de Data e Horário**:
   - Carrossel horizontal com os próximos 30 dias com rolagem suave e navegação por setas no desktop (`scrollBy(240px, smooth)`).
   - Grade de slots de 30 minutos filtrada por expediente, intervalo de almoço e bloqueios manuais.
4. **Passo 4: Identificação, Sinal Pix e Despacho**:
   - Coleta de Nome e WhatsApp com máscara.
   - Cálculo e exibição do sinal Pix de garantia (30% do total) com QR Code Base64 e Copia e Cola.
   - Botão dedicado para cópia rápida da chave Pix com feedback temporário (2,5s).
   - Despacho estruturado para o WhatsApp do lojista.

---

## 2. Regras Invioláveis de Extração de Dados

### A. Extração Dinâmica de Serviços e Profissionais
* **Zero Dicionários Hardcoded**: É expressamente proibido utilizar mapeamentos estáticos por slug de loja (ex: `|| defaultServicesBySlug['barbearia-style']`).
* **Origem dos Serviços**: Os serviços são extraídos dinamicamente de `props.tenant.categories`.
* **Separação de Serviços vs Venda Física**:
  * Procedimentos de agendamento possuem **`durationMinutes > 0`** (ex: 30, 45, 60 min).
  * Produtos de varejo/balcão possuem **`durationMinutes === 0`** e categoria com nome contendo "Produto" ou "Venda". Eles são **estritamente filtrados e excluídos** da grade de agendamento, ficando disponíveis apenas para compra direta na sacola.
* **Origem dos Especialistas**: Extraídos dinamicamente de `props.tenant.professionals`. Profissionais sem a flag explícita recebem fallback de disponibilidade ativa (`isAvailable: true`).

---

## 3. Blindagens Anti-Bug e Prevenção de Horário Fantasma

### A. Bloqueio Estrito no Passo 3 (`canAdvance`)
Para eliminar o bug de "horário fantasma" (onde o usuário conseguia avançar para o resumo sem ter selecionado um horário válido):
1. **Validação de Avanço**: O botão "Avançar" só é habilitado se:
   - Uma data estiver selecionada.
   - Um horário válido (`selectedTime`) estiver selecionado.
   - A data selecionada possuir ao menos 1 vaga disponível.
2. **Tratamento Amigável de 0 Vagas**:
   - Caso o dia selecionado não tenha horários disponíveis (todos ocupados ou especialista de folga), a interface exibe um card amigável com alerta visual e **dois botões de ação rápida**:
     - *Navegar para o próximo dia com vagas*.
     - *Trocar de especialista*.

### B. Proteção contra Horários Passados no Dia de Hoje
No dia corrente (`today`), o gerador de slots compara o horário do slot com o relógio local (`now.getHours() * 60 + now.getMinutes()`), descartando automaticamente slots que já tenham passado.

---

## 4. Algoritmo de Cálculo de Slots (`useBookingSlots.ts`)

```ts
// Geração de slots de 30 minutos respeitando expediente e almoço
const startMin = workStartH * 60 + workStartM
const endMin = workEndH * 60 + workEndM
const lunchStart = lunchStartH * 60 + lunchStartM
const lunchEnd = lunchEndH * 60 + lunchEndM

for (let current = startMin; current + requiredDuration <= endMin; current += 30) {
  // Ignora se colidir com intervalo de almoço do profissional
  if (hasLunch && current < lunchEnd && (current + requiredDuration) > lunchStart) {
    continue
  }
  // Ignora se o horário estiver marcado como bloqueado no painel admin
  if (isSlotBlocked(dateStr, timeStr)) {
    continue
  }
  availableSlots.push(timeStr)
}
```

---

## 5. Venda Híbrida & Upsell no WhatsApp
Ao finalizar o agendamento, o cliente tem a opção de anexar produtos físicos do catálogo (ex: pomada modeladora em barbearia, clareador dental em clínica). O link do WhatsApp é despachado com a síntese combinada de serviços e produtos de upsell.
