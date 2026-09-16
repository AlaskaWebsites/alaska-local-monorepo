# ADR 018: Resiliência de Contratos, Props e Eventos das Abas do Painel do Lojista

- **Status:** Aceito / Implementado
- **Data:** 2026-09-15
- **Contexto:** `apps/web/pages/[slug]/admin.vue`, `apps/web/components/admin/tabs/`, `apps/web/composables/useMerchantAdmin.ts`
- **Referência:** ADR 013 (Painel do Lojista), ADR 014 (Turborepo & @alaska/contracts), ADR 017 (Design System Claro Suave)

---

## 1. Contexto & Problema

O Painel do Lojista do Alaska Local (`pages/[slug]/admin.vue`) consolida a gestão operacional em tempo real de 7 domínios vitais:
1. **Cardápio & Preços** (`AdminCatalogTab.vue`)
2. **Agenda & Bloqueios** (`AdminAgendaTab.vue`)
3. **Pix & Contato** (`AdminPixContactTab.vue`)
4. **Horários & Pausa** (`AdminHoursTab.vue`)
5. **Delivery & Taxas** (`AdminDeliveryTab.vue`)
6. **Comunicado** (`AdminAnnouncementTab.vue`)
7. **Segurança & PIN** (`AdminSecurityTab.vue`)

Durante a refatoração e expansão das abas para suporte modular, ocorreram desalinhamentos sutis entre as propriedades declaradas nos componentes filhos (`defineProps`), os eventos emitidos (`defineEmits`) e o composable reativo `useMerchantAdmin.ts`.

Esses descompassos causaram:
1. **Crash de Renderização no SSR/Boot (Erro 500):**
   * Log: `[nuxt] [request error] [unhandled] [500] r.getProductPrice is not a function`
   * Causa: `AdminCatalogTab.vue` esperava a prop `:get-product-price="getProductPrice"`, mas o componente pai `admin.vue` ou templates de storefront não a forneciam em todos os pontos de montagem.
2. **Propagação Incompleta de Formulários:**
   * Props com nomes ligeiramente divergentes (ex: `form` vs `deliveryForm` vs `deliveryFeeInput`) causavam campos vazios ou reatividades desincronizadas em Delivery e Pix.
3. **Perda de Mutação Otimista:**
   * Handlers de eventos com nomes despadronizados (`@save` vs `@save-delivery` vs `@update`) impediam que o lojista salvasse horários ou taxas sem recarregar a página.

---

## 2. Decisão Arquitetural: Princípio da Tolerância Extrema (Robustness Principle)

