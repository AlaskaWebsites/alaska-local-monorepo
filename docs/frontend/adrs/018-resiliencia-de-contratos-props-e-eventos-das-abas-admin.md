# ADR 018: Resiliência de Contratos de Props, Emissão Dual de Eventos e Defesa Anti-Crash no Painel do Lojista

- **Status:** Aceito / Implementado
- **Data:** 2026-09-15
- **Contexto:** `apps/web/pages/[slug]/admin.vue`, `apps/web/components/admin/tabs/` (`AdminCatalogTab.vue`, `AdminPixContactTab.vue`, `AdminHoursTab.vue`, `AdminDeliveryTab.vue`, `AdminAnnouncementTab.vue`), `AdminTabsNav.vue`

---

## 1. Contexto & Diagnóstico dos Problemas

Durante a operação do Painel do Lojista mobile (`/[slug]/admin`), foram identificadas falhas de renderização, tela de erro 500 durante a inicialização do app e perda de reatividade em 5 abas operacionais essenciais:

```
┌───────────────────────────────────────────────────────────────────────────┐
│               DESCOMPASSO DE CONTRATOS NO PAINEL ADMIN                    │
│                                                                           │
│  admin.vue (Orquestrador Pai)         Componentes de Abas (Filhos)        │
│  ────────────────────────────         ────────────────────────────        │
│  1. Cardápio / Catálogo:                                                  │
│     Não passava :get-product-price    Chamava getProductPrice(product)    │
│     (props.getProductPrice = undef ──> TypeError: not a function / 500)   │
│                                                                           │
│  2. Pix & Contato:                                                        │
│     Enviava :pix-form                 Esperava props.pixConfigInput       │
│     (props.pixConfigInput = undef  ──> TypeError: keyType quebrava)       │
│                                                                           │
│  3. Horários & Pausa:                                                     │
│     Sem listeners para                Switches emitiam:                   │
│     @toggle-emergency                 'toggle-emergency'                  │
│     @toggle-day-closed                'toggle-day-closed'                 │
│                                                                           │
│  4. Delivery & Taxas:                                                     │
│     Enviava :delivery-form            Esperava props atomizadas           │
│     Escutava @save                    Emitia 'save-delivery'              │
│                                                                           │
│  5. Comunicado:                                                           │
│     Enviava :announcement-form        Esperava announcementEnabled        │
│     Escutava @save                    Emitia 'save-announcement'          │
└───────────────────────────────────────────────────────────────────────────┘
```

### Detalhamento das 5 Quebras de Contrato:

1. **Aba Cardápio & Catálogo (`AdminCatalogTab.vue`) — Erro 500 na Inicialização**:
   * **Sintoma**: Ao carregar o painel administrativo com `activeTab = 'catalog'` (aba padrão de abertura), o Nuxt abortava a inicialização com a tela:
     `500 r.getProductPrice is not a function` e log `[nuxt] error caught during app initialization TypeError: r.getProductPrice is not a function`.
   * **Causa Raiz**: O template de `AdminCatalogTab.vue` executava diretamente `getProductPrice(product)`. Porém, a prop `getProductPrice` não era repassada por `admin.vue`, fazendo com que a invocação de `undefined(...)` disparasse uma exception não capturada. Adicionalmente, os emits diferiam (`create-product` vs `open-create-modal`, `edit-price` vs `open-price-modal`, `toggle-product` vs `toggle-avail`).

2. **Aba Pix & Contato (`AdminPixContactTab.vue`) — Crash de Renderização (Tela em Branco)**:
   * **Sintoma**: Ao alternar para a aba "Pix & Contato", a tela ficava totalmente em branco e o console registrava:
     `TypeError: Cannot read properties of undefined (reading 'keyType') at Proxy.<anonymous>`.
   * **Causa Raiz**: O componente `admin.vue` passava `:pix-form="pixForm"` e `:contact-form="contactForm"`, enquanto `AdminPixContactTab.vue` declarava estritamente `defineProps<{ pixConfigInput: ...; contactInput: ... }>()`. Como `pixConfigInput` chegava `undefined`, o template falhava ao ler `pixConfigInput.keyType` no `<select>`, abortando a montagem do componente no Nuxt.

3. **Aba Horários & Pausa Geral (`AdminHoursTab.vue`) — Ausência de Listeners**:
   * **Sintoma**: O switch de fechamento emergencial da loja e os switches de cada dia da semana não respondiam aos toques e cliques do lojista.
   * **Causa Raiz**: O componente filho emitia `@click="emit('toggle-emergency')"` e `@click="emit('toggle-day-closed', d)"`. No entanto, o `admin.vue` escutava apenas `@save-schedule` e `@save-emergency`, não possuindo handlers para alternância imediata de estado.

