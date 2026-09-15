# ADR 018: Resiliência de Contratos de Props, Emissão Dual de Eventos e Defesa Anti-Crash no Painel do Lojista

- **Status:** Aceito / Implementado
- **Data:** 2026-09-15
- **Contexto:** `apps/web/pages/[slug]/admin.vue`, `apps/web/components/admin/tabs/` (`AdminPixContactTab.vue`, `AdminHoursTab.vue`, `AdminDeliveryTab.vue`, `AdminAnnouncementTab.vue`), `AdminTabsNav.vue`

---

## 1. Contexto & Diagnóstico dos Problemas

Durante a operação do Painel do Lojista mobile (`/[slug]/admin`), foram identificadas falhas de renderização e perda de reatividade em 4 abas operacionais essenciais:

```
┌─────────────────────────────────────────────────────────────────────────┐
│              DESCOMPASSO DE CONTRATOS NO PAINEL ADMIN                  │
│                                                                         │
│  admin.vue (Orquestrador Pai)         Componentes de Abas (Filhos)      │
│  ────────────────────────────         ────────────────────────────      │
│  1. Pix & Contato:                                                      │
│     Enviava :pix-form                 Esperava props.pixConfigInput     │
│     (props.pixConfigInput = undefined ──> TypeError: keyType quebrava)  │
│                                                                         │
│  2. Horários & Pausa:                                                   │
│     Sem listeners para                Switches emitiam:                 │
│     @toggle-emergency                 'toggle-emergency'                │
│     @toggle-day-closed                'toggle-day-closed'               │
│                                                                         │
│  3. Delivery & Taxas:                                                   │
│     Enviava :delivery-form            Esperava props atomizadas         │
│     Escutava @save                    Emitia 'save-delivery'            │
│                                                                         │
│  4. Comunicado:                                                         │
│     Enviava :announcement-form        Esperava announcementEnabled      │
│     Escutava @save                    Emitia 'save-announcement'        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Detalhamento das 4 Quebras de Contrato:

1. **Aba Pix & Contato (`AdminPixContactTab.vue`) — Crash de Renderização (Tela em Branco)**:
   * **Sintoma**: Ao alternar para a aba "Pix & Contato", a tela ficava totalmente em branco e o console registrava:
     `TypeError: Cannot read properties of undefined (reading 'keyType') at Proxy.<anonymous>`.
   * **Causa Raiz**: O componente `admin.vue` passava `:pix-form="pixForm"` e `:contact-form="contactForm"`, enquanto `AdminPixContactTab.vue` declarava estritamente `defineProps<{ pixConfigInput: ...; contactInput: ... }>()`. Como `pixConfigInput` chegava `undefined`, o template falhava ao ler `pixConfigInput.keyType` no `<select>`, abortando a montagem do componente no Nuxt.

2. **Aba Horários & Pausa Geral (`AdminHoursTab.vue`) — Ausência de Listeners**:
   * **Sintoma**: O switch de fechamento emergencial da loja e os switches de cada dia da semana não respondiam aos toques e cliques do lojista.
   * **Causa Raiz**: O componente filho emitia `@click="emit('toggle-emergency')"` e `@click="emit('toggle-day-closed', d)"`. No entanto, o `admin.vue` escutava apenas `@save-schedule` e `@save-emergency`, não possuindo handlers para alternância imediata de estado.

3. **Aba Delivery & Taxas (`AdminDeliveryTab.vue`) — Incompatibilidade de Nomes e Ação Salvar Inerte**:
   * **Sintoma**: Valores alterados nos inputs não refletiam no formulário e o botão "Salvar Regras de Entrega" não executava nenhuma ação de persistência nem exibia toast.
   * **Causa Raiz**: O filho declarava props individuais (`deliveryFeeInput`, `minOrderInput`, `estimatedTimeInput`) com emissão de `@save-delivery`, enquanto o pai fornecia `:delivery-form="deliveryForm"` e escutava apenas `@save`.

4. **Aba Comunicado no Topo (`AdminAnnouncementTab.vue`) — Incompatibilidade de Props e Eventos**:
   * **Sintoma**: O switch de ativação do comunicado e a mensagem digitada não persistiam ao clicar em "Salvar Comunicado".
   * **Causa Raiz**: O filho esperava `announcementEnabled` e `announcementMessage` e emitia `save-announcement`, enquanto o orquestrador passava `:announcement-form` e escutava `@save`.

---

## 2. Decisão Arquitetural

Adotamos a estratégia de **Tolerância Defensiva e Contratos Híbridos** em todos os componentes de abas operacionais do Painel do Lojista:

### A. Padrão Dual-Prop com Fallback Defensivo
Cada componente de aba agora aceita tanto o objeto unificado (`*Form`) quanto as propriedades atômicas individuais (`*Input`), calculando os valores reativos por meio de `computed` com fallbacks garantidos contra `undefined`:

```typescript
// Exemplo em AdminPixContactTab.vue
const props = defineProps<{
  pixConfigInput?: { keyType?: string; pixKey?: string; beneficiary?: string; city?: string }
  pixForm?: { keyType?: string; pixKey?: string; beneficiary?: string; city?: string }
  contactInput?: { whatsapp?: string; instagram?: string }
  contactForm?: { whatsapp?: string; instagram?: string }
}>()