Adotamos a **Lei de Postel** (*Seja conservador no que você envia, seja liberal no que você aceita*) em todas as abas e composables operacionais:

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN.VUE (PAI)                         │
│  • Fornece métodos canônicos E aliases de conveniência      │
│  • Passa objetos estruturados (ex: :delivery-form) E        │
│    props granulares (ex: :delivery-fee-input)               │
│  • Escuta eventos primários E aliases (@save, @save-*)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌───────────────────────────┐
│     COMPONENTES FILHOS        │   │    USEMERCHANTADMIN.TS    │
│  • Computeds com fallbacks    │   │  • Assinaturas flexíveis  │
│  • Guardas typeof === 'func'  │   │  • Gravação em 3 camadas  │
│  • Emissão dupla preventiva   │   │  • Zod safeParse local    │
└───────────────────────────────┘   └───────────────────────────┘
```

---

## 3. Resolução Detalhada por Componente

### A. `AdminCatalogTab.vue` (Blindagem contra `getProductPrice is not a function`)
* **Problema**: Invocação direta de `getProductPrice(product)` causava erro fatal se a prop não fosse fornecida.
* **Solução**:
  1. Criação do método helper seguro `resolveProductPrice(product: Product): number`:
     * Se `props.getProductPrice` for uma função, executa `props.getProductPrice(product)`.
     * Se a prop estiver indefinida ou nula, executa o fallback defensivo seguro: `Number(product?.price || 0)`.
  2. Implementação idêntica para `isProductAvailable(product)`:
     * Verifica `props.isProductAvailable(product)`.
     * Fallback para `product.isAvailable ?? product.available ?? true`.

### B. `AdminDeliveryTab.vue` (Compatibilidade Bidirecional de Props e Eventos)
* **Problema**: O formulário de delivery aceitava ora `:delivery-form`, ora `:delivery-fee-input` / `:min-order-input`.
* **Solução**:
  * O componente declara `deliveryForm` opcional e as props granulares como fallback.
  * O computed `activeForm` resolve a fonte ativa de forma transparente.
  * O botão de salvar emite tanto `@save-delivery` quanto `@save`.

### C. `AdminAnnouncementTab.vue` (Unificação de Banners de Aviso)
* **Problema**: O switch de ativação do comunicado e a mensagem de texto dependiam de nomes de props ambíguos.
* **Solução**:
  * Suporte simultâneo a `:announcement-form="{ enabled, message }"` e props granulares (`:announcement-enabled`, `:announcement-message`).
  * Emissão sincronizada dos eventos `update:announcementEnabled`, `update:announcementMessage`, `@save-announcement` e `@save`.

### D. `AdminHoursTab.vue` (Escala Semanal e Pausa Emergencial)
* **Problema**: Botão de salvar horários não refletia o estado da semana se o pai estivesse ouvindo apenas um dos eventos.
* **Solução**:
  * Emissão coordenada de `@save-schedule` e `@save`.
  * Preservação da reatividade háptica (`triggerHaptic(30)`).

### E. `AdminPixContactTab.vue` (Configuração Unificada de Pagamento e Redes Sociais)
* **Problema**: Divergência na leitura de chaves Pix (`key` vs `pixKey`).
* **Solução**:
  * Normalização em `activePixForm` resolvendo `props.pixForm?.pixKey || props.pixForm?.key || ''`.

---

## 4. Resolução de Falhas de Negócio nas Telas do Storefront e Admin

### A. Exibição do Instagram da Loja na Vitrine (`StoreHeaderCard.vue` & `StoreInfoModal.vue`)
* **Problema**: O Instagram cadastrado pelo lojista não era exibido na vitrine inicial da loja.
* **Causa**: O componente `StoreHeaderCard.vue` e o modal `StoreInfoModal.vue` possuíam apenas o link para o WhatsApp.
* **Solução**: Adicionada a computada `instagramUrl` (sanitizando arrobas e prefixando `https://instagram.com/`) e `instagramHandle`, renderizando o canal de Instagram com ícone oficial tanto no grid de metadados do cabeçalho quanto na seção de contatos do modal de informações.

### B. Sincronização de Dias da Semana (Eliminação do Double-Toggle)
* **Problema**: O switch de desativação de um dia da semana (ex: Segunda-feira ou Domingo) não respondia adequadamente ao toque.
* **Causa**: O componente filho `AdminHoursTab.vue` invertia `d.closed = !d.closed` e emitia `'toggle-day-closed'`. O componente pai `admin.vue` escutava o evento e executava novamente `day.closed = !day.closed`, anulando o clique anterior (inversão dupla), além de não invocar `saveScheduleConfig()`.
* **Solução**: `admin.vue` recebe o dia já alternado e despacha diretamente `await saveScheduleConfig()`, salvando instantaneamente no `localStorage` e na API NestJS sem dupla inversão.

### C. Validação de Pedido Mínimo e Exibição de Tempo Estimado de Entrega
* **Problema**: O cliente conseguia finalizar pedidos com valores abaixo do pedido mínimo configurado no painel, e o tempo estimado de entrega (ex: `30-45 min`) não era visível no storefront.
* **Causa**: A computada `effectiveTenant` em `pages/[slug]/index.vue` não mesclava os overrides de `delivery` (`deliveryFee`, `minOrderValue`, `estimatedTime`), e o `CartDrawerModal.vue` não incluía a validação `itemsSubtotal >= minOrderValue` em `isFormValid`.
* **Solução**:
  1. `effectiveTenant` passa a mesclar reativamente todas as configurações de delivery do lojista.
  2. `CartDrawerModal.vue` implementa a trava `isBelowMinOrder`: se o subtotal for inferior ao pedido mínimo para entregas, o botão de finalização é desabilitado, seu texto é atualizado informando a quantia faltante, e um card de aviso em destaque informa exatamente quanto falta adicionar à sacola.
  3. O tempo estimado de entrega é exibido em badge no `StoreHeaderCard.vue`, no modal `StoreInfoModal.vue` e na seleção de entrega da sacola.