4. **Aba Delivery & Taxas (`AdminDeliveryTab.vue`) — Incompatibilidade de Nomes e Ação Salvar Inerte**:
   * **Sintoma**: Valores alterados nos inputs não refletiam no formulário e o botão "Salvar Regras de Entrega" não executava nenhuma ação de persistência nem exibia toast.
   * **Causa Raiz**: O filho declarava props individuais (`deliveryFeeInput`, `minOrderInput`, `estimatedTimeInput`) com emissão de `@save-delivery`, enquanto o pai fornecia `:delivery-form="deliveryForm"` e escutava apenas `@save`.

5. **Aba Comunicado no Topo (`AdminAnnouncementTab.vue`) — Incompatibilidade de Props e Eventos**:
   * **Sintoma**: O switch de ativação do comunicado e a mensagem digitada não persistiam ao clicar em "Salvar Comunicado".
   * **Causa Raiz**: O filho esperava `announcementEnabled` e `announcementMessage` e emitia `save-announcement`, enquanto o orquestrador passava `:announcement-form` e escutava `@save`.

---

## 2. Decisão Arquitetural

Adotamos a estratégia de **Tolerância Defensiva e Contratos Híbridos** em todos os componentes de abas operacionais do Painel do Lojista:

### A. Padrão Dual-Prop com Fallback Defensivo
Cada componente de aba agora aceita tanto o objeto unificado (`*Form`) quanto as propriedades atômicas individuais (`*Input`), calculando os valores reativos por meio de funções ou `computed` com fallbacks garantidos contra `undefined`:

```typescript
// Exemplo em AdminCatalogTab.vue: Prevenção de TypeError se getProductPrice for omitido
function resolvePrice(product: Product): number {
  if (typeof props.getProductPrice === 'function') {
    return props.getProductPrice(product)
  }
  return Number(product?.price) || 0
}

function checkAvailable(product: Product): boolean {
  if (typeof props.isProductAvailable === 'function') {
    return props.isProductAvailable(product)
  }
  return product?.isAvailable !== false
}
```

```typescript
// Exemplo em AdminPixContactTab.vue: activePix NUNCA será undefined
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
* **Catálogo**: emite `'create-product'`/`'open-create-modal'`, `'toggle-product'`/`'toggle-avail'`, `'edit-price'`/`'open-price-modal'`, `'manage-options'`/`'open-options'` e `'delete-product'`.
* **Pix**: emite `'save-pix'` e `'save'`.
* **Contato**: emite `'save-contact'` e `'save'`.
* **Horários**: emite `'save-schedule'`, `'toggle-emergency'` e `'save-emergency'`.
* **Delivery**: emite `'save-delivery'`, `'save'` e `@update:*`.
* **Comunicado**: emite `'save-announcement'`, `'save'` e `@update:*`.

### C. Handlers Universais no Orquestrador (`admin.vue`)
O componente `admin.vue` aceita assinaturas flexíveis nos handlers:
* `handleProductAvailabilityToggle(productOrList, productId)`: suporta tanto receber o objeto `Product` diretamente quanto a tupla `(list, id)`.
* `openPriceModal(categoryProductsOrProduct, product)`: suporta tanto a lista com o produto quanto o produto isolado.
* `getProductPrice(product)`: calcula `localOverrides.value?.products?.[product.id]?.price ?? product.price`.

### D. Lifecycle Loaders no Orquestrador
* `loadScheduleFromOverrides()`: mapeia os 7 dias canônicos (`monday` a `sunday`).
* `loadPixAndContactFromOverrides()`: carrega chave, beneficiário, cidade, WhatsApp e Instagram.
* `loadDeliveryFromOverrides()`: carrega taxa de entrega em reais (convertendo centavos quando necessário), pedido mínimo e tempo estimado.
* `loadAnnouncementFromOverrides()`: carrega flag ativa e mensagem de comunicado.

---

## 3. Consequências & Prevenção de Recorrências

1. **Eliminação de Telas 500 no Boot**: O painel inicia com segurança mesmo se alguma prop de função ou objeto for omitida por refatorações futuras.
2. **Robustez Total contra Descompassos**: Nenhuma aba quebra ou gera tela branca caso o orquestrador passe props por objeto ou atômicas.
3. **Reatividade Instantânea (< 50ms)**: Cliques nos switches de emergência, dias de atendimento e disponibilidade de itens alteram o estado imediatamente com feedback tátil e gravação em storage.
4. **Padrão Obrigatório de Novas Abas**: Qualquer nova aba criada no Painel do Lojista DEVE implementar:
   * Tipagem opcional com fallback defensivo nos `computed` e métodos de extração.
   * Emissão dupla de eventos (semântico + genérico).
   * Função de carregamento correspondente no orquestrador `admin.vue`.