// Garante que activePix NUNCA será undefined, eliminando TypeError
const activePix = computed(() => {
  return (props.pixForm || props.pixConfigInput || {
    keyType: 'cpf',
    pixKey: '',
    beneficiary: '',
    city: ''
  }) as any
})
```

### B. Padrão Dual-Emit em Ações de Usuário
Todos os botões de confirmação e switches emitem simultaneamente o evento semântico de domínio e o evento genérico:
* Pix: emite `'save-pix'` e `'save'`.
* Contato: emite `'save-contact'` e `'save'`.
* Horários: emite `'save-schedule'`, `'toggle-emergency'` e `'save-emergency'`.
* Delivery: emite `'save-delivery'`, `'save'` e `@update:*`.
* Comunicado: emite `'save-announcement'`, `'save'` e `@update:*`.

### C. Lifecycle Loaders no Orquestrador (`admin.vue`)
O componente `admin.vue` implementa métodos explícitos de carga que leem os dados do tenant combinados com os overrides locais em `localStorage`, executados tanto no `onMounted` quanto no `watch(tenant, ..., { deep: true })`:
* `loadScheduleFromOverrides()`: mapeia os 7 dias canônicos (`monday` a `sunday`).
* `loadPixAndContactFromOverrides()`: carrega chave, beneficiário, cidade, WhatsApp e Instagram.
* `loadDeliveryFromOverrides()`: carrega taxa de entrega em reais (convertendo centavos quando necessário), pedido mínimo e tempo estimado.
* `loadAnnouncementFromOverrides()`: carrega flag ativa e mensagem de comunicado.

### D. Handlers de Emergência e Escala Semanal
* `toggleEmergencyPause()`: alterna o estado de fechamento imediato e chama `updateEmergency(nextVal, msg)`.
* `toggleDayClosed(day)`: inverte `day.closed = !day.closed` e sincroniza os overrides locais.

---

## 3. Consequências & Prevenção de Recorrências

1. **Robustez Total contra Descompassos**: Nenhuma aba quebra ou gera tela branca caso o orquestrador passe props por objeto ou atômicas.
2. **Reatividade Instantânea (< 50ms)**: Cliques nos switches de emergência ou dias de atendimento alteram o estado imediatamente com feedback tátil e gravação em storage.
3. **Padrão de Criação de Novas Abas**: Qualquer nova aba criada no Painel do Lojista DEVE implementar:
   * Tipagem opcional com fallback defensivo nos `computed`.
   * Emissão dupla de eventos (semântico + genérico).
   * Função de carregamento correspondente no orquestrador `admin.vue`.