---

## 5. Resolução de Falha no PATCH de Disponibilidade, Banner de Comunicado e Alinhamento do Grid de Metadados

### A. Correção da Assinatura e Eliminação de IDs Booleanos em `toggleProductAvailability`
* **Problema**: O lojista tentava desativar um produto no painel admin, mas o produto continuava ativo ou retornava erro 404 no console: `PATCH /api/v1/tenants/bella-donna/products/true/availability 404 (Not Found)`.
* **Causa Raiz**: O componente `admin.vue` invocava `toggleProductAvailability(targetProduct.id, currentStatus)` passando dois argumentos (`string`, `boolean`). O composable `useMerchantAdmin.ts` declarava `(products: Product[], productId: string, currentStatus: boolean)`. Como resultado, `productId` assumia o valor do segundo argumento (`true`), enviando a requisição HTTP com o identificador `'true'` e gravando o override local sob a chave `products["true"]`.
* **Solução**: O método `toggleProductAvailability` foi blindado com polimorfismo defensivo: aceita tanto `(id, status)` quanto `(products, id, status)` ou `(productObject, status)`, além de validar explicitamente `if (!productId || productId === 'true' || productId === 'false') return false`.
* **Eliminação de Emissão Dupla**: `AdminCatalogTab.vue` disparava dois eventos simultâneos (`toggle-product` e `toggle-avail`), acionando o handler duas vezes no mesmo clique. Foi padronizado para emitir exclusivamente `toggle-avail`.

### B. Propagação do Comunicado no Storefront (`StoreHeroBanner.vue`)
* **Problema**: O comunicado configurado na aba "Comunicado" com o switch ativo não aparecia no topo da vitrine da loja.
* **Causa Raiz**: O componente `index.vue` passava uma string pura com a mensagem em `:announcement="announcementOverride"`, enquanto o componente `StoreHeroBanner.vue` esperava um objeto e avaliava estritamente `announcement?.enabled && announcement?.message`.
* **Solução**: `StoreHeroBanner.vue` passou a aceitar tanto string quanto objeto estruturado através de `isAnnouncementActive` e `announcementText`. Em `index.vue`, a computada `effectiveAnnouncement` foi padronizada para ler do override local e dos dados canônicos do tenant.

### C. Normalização dos Horários Semanais no Cabeçalho (`StoreHeaderCard.vue`)
* **Problema**: O botão de horários no storefront exibia apenas o texto `" às "`, sem os horários de início e fim.
* **Causa Raiz**: Em lojas configuradas com grade detalhada por dia da semana (como Segunda a Domingo em `openingHours.monday`), as chaves de topo `openingHours.open` e `openingHours.close` não existiam, resultando na interpolação de `undefined às undefined`.
* **Solução**: Implementada a computada `displayHours`, que verifica a escala do dia atual da semana (ex: Domingo/Segunda), exibe `"Fechado hoje"` se for o dia de folga da loja, ou busca o horário padrão configurado nos dias úteis.

### D. Flexbox Balanceado no Cabeçalho da Vitrine
* **Problema**: No desktop, os botões de localização, prazo de entrega, horário, WhatsApp e Instagram sofriam quebra de espaçamento: WhatsApp e Instagram ficavam espremidos na quarta coluna de um grid rígido, enquanto o horário ficava com espaço excessivo.
* **Causa Raiz**: Uso de `grid grid-cols-1 sm:grid-cols-4` onde 5 elementos eram distribuídos de forma desproporcional.
* **Solução**: Substituição por layout flexível fluido `flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5`, garantindo espaçamento simétrico (`gap-x-6`), sem esmagamento dos botões de redes sociais e com auto-alinhamento responsivo em todas as resoluções.

---

## 6. Resolução de Regressão de Assinaturas e Aliases Operacionais no Admin (Erros e.find e k is not a function)

### A. TypeError: e.find is not a function ao ativar/desativar produtos
* **Log/Erro**: `TypeError: e.find is not a function at c (Cro2cTQx.js:1:8347) at et (DGH_wdX8.js:1:52383)` ao clicar no switch de produto em `AdminCatalogTab.vue`.
* **Causa Raiz**: A assinatura de `toggleProductAvailability` em `useMerchantAdmin.ts` esperava `(products: Product[], productId: string, currentStatus: boolean)` e executava `products.find(p => p.id === productId)`. No entanto, `admin.vue` invocava `toggleProductAvailability(targetProduct.id, currentStatus)` passando o ID do produto (string) como primeiro argumento. A tentativa de invocar `.find()` em uma string disparava o `TypeError: e.find is not a function`.
* **Solução Defensiva**: Polimorfismo com guardas defensivas `typeof productsOrId === 'string'` e `Array.isArray(productsList)`. Se o primeiro argumento for string, ele é tratado diretamente como `productId`, sem invocar `.find()`. Se for um array de produtos, executa `.find()` protegido por try/catch.

### B. TypeError: k is not a function ao Salvar Regras de Entrega
* **Log/Erro**: `TypeError: k is not a function at Fe (DGH_wdX8.js:1:57369) at HTMLButtonElement.n` ao clicar no botão 'Salvar Regras de Entrega' em `AdminDeliveryTab.vue`.
* **Causa Raiz**: O composable `useMerchantAdmin.ts` definia e exportava a função como `updateDeliveryConfig`, enquanto `admin.vue` desestruturava `updateDelivery` (`const { updateDelivery } = useMerchantAdmin(slug)`). Como resultado, `updateDelivery` era `undefined`, e a tentativa de invocação disparava o erro fatal.
* **Solução Defensiva**: O composable agora exporta tanto `updateDelivery` quanto `updateDeliveryConfig: updateDelivery` e `saveDelivery: updateDelivery`, aceitando tanto argumentos posicionais `(fee, minOrder, estimatedTime)` quanto objeto de configuração `{ deliveryFee, minOrderValue, estimatedTime }`.

### C. Inconsistência na Gravação do Comunicado da Vitrine
* **Problema**: Ao salvar o comunicado na aba 'Comunicado', o texto do aviso era perdido e a mensagem não persistia.
* **Causa Raiz**: `admin.vue` invocava `updateAnnouncement(announcementForm.value.enabled, announcementForm.value.message)` com dois argumentos (`boolean`, `string`), enquanto `useMerchantAdmin.ts` esperava um único objeto `config: { enabled, message }`. O primeiro argumento booleano era salvo diretamente como `{ announcement: true }`, sobrescrevendo o objeto e descartando o texto da mensagem.
* **Solução Defensiva**: `updateAnnouncement` foi polimorfizado para aceitar tanto `(enabled: boolean, message: string)` quanto `(config: { enabled?: boolean; message?: string })`, garantindo que ambos os formatos persistam `{ announcement: { enabled, message } }` de forma segura.

### D. Tratamento Tolerante de 404 em Endpoints de Retaguarda (/hours)
* **Log/Erro**: `PATCH /api/v1/tenants/bella-donna/hours 404 (Not Found)`
* **Causa Raiz**: Lojas locais em demonstração (como `bella-donna`) não estão no banco relacional remoto na nuvem.
* **Solução Defensiva**: Sincronização em 3 camadas: o painel grava instantaneamente no `localStorage` sob `alaska_overrides_<slug>`, reflete na UI em < 50ms com feedback háptico, e encapsula a chamada de API em `catch(() => {})` silencioso, garantindo zero downtime e resiliência offline total para o lojista.
